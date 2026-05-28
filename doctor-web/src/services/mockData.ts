import type { Patient, Appointment, MedicalRecord, AccessRequest, Notification, AnalyticsData, DepartmentStat } from '../types';

export const MOCK_PATIENTS: Patient[] = [
  { id: 'P001', name: 'Michael Chen', initials: 'MC', age: 42, gender: 'Male', dob: '1982-05-14', phone: '+1 (555) 234-5678', email: 'michael.chen@email.com', address: '12 Oak Street, San Francisco, CA', bloodType: 'A+', condition: 'Hypertension', lastVisit: '2024-04-20', nextVisit: '2024-05-15', status: 'Active', walletAddress: '0x742d35Cc6634C0532925a3b8D4C9f1234', allergies: ['Penicillin'], medications: ['Lisinopril 10mg', 'Amlodipine 5mg'], notes: 'Blood pressure well controlled. Continue current medication.' },
  { id: 'P002', name: 'Emma Watson', initials: 'EW', age: 28, gender: 'Female', dob: '1996-03-22', phone: '+1 (555) 345-6789', email: 'emma.watson@email.com', address: '45 Maple Ave, Boston, MA', bloodType: 'O-', condition: 'Annual Checkup', lastVisit: '2024-04-18', nextVisit: '2025-04-18', status: 'Active', walletAddress: '0x8c52a1B3d9E7f2A4C8B6D1E3F5A7C9B1', allergies: [], medications: [], notes: 'All vitals normal. Recommended vitamin D supplement.' },
  { id: 'P003', name: 'James Rodriguez', initials: 'JR', age: 35, gender: 'Male', dob: '1989-08-10', phone: '+1 (555) 456-7890', email: 'james.r@email.com', address: '78 Pine Road, Chicago, IL', bloodType: 'B+', condition: 'Post-operative', lastVisit: '2024-04-22', nextVisit: '2024-05-06', status: 'Active', allergies: ['Aspirin', 'Sulfa drugs'], medications: ['Oxycodone 5mg', 'Amoxicillin 500mg'], notes: 'Post appendectomy recovery. Wound healing well.' },
  { id: 'P004', name: 'Sophia Miller', initials: 'SM', age: 54, gender: 'Female', dob: '1970-01-30', phone: '+1 (555) 567-8901', email: 'sophia.miller@email.com', address: '23 Elm Court, Seattle, WA', bloodType: 'AB+', condition: 'Type 2 Diabetes', lastVisit: '2024-04-25', nextVisit: '2024-05-25', status: 'Active', walletAddress: '0x3F5A7C9B1D2E4F6A8C0B2D4E6F8A0C2D', allergies: ['Latex'], medications: ['Metformin 1000mg', 'Glipizide 5mg', 'Atorvastatin 20mg'], notes: 'HbA1c slightly elevated. Adjust diet plan.' },
  { id: 'P005', name: 'David Wilson', initials: 'DW', age: 61, gender: 'Male', dob: '1963-11-05', phone: '+1 (555) 678-9012', email: 'david.wilson@email.com', address: '56 Birch Lane, Austin, TX', bloodType: 'A-', condition: 'Coronary Artery Disease', lastVisit: '2024-03-30', status: 'Inactive', allergies: ['Ibuprofen'], medications: ['Aspirin 81mg', 'Atorvastatin 40mg', 'Metoprolol 50mg'], notes: 'Missed last two follow-ups. Needs urgent contact.' },
  { id: 'P006', name: 'Aisha Kamara', initials: 'AK', age: 31, gender: 'Female', dob: '1993-07-19', phone: '+1 (555) 789-0123', email: 'aisha.k@email.com', address: '89 Cedar Drive, Miami, FL', bloodType: 'O+', condition: 'Asthma', lastVisit: '2024-04-28', nextVisit: '2024-07-28', status: 'Active', allergies: ['NSAIDs', 'Cat dander'], medications: ['Salbutamol inhaler', 'Fluticasone inhaler'], notes: 'Asthma well managed. No acute episodes in 3 months.' },
  { id: 'P007', name: 'Carlos Diaz', initials: 'CD', age: 47, gender: 'Male', dob: '1977-04-03', phone: '+1 (555) 890-1234', email: 'carlos.d@email.com', address: '34 Willow Way, Phoenix, AZ', bloodType: 'B-', condition: 'Hypothyroidism', lastVisit: '2024-04-10', nextVisit: '2024-10-10', status: 'Active', allergies: [], medications: ['Levothyroxine 50mcg'], notes: 'TSH levels normal. Continue current dose.' },
  { id: 'P008', name: 'Linda Park', initials: 'LP', age: 38, gender: 'Female', dob: '1986-12-28', phone: '+1 (555) 901-2345', email: 'linda.park@email.com', address: '67 Spruce Street, Denver, CO', bloodType: 'AB-', condition: 'Rheumatoid Arthritis', lastVisit: '2024-04-15', nextVisit: '2024-05-20', status: 'Critical', walletAddress: '0xA1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6', allergies: ['Sulfa drugs'], medications: ['Methotrexate 15mg', 'Folic Acid 1mg', 'Hydroxychloroquine 200mg'], notes: 'Flare-up last week. Increased steroid dose temporarily.' },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  { id: 'APT001', patientId: 'P001', patientName: 'Michael Chen', patientInitials: 'MC', patientAge: 42, patientGender: 'Male', date: new Date().toISOString().split('T')[0], startTime: '09:00 AM', endTime: '09:30 AM', type: 'In-Person', category: 'Cardiology Follow-up', status: 'Upcoming', experience: '5 Star · 9 years', rating: 4.9 },
  { id: 'APT002', patientId: 'P002', patientName: 'Emma Watson', patientInitials: 'EW', patientAge: 28, patientGender: 'Female', date: new Date().toISOString().split('T')[0], startTime: '10:30 AM', endTime: '11:00 AM', type: 'In-Person', category: 'Annual Checkup', status: 'Upcoming', experience: '4.8 Star · 6 years', rating: 4.8 },
  { id: 'APT003', patientId: 'P003', patientName: 'James Rodriguez', patientInitials: 'JR', patientAge: 35, patientGender: 'Male', date: new Date().toISOString().split('T')[0], startTime: '11:45 AM', endTime: '12:15 PM', type: 'In-Person', category: 'Post-Op Review', status: 'Upcoming', experience: '4.9 Star · 7 years', rating: 4.7 },
  { id: 'APT004', patientId: 'P004', patientName: 'Sophia Miller', patientInitials: 'SM', patientAge: 54, patientGender: 'Female', date: new Date().toISOString().split('T')[0], startTime: '01:00 PM', endTime: '01:30 PM', type: 'Virtual', category: 'Diabetes Management', status: 'In Progress', experience: '4.5 Star · 9 years', rating: 4.5 },
  { id: 'APT005', patientId: 'P006', patientName: 'Aisha Kamara', patientInitials: 'AK', patientAge: 31, patientGender: 'Female', date: new Date().toISOString().split('T')[0], startTime: '02:30 PM', endTime: '03:00 PM', type: 'In-Person', category: 'Pulmonology', status: 'Upcoming', experience: '5 Star · 12 years', rating: 5.0 },
  { id: 'APT006', patientId: 'P007', patientName: 'Carlos Diaz', patientInitials: 'CD', patientAge: 47, patientGender: 'Male', date: new Date().toISOString().split('T')[0], startTime: '03:30 PM', endTime: '04:00 PM', type: 'Virtual', category: 'Endocrinology', status: 'Upcoming', experience: '4.8 Star · 6 years', rating: 4.8 },
  { id: 'APT007', patientId: 'P008', patientName: 'Linda Park', patientInitials: 'LP', patientAge: 38, patientGender: 'Female', date: new Date().toISOString().split('T')[0], startTime: '04:30 PM', endTime: '05:00 PM', type: 'In-Person', category: 'Rheumatology', status: 'Upcoming', experience: '4.7 Star · 8 years', rating: 4.7 },
  { id: 'APT008', patientId: 'P005', patientName: 'David Wilson', patientInitials: 'DW', patientAge: 61, patientGender: 'Male', date: '2024-04-29', startTime: '10:00 AM', endTime: '10:30 AM', type: 'In-Person', category: 'Cardiology', status: 'No-Show', experience: '5 Star · 10 years', rating: 4.6 },
  { id: 'APT009', patientId: 'P001', patientName: 'Michael Chen', patientInitials: 'MC', patientAge: 42, patientGender: 'Male', date: '2024-04-28', startTime: '09:00 AM', endTime: '09:30 AM', type: 'In-Person', category: 'Cardiology Follow-up', status: 'Completed' },
];

export const MOCK_RECORDS: MedicalRecord[] = [
  { id: 'REC-001', patientId: 'P001', patientName: 'Michael Chen', date: '2024-04-20', type: 'Lab Report', description: 'Complete Blood Count (CBC) Panel', hash: '0x7f23a4b1c9d0e2f3', txHash: '0xabc123def456789', blockNumber: 18524731, status: 'Synced', verified: true, ipfsCid: 'QmX7p3n5y8z1k4m6w9' },
  { id: 'REC-002', patientId: 'P002', patientName: 'Emma Watson', date: '2024-04-18', type: 'Prescription', description: 'Vitamin D Supplement — 2000IU daily', hash: '0x3a45c9d0e2f4a1b8', txHash: '0xdef456789abc123', blockNumber: 18524612, status: 'Synced', verified: true },
  { id: 'REC-003', patientId: 'P003', patientName: 'James Rodriguez', date: '2024-04-22', type: 'Surgery Report', description: 'Appendectomy — Laparoscopic procedure', hash: '0x1e89f4e5a6b7c8d9', txHash: undefined, blockNumber: undefined, status: 'Pending', verified: false },
  { id: 'REC-004', patientId: 'P001', patientName: 'Michael Chen', date: '2024-04-20', type: 'Consultation Note', description: 'Hypertension follow-up — BP 128/82', hash: '0x9d12b6c7e8f9a0b1', txHash: '0x789abc123def456', blockNumber: 18524590, status: 'Synced', verified: true },
  { id: 'REC-005', patientId: 'P004', patientName: 'Sophia Miller', date: '2024-04-25', type: 'Lab Report', description: 'HbA1c and Fasting Glucose Panel', hash: '0x4c56d7e8f9a1b2c3', txHash: undefined, blockNumber: undefined, status: 'Verifying', verified: false },
  { id: 'REC-006', patientId: 'P008', patientName: 'Linda Park', date: '2024-04-15', type: 'X-Ray', description: 'Hand and wrist X-Ray — RA assessment', hash: '0x5d67e8f9a0b1c2d3', txHash: '0x123abc456def789', blockNumber: 18524410, status: 'Synced', verified: true },
  { id: 'REC-007', patientId: 'P006', patientName: 'Aisha Kamara', date: '2024-04-28', type: 'Consultation Note', description: 'Asthma management — PFT results normal', hash: '0x6e78f9a0b1c2d3e4', txHash: undefined, blockNumber: undefined, status: 'Pending', verified: false },
];

export const MOCK_ACCESS_REQUESTS: AccessRequest[] = [
  { id: 'AR001', patientId: 'P001', patientName: 'Michael Chen', patientInitials: 'MC', requestedAt: '2024-04-29T09:15:00Z', expiresAt: '2024-05-29T09:15:00Z', status: 'Approved', recordTypes: ['Lab Reports', 'Consultation Notes'] },
  { id: 'AR002', patientId: 'P003', patientName: 'James Rodriguez', patientInitials: 'JR', requestedAt: '2024-04-28T14:30:00Z', expiresAt: '2024-05-28T14:30:00Z', status: 'Pending', recordTypes: ['Surgery Reports', 'X-Rays', 'Prescriptions'] },
  { id: 'AR003', patientId: 'P008', patientName: 'Linda Park', patientInitials: 'LP', requestedAt: '2024-04-27T11:00:00Z', expiresAt: '2024-05-27T11:00:00Z', status: 'Approved', recordTypes: ['All Records'] },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'N001', type: 'success', title: 'Record Synced', message: "Michael Chen's CBC lab results synced to blockchain.", timestamp: '10 mins ago', read: false },
  { id: 'N002', type: 'info', title: 'Appointment Reminder', message: 'Emma Watson — Annual Checkup at 10:30 AM today.', timestamp: '1 hour ago', read: false },
  { id: 'N003', type: 'warning', title: 'Access Request', message: 'James Rodriguez has requested access to his records.', timestamp: '2 hours ago', read: false },
  { id: 'N004', type: 'danger', title: 'No-Show Alert', message: 'David Wilson missed his 10:00 AM appointment.', timestamp: '4 hours ago', read: true },
  { id: 'N005', type: 'success', title: 'Blockchain Verified', message: "Linda Park's X-Ray verified on-chain successfully.", timestamp: '1 day ago', read: true },
];

export const MOCK_ANALYTICS: AnalyticsData[] = [
  { month: 'Nov', patients: 68, appointments: 92, records: 45 },
  { month: 'Dec', patients: 74, appointments: 88, records: 52 },
  { month: 'Jan', patients: 82, appointments: 105, records: 61 },
  { month: 'Feb', patients: 71, appointments: 97, records: 58 },
  { month: 'Mar', patients: 95, appointments: 118, records: 73 },
  { month: 'Apr', patients: 110, appointments: 134, records: 89 },
];

export const MOCK_DEPT_STATS: DepartmentStat[] = [
  { name: 'Cardiology', percentage: 32, color: '#2952FF' },
  { name: 'Endocrinology', percentage: 24, color: '#8F76FF' },
  { name: 'Pulmonology', percentage: 18, color: '#11C137' },
  { name: 'Rheumatology', percentage: 15, color: '#FA6E3C' },
  { name: 'General', percentage: 11, color: '#5D6582' },
];
