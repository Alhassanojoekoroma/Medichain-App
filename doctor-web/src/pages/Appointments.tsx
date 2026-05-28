import React from 'react';
import { Calendar as CalendarIcon, Clock, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

const Appointments: React.FC = () => {
  return (
    <div className="page-container">
      <div className="page-header animate-fade-in">
        <div>
          <h1 className="heading-2 page-title">Appointments Schedule</h1>
          <p className="page-subtitle">Manage your daily and weekly consultations.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-outline">
            <CalendarIcon size={18} />
            <span>Month View</span>
          </button>
          <button className="btn-primary">
            <span>Schedule Appointment</span>
          </button>
        </div>
      </div>

      <div className="calendar-header animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center gap-4">
          <h2 className="heading-3">March 2024</h2>
          <div className="flex gap-1">
            <button className="icon-btn-sm border"><ChevronLeft size={18} /></button>
            <button className="icon-btn-sm border"><ChevronRight size={18} /></button>
          </div>
        </div>
        <button className="btn-outline">Today</button>
      </div>

      <div className="appointments-grid animate-fade-in" style={{ animationDelay: '0.2s', marginTop: '1.5rem' }}>
        <div className="appointment-card glass-panel">
          <div className="card-header border-b">
            <h3 className="font-semibold">Today's Schedule</h3>
            <span className="text-muted text-sm">4 appointments</span>
          </div>
          <div className="p-4 flex flex-col gap-3">
            {[
              { time: '09:00 AM', name: 'Michael Chen', reason: 'Follow-up Cardiology', type: 'In-person' },
              { time: '10:30 AM', name: 'Emma Watson', reason: 'Annual Physical', type: 'In-person' },
              { time: '01:00 PM', name: 'Sarah Miller', reason: 'Lab Results Review', type: 'Virtual' },
              { time: '03:30 PM', name: 'David Wilson', reason: 'New Patient Consultation', type: 'In-person' },
            ].map((apt, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex gap-3 items-center">
                  <div className="bg-primary-light text-primary p-2 rounded-md font-bold text-xs w-16 text-center">
                    {apt.time}
                  </div>
                  <div>
                    <div className="font-semibold">{apt.name}</div>
                    <div className="text-xs text-muted">{apt.reason}</div>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${apt.type === 'Virtual' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                  {apt.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointments;
