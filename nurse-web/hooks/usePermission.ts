// doctor-web/hooks/usePermission.ts

import { useAuth } from './useAuth';
import { Permission, UserRole } from '../types';

const PERMISSIONS: Record<UserRole, Permission> = {
  doctor: {
    canViewPatients: true,       canViewPatientNames: true,
    canViewRecords: true,        canUploadRecords: true,
    canWritePrescriptions: true, canDispenseMeds: false,
    canViewAppointments: true,   canBookAppointments: true,
    canScanQR: true,             canViewDrugLogs: false,
    canViewNationalStats: false, canRegisterUsers: false,
    canManageAccess: false,      canViewAuditLog: true,
    canViewSystemHealth: false,  dataIsAnonymised: false,
  },
  nurse: {
    canViewPatients: true,       canViewPatientNames: true,
    canViewRecords: true,        canUploadRecords: true,
    canWritePrescriptions: false,canDispenseMeds: false,
    canViewAppointments: true,   canBookAppointments: true,
    canScanQR: true,             canViewDrugLogs: false,
    canViewNationalStats: false, canRegisterUsers: false,
    canManageAccess: false,      canViewAuditLog: false,
    canViewSystemHealth: false,  dataIsAnonymised: false,
  },
  staff: {
    canViewPatients: false,      canViewPatientNames: false,
    canViewRecords: false,       canUploadRecords: false,
    canWritePrescriptions: false,canDispenseMeds: true,
    canViewAppointments: true,   canBookAppointments: true,
    canScanQR: false,            canViewDrugLogs: true,
    canViewNationalStats: false, canRegisterUsers: false,
    canManageAccess: false,      canViewAuditLog: false,
    canViewSystemHealth: false,  dataIsAnonymised: false,
  },
  government: {
    canViewPatients: false,      canViewPatientNames: false,
    canViewRecords: false,       canUploadRecords: false,
    canWritePrescriptions: false,canDispenseMeds: false,
    canViewAppointments: false,  canBookAppointments: false,
    canScanQR: false,            canViewDrugLogs: true,
    canViewNationalStats: true,  canRegisterUsers: false,
    canManageAccess: false,      canViewAuditLog: false,
    canViewSystemHealth: false,  dataIsAnonymised: true,
  },
  admin: {
    canViewPatients: true,       canViewPatientNames: true,
    canViewRecords: true,        canUploadRecords: true,
    canWritePrescriptions: false,canDispenseMeds: false,
    canViewAppointments: true,   canBookAppointments: true,
    canScanQR: false,            canViewDrugLogs: true,
    canViewNationalStats: true,  canRegisterUsers: true,
    canManageAccess: true,       canViewAuditLog: true,
    canViewSystemHealth: true,   dataIsAnonymised: false,
  },
};

export function usePermission(): Permission {
  const { role } = useAuth();
  if (!role) return PERMISSIONS.doctor;
  return PERMISSIONS[role];
}
