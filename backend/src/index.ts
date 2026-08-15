/**
 * backend/src/index.ts
 * Main entrypoint for the refactored Express API server.
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import qrRoutes from './routes/qr.routes';
import accessRoutes from './routes/access.routes';
import accessRequestRoutes from './routes/accessRequest.routes';
import consentRoutes from './routes/consent.routes';
import auditRoutes from './routes/audit.routes';
import authRoutes from './routes/auth.routes';
import patientsRoutes from './routes/patients.routes';
import recordsRoutes from './routes/records.routes';
import treatmentsRoutes from './routes/treatments.routes';
import { db } from './config/db';
import { logger } from './utils/logger';
import { FabricGateway } from './services/FabricGateway';
import { runMigrations } from './config/migrate';
import { readSecurityConfig } from './config/environment';
import platformRoutes from './routes/platform.routes';
import { notFound, requestContext, safeError } from './middleware/requestContext.middleware';
import clinicalRoutes from './routes/clinical.routes';
import aiRoutes from './routes/ai.routes';
import intelligenceRoutes from './routes/intelligence.routes';
import operationsRoutes from './routes/operations.routes';
import { OperationalTelemetry, redactOperationalPath } from './domain/operationalReadiness';
import { OutboxWorkerService } from './services/OutboxWorkerService';

export const app = express();
const port = process.env.PORT || 5000; // running on 5000 to avoid conflict with frontend
const securityConfig = readSecurityConfig();
const allowedOrigins = securityConfig.corsAllowedOrigins.length > 0
  ? securityConfig.corsAllowedOrigins
  : ['http://localhost:3000', 'http://localhost:8081'];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Origin not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID', 'Idempotency-Key', 'X-PalmChain-Activity'],
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(requestContext);

// Set up rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

// Apply rate limiting to all /api routes
app.use('/api', apiLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { error: 'Too many authentication attempts. Please try again later.' },
});
app.use('/api/auth', authLimiter);

const tokenLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'TOKEN_RATE_LIMIT', message: 'Token operation rate exceeded' } },
});
app.use('/api/qr', tokenLimiter);
app.use('/api/access/scan', tokenLimiter);

const syncLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'SYNC_RATE_LIMIT', message: 'Sync rate exceeded' } },
});
app.use('/api/platform/sync', syncLimiter);

const sessionRenewalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'SESSION_RENEWAL_RATE_LIMIT', message: 'Session renewal rate exceeded' } },
});
app.use('/api/platform/sessions/renew-sandbox', sessionRenewalLimiter);

// Request logging middleware
app.use((req, res, next) => {
  const started = process.hrtime.bigint();
  logger.info(`${req.method} ${redactOperationalPath(req.path)}`);
  res.on('finish', () => OperationalTelemetry.observe(Number(process.hrtime.bigint() - started) / 1_000_000, res.statusCode));
  next();
});

// Legacy endpoints could be imported here from older index.js if needed
// app.use('/api/legacy', legacyRoutes);

// --- New QR Access & Consent Endpoints ---
app.use('/api/auth', authRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/access', accessRoutes);
app.use('/api/access-requests', accessRequestRoutes);
app.use('/api/consent', consentRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/records', recordsRoutes);
app.use('/api/treatments', treatmentsRoutes);
app.use('/api/platform', platformRoutes);
app.use('/api/clinical', clinicalRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/intelligence', intelligenceRoutes);
app.use('/api/operations', operationsRoutes);

app.get('/api/health', async (req, res) => {
  try {
    // Check DB connection
    await db.query('SELECT 1');
    
    // Check Fabric gateway connection
    const fabricHealth = await FabricGateway.healthCheck();
    
    res.json({ status: 'READY', dependencies: { database: 'available', fabric: fabricHealth.connected ? 'available' : fabricHealth.mode === 'disabled' ? 'disabled' : 'unavailable' } });
  } catch (err: any) {
    logger.error(`Health check failed: ${err.message}`);
    res.status(503).json({ status: 'NOT_READY', error: 'Service health check failed' });
  }
});

app.use(notFound);
app.use(safeError);

async function startServer(): Promise<void> {
  try {
    await runMigrations();
    await FabricGateway.connect();

    if (process.env.OUTBOX_WORKER_ENABLED === 'true') {
      const intervalMs = Number(process.env.OUTBOX_WORKER_INTERVAL_MS || 5000);
      if (!Number.isInteger(intervalMs) || intervalMs < 1000 || intervalMs > 60000) throw new Error('OUTBOX_WORKER_INTERVAL_INVALID');
      const runWorker = () => OutboxWorkerService.runOnce().catch(error => logger.error(`Outbox worker cycle failed: ${error instanceof Error ? error.message : 'OUTBOX_WORKER_FAILED'}`));
      void runWorker();
      setInterval(runWorker, intervalMs).unref();
    }

    app.listen(port, () => {
      logger.info(`MediChain Backend API listening on port ${port} (${securityConfig.appEnvironment}/${securityConfig.dataClassification})`);
    });
  } catch (err: any) {
    logger.error(`Startup failed closed: ${err.message}`);
    process.exitCode = 1;
  }
}

void startServer();
