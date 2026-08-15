import * as crypto from 'node:crypto';
import * as net from 'node:net';
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export type PipelineState =
  | 'authorized'
  | 'uploading'
  | 'quarantined'
  | 'validating'
  | 'scanning'
  | 'encrypting'
  | 'pending_verification'
  | 'active'
  | 'failed';

export type SupportedFileType = 'application/pdf' | 'image/jpeg' | 'image/png';

export interface UploadDescriptor {
  id: string;
  idempotencyKey: string;
  patientId: string;
  actorId: string;
  facilityId: string;
  declaredContentType: SupportedFileType;
  declaredSize: number;
  originalName: string;
  state: PipelineState;
  attempts: number;
  createdAt: string;
  updatedAt: string;
  failureCode?: string;
}

export interface ActivationEvidence {
  scanStatus: 'clean' | 'infected' | 'error' | 'pending';
  serverContentHash?: string;
  encryptedObjectKey?: string;
  kmsKeyReference?: string;
  auditEventId?: string;
  auditConfirmed: boolean;
}

const transitions: Record<PipelineState, ReadonlySet<PipelineState>> = {
  authorized: new Set(['uploading', 'failed']),
  uploading: new Set(['quarantined', 'failed']),
  quarantined: new Set(['validating', 'failed']),
  validating: new Set(['scanning', 'failed']),
  scanning: new Set(['encrypting', 'failed']),
  encrypting: new Set(['pending_verification', 'failed']),
  pending_verification: new Set(['active', 'failed']),
  active: new Set(),
  failed: new Set(['authorized']),
};

export function transitionUpload(upload: UploadDescriptor, next: PipelineState, now = new Date()): UploadDescriptor {
  if (!transitions[upload.state].has(next)) throw new Error(`PIPELINE_TRANSITION_INVALID:${upload.state}:${next}`);
  return {
    ...upload,
    state: next,
    attempts: next === 'authorized' && upload.state === 'failed' ? upload.attempts + 1 : upload.attempts,
    updatedAt: now.toISOString(),
    failureCode: next === 'failed' ? upload.failureCode ?? 'PIPELINE_FAILED' : undefined,
  };
}

export function failUpload(upload: UploadDescriptor, failureCode: string, now = new Date()): UploadDescriptor {
  if (!/^[A-Z][A-Z0-9_]{2,63}$/.test(failureCode)) throw new Error('FAILURE_CODE_INVALID');
  if (upload.state === 'active') throw new Error('ACTIVE_RECORD_CANNOT_FAIL');
  if (upload.state === 'failed') return { ...upload, failureCode, updatedAt: now.toISOString() };
  return { ...transitionUpload(upload, 'failed', now), failureCode };
}

const signatures: Record<SupportedFileType, readonly number[][]> = {
  'application/pdf': [[0x25, 0x50, 0x44, 0x46, 0x2d]],
  'image/jpeg': [[0xff, 0xd8, 0xff]],
  'image/png': [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
};

export function validateUpload(input: {
  declaredContentType: SupportedFileType;
  declaredSize: number;
  actualSize: number;
  firstBytes: Uint8Array;
  maxBytes?: number;
}): { valid: true } | { valid: false; code: string } {
  const maxBytes = input.maxBytes ?? 25 * 1024 * 1024;
  if (!Number.isSafeInteger(input.actualSize) || input.actualSize <= 0 || input.actualSize > maxBytes) return { valid: false, code: 'FILE_SIZE_NOT_ALLOWED' };
  if (input.declaredSize !== input.actualSize) return { valid: false, code: 'FILE_SIZE_MISMATCH' };
  const validSignature = signatures[input.declaredContentType].some(signature =>
    signature.every((value, index) => input.firstBytes[index] === value)
  );
  return validSignature ? { valid: true } : { valid: false, code: 'FILE_SIGNATURE_MISMATCH' };
}

export function serverSha256(bytes: Uint8Array): string {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

export function activationDecision(evidence: ActivationEvidence): { allowed: boolean; missing: string[] } {
  const missing: string[] = [];
  if (evidence.scanStatus !== 'clean') missing.push('clean_scan');
  if (!evidence.serverContentHash || !/^[a-f0-9]{64}$/.test(evidence.serverContentHash)) missing.push('server_hash');
  if (!evidence.encryptedObjectKey) missing.push('encrypted_object');
  if (!evidence.kmsKeyReference) missing.push('kms_evidence');
  if (!evidence.auditConfirmed || !evidence.auditEventId) missing.push('audit_confirmation');
  return { allowed: missing.length === 0, missing };
}

export function assertPreviewTtl(ttlSeconds: number): number {
  if (!Number.isInteger(ttlSeconds) || ttlSeconds < 15 || ttlSeconds > 300) throw new Error('SIGNED_URL_TTL_INVALID');
  return ttlSeconds;
}

export interface MedicalObjectStorageConfig {
  quarantineBucket: string;
  cleanBucket: string;
  kmsKeyId: string;
  uploadTtlSeconds?: number;
  previewTtlSeconds?: number;
}

function safeStorageConfig(config: MedicalObjectStorageConfig): Required<MedicalObjectStorageConfig> {
  for (const [name, value] of Object.entries({
    quarantineBucket: config.quarantineBucket,
    cleanBucket: config.cleanBucket,
    kmsKeyId: config.kmsKeyId,
  })) {
    if (!value || value.length > 256 || /[\r\n]/.test(value)) throw new Error(`STORAGE_CONFIG_INVALID:${name}`);
  }
  if (config.quarantineBucket === config.cleanBucket) throw new Error('STORAGE_BUCKET_BOUNDARY_REQUIRED');
  return {
    ...config,
    uploadTtlSeconds: assertPreviewTtl(config.uploadTtlSeconds ?? 300),
    previewTtlSeconds: assertPreviewTtl(config.previewTtlSeconds ?? 120),
  };
}

export class MedicalObjectStorage {
  private readonly config: Required<MedicalObjectStorageConfig>;

  constructor(private readonly client: S3Client, config: MedicalObjectStorageConfig) {
    this.config = safeStorageConfig(config);
  }

  async authorizeQuarantineUpload(input: { contentType: SupportedFileType; contentLength: number; objectKey?: string }): Promise<{
    objectKey: string;
    uploadUrl: string;
    requiredHeaders: Record<string, string>;
    expiresInSeconds: number;
  }> {
    if (!Number.isSafeInteger(input.contentLength) || input.contentLength < 1 || input.contentLength > 25 * 1024 * 1024) throw new Error('FILE_SIZE_NOT_ALLOWED');
    const objectKey = input.objectKey ?? `quarantine/${crypto.randomUUID()}`;
    if (!/^quarantine\/[0-9a-f-]{36}$/i.test(objectKey)) throw new Error('QUARANTINE_OBJECT_KEY_INVALID');
    const command = new PutObjectCommand({
      Bucket: this.config.quarantineBucket,
      Key: objectKey,
      ContentType: input.contentType,
      ContentLength: input.contentLength,
      ServerSideEncryption: 'aws:kms',
      SSEKMSKeyId: this.config.kmsKeyId,
    });
    return {
      objectKey,
      uploadUrl: await getSignedUrl(this.client, command, { expiresIn: this.config.uploadTtlSeconds }),
      requiredHeaders: {
        'content-type': input.contentType,
        'x-amz-server-side-encryption': 'aws:kms',
        'x-amz-server-side-encryption-aws-kms-key-id': this.config.kmsKeyId,
      },
      expiresInSeconds: this.config.uploadTtlSeconds,
    };
  }

  async promoteClean(input: { quarantineObjectKey: string; serverContentHash: string }): Promise<{ cleanObjectKey: string }> {
    if (!/^quarantine\/[0-9a-f-]{36}$/i.test(input.quarantineObjectKey) || !/^[a-f0-9]{64}$/.test(input.serverContentHash)) throw new Error('PROMOTION_INPUT_INVALID');
    const cleanObjectKey = `clean/${crypto.randomUUID()}`;
    await this.client.send(new CopyObjectCommand({
      Bucket: this.config.cleanBucket,
      Key: cleanObjectKey,
      CopySource: `${this.config.quarantineBucket}/${input.quarantineObjectKey}`,
      ServerSideEncryption: 'aws:kms',
      SSEKMSKeyId: this.config.kmsKeyId,
      MetadataDirective: 'REPLACE',
      Metadata: { 'content-sha256': input.serverContentHash },
    }));
    await this.client.send(new DeleteObjectCommand({ Bucket: this.config.quarantineBucket, Key: input.quarantineObjectKey }));
    return { cleanObjectKey };
  }

  async readQuarantine(quarantineObjectKey: string): Promise<{ bytes: Uint8Array; contentType?: string; contentLength: number }> {
    if (!/^quarantine\/[0-9a-f-]{36}$/i.test(quarantineObjectKey)) throw new Error('QUARANTINE_OBJECT_KEY_INVALID');
    const response = await this.client.send(new GetObjectCommand({ Bucket: this.config.quarantineBucket, Key: quarantineObjectKey }));
    if (!response.Body) throw new Error('QUARANTINE_OBJECT_MISSING');
    const bytes = await response.Body.transformToByteArray();
    return { bytes, contentType: response.ContentType, contentLength: bytes.byteLength };
  }

  async deleteQuarantine(quarantineObjectKey: string): Promise<void> {
    if (!/^quarantine\/[0-9a-f-]{36}$/i.test(quarantineObjectKey)) throw new Error('QUARANTINE_OBJECT_KEY_INVALID');
    await this.client.send(new DeleteObjectCommand({ Bucket: this.config.quarantineBucket, Key: quarantineObjectKey }));
  }

  async authorizePreview(cleanObjectKey: string): Promise<{ url: string; expiresInSeconds: number }> {
    if (!/^clean\/[0-9a-f-]{36}$/i.test(cleanObjectKey)) throw new Error('CLEAN_OBJECT_KEY_INVALID');
    const command = new GetObjectCommand({ Bucket: this.config.cleanBucket, Key: cleanObjectKey, ResponseCacheControl: 'private, no-store' });
    return {
      url: await getSignedUrl(this.client, command, { expiresIn: this.config.previewTtlSeconds }),
      expiresInSeconds: this.config.previewTtlSeconds,
    };
  }
}

export class ClamAvScanner {
  constructor(private readonly options: { host: string; port?: number; timeoutMs?: number }) {
    if (!options.host || /[\r\n]/.test(options.host)) throw new Error('CLAMAV_HOST_INVALID');
  }

  scan(bytes: Uint8Array): Promise<'clean' | 'infected'> {
    const port = this.options.port ?? 3310;
    const timeoutMs = this.options.timeoutMs ?? 30_000;
    if (bytes.byteLength < 1 || bytes.byteLength > 25 * 1024 * 1024 || port < 1 || port > 65535 || timeoutMs < 1000 || timeoutMs > 120_000) {
      return Promise.reject(new Error('CLAMAV_SCAN_POLICY_INVALID'));
    }
    return new Promise((resolve, reject) => {
      const socket = net.createConnection({ host: this.options.host, port });
      const response: Buffer[] = [];
      const fail = (code: string) => { socket.destroy(); reject(new Error(code)); };
      socket.setTimeout(timeoutMs, () => fail('CLAMAV_TIMEOUT'));
      socket.once('error', () => fail('CLAMAV_UNAVAILABLE'));
      socket.on('data', chunk => response.push(Buffer.from(chunk)));
      socket.once('connect', () => {
        socket.write('zINSTREAM\0');
        const length = Buffer.alloc(4);
        length.writeUInt32BE(bytes.byteLength);
        socket.write(length);
        socket.write(bytes);
        socket.end(Buffer.alloc(4));
      });
      socket.once('end', () => {
        const result = Buffer.concat(response).toString('utf8').replace(/\0/g, '').trim();
        if (/\bOK$/.test(result)) resolve('clean');
        else if (/\bFOUND$/.test(result)) resolve('infected');
        else reject(new Error('CLAMAV_RESPONSE_INVALID'));
      });
    });
  }
}
