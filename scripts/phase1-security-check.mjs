import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname } from 'node:path';

const tracked = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { encoding: 'utf8' })
  .split('\0')
  .filter(Boolean);

const failures = [];
const textExtensions = new Set([
  '.js', '.mjs', '.cjs', '.ts', '.tsx', '.json', '.yaml', '.yml', '.env', '.example', '.production',
]);

for (const file of tracked) {
  const normalized = file.replaceAll('\\', '/');
  if (!existsSync(file)) continue;
  if (/(^|\/)crypto-config\/|(^|\/)keystore\/|(^|\/)wallet\/|(^|\/)priv_sk$/.test(normalized)) {
    failures.push(`${file}: generated credential material must not be tracked`);
  }
  if (statSync(file).size > 2_000_000) continue;
  if (!textExtensions.has(extname(file)) && !file.includes('.env')) continue;

  const text = readFileSync(file, 'utf8');
  const checks = [
    [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, 'private key material'],
    [/AIza[0-9A-Za-z_-]{30,}/, 'Google API credential'],
    [/\bAKIA[0-9A-Z]{16}\b/, 'AWS access key'],
    [/\bsk-[0-9A-Za-z_-]{20,}\b/, 'provider API credential'],
  ];
  for (const [pattern, description] of checks) {
    if (pattern.test(text)) failures.push(`${file}: possible ${description}`);
  }
}

const appConfig = readFileSync('app.config.js', 'utf8');
const aiService = readFileSync('src/services/aiService.ts', 'utf8');
const legacyGateway = readFileSync('backend/api/index.js', 'utf8');
const authService = readFileSync('src/services/authService.ts', 'utf8');
const clientServices = readFileSync('src/services/index.ts', 'utf8');

if (/geminiApiKey|EXPO_PUBLIC_GEMINI|GEMINI_API_KEY/.test(appConfig + aiService)) {
  failures.push('mobile client: AI provider credentials or configuration are still referenced');
}
if (/generativelanguage\.googleapis\.com|GoogleGenAI|_simulateExtraction/.test(aiService)) {
  failures.push('mobile AI service: direct or simulated provider processing is still present');
}
if (/GoogleGenAI|multer|IPFSStorage|FabricGateway|syncRoutes/.test(legacyGateway)) {
  failures.push('legacy gateway: a decommissioned sensitive integration was reintroduced');
}
if (/DEMO_CREDENTIALS|generateSessionToken|offline demo mode/.test(authService)) {
  failures.push('mobile authentication: a local authenticated-session fallback was reintroduced');
}
if (/EXPO_PUBLIC_HYPERLEDGER|falling back to local|RECOVERED_PRIVATE_KEY_SIMULATION|ENC\[AES256\]/.test(clientServices)) {
  failures.push('mobile services: direct or simulated blockchain/cryptographic trust was reintroduced');
}

if (failures.length > 0) {
  console.error('Phase 1 security check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Phase 1 security check passed across ${tracked.length} tracked paths.`);
