// data/mockData.ts
import type {
  Patient, Appointment, MedicalRecord, AccessRequest,
  Notification, AnalyticsDataPoint, DepartmentStat,
  BlockchainStatus, DrugInteractionAlert
} from '@/types';

const TODAY = new Date().toISOString().split('T')[0];

export const MOCK_PATIENTS: Patient[] = [
  {
    id: 'P001', name: 'Aminata Koroma', initials: 'AK',
    age: 34, gender: 'Female', dob: '1991-03-15',
    phone: '+232 76 123 456', email: 'aminata.k@email.com',
    address: '12 Wilkinson Road, Freetown',
    bloodType: 'O+', condition: 'Hypertension',
    lastVisit: '2026-05-20', nextVisit: TODAY,
    status: 'Active',
    allergies: ['Penicillin', 'Aspirin'],
    medications: ['Lisinopril 10mg', 'Amlodipine 5mg'],
    emergencyContactName: 'Ibrahim Koroma',
    emergencyContactPhone: '+232 76 987 654',
    insuranceProvider: 'NASSIT', insuranceId: 'NAS-2291-AK',
    assignedDoctorId: 'D001',
    qrPublicAccess: true,
    qrPublicFields: ['name', 'bloodType', 'allergies', 'emergencyContact'],
  },
  {
    id: 'P002', name: 'Mohamed Bangura', initials: 'MB',
    age: 45, gender: 'Male', dob: '1980-07-22',
    phone: '+232 77 234 567', email: 'mbangura@email.com',
    address: '45 Congo Cross, Freetown',
    bloodType: 'A+', condition: 'Type 2 Diabetes',
    lastVisit: '2026-05-15', nextVisit: '2026-06-05',
    status: 'Active',
    allergies: ['Sulfa drugs'],
    medications: ['Metformin 500mg', 'Glibenclamide 5mg', 'Atorvastatin 20mg'],
    emergencyContactName: 'Fatmata Bangura',
    emergencyContactPhone: '+232 77 345 678',
    assignedDoctorId: 'D001',
    qrPublicAccess: true,
    qrPublicFields: ['name', 'bloodType', 'allergies', 'emergencyContact'],
  },
  {
    id: 'P003', name: 'Fatmata Sesay', initials: 'FS',
    age: 28, gender: 'Female', dob: '1997-11-08',
    phone: '+232 78 345 678',
    address: '8 Spur Road, Freetown',
    bloodType: 'B-', condition: 'Asthma',
    lastVisit: '2026-04-30',
    status: 'Active',
    allergies: ['NSAIDs', 'Dust mites'],
    medications: ['Salbutamol inhaler', 'Beclomethasone inhaler'],
    emergencyContactName: 'Alhaji Sesay',
    emergencyContactPhone: '+232 78 456 789',
    assignedDoctorId: 'D001',
    qrPublicAccess: true,
    qrPublicFields: ['name', 'bloodType', 'allergies'],
  },
  {
    id: 'P004', name: 'Ibrahim Turay', initials: 'IT',
    age: 62, gender: 'Male', dob: '1963-05-01',
    phone: '+232 79 456 789',
    address: '3 Hill Station Road, Freetown',
    bloodType: 'AB+', condition: 'Coronary Artery Disease',
    lastVisit: '2026-05-28',
    status: 'Critical',
    allergies: ['Iodine contrast', 'Warfarin (sensitivity)'],
    medications: ['Aspirin 75mg', 'Atenolol 50mg', 'Isosorbide mononitrate 20mg', 'Furosemide 40mg'],
    notes: 'Awaiting cardiac catheterization. Monitor BP closely.',
    emergencyContactName: 'Mariama Turay',
    emergencyContactPhone: '+232 79 567 890',
    assignedDoctorId: 'D001',
    qrPublicAccess: true,
    qrPublicFields: ['name', 'bloodType', 'allergies', 'emergencyContact'],
  },
  {
    id: 'P005', name: 'Isatu Mansaray', initials: 'IM',
    age: 19, gender: 'Female', dob: '2007-02-14',
    phone: '+232 76 567 890',
    address: '22 Kissy Road, Freetown',
    bloodType: 'O-', condition: 'Sickle Cell Disease',
    lastVisit: '2026-05-10',
    status: 'Active',
    allergies: ['Morphine'],
    medications: ['Hydroxyurea 500mg', 'Folic acid 5mg', 'Penicillin V 250mg (prophylaxis)'],
    emergencyContactName: 'Kadiatu Mansaray',
    emergencyContactPhone: '+232 76 678 901',
    assignedDoctorId: 'D001',
    qrPublicAccess: true,
    qrPublicFields: ['name', 'bloodType', 'allergies', 'emergencyContact'],
  },
  {
    id: 'P006', name: 'Samuel Kamara', initials: 'SK',
    age: 38, gender: 'Male', dob: '1988-09-30',
    phone: '+232 77 678 901',
    address: '67 Wellington Street, Freetown',
    bloodType: 'A-', condition: 'Malaria (recurrent)',
    lastVisit: '2026-03-15',
    status: 'Inactive',
    allergies: [],
    medications: ['Artemether-lumefantrine (as needed)'],
    emergencyContactName: 'Agnes Kamara',
    emergencyContactPhone: '+232 77 789 012',
    assignedDoctorId: 'D001',
    qrPublicAccess: false,
    qrPublicFields: [],
  },
  {
    id: 'P007', name: 'Mariama Conteh', initials: 'MC',
    age: 52, gender: 'Female', dob: '1973-12-03',
    phone: '+232 78 789 012',
    address: '14 Lumley Beach Road, Freetown',
    bloodType: 'B+', condition: 'Rheumatoid Arthritis',
    lastVisit: '2026-05-22', nextVisit: '2026-06-12',
    status: 'Active',
    allergies: ['Gold compounds'],
    medications: ['Methotrexate 15mg weekly', 'Folic acid 5mg', 'Prednisolone 5mg'],
    emergencyContactName: 'Abdul Conteh',
    emergencyContactPhone: '+232 78 890 123',
    assignedDoctorId: 'D001',
    qrPublicAccess: true,
    qrPublicFields: ['name', 'bloodType', 'emergencyContact'],
  },
  {
    id: 'P008', name: 'Alhaji Jalloh', initials: 'AJ',
    age: 71, gender: 'Male', dob: '1954-04-17',
    phone: '+232 79 890 123',
    address: '5 Brookfields Road, Freetown',
    bloodType: 'O+', condition: 'COPD + Hypertension',
    lastVisit: '2026-05-29', nextVisit: TODAY,
    status: 'Active',
    allergies: ['Beta-blockers (relative)'],
    medications: ['Tiotropium inhaler', 'Salbutamol PRN', 'Amlodipine 10mg', 'Ramipril 5mg'],
    emergencyContactName: 'Sia Jalloh',
    emergencyContactPhone: '+232 79 901 234',
    assignedDoctorId: 'D001',
    qrPublicAccess: true,
    qrPublicFields: ['name', 'bloodType', 'allergies', 'emergencyContact'],
  },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'A001', patientId: 'P001', patientName: 'Aminata Koroma',
    patientInitials: 'AK', patientAge: 34, patientGender: 'Female',
    date: TODAY, startTime: '09:00', endTime: '09:30',
    type: 'In-Person', category: 'Follow-up', status: 'In Progress',
  },
  {
    id: 'A002', patientId: 'P002', patientName: 'Mohamed Bangura',
    patientInitials: 'MB', patientAge: 45, patientGender: 'Male',
    date: TODAY, startTime: '10:00', endTime: '10:45',
    type: 'Virtual', category: 'Consultation', status: 'Upcoming',
    videoCallRoomId: 'mc-room-A002',
  },
  {
    id: 'A003', patientId: 'P008', patientName: 'Alhaji Jalloh',
    patientInitials: 'AJ', patientAge: 71, patientGender: 'Male',
    date: TODAY, startTime: '11:00', endTime: '11:30',
    type: 'In-Person', category: 'Follow-up', status: 'Upcoming',
  },
  {
    id: 'A004', patientId: 'P004', patientName: 'Ibrahim Turay',
    patientInitials: 'IT', patientAge: 62, patientGender: 'Male',
    date: TODAY, startTime: '14:00', endTime: '15:00',
    type: 'In-Person', category: 'Emergency', status: 'Upcoming',
    notes: 'Pre-catheterization assessment',
  },
  {
    id: 'A005', patientId: 'P003', patientName: 'Fatmata Sesay',
    patientInitials: 'FS', patientAge: 28, patientGender: 'Female',
    date: '2026-06-02', startTime: '09:00', endTime: '09:30',
    type: 'Virtual', category: 'Follow-up', status: 'Upcoming',
    videoCallRoomId: 'mc-room-A005',
  },
  {
    id: 'A006', patientId: 'P005', patientName: 'Isatu Mansaray',
    patientInitials: 'IM', patientAge: 19, patientGender: 'Female',
    date: '2026-06-03', startTime: '10:30', endTime: '11:00',
    type: 'In-Person', category: 'Lab Review', status: 'Upcoming',
  },
  {
    id: 'A007', patientId: 'P001', patientName: 'Aminata Koroma',
    patientInitials: 'AK', patientAge: 34, patientGender: 'Female',
    date: '2026-05-28', startTime: '09:00', endTime: '09:30',
    type: 'In-Person', category: 'Consultation', status: 'Completed',
  },
  {
    id: 'A008', patientId: 'P007', patientName: 'Mariama Conteh',
    patientInitials: 'MC', patientAge: 52, patientGender: 'Female',
    date: '2026-05-27', startTime: '15:00', endTime: '15:30',
    type: 'Virtual', category: 'Follow-up', status: 'No-Show',
    videoCallRoomId: 'mc-room-A008',
  },
  {
    id: 'A009', patientId: 'P006', patientName: 'Samuel Kamara',
    patientInitials: 'SK', patientAge: 38, patientGender: 'Male',
    date: '2026-05-25', startTime: '11:00', endTime: '11:30',
    type: 'In-Person', category: 'Consultation', status: 'Completed',
  },
];

export const MOCK_RECORDS: MedicalRecord[] = [
  {
    id: 'R001', patientId: 'P001', patientName: 'Aminata Koroma',
    date: '2026-05-20', type: 'Lab Report',
    description: 'Full blood count + renal function panel',
    hash: 'a3f7b9c1d2e4f60819a2b3c4d5e6f708',
    txHash: '0x7a3f9b1c2d4e6f8a0b2c4d6e8f0a2c4e',
    blockNumber: 1024,
    status: 'Synced', verified: true,
    ipfsCid: 'QmXf8Y7zKpLm3NqRsT2uVwE5hJcGbMnAoP9iDkFlH6ySv',
    uploadedBy: 'Dr. Amara Kofi', fileSize: '1.2 MB',
  },
  {
    id: 'R002', patientId: 'P002', patientName: 'Mohamed Bangura',
    date: '2026-05-15', type: 'Prescription',
    description: 'Diabetes medication renewal — Metformin + Glibenclamide',
    hash: 'b4g8c0d3e5f7a9102b3c4d5e6f7g8h9i',
    txHash: '0x8b4g0c3d5e7f9a1b3c5d7e9f1a3b5c7e',
    blockNumber: 1031,
    status: 'Synced', verified: true,
    ipfsCid: 'QmAb3Cd4Ef5Gh6Ij7Kl8Mn9Op0Qr1St2Uv3Wx4Yz5Aa6Bb',
    uploadedBy: 'Dr. Amara Kofi', fileSize: '340 KB',
  },
  {
    id: 'R003', patientId: 'P004', patientName: 'Ibrahim Turay',
    date: '2026-05-28', type: 'Imaging',
    description: 'Chest X-Ray — cardiac silhouette assessment',
    hash: 'c5h9d1e4f6g8b021c4d5e6f7g8h9i0j1',
    status: 'Verifying', verified: false,
    uploadedBy: 'Dr. Amara Kofi', fileSize: '4.8 MB',
  },
  {
    id: 'R004', patientId: 'P003', patientName: 'Fatmata Sesay',
    date: '2026-04-30', type: 'Consultation Note',
    description: 'Asthma review — spirometry results, inhaler technique assessment',
    hash: 'd6i0e2f5g7h9c132d5e6f7g8h9i0j1k2',
    txHash: '0x9c6i2e5f7g9h1a2b4c6d8e0f2a4b6d8e',
    blockNumber: 998,
    status: 'Synced', verified: true,
    ipfsCid: 'QmCc7Dd8Ee9Ff0Gg1Hh2Ii3Jj4Kk5Ll6Mm7Nn8Oo9Pp0Qq',
    uploadedBy: 'Dr. Amara Kofi', fileSize: '890 KB',
  },
  {
    id: 'R005', patientId: 'P005', patientName: 'Isatu Mansaray',
    date: '2026-05-10', type: 'Lab Report',
    description: 'Haemoglobin electrophoresis + HbF level monitoring',
    hash: 'e7j1f3g6h8i0d243e6f7g8h9i0j1k2l3',
    status: 'Pending', verified: false,
    uploadedBy: 'Dr. Amara Kofi', fileSize: '2.1 MB',
  },
  {
    id: 'R006', patientId: 'P007', patientName: 'Mariama Conteh',
    date: '2026-05-22', type: 'Prescription',
    description: 'Methotrexate therapy prescription + liver function monitoring note',
    hash: 'f8k2g4h7i9j1e354f7g8h9i0j1k2l3m4',
    txHash: '0xad8k4g7h9i1j2a3b5c7d9e1f3a5b7c9d',
    blockNumber: 1045,
    status: 'Synced', verified: true,
    ipfsCid: 'QmEe1Ff2Gg3Hh4Ii5Jj6Kk7Ll8Mm9Nn0Oo1Pp2Qq3Rr4Ss',
    uploadedBy: 'Dr. Amara Kofi', fileSize: '450 KB',
  },
  {
    id: 'R007', patientId: 'P008', patientName: 'Alhaji Jalloh',
    date: '2026-05-29', type: 'Consultation Note',
    description: 'COPD exacerbation review — oxygen saturation trending, medication adjustment',
    hash: 'g9l3h5i8j0k2f465g8h9i0j1k2l3m4n5',
    status: 'Pending', verified: false,
    uploadedBy: 'Dr. Amara Kofi', fileSize: '670 KB',
  },
];

export const MOCK_ACCESS_REQUESTS: AccessRequest[] = [
  {
    id: 'AC001', patientId: 'P001', patientName: 'Aminata Koroma', patientInitials: 'AK',
    requestedAt: '2026-05-20T08:30:00Z', expiresAt: '2026-06-20T08:30:00Z',
    status: 'Approved',
    recordTypes: ['Lab Report', 'Consultation Note', 'Prescription'],
    grantedBy: 'Aminata Koroma', txHash: '0xabc123def456',
  },
  {
    id: 'AC002', patientId: 'P002', patientName: 'Mohamed Bangura', patientInitials: 'MB',
    requestedAt: '2026-05-15T10:00:00Z', expiresAt: '2026-06-15T10:00:00Z',
    status: 'Approved',
    recordTypes: ['Prescription', 'Lab Report'],
    grantedBy: 'Mohamed Bangura', txHash: '0xdef456abc789',
  },
  {
    id: 'AC003', patientId: 'P004', patientName: 'Ibrahim Turay', patientInitials: 'IT',
    requestedAt: '2026-05-28T14:00:00Z', expiresAt: '2026-06-28T14:00:00Z',
    status: 'Approved',
    recordTypes: ['Imaging', 'Consultation Note', 'Lab Report'],
    grantedBy: 'Mariama Turay (Family)', txHash: '0x789abcdef012',
  },
  {
    id: 'AC004', patientId: 'P003', patientName: 'Fatmata Sesay', patientInitials: 'FS',
    requestedAt: '2026-05-30T09:00:00Z', expiresAt: '2026-06-30T09:00:00Z',
    status: 'Pending',
    recordTypes: ['Consultation Note'],
  },
  {
    id: 'AC005', patientId: 'P006', patientName: 'Samuel Kamara', patientInitials: 'SK',
    requestedAt: '2026-04-01T11:00:00Z', expiresAt: '2026-05-01T11:00:00Z',
    status: 'Expired',
    recordTypes: ['Consultation Note', 'Prescription'],
    grantedBy: 'Samuel Kamara',
  },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'N001', type: 'danger', title: 'Critical Patient Alert',
    message: 'Ibrahim Turay (P004) blood pressure reading critically high — 195/115 mmHg. Immediate review required.',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(), read: false, link: '/patients/P004',
  },
  {
    id: 'N002', type: 'warning', title: 'Drug Interaction Detected',
    message: 'Potential interaction between Methotrexate and NSAIDs for Mariama Conteh. Please review.',
    timestamp: new Date(Date.now() - 60 * 60000).toISOString(), read: false, link: '/patients/P007',
  },
  {
    id: 'N003', type: 'success', title: 'Record Synced to Blockchain',
    message: 'Lab report for Aminata Koroma (R001) successfully anchored. Block #1024.',
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), read: false, link: '/records',
  },
  {
    id: 'N004', type: 'info', title: 'Appointment Starting Soon',
    message: 'Virtual consultation with Mohamed Bangura at 10:00 AM. Room mc-room-A002.',
    timestamp: new Date(Date.now() - 3 * 3600000).toISOString(), read: true, link: '/appointments',
  },
  {
    id: 'N005', type: 'success', title: 'Access Request Approved',
    message: 'Fatmata Sesay has approved your access to her Consultation Notes. Access expires in 30 days.',
    timestamp: new Date(Date.now() - 5 * 3600000).toISOString(), read: true, link: '/access-log',
  },
  {
    id: 'N006', type: 'warning', title: 'Record Pending Sync',
    message: '2 records (R005, R007) are still pending blockchain sync. Check network connection.',
    timestamp: new Date(Date.now() - 24 * 3600000).toISOString(), read: true, link: '/records',
  },
];

export const MOCK_ANALYTICS: AnalyticsDataPoint[] = [
  { month: 'Nov', patients: 38, appointments: 52, records: 24 },
  { month: 'Dec', patients: 45, appointments: 61, records: 31 },
  { month: 'Jan', patients: 52, appointments: 74, records: 38 },
  { month: 'Feb', patients: 61, appointments: 88, records: 45 },
  { month: 'Mar', patients: 74, appointments: 103, records: 59 },
  { month: 'Apr', patients: 89, appointments: 118, records: 72 },
];

export const MOCK_DEPT_STATS: DepartmentStat[] = [
  { name: 'General Medicine', percentage: 42, color: '#0D9426', count: 89 },
  { name: 'Cardiology', percentage: 21, color: '#8F76FF', count: 44 },
  { name: 'Paediatrics', percentage: 18, color: '#FA6E3C', count: 38 },
  { name: 'Maternal Health', percentage: 12, color: '#1D9E75', count: 25 },
  { name: 'Emergency', percentage: 7, color: '#E53E3E', count: 15 },
];

export const MOCK_BLOCKCHAIN_STATUS: BlockchainStatus = {
  connected: true,
  fabricId: 'doctor-amara-kofi@medichain.sl',
  network: 'mychannel',
  lastSync: new Date(Date.now() - 8 * 60000).toISOString(),
  pendingTx: 2,
  totalRecords: 7,
};

export const MOCK_DRUG_ALERTS: DrugInteractionAlert[] = [
  {
    id: 'DA001', patientId: 'P004', patientName: 'Ibrahim Turay',
    drug1: 'Aspirin 75mg', drug2: 'Warfarin (sensitivity)',
    severity: 'High',
    description: 'Combined anticoagulant effect increases bleeding risk significantly.',
  },
  {
    id: 'DA002', patientId: 'P007', patientName: 'Mariama Conteh',
    drug1: 'Methotrexate', drug2: 'NSAIDs',
    severity: 'High',
    description: 'NSAIDs can increase Methotrexate toxicity by reducing renal clearance.',
  },
  {
    id: 'DA003', patientId: 'P002', patientName: 'Mohamed Bangura',
    drug1: 'Metformin', drug2: 'Atorvastatin',
    severity: 'Medium',
    description: 'Monitor for increased lactic acidosis risk. Check renal function regularly.',
  },
];

export const LOGGED_IN_DOCTOR = {
  id: 'D001',
  name: 'Dr. Amara Kofi',
  initials: 'AK',
  email: 'amara.kofi@medichain.sl',
  role: 'doctor' as const,
  fabricId: 'doctor-amara-kofi@medichain.sl',
  hospitalAffiliation: 'Connaught Hospital, Freetown',
  licenseNumber: 'SL-MED-2019-0047',
  isEnrolled: true,
};

// ── GOVERNMENT PORTAL DATA ──────────────────────────────────────

export const MOCK_REGIONAL_STATS = [
  { region: 'Western Area',      patients: 18420, facilities: 24, doctors: 312, drugScore: 88 },
  { region: 'Eastern Province',  patients: 9810,  facilities: 18, doctors: 143, drugScore: 71 },
  { region: 'Northern Province', patients: 11230, facilities: 20, doctors: 178, drugScore: 76 },
  { region: 'Southern Province', patients: 8900,  facilities: 16, doctors: 134, drugScore: 68 },
  { region: 'North West',        patients: 6540,  facilities: 12, doctors: 98,  drugScore: 62 },
];

export const MOCK_DRUG_DISTRIBUTION = [
  { drug: 'Amoxicillin',  hospital: 'Connaught Hospital',      qty: 500,  date: '2026-06-01', region: 'Western Area',      status: 'Delivered',
    txId: 'a3f9e2d1b8c74f6e2a1d9b3c8e5f7a2d4b6c8e1f3a5d7b9c2e4f6a8d1b3c5e7', blockNumber: 141 },
  { drug: 'Paracetamol',  hospital: 'Ola During Hospital',     qty: 1200, date: '2026-06-02', region: 'Western Area',      status: 'Delivered',
    txId: 'b4e8f3c2a9d75e7f3b2e8c4a9f1d6b5e3a7c9f2d4b6e8a1c3f5d7b9e2a4c6d8', blockNumber: 142 },
  { drug: 'Artemether',   hospital: 'Kenema Govt Hospital',    qty: 300,  date: '2026-06-03', region: 'Eastern Province',  status: 'In Transit',
    txId: 'c5f7a4d3b2e8f9a1c4f7d2b5e8a3c6f1d4b7e2a5c8f3d6b1e4a7c2f5d8b3e6a9', blockNumber: 143 },
  { drug: 'ORS Sachets',  hospital: 'Bo Government Hospital',  qty: 800,  date: '2026-06-04', region: 'Southern Province', status: 'Delivered',
    txId: 'd6a8b5c4e3f2a7d1c5b8e3a6d2c7f4b1e5a8d3c6f1b4e7a2d5c8f3b6e1a4d7c2', blockNumber: 144 },
  { drug: 'Vitamin A',    hospital: 'Port Loko District Hosp', qty: 450,  date: '2026-06-05', region: 'Northern Province', status: 'Pending',
    txId: null, blockNumber: null },
];

export const MOCK_DISEASE_STATS = [
  { disease: 'Malaria',      cases: 4820, change: 12, trend: 'up'   },
  { disease: 'Typhoid',      cases: 1230, change: -5,  trend: 'down' },
  { disease: 'Cholera',      cases: 340,  change: 2,  trend: 'up'   },
  { disease: 'Tuberculosis', cases: 780,  change: -8,  trend: 'down' },
  { disease: 'COVID-19',     cases: 120,  change: -22, trend: 'down' },
];

// ── STAFF / PHARMACY PORTAL DATA ────────────────────────────────

export const MOCK_PRESCRIPTIONS = [
  { id: 'RX-001', drug: 'Amoxicillin 500mg', dosage: '1 tablet 3x/day', qty: 21, issuedBy: 'Dr. Amara Kofi',  issuedAt: '2026-06-07 09:15', status: 'Pending',
    fabricTxId: 'e7b1c4f8a2d6e3b9c5f2a8d4b7e1c6f3a9d2b5e8c1f4a7d3b6e9c2f5a1d8b4e7', fabricBlock: 148 },
  { id: 'RX-002', drug: 'Ibuprofen 400mg',   dosage: '1 tablet 2x/day', qty: 14, issuedBy: 'Dr. John Kamara', issuedAt: '2026-06-07 10:30', status: 'Dispensed',
    fabricTxId: 'f8c2d5a9b3e7f4c1d8b5e2a9c6f3d1b8e5c2f9a6d3b1e8c5f2a9d6b3e1c8f5a2', fabricBlock: 149 },
  { id: 'RX-003', drug: 'Metformin 850mg',   dosage: '1 tablet 2x/day', qty: 60, issuedBy: 'Dr. Amara Kofi',  issuedAt: '2026-06-06 14:00', status: 'Pending',
    fabricTxId: 'a1d4f7b2e5c8a3d6f9b4e7c2a5d8f1b6e3c9a4d7f2b5e8c1a6d3f8b2e5c7a4d1', fabricBlock: 145 },
  { id: 'RX-004', drug: 'Omeprazole 20mg',   dosage: '1 capsule/day',   qty: 30, issuedBy: 'Dr. John Kamara', issuedAt: '2026-06-05 11:45', status: 'Expired',
    fabricTxId: 'b2e5a8c1d4f7b3e6a9c2d5f8b1e4a7c3d6f9b2e5c8a1d4f7b3e6a9c2d5f8b1e4', fabricBlock: 138 },
];

export const MOCK_DRUG_INVENTORY = [
  { name: 'Amoxicillin 500mg', category: 'Antibiotic',   inStock: 340, threshold: 100, lastRestocked: '2026-05-20', supplier: 'MedPharm SL',   status: 'In Stock'    },
  { name: 'Paracetamol 500mg', category: 'Analgesic',    inStock: 80,  threshold: 150, lastRestocked: '2026-05-15', supplier: 'HealthSupply',  status: 'Low Stock'   },
  { name: 'Artemether/Lum.',   category: 'Antimalarial', inStock: 0,   threshold: 50,  lastRestocked: '2026-04-30', supplier: 'UNICEF SL',     status: 'Out of Stock'},
  { name: 'Metformin 850mg',   category: 'Antidiabetic', inStock: 210, threshold: 80,  lastRestocked: '2026-06-01', supplier: 'MedPharm SL',   status: 'In Stock'    },
  { name: 'Vitamin A 200k IU', category: 'Supplement',   inStock: 45,  threshold: 60,  lastRestocked: '2026-05-28', supplier: 'WHO SL Office', status: 'Low Stock'   },
];

// ── ADMIN PORTAL DATA ────────────────────────────────────────────

export const MOCK_SYSTEM_USERS = [
  { id: 'USR-001', name: 'Dr. Amara Kofi',  email: 'doctor@medichain.sl',  role: 'doctor' as const,     hospital: 'Connaught Hospital',  status: 'Active', registeredAt: '2026-01-10',
    fabricIdentity: 'doctor-amara-kofi',  fabricOrg: 'DoctorOrg',     enrolledAt: '2026-01-10' },
  { id: 'USR-002', name: 'Dr. John Kamara', email: 'doctor2@medichain.sl', role: 'doctor' as const,     hospital: 'Connaught Hospital',  status: 'Active', registeredAt: '2026-01-15',
    fabricIdentity: 'doctor-john-kamara', fabricOrg: 'DoctorOrg',     enrolledAt: '2026-01-15' },
  { id: 'USR-003', name: 'Nurse Inos',      email: 'nurse@medichain.sl',   role: 'nurse' as const,      hospital: 'Ola During Hospital', status: 'Active', registeredAt: '2026-02-01',
    fabricIdentity: 'nurse-inos',         fabricOrg: 'NurseOrg',      enrolledAt: '2026-02-01' },
  { id: 'USR-004', name: 'Admin Staff',     email: 'staff@medichain.sl',   role: 'staff' as const,      hospital: 'Connaught Hospital',  status: 'Active', registeredAt: '2026-02-10',
    fabricIdentity: 'staff-pharmacy-01',  fabricOrg: 'PharmacyOrg',   enrolledAt: '2026-02-10' },
  { id: 'USR-005', name: 'Min. Health Rep', email: 'gov@mohs.sl',          role: 'government' as const, hospital: 'MOHS Freetown',       status: 'Active', registeredAt: '2026-03-01',
    fabricIdentity: 'gov-mohs-rep-01',    fabricOrg: 'GovernmentOrg', enrolledAt: '2026-03-01' },
];

export const MOCK_AUDIT_LOG = [
  { timestamp: '2026-06-08 09:12', user: 'Dr. Amara Kofi',  role: 'doctor', action: 'record_upload',   resource: 'Patient MCH-002', ip: '10.0.0.4',   status: 'Success',
    fabricTxId: 'a3f9e2d1b8c74f6e2a1d9b3c8e5f7a2d4b6c8e1f3a5d7b9c2e4f6a8d1b3c5e7', fabricBlock: 150, channel: 'medical-records-channel' },
  { timestamp: '2026-06-08 09:08', user: 'Admin Staff',     role: 'staff',  action: 'login',           resource: 'System',          ip: '10.0.0.9',   status: 'Success',
    fabricTxId: null, fabricBlock: null, channel: null },
  { timestamp: '2026-06-08 08:55', user: 'Unknown',         role: '—',      action: 'login',           resource: 'System',          ip: '41.223.8.2', status: 'Failed',
    fabricTxId: null, fabricBlock: null, channel: null },
  { timestamp: '2026-06-08 08:40', user: 'Dr. John Kamara', role: 'doctor', action: 'access_granted',  resource: 'Patient MCH-005', ip: '10.0.0.5',   status: 'Success',
    fabricTxId: 'c5f7a4d3b2e8f9a1c4f7d2b5e8a3c6f1d4b7e2a5c8f3d6b1e4a7c2f5d8b3e6a9', fabricBlock: 147, channel: 'medical-records-channel' },
  { timestamp: '2026-06-07 17:30', user: 'OJOE Admin',      role: 'admin',  action: 'user_registered', resource: 'Nurse Inos',      ip: '10.0.0.1',   status: 'Success',
    fabricTxId: 'd6a8b5c4e3f2a7d1c5b8e3a6d2c7f4b1e5a8d3c6f1b4e7a2d5c8f3b6e1a4d7c2', fabricBlock: 133, channel: 'admin-channel' },
];

// Fabric-specific system health — use these service names exactly on /admin/health
export const MOCK_SYSTEM_HEALTH = [
  { service: 'Fabric Peer (Org1)',        status: 'Online',   uptime: 99.98, lastChecked: '2026-06-09 11:00' },
  { service: 'Fabric Peer (Org2)',        status: 'Online',   uptime: 99.95, lastChecked: '2026-06-09 11:00' },
  { service: 'Fabric Ordering Service',  status: 'Online',   uptime: 99.91, lastChecked: '2026-06-09 11:00' },
  { service: 'Fabric CA Server',         status: 'Online',   uptime: 100.0, lastChecked: '2026-06-09 11:00' },
  { service: 'IPFS Node',                status: 'Degraded', uptime: 97.40, lastChecked: '2026-06-09 11:00' },
  { service: 'Backend API Server',       status: 'Online',   uptime: 99.99, lastChecked: '2026-06-09 11:00' },
  { service: 'PostgreSQL Database',      status: 'Online',   uptime: 100.0, lastChecked: '2026-06-09 11:00' },
];
