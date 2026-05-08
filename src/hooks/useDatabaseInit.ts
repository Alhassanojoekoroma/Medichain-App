/**
 * useDatabaseInit — initializes SQLite + restores secure auth session.
 * Returns isReady = true once BOTH the DB is loaded AND the auth check is done.
 */
import { useEffect, useState } from 'react';
import { initDatabase } from '../services/database';
import { AuthService } from '../services/authService';
import { useStore } from '../store/useStore';

export function useDatabaseInit(): boolean {
  const [isReady, setIsReady] = useState(false);
  const loadFromDatabase = useStore((s) => s.loadFromDatabase);
  const setAuthenticated = useStore((s) => s.setAuthenticated);
  const setUser = useStore((s) => s.setUser);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        // 1. Open SQLite and create tables
        await initDatabase();

        // 2. Load all persisted data into Zustand
        await loadFromDatabase();

        // 3. Restore secure auth session (auto-login if token still valid)
        const session = await AuthService.restoreSession();
        if (session && mounted) {
          // Load user from the SQLite store (loadFromDatabase already sets it)
          // Just ensure isAuthenticated is flipped
          setAuthenticated(true);
          console.log('[Auth] Session restored for:', session.email);
        }
      } catch (err) {
        console.error('[DB] Init error:', err);
      } finally {
        if (mounted) setIsReady(true);
      }
    };

    init();
    return () => { mounted = false; };
  }, []);

  return isReady;
}
