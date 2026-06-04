import { Pool } from 'pg';
import { logger } from '../utils/logger';

// Create the real Postgres pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // increased max connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  logger.error(`[DB] Unexpected PG Pool error: ${err.message}`, err);
});

export const db = {
  on: (event: 'error' | 'release' | 'connect' | 'acquire' | 'remove', listener: (...args: any[]) => void) => {
    pool.on(event, listener);
  },
  query: async (text: string, params?: any[]) => {
    const start = Date.now();
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      logger.info(`[DB] executed query`, { text, duration, rows: res.rowCount });
      return res;
    } catch (err: any) {
      logger.error(`[DB] Error executing query`, { text, params, error: err.message });
      throw err;
    }
  },
  // Export pool for transactions if needed
  pool,
};
