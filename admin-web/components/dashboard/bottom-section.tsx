'use client';

import { Activity, AlertCircle, Video, User } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { MOCK_ANALYTICS, MOCK_PATIENTS, MOCK_RECORDS } from '@/data/mockData';
import { useRouter } from 'next/navigation';

const recordsActivityData = MOCK_ANALYTICS.map(d => ({ name: d.month, value: d.records }));

export function BottomSection() {
  const router = useRouter();
  const criticalPatient = MOCK_PATIENTS.find(p => p.status === 'Critical');
  const pendingRecords = MOCK_RECORDS.filter(r => r.status === 'Pending').length;
  const syncedRecords = MOCK_RECORDS.filter(r => r.status === 'Synced').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
      {/* Records Activity */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#D8DCE8]">
        <div className="flex items-center gap-2 mb-1">
          <Activity className="w-4 h-4 text-brand" />
          <h3 className="text-sm sm:text-base font-semibold text-[#101326]">Records Activity</h3>
        </div>
        <div className="text-3xl sm:text-4xl font-bold text-[#101326] mb-3 sm:mb-4">{syncedRecords}/{MOCK_RECORDS.length}</div>
        <div className="h-24 sm:h-32 relative">
          <div className="absolute left-0 top-0 text-[10px] sm:text-xs text-[#8C91A8]">High</div>
          <div className="absolute right-0 top-0 text-[10px] sm:text-xs text-[#8C91A8]">Low</div>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={recordsActivityData}>
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#2952ff"
                strokeWidth={2}
                dot={{ fill: '#2952ff', strokeWidth: 0, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-between mt-3 sm:mt-4">
          <div className="flex-1 bg-brand rounded-l-full py-1.5 sm:py-2 px-3 sm:px-4 text-center">
            <span className="text-xs sm:text-sm font-medium text-white">{syncedRecords} Synced</span>
          </div>
          <div className="flex-1 bg-brand-light rounded-r-full py-1.5 sm:py-2 px-3 sm:px-4 text-center">
            <span className="text-xs sm:text-sm text-[#5D6582]">{pendingRecords} Pending</span>
          </div>
        </div>
      </div>

      {/* Today's Critical Patients */}
      <div className="bg-brand rounded-2xl p-4 sm:p-5 text-white">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-xs sm:text-sm font-medium opacity-90">Today's Critical Patients</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/patients')}
              className="w-7 h-7 sm:w-8 sm:h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {criticalPatient ? (
          <>
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center">
                <span className="font-bold text-sm">{criticalPatient.initials}</span>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-sm sm:text-base">{criticalPatient.name}</span>
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#E53E3E] rounded-full animate-pulse" />
                </div>
                <span className="text-xs sm:text-sm opacity-70">{criticalPatient.condition}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-4 sm:mb-6">
              <div className="text-center bg-white/10 rounded-xl p-2">
                <div className="text-sm sm:text-lg font-bold">{criticalPatient.bloodType}</div>
                <div className="text-[8px] sm:text-xs opacity-70">Blood Type</div>
              </div>
              <div className="text-center bg-white/10 rounded-xl p-2">
                <div className="text-sm sm:text-lg font-bold">{criticalPatient.age}</div>
                <div className="text-[8px] sm:text-xs opacity-70">Age</div>
              </div>
              <div className="text-center bg-white/10 rounded-xl p-2">
                <div className="text-sm sm:text-lg font-bold">{criticalPatient.allergies.length}</div>
                <div className="text-[8px] sm:text-xs opacity-70">Allergies</div>
              </div>
            </div>

            <div className="bg-white/10 rounded-xl p-3 mb-4">
              <p className="text-xs opacity-70 mb-1">Notes</p>
              <p className="text-xs sm:text-sm">{criticalPatient.notes || 'Monitor closely.'}</p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => router.push(`/patients/${criticalPatient.id}`)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white rounded-full py-2 sm:py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-medium flex items-center justify-center gap-1 sm:gap-2 transition-colors"
              >
                <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                View Profile
              </button>
              <button
                onClick={() => router.push('/appointments')}
                className="flex-1 bg-[#8F76FF] hover:bg-[#7a60e6] text-white rounded-full py-2 sm:py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-medium flex items-center justify-center gap-1 sm:gap-2 transition-colors"
              >
                <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Schedule Appt.
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-8 opacity-70">
            <p className="text-sm">No critical patients today</p>
            <p className="text-xs mt-1">All patients stable ✓</p>
          </div>
        )}
      </div>
    </div>
  );
}
