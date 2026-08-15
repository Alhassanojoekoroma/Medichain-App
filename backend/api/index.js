/**
 * Decommissioned MediChain legacy gateway.
 *
 * The previous process exposed unauthenticated AI, file, ledger, and offline
 * sync operations. Phase 1 replaces that attack surface with a local-only
 * tombstone. Approved capabilities must be rebuilt behind the primary typed API
 * and its authorization boundary; this process must never be internet-facing.
 */

require('dotenv').config();
const express = require('express');

const app = express();
const port = Number(process.env.PORT || 3000);
const host = '127.0.0.1';

app.disable('x-powered-by');
app.use(express.json({ limit: '16kb' }));

app.get('/api/health', (_req, res) => {
  res.status(503).json({
    status: 'DECOMMISSIONED',
    message: 'Legacy gateway capabilities are disabled by the Phase 1 security containment gate.',
  });
});

app.all('/api/*', (_req, res) => {
  res.status(410).json({
    error: 'Endpoint removed',
    code: 'LEGACY_GATEWAY_DECOMMISSIONED',
  });
});

if (require.main === module) {
  app.listen(port, host, () => {
    console.warn(`Decommissioned legacy gateway tombstone listening locally on ${host}:${port}`);
  });
}

module.exports = app;
