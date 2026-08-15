/**
 * useDatabaseInit — initializes SQLite + restores secure auth session.
 * Returns isReady = true once BOTH the DB is loaded AND the auth check is done.
 */
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { initDatabase } from '../services/database';
import { AuthService } from '../services/authService';
import { useStore } from '../store/useStore';

const BYPASS_AUTH = process.env.EXPO_PUBLIC_BYPASS_AUTH === 'true';

export function useDatabaseInit(): boolean {
  const [isReady, setIsReady] = useState(false);
  const loadFromDatabase = useStore((s) => s.loadFromDatabase);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        // Native devices use SQLite for the encrypted/offline cache. The web
        // app is intentionally online-only and does not persist patient data
        // in browser storage.
        if (Platform.OS !== 'web') await initDatabase();

        // 2. Load all persisted data into Zustand
        await loadFromDatabase();

        // 3. Restore secure auth session (auto-login if token still valid)
        const session = await AuthService.restoreSession();
        if (session && mounted) {
          const cached = useStore.getState().user;
          await useStore.getState().activatePatient({
            id: session.userId,
            name: session.fullName || (cached?.id === session.userId ? cached.name : ''),
            email: session.email,
            phone: session.phone || (cached?.id === session.userId ? cached.phone : ''),
            bloodType: session.bloodType || (cached?.id === session.userId ? cached.bloodType : ''),
            weight: cached?.id === session.userId ? cached.weight : '',
            height: cached?.id === session.userId ? cached.height : '',
            avatar: cached?.id === session.userId ? cached.avatar : undefined,
          }, true);
          console.log('[Auth] Session restored for:', session.email);
        } else if (BYPASS_AUTH && mounted) {
          useStore.setState({
            user: {
              id: 'demo-patient',
              name: 'Demo Patient',
              email: 'demo@medichain.test',
              phone: 'N/A',
              bloodType: 'AB',
              weight: '',
              height: '',
            },
            isAuthenticated: true,
            syncStatus: 'idle',
            syncError: null,
            lastSyncedAt: new Date().toISOString(),
            medications: [],
            records: [],
            appointments: [],
            blockchainLogs: [],
            healthMetrics: [],
            allergies: [],
            accessRequests: [],
          });
          console.log('[Auth] Bypass auth enabled. Demo patient activated.');
        }
      } catch (err) {
        console.error('[DB] Init error:', err);
      } finally {
        if (mounted) setIsReady(true);
      }
    };

    init();
    return () => { mounted = false; };
  }, [loadFromDatabase]);

  return isReady;
}
