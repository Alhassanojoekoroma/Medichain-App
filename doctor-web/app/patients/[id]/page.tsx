'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Phone, Mail, MapPin, AlertCircle, Pill, QrCode, Calendar, FileText, Edit } from 'lucide-react';
import { LayoutWrapper } from '@/components/dashboard/layout-wrapper';
import { MOCK_PATIENTS, MOCK_RECORDS, MOCK_APPOINTMENTS } from '@/data/mockData';

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const patient = MOCK_PATIENTS.find(p => p.id === id);

  if (!patient) {
    return (
      <LayoutWrapper>
        <div className="text-center py-20">
          <p className="text-xl font-bold text-[#101326]">Patient not found</p>
          <button onClick={() => router.push('/patients')} className="mt-4 text-brand hover:underline text-sm">
            ← Back to Patients
          </button>
        </div>
      </LayoutWrapper>
    );
  }

  const patientRecords = MOCK_RECORDS.filter(r => r.patientId === id);
  const patientAppointments = MOCK_APPOINTMENTS.filter(a => a.patientId === id);

  return (
    <LayoutWrapper>
      <div className="space-y-4 sm:space-y-6">
        {/* Back + Header */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => router.push('/patients')}
            className="p-2 hover:bg-brand-light rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#5D6582]" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#101326]">{patient.name}</h1>
            <p className="text-sm text-[#8C91A8]">Patient ID: {patient.id}</p>
          </div>
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => router.push(`/public/patient-qr/${id}`)}
              className="flex items-center gap-2 border border-[#D8DCE8] hover:border-brand px-3 py-2 rounded-xl text-sm font-medium text-[#5D6582] hover:text-brand transition-colors"
            >
              <QrCode className="w-4 h-4" />
              <span className="hidden sm:inline">View QR</span>
            </button>
            <button className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white px-3 py-2 rounded-xl text-sm font-medium transition-colors">
              <Edit className="w-4 h-4" />
              <span className="hidden sm:inline">Edit</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: Demographics */}
          <div className="lg:col-span-1 space-y-4">
            {/* Profile card */}
            <div className="bg-white rounded-2xl p-5 border border-[#D8DCE8]">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl ${
                  patient.status === 'Critical' ? 'bg-[#FEE2E2] text-[#E53E3E]' : 'bg-brand-light text-brand'
                }`}>
                  {patient.initials}
                </div>
                <div>
                  <div className="font-bold text-[#101326] text-lg">{patient.name}</div>
                  <div className="text-sm text-[#8C91A8]">{patient.gender} • {patient.age} years</div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    patient.status === 'Critical' ? 'bg-[#FEE2E2] text-[#E53E3E]' :
                    patient.status === 'Active' ? 'bg-brand-light text-brand' :
                    'bg-[#EAEEF2] text-[#8C91A8]'
                  }`}>
                    {patient.status}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-[#8C91A8]" />
                  <span className="text-[#5D6582]">{patient.phone}</span>
                </div>
                {patient.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-[#8C91A8]" />
                    <span className="text-[#5D6582]">{patient.email}</span>
                  </div>
                )}
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-[#8C91A8] mt-0.5" />
                  <span className="text-[#5D6582]">{patient.address}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[#D8DCE8] grid grid-cols-2 gap-3">
                <div className="bg-[#EDE9FF] rounded-xl p-3 text-center">
                  <div className="text-lg font-bold text-[#8F76FF]">{patient.bloodType}</div>
                  <div className="text-xs text-[#8C91A8]">Blood Type</div>
                </div>
                <div className="bg-brand-light rounded-xl p-3 text-center">
                  <div className="text-lg font-bold text-brand">{patient.age}</div>
                  <div className="text-xs text-[#8C91A8]">Age</div>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-white rounded-2xl p-5 border border-[#D8DCE8]">
              <h3 className="font-semibold text-[#101326] mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#E53E3E]" />
                Emergency Contact
              </h3>
              <p className="font-medium text-[#101326] text-sm">{patient.emergencyContactName}</p>
              <p className="text-sm text-[#5D6582]">{patient.emergencyContactPhone}</p>
            </div>

            {/* Insurance */}
            {patient.insuranceProvider && (
              <div className="bg-white rounded-2xl p-5 border border-[#D8DCE8]">
                <h3 className="font-semibold text-[#101326] mb-2">Insurance</h3>
                <p className="text-sm font-medium text-[#5D6582]">{patient.insuranceProvider}</p>
                <p className="text-xs text-[#8C91A8]">ID: {patient.insuranceId}</p>
              </div>
            )}
          </div>

          {/* Right: Medical details */}
          <div className="lg:col-span-2 space-y-4">
            {/* Primary condition */}
            <div className="bg-white rounded-2xl p-5 border border-[#D8DCE8]">
              <h3 className="font-semibold text-[#101326] mb-3">Primary Condition</h3>
              <p className="text-[#5D6582]">{patient.condition}</p>
              {patient.notes && (
                <div className="mt-3 p-3 bg-[#FFF3E6] border border-[#FDE8DC] rounded-xl">
                  <p className="text-xs text-[#FA6E3C] font-medium mb-1">Clinical Note</p>
                  <p className="text-sm text-[#5D6582]">{patient.notes}</p>
                </div>
              )}
            </div>

            {/* Allergies */}
            <div className="bg-white rounded-2xl p-5 border border-[#D8DCE8]">
              <h3 className="font-semibold text-[#101326] mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#FA6E3C]" />
                Allergies
              </h3>
              {patient.allergies.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {patient.allergies.map(a => (
                    <span key={a} className="allergy-chip">{a}</span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#8C91A8]">No known allergies</p>
              )}
            </div>

            {/* Medications */}
            <div className="bg-white rounded-2xl p-5 border border-[#D8DCE8]">
              <h3 className="font-semibold text-[#101326] mb-3 flex items-center gap-2">
                <Pill className="w-4 h-4 text-[#8F76FF]" />
                Current Medications
              </h3>
              <div className="space-y-2">
                {patient.medications.map((med, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-[#EDE9FF] rounded-xl">
                    <div className="w-2 h-2 bg-[#8F76FF] rounded-full" />
                    <span className="text-sm text-[#5D6582]">{med}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Records */}
            <div className="bg-white rounded-2xl p-5 border border-[#D8DCE8]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-[#101326] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand" />
                  Medical Records ({patientRecords.length})
                </h3>
                <button
                  onClick={() => router.push('/records/upload')}
                  className="text-xs text-brand hover:underline font-medium"
                >
                  + Upload
                </button>
              </div>
              <div className="space-y-2">
                {patientRecords.map(record => (
                  <div key={record.id} className="flex items-center gap-3 p-3 bg-[#EAEEF2] rounded-xl">
                    <div className={`w-2 h-2 rounded-full ${
                      record.status === 'Synced' ? 'bg-brand' :
                      record.status === 'Pending' ? 'bg-[#FA6E3C]' :
                      record.status === 'Verifying' ? 'bg-[#8F76FF]' : 'bg-[#E53E3E]'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#101326]">{record.type}</p>
                      <p className="text-xs text-[#8C91A8] truncate">{record.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#8C91A8]">{record.date}</p>
                      <span className={`text-xs font-semibold ${
                        record.status === 'Synced' ? 'text-brand' : 'text-[#FA6E3C]'
                      }`}>{record.status}</span>
                    </div>
                  </div>
                ))}
                {patientRecords.length === 0 && (
                  <p className="text-sm text-[#8C91A8] text-center py-4">No records yet</p>
                )}
              </div>
            </div>

            {/* Appointments */}
            <div className="bg-white rounded-2xl p-5 border border-[#D8DCE8]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-[#101326] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand" />
                  Appointments ({patientAppointments.length})
                </h3>
                <button
                  onClick={() => router.push('/appointments')}
                  className="text-xs text-brand hover:underline font-medium"
                >
                  View all
                </button>
              </div>
              <div className="space-y-2">
                {patientAppointments.slice(0, 3).map(appt => (
                  <div key={appt.id} className="flex items-center gap-3 p-3 bg-[#EAEEF2] rounded-xl">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#101326]">{appt.category} • {appt.type}</p>
                      <p className="text-xs text-[#8C91A8]">{appt.date} {appt.startTime}–{appt.endTime}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      appt.status === 'Completed' ? 'bg-brand-light text-brand' :
                      appt.status === 'In Progress' ? 'bg-[#FFF3E6] text-[#FA6E3C]' :
                      appt.status === 'No-Show' ? 'bg-[#FEE2E2] text-[#E53E3E]' :
                      'bg-[#EDE9FF] text-[#8F76FF]'
                    }`}>{appt.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
