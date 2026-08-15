/**
 * MediChain Global Store — Zustand + SQLite
 *
 * Architecture:
 *  - Zustand holds in-memory state for fast UI reactivity.
 *  - Every write action ALSO persists to SQLite via DatabaseService.
 *  - On app startup, `loadFromDatabase()` loads only data that was actually
 *    persisted for the signed-in patient.
 */
import { create } from 'zustand';
import { Platform } from 'react-native';
import { createLogger } from '../utils/logger';

const logger = createLogger('useStore');
const isWeb = Platform.OS === 'web';
import { User, Medication, Record, Appointment, BlockchainLog, HealthMetric, Allergy, DoctorAccessRequest } from '../types';
import {
  UserDB, MedicationDB, RecordDB, AppointmentDB,
  BlockchainLogDB, HealthMetricDB, AllergyDB, clearPatientData,
} from '../services/database';
import { PatientDataService } from '../services/patientDataService';

// ─── Store Interface ────────────────────────────────────────────────────────

interface AppState {
  // DB state
  isDbReady: boolean;
  setDbReady: (ready: boolean) => void;

  // Auth
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setAuthenticated: (value: boolean) => void;
  activatePatient: (user: User, preserveExistingCache?: boolean) => Promise<void>;
  logout: () => Promise<void>;

  // Health Data
  medications: Medication[];
  records: Record[];
  appointments: Appointment[];
  blockchainLogs: BlockchainLog[];
  healthMetrics: HealthMetric[];
  allergies: Allergy[];
  accessRequests: DoctorAccessRequest[];
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  syncError: string | null;
  lastSyncedAt: string | null;

  // Actions
  loadFromDatabase: () => Promise<void>;
  syncPatientData: () => Promise<void>;

  addRecord: (record: Record) => Promise<void>;
  removeRecord: (id: string) => Promise<void>;

  addMedication: (med: Medication) => Promise<void>;
  removeMedication: (id: string) => Promise<void>;
  updateMedicationStatus: (id: string, status: Medication['status']) => Promise<void>;

  addAppointment: (app: Appointment) => Promise<void>;
  removeAppointment: (id: string) => Promise<void>;

  addBlockchainLog: (log: BlockchainLog) => Promise<void>;

  addAllergy: (allergy: Allergy) => Promise<void>;
  removeAllergy: (id: string) => Promise<void>;
  
  approveAccessRequest: (id: string) => void;
  denyAccessRequest: (id: string) => void;

  // Settings
  isScanning: boolean;
  setIsScanning: (value: boolean) => void;

  // Security
  isMfaEnabled: boolean;
  isBiometricsEnabled: boolean;
  setMfaEnabled: (value: boolean) => void;
  setBiometricsEnabled: (value: boolean) => void;
}

// ─── Store ──────────────────────────────────────────────────────────────────

export const useStore = create<AppState>((set, get) => ({
  // DB
  isDbReady: false,
  setDbReady: (isDbReady) => set({ isDbReady }),

  // Auth
  user: null,
  isAuthenticated: false,
  setUser: (user) => {
    set({ user });
    if (user && !isWeb) UserDB.upsert(user).catch((err) => logger.error('Failed to upsert user', err));
  },
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  activatePatient: async (user, preserveExistingCache = false) => {
    const cachedUser = isWeb ? get().user : await UserDB.get();
    const preserveCache = preserveExistingCache && cachedUser?.id === user.id;
    if (!isWeb && !preserveCache) await clearPatientData();

    const activeUser: User = preserveCache && cachedUser ? {
      ...cachedUser,
      ...user,
      name: user.name || cachedUser.name,
      email: user.email || cachedUser.email,
      phone: user.phone || cachedUser.phone,
      bloodType: user.bloodType || cachedUser.bloodType,
      weight: user.weight || cachedUser.weight,
      height: user.height || cachedUser.height,
    } : user;

    if (!isWeb) await UserDB.replace(activeUser);
    set({
      user: activeUser,
      isAuthenticated: true,
      ...(preserveCache ? {} : {
        medications: [], records: [], appointments: [], blockchainLogs: [],
        healthMetrics: [], allergies: [], accessRequests: [],
      }),
      syncError: null,
    });
    await get().syncPatientData();
  },
  logout: async () => {
    try {
      if (!isWeb) await clearPatientData();
    } catch (error) {
      logger.error('Failed to clear local patient cache during sign-out', error);
    } finally {
      set({
        user: null, isAuthenticated: false, medications: [], records: [],
        appointments: [], blockchainLogs: [], healthMetrics: [], allergies: [],
        accessRequests: [], syncStatus: 'idle', syncError: null, lastSyncedAt: null,
      });
    }
  },

  // Never invent patient information while the real data is loading.
  medications: [],
  records: [],
  appointments: [],
  blockchainLogs: [],
  healthMetrics: [],
  allergies: [],
  accessRequests: [],
  syncStatus: 'idle',
  syncError: null,
  lastSyncedAt: null,

  // ── DB Loader ──────────────────────────────────────────────────────────
  loadFromDatabase: async () => {
    if (isWeb) {
      set({
        user: null, medications: [], records: [], appointments: [],
        blockchainLogs: [], healthMetrics: [], allergies: [], isDbReady: true,
      });
      return;
    }
    try {
      // Load only persisted data into Zustand.
      const [meds, records, appts, logs, metrics, allergies, user] = await Promise.all([
        MedicationDB.getAll(),
        RecordDB.getAll(),
        AppointmentDB.getAll(),
        BlockchainLogDB.getAll(),
        HealthMetricDB.getAll(),
        AllergyDB.getAll(),
        UserDB.get(),
      ]);

      set({
        medications: user ? meds : [],
        records: user ? records : [],
        appointments: user ? appts : [],
        blockchainLogs: user ? logs : [],
        healthMetrics: user ? metrics : [],
        allergies: user ? allergies : [],
        user: user ?? null,
        isDbReady: true,
      });

      logger.info('[DB] Loaded all data from SQLite');
    } catch (err) {
      logger.error('[DB] Failed to load from database:', err);
      // Fail closed: a local database error must never reveal fictional data.
      set({
        medications: [], records: [], appointments: [], blockchainLogs: [],
        healthMetrics: [], allergies: [], isDbReady: true,
      });
    }
  },

  // ── Records ────────────────────────────────────────────────────────────
  syncPatientData: async () => {
    if (get().syncStatus === 'syncing') return;
    set({ syncStatus: 'syncing', syncError: null });
    try {
      const snapshot = await PatientDataService.fetchSnapshot();
      const currentUser = get().user;
      if (currentUser && currentUser.id !== snapshot.user.id) throw new Error('PATIENT_IDENTITY_MISMATCH');
      const user: User = {
        ...snapshot.user,
        weight: currentUser?.weight || '',
        height: currentUser?.height || '',
        avatar: currentUser?.avatar,
      };
      if (!isWeb) {
        await RecordDB.replaceAll(snapshot.records);
        await UserDB.replace(user);
      }
      const lastSyncedAt = new Date().toISOString();
      set({ user, records: snapshot.records, syncStatus: 'success', syncError: null, lastSyncedAt });
    } catch (error: any) {
      logger.error('Patient data sync failed', error);
      const message = error?.message === 'SYNC_TIMEOUT'
        ? 'The connection timed out. Showing the last records saved on this device.'
        : error?.message === 'SESSION_NOT_AUTHORIZED'
          ? 'Your session could not be verified. Please sign in again.'
          : 'Records could not be refreshed. Showing the last records saved on this device.';
      set({ syncStatus: 'error', syncError: message });
    }
  },

  addRecord: async (record) => {
    await RecordDB.insert(record);
    set((state) => ({ records: [record, ...state.records] }));
  },
  removeRecord: async (id) => {
    await RecordDB.delete(id);
    set((state) => ({ records: state.records.filter(r => r.id !== id) }));
  },

  // ── Medications ────────────────────────────────────────────────────────
  addMedication: async (med) => {
    await MedicationDB.insert(med);
    set((state) => ({ medications: [...state.medications, med] }));
  },
  removeMedication: async (id) => {
    await MedicationDB.delete(id);
    set((state) => ({ medications: state.medications.filter(m => m.id !== id) }));
  },
  updateMedicationStatus: async (id, status) => {
    await MedicationDB.updateStatus(id, status);
    set((state) => ({
      medications: state.medications.map(m => m.id === id ? { ...m, status } : m),
    }));
  },

  // ── Appointments ───────────────────────────────────────────────────────
  addAppointment: async (app) => {
    await AppointmentDB.insert(app);
    set((state) => ({ appointments: [...state.appointments, app] }));
  },
  removeAppointment: async (id) => {
    await AppointmentDB.delete(id);
    set((state) => ({ appointments: state.appointments.filter(a => a.id !== id) }));
  },

  // ── Blockchain Logs ────────────────────────────────────────────────────
  addBlockchainLog: async (log) => {
    await BlockchainLogDB.insert(log);
    set((state) => ({ blockchainLogs: [log, ...state.blockchainLogs] }));
  },

  // ── Allergies ──────────────────────────────────────────────────────────
  addAllergy: async (allergy) => {
    await AllergyDB.insert(allergy);
    set((state) => ({ allergies: [...state.allergies, allergy] }));
  },
  removeAllergy: async (id) => {
    await AllergyDB.delete(id);
    set((state) => ({ allergies: state.allergies.filter(a => a.id !== id) }));
  },

  // ── Access Requests ────────────────────────────────────────────────────
  approveAccessRequest: (id) => {
    set((state) => ({
      accessRequests: state.accessRequests.map(r => r.id === id ? { ...r, status: 'approved' } : r)
    }));
  },
  denyAccessRequest: (id) => {
    set((state) => ({
      accessRequests: state.accessRequests.map(r => r.id === id ? { ...r, status: 'denied' } : r)
    }));
  },

  // ── Settings (not persisted in DB — can add later) ─────────────────────
  isScanning: false,
  setIsScanning: (isScanning) => set({ isScanning }),

  isMfaEnabled: true,
  isBiometricsEnabled: true,
  setMfaEnabled: (isMfaEnabled) => set({ isMfaEnabled }),
  setBiometricsEnabled: (isBiometricsEnabled) => set({ isBiometricsEnabled }),
}));
