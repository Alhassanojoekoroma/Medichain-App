/**
 * backend/src/config/db.ts
 * PostgreSQL connection pool
 */
import { Pool } from 'pg';

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 3000,
});

db.on('error', (err) => {
  console.error('[DB] Unexpected pool error:', err);
});
