'use client';

import { Users, AlertTriangle, FileCheck } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, ResponsiveContainer } from 'recharts';
import { MOCK_PATIENTS, MOCK_RECORDS } from '@/data/mockData';

const totalPatientsData = [
  { day: 1, value: 150 }, { day: 2, value: 160 }, { day: 3, value: 158 },
  { day: 4, value: 170 }, { day: 5, value: 168 }, { day: 6, value: 185 },
  { day: 7, value: 180 }, { day: 8, value: 192 }, { day: 9, value: 190 },
  { day: 10, value: 200 }, { day: 11, value: 205 }, { day: 12, value: 211 },
];

const activePatientsData = [
  { name: '1', value: 50 },
  { name: '2', value: 70 },
  { name: '3', value: 85 },
];

const criticalData = [
  { name: '1', value: 40 },
  { name: '2', value: 55 },
  { name: '3', value: 75 },
];

export function StatsCards() {
  const activePatients = MOCK_PATIENTS.filter(p => p.status === 'Active').length;
  const criticalPatients = MOCK_PATIENTS.filter(p => p.status === 'Critical').length;
  const syncedRecords = MOCK_RECORDS.filter(r => r.status === 'Synced').length;
  const totalRecords = MOCK_RECORDS.length;

  // Patient initials for avatar stack
  const recentPatients = MOCK_PATIENTS.slice(0, 3);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Total Patients */}
      <div className="bg-brand rounded-2xl p-4 sm:p-5 text-white relative overflow-hidden col-span-2 sm:col-span-1">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-xs sm:text-sm font-medium opacity-90">Total Patients</h3>
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="h-14 sm:h-16 mb-2 sm:mb-3">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={totalPatientsData}>
              <Line type="monotone" dataKey="value" stroke="#A3D9AE" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="text-3xl sm:text-4xl font-bold">211</div>
        <div className="text-xs sm:text-sm opacity-70 mt-1">Registered on blockchain</div>
      </div>

      {/* Active Patients */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#D8DCE8]">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <h3 className="text-xs sm:text-sm font-medium text-[#5D6582]">Active Patients</h3>
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-brand-light rounded-lg flex items-center justify-center">
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand" />
          </div>
        </div>
        <div className="text-2xl sm:text-4xl font-bold text-[#101326] mb-0.5 sm:mb-1">{activePatients}</div>
        <div className="text-xs text-[#8C91A8] mb-2 sm:mb-3">This month</div>
        <div className="h-10 sm:h-12 flex items-end gap-2 justify-center">
          {activePatientsData.map((item, index) => (
            <div
              key={index}
              className="w-6 sm:w-8 bg-brand rounded-t-md transition-all"
              style={{ height: `${item.value}%` }}
            />
          ))}
        </div>
        <div className="text-[10px] sm:text-xs text-[#8C91A8] mt-2">Under active care</div>
      </div>

      {/* Critical Cases */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#D8DCE8]">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <h3 className="text-xs sm:text-sm font-medium text-[#5D6582]">Critical Cases</h3>
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#FEE2E2] rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E53E3E]" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 sm:gap-3 mb-0.5 sm:mb-1">
          <span className="text-2xl sm:text-4xl font-bold text-[#E53E3E]">{criticalPatients}</span>
          <span className="text-xs sm:text-sm text-[#E53E3E] font-medium">Immediate</span>
        </div>
        <div className="text-xs text-[#8C91A8] mb-2 sm:mb-3">Requires immediate review</div>
        <div className="relative h-10 sm:h-12">
          <div className="absolute -top-7 sm:-top-8 right-0 bg-[#E53E3E] text-white text-[10px] sm:text-xs px-2 py-1 rounded">
            Monitor now
          </div>
          <div className="h-full flex items-end gap-2 justify-center">
            {criticalData.map((item, index) => (
              <div
                key={index}
                className="w-6 sm:w-8 bg-[#FEE2E2] rounded-t-md transition-all"
                style={{ height: `${item.value}%` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Records on Chain */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#D8DCE8]">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <h3 className="text-xs sm:text-sm font-medium text-[#5D6582]">Records on Chain</h3>
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-brand-light rounded-lg flex items-center justify-center">
            <FileCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand" />
          </div>
        </div>
        <div className="flex -space-x-2 mb-3 sm:mb-4">
          {recentPatients.map((p) => (
            <div
              key={p.id}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white bg-brand flex items-center justify-center"
            >
              <span className="text-white font-bold text-[10px] sm:text-xs">{p.initials}</span>
            </div>
          ))}
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white bg-brand-light flex items-center justify-center text-[10px] sm:text-xs text-brand font-medium">
            +{totalRecords - 3}
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-[#101326] mb-1">{totalRecords}</div>
        <div className="text-xs text-[#8C91A8]">{syncedRecords} synced to Fabric</div>
      </div>
    </div>
  );
}
