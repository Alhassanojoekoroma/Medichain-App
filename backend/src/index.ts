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

const app = express();
const port = process.env.PORT || 5000; // running on 5000 to avoid conflict with frontend

const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3001', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());

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

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
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

app.get('/api/health', async (req, res) => {
  try {
    // Check DB connection
    await db.query('SELECT 1');
    
    // Check Fabric gateway connection
    const fabricHealth = await FabricGateway.healthCheck();
    
    res.json({ 
      status: 'OK', 
      message: 'MediChain QR API is running', 
      db: 'Connected',
      blockchain: fabricHealth
    });
  } catch (err: any) {
    logger.error(`Health check failed: ${err.message}`);
    res.status(500).json({ status: 'DEGRADED', error: 'Service health check failed', details: err.message });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(`${err.name}: ${err.message}\n${err.stack}`);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Connect to Fabric network and then start Express server
FabricGateway.connect()
  .then(async () => {
    // Run database migrations/seeds
    await runMigrations();

    app.listen(port, () => {
      logger.info(`MediChain Backend API listening on port ${port}`);
    });
  })
  .catch(async (err) => {
    logger.error(`Failed to initialize Fabric connection: ${err.message}`);
    // Run database migrations/seeds even if Fabric fails
    await runMigrations();

    app.listen(port, () => {
      logger.info(`MediChain Backend API listening on port ${port} (DEGRADED)`);
    });
  });
