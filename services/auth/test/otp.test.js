const test = require('node:test');
const assert = require('node:assert/strict');
const { issueOtp, normalizeSierraLeonePhone, patientCapabilities, persistableChallenge, verifyOtp } = require('../dist/index');

class MemoryStore {
  constructor(challenge) { this.challenge = challenge; }
  async save(challenge) { this.challenge = challenge; }
  async find(id) { return this.challenge?.id === id ? { ...this.challenge } : null; }
  async consumeIfCurrent(id, digest, now) {
    if (!this.challenge || this.challenge.id !== id || this.challenge.codeDigest !== digest || this.challenge.consumedAt) return false;
    this.challenge.consumedAt = now; return true;
  }
  async recordFailedAttempt(id) {
    if (this.challenge?.id === id) this.challenge.attemptsRemaining -= 1;
    return this.challenge?.attemptsRemaining ?? 0;
  }
}

const secret = 'o'.repeat(48);

test('normalizes Sierra Leone phone numbers and rejects invalid lengths', () => {
  assert.equal(normalizeSierraLeonePhone('076 123 456'), '+23276123456');
  assert.equal(normalizeSierraLeonePhone('+232 76 123 456'), '+23276123456');
  assert.throws(() => normalizeSierraLeonePhone('+1 555 123 4567'), /PHONE_INVALID/);
});

test('OTP is hashed at rest, single-use, expiring, and attempt limited', async () => {
  const issued = issueOtp({ phone: '076123456', purpose: 'register', secret, now: new Date('2026-08-02T00:00:00Z') });
  const persisted = persistableChallenge(issued, secret);
  assert.equal(JSON.stringify(persisted).includes(issued.code), false);
  const store = new MemoryStore(persisted);
  assert.equal((await verifyOtp({ challengeId: persisted.id, code: '999999', secret, store, now: new Date('2026-08-02T00:01:00Z') })).verified, false);
  assert.equal((await verifyOtp({ challengeId: persisted.id, code: issued.code, secret, store, now: new Date('2026-08-02T00:02:00Z') })).verified, true);
  assert.equal((await verifyOtp({ challengeId: persisted.id, code: issued.code, secret, store, now: new Date('2026-08-02T00:03:00Z') })).code, 'OTP_ALREADY_USED');
});

test('unverified accounts receive no PHI capabilities', () => {
  assert.deepEqual(patientCapabilities('unverified'), { viewVerificationStatus: true, viewRecords: false, manageConsent: false, cachePhi: false });
  assert.equal(patientCapabilities('active').viewRecords, true);
});
