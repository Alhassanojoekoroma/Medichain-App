'use client';

import { Video, MapPin } from 'lucide-react';
import { MOCK_APPOINTMENTS } from '@/data/mockData';
import type { Appointment } from '@/types';

interface ScheduleProps {
  selectedDate?: Date;
}

function getStatusStyle(status: Appointment['status']) {
  switch (status) {
    case 'In Progress': return 'bg-[#FFF3E6] text-[#FA6E3C]';
    case 'Upcoming': return 'bg-brand-light text-brand';
    case 'Completed': return 'bg-brand-light text-brand';
    case 'No-Show': return 'bg-[#FEE2E2] text-[#E53E3E]';
    case 'Cancelled': return 'bg-[#FEE2E2] text-[#E53E3E]';
    default: return 'bg-[#EAEEF2] text-[#8C91A8]';
  }
}

function getCategoryColor(category: Appointment['category']) {
  switch (category) {
    case 'Emergency': return 'bg-[#E53E3E]';
    case 'Follow-up': return 'bg-brand';
    case 'Consultation': return 'bg-[#8F76FF]';
    case 'Lab Review': return 'bg-[#1D9E75]';
    case 'Imaging': return 'bg-[#FA6E3C]';
    default: return 'bg-[#8C91A8]';
  }
}

export function Schedule({ selectedDate }: ScheduleProps) {
  const dateStr = selectedDate
    ? selectedDate.toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  const dayAppointments = MOCK_APPOINTMENTS.filter(a => a.date === dateStr);

  const dateLabel = selectedDate
    ? selectedDate.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' })
    : new Date().toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#D8DCE8]">
      <h3 className="text-sm sm:text-base font-semibold text-[#101326] mb-1">{dateLabel}</h3>
      <p className="text-xs text-[#8C91A8] mb-3 sm:mb-4">
        {dayAppointments.length} appointment{dayAppointments.length !== 1 ? 's' : ''}
      </p>

      <div className="space-y-3 sm:space-y-4">
        {dayAppointments.length === 0 ? (
          <div className="text-center py-6 text-[#8C91A8]">
            <p className="text-sm">No appointments this day</p>
          </div>
        ) : (
          dayAppointments.map((appt) => (
            <div key={appt.id} className="flex items-start sm:items-center gap-2 sm:gap-3">
              {/* Avatar */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-brand flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs sm:text-sm">{appt.patientInitials}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-medium text-[#101326] text-xs sm:text-sm truncate">
                  {appt.patientName}
                </div>
                <div className="text-[10px] sm:text-xs text-[#8C91A8]">
                  {appt.startTime} – {appt.endTime}
                </div>
                <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-0.5 sm:mt-1">
                  <span className={`${getCategoryColor(appt.category)} text-white text-[9px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap`}>
                    {appt.category}
                  </span>
                  <span className={`text-[9px] sm:text-xs px-1.5 py-0.5 rounded-full whitespace-nowrap font-medium ${getStatusStyle(appt.status)}`}>
                    {appt.status}
                  </span>
                </div>
              </div>

              {/* Type icon */}
              <div className="flex-shrink-0">
                {appt.type === 'Virtual' ? (
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#EDE9FF] rounded-full flex items-center justify-center">
                    <Video className="w-3 h-3 sm:w-4 sm:h-4 text-[#8F76FF]" />
                  </div>
                ) : (
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-brand-light rounded-full flex items-center justify-center">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-brand" />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
