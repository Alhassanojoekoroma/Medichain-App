import * as crypto from 'node:crypto';

export interface OtpChallenge {
  id: string;
  phoneE164: string;
  purpose: 'register' | 'login' | 'recovery';
  codeDigest: string;
  expiresAt: string;
  attemptsRemaining: number;
  consumedAt?: string;
}

export interface OtpStore {
  save(challenge: OtpChallenge): Promise<void>;
  find(id: string): Promise<OtpChallenge | null>;
  consumeIfCurrent(id: string, expectedDigest: string, now: string): Promise<boolean>;
  recordFailedAttempt(id: string): Promise<number>;
}

export interface SmsProvider {
  sendOtp(input: { phoneE164: string; code: string; expiresInSeconds: number }): Promise<{ providerMessageId: string }>;
}

export interface IssuedOtp {
  challenge: Omit<OtpChallenge, 'codeDigest'>;
  code: string;
}

const SIERRA_LEONE_E164 = /^\+232\d{8}$/;

export function normalizeSierraLeonePhone(value: string): string {
  const digits = value.replace(/[^\d+]/g, '');
  const normalized = digits.startsWith('+232') ? digits : digits.startsWith('232') ? `+${digits}` : `+232${digits.replace(/^0/, '')}`;
  if (!SIERRA_LEONE_E164.test(normalized)) throw new Error('PHONE_INVALID');
  return normalized;
}

function digest(challengeId: string, code: string, secret: string): string {
  if (secret.length < 32) throw new Error('OTP_SECRET_WEAK');
  return crypto.createHmac('sha256', secret).update(`${challengeId}:${code}`).digest('hex');
}

export function issueOtp(input: {
  phone: string;
  purpose: OtpChallenge['purpose'];
  secret: string;
  now?: Date;
  ttlSeconds?: number;
  attempts?: number;
}): IssuedOtp {
  const now = input.now ?? new Date();
  const ttlSeconds = input.ttlSeconds ?? 300;
  const attempts = input.attempts ?? 5;
  if (ttlSeconds < 60 || ttlSeconds > 600 || attempts < 1 || attempts > 5) throw new Error('OTP_POLICY_INVALID');
  const id = crypto.randomUUID();
  const code = crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
  return {
    challenge: {
      id,
      phoneE164: normalizeSierraLeonePhone(input.phone),
      purpose: input.purpose,
      expiresAt: new Date(now.getTime() + ttlSeconds * 1000).toISOString(),
      attemptsRemaining: attempts,
    },
    code,
  };
}

export function persistableChallenge(issued: IssuedOtp, secret: string): OtpChallenge {
  return { ...issued.challenge, codeDigest: digest(issued.challenge.id, issued.code, secret) };
}

export async function verifyOtp(input: {
  challengeId: string;
  code: string;
  secret: string;
  store: OtpStore;
  now?: Date;
}): Promise<{ verified: boolean; code: string }> {
  const challenge = await input.store.find(input.challengeId);
  const now = (input.now ?? new Date()).toISOString();
  if (!challenge) return { verified: false, code: 'OTP_NOT_FOUND' };
  if (challenge.consumedAt) return { verified: false, code: 'OTP_ALREADY_USED' };
  if (Date.parse(challenge.expiresAt) <= Date.parse(now)) return { verified: false, code: 'OTP_EXPIRED' };
  if (challenge.attemptsRemaining <= 0) return { verified: false, code: 'OTP_ATTEMPTS_EXHAUSTED' };
  if (!/^\d{6}$/.test(input.code)) {
    await input.store.recordFailedAttempt(challenge.id);
    return { verified: false, code: 'OTP_INVALID' };
  }
  const supplied = digest(challenge.id, input.code, input.secret);
  const equal = crypto.timingSafeEqual(Buffer.from(supplied, 'hex'), Buffer.from(challenge.codeDigest, 'hex'));
  if (!equal) {
    await input.store.recordFailedAttempt(challenge.id);
    return { verified: false, code: 'OTP_INVALID' };
  }
  const consumed = await input.store.consumeIfCurrent(challenge.id, challenge.codeDigest, now);
  return consumed ? { verified: true, code: 'OTP_VERIFIED' } : { verified: false, code: 'OTP_REPLAYED' };
}

export function patientCapabilities(status: 'unverified' | 'active' | 'suspended' | 'disabled') {
  return status === 'active'
    ? { viewVerificationStatus: true, viewRecords: true, manageConsent: true, cachePhi: true }
    : { viewVerificationStatus: true, viewRecords: false, manageConsent: false, cachePhi: false };
}
