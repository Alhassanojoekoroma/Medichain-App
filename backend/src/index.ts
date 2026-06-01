/**
 * backend/src/index.ts
 * Main entrypoint for the refactored Express API server.
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import qrRoutes from './routes/qr.routes';
import accessRoutes from './routes/access.routes';
import accessRequestRoutes from './routes/accessRequest.routes';
import consentRoutes from './routes/consent.routes';
import auditRoutes from './routes/audit.routes';
import authRoutes from './routes/auth.routes';
import { db } from './config/db';

const app = express();
const port = process.env.PORT || 3000; // running on 3000 for frontend compatibility

app.use(cors());
app.use(express.json());

// Legacy endpoints could be imported here from older index.js if needed
// app.use('/api/legacy', legacyRoutes);

// --- New QR Access & Consent Endpoints ---
app.use('/api/auth', authRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/access', accessRoutes);
app.use('/api/access-requests', accessRequestRoutes);
app.use('/api/consent', consentRoutes);
app.use('/api/audit', auditRoutes);

app.get('/api/health', async (req, res) => {
  try {
    // Check DB connection
    await db.query('SELECT 1');
    res.json({ status: 'OK', message: 'MediChain QR API is running', db: 'Connected' });
  } catch (err) {
    res.status(500).json({ status: 'DEGRADED', error: 'DB connection failed' });
  }
});

app.listen(port, () => {
  console.log(`MediChain Backend API listening on port ${port}`);
});
