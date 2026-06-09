'use client';

import { BarChart as BarChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { MOCK_ANALYTICS } from '@/data/mockData';

export function AnalyticView() {
  const chartData = MOCK_ANALYTICS.map(d => ({ name: d.month, value: d.appointments }));
  const maxIdx = chartData.reduce((maxI, d, i, arr) => d.value > arr[maxI].value ? i : maxI, 0);

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#D8DCE8]">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-brand-light rounded-lg flex items-center justify-center">
          <BarChartIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand" />
        </div>
        <h3 className="text-sm sm:text-base font-semibold text-[#101326]">Patient Analytics</h3>
        <span className="ml-auto text-xs text-[#8C91A8]">Nov – Apr 2026</span>
      </div>

      {/* Mobile: 2x2 grid, Desktop: 12-column grid */}
      <div className="grid grid-cols-2 md:grid-cols-12 gap-4 sm:gap-6">
        {/* Left section */}
        <div className="col-span-1 md:col-span-3">
          <div className="mb-3 sm:mb-4">
            <span className="text-2xl sm:text-4xl font-bold text-[#101326]">72%</span>
            <span className="text-[10px] sm:text-sm text-[#8C91A8] ml-1 sm:ml-2 block sm:inline">Follow-up rate</span>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-brand" />
                <span className="text-xs sm:text-sm text-[#5D6582]">Lab Reports</span>
              </div>
              <span className="text-xs sm:text-sm font-medium text-[#101326]">42%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#8F76FF]" />
                <span className="text-xs sm:text-sm text-[#5D6582]">Consultations</span>
              </div>
              <span className="text-xs sm:text-sm font-medium text-[#101326]">35%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#D8DCE8]" />
                <span className="text-xs sm:text-sm text-[#5D6582]">Prescriptions</span>
              </div>
              <span className="text-xs sm:text-sm font-medium text-[#101326]">23%</span>
            </div>
          </div>
        </div>

        {/* Middle section - Chart */}
        <div className="col-span-1 md:col-span-5 relative">
          <div className="absolute top-0 left-0 sm:left-1/4 bg-brand text-white text-[9px] sm:text-xs p-2 sm:p-3 rounded-lg z-10 shadow-lg">
            <div className="font-medium mb-1 sm:mb-2">April 2026</div>
            <div className="space-y-0.5 sm:space-y-1">
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-brand-tint" />
                <span>Lab Reports</span>
                <span className="ml-auto">72</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-brand-tint" />
                <span>Consultations</span>
                <span className="ml-auto">118</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-white" />
                <span>Patients</span>
                <span className="ml-auto">89</span>
              </div>
            </div>
          </div>
          <div className="h-32 sm:h-40 mt-20 sm:mt-16">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barSize={16}>
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === maxIdx ? '#8F76FF' : 'var(--color-brand-light)'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right section - Top patient */}
        <div className="col-span-2 md:col-span-4 flex flex-col gap-3 sm:gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-brand flex items-center justify-center">
                <span className="text-white font-bold text-sm">AK</span>
              </div>
              <div className="bg-white border border-[#D8DCE8] rounded-full px-3 py-1.5 sm:px-4 sm:py-2 flex items-center gap-2">
                <span className="text-xs sm:text-sm font-medium text-[#101326]">Aminata Koroma</span>
              </div>
            </div>
          </div>
          <div className="flex-1 rounded-2xl overflow-hidden bg-brand-light min-h-[100px] sm:min-h-[120px] flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-brand rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white font-bold text-xl">AK</span>
              </div>
              <p className="text-xs text-[#5D6582] font-medium">Top Patient — Apr 2026</p>
              <p className="text-xs text-[#8C91A8]">Hypertension • Active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
