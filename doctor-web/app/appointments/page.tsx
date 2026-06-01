'use client';

import { useState } from 'react';
import { LayoutWrapper } from '@/components/dashboard/layout-wrapper';
import { MOCK_APPOINTMENTS } from '@/data/mockData';
import { useAuth } from '@/hooks/useAuth';
import { Calendar as CalendarIcon, Video, MapPin, Clock, Search, Filter, CheckCircle2, XCircle, AlertCircle, HelpCircle } from 'lucide-react';
import type { Appointment, AppointmentStatus } from '@/types';

export default function AppointmentsPage() {
  useAuth(); // Require authentication

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'past'>('today');

  const TODAY = new Date().toISOString().split('T')[0];

  // Helper to categorize appointment date relative to today
  const getAppointmentTabCategory = (appDate: string) => {
    if (appDate === TODAY) return 'today';
    return appDate > TODAY ? 'upcoming' : 'past';
  };

  const getStatusIcon = (status: AppointmentStatus) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      case 'Cancelled':
        return <XCircle className="h-4 w-4 text-rose-500" />;
      case 'No-Show':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case 'In Progress':
        return <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />;
      default:
        return <Clock className="h-4 w-4 text-violet-500" />;
    }
  };

  const getStatusBadgeClass = (status: AppointmentStatus) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'No-Show':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'In Progress':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-violet-50 text-violet-700 border-violet-200';
    }
  };

  const filteredAppointments = MOCK_APPOINTMENTS.filter((app) => {
    const tabMatch = getAppointmentTabCategory(app.date) === activeTab;
    const nameMatch = app.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      app.id.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = statusFilter === 'all' || app.status === statusFilter;
    return tabMatch && nameMatch && statusMatch;
  });

  return (
    <LayoutWrapper title="Appointments">
      <div className="space-y-6">
        {/* Header Summary */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Patient Appointments</h1>
            <p className="text-sm text-slate-500">View and manage virtual and in-person patient consultations</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm">
              <CalendarIcon className="h-4 w-4" />
              Schedule Appointment
            </button>
          </div>
        </div>

        {/* Filters and Tabs */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
          {/* Tabs */}
          <div className="flex border-b border-slate-100 pb-2 overflow-x-auto gap-2">
            <button
              onClick={() => setActiveTab('today')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition whitespace-nowrap ${
                activeTab === 'today'
                  ? 'bg-brand-light text-brand'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
              }`}
            >
              Today&apos;s Appointments
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition whitespace-nowrap ${
                activeTab === 'upcoming'
                  ? 'bg-brand-light text-brand'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition whitespace-nowrap ${
                activeTab === 'past'
                  ? 'bg-brand-light text-brand'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
              }`}
            >
              Past Records
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search patient name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
              />
            </div>
            <div className="flex gap-2">
              <div className="relative flex items-center">
                <Filter className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition appearance-none cursor-pointer text-slate-700"
                >
                  <option value="all">All Statuses</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="No-Show">No-Show</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Appointment Grid/List */}
        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
            <CalendarIcon className="h-10 w-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No appointments found</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              There are no {activeTab} appointments matching your filters at this time.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredAppointments.map((app) => (
              <div
                key={app.id}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between gap-4 hover:border-slate-300 transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-brand-light text-brand font-semibold text-sm flex items-center justify-center">
                        {app.patientInitials}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 text-base">{app.patientName}</h3>
                        <p className="text-xs text-slate-500">
                          {app.patientGender}, {app.patientAge} yrs • ID: {app.patientId}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeClass(app.status)} flex items-center gap-1.5`}>
                      {getStatusIcon(app.status)}
                      {app.status}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-600 border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span>
                        {app.startTime} - {app.endTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-slate-400" />
                      <span>{app.date}</span>
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      {app.type === 'Virtual' ? (
                        <>
                          <Video className="h-4 w-4 text-brand" />
                          <span className="font-medium text-slate-700">Virtual Consultation (Telehealth)</span>
                        </>
                      ) : (
                        <>
                          <MapPin className="h-4 w-4 text-slate-500" />
                          <span className="font-medium text-slate-700">In-Person • Connaught Hospital</span>
                        </>
                      )}
                    </div>
                  </div>

                  {app.notes && (
                    <div className="mt-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs text-slate-600">
                      <span className="font-semibold text-slate-700">Notes:</span> {app.notes}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                  <button className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 transition">
                    View Profile
                  </button>
                  {app.type === 'Virtual' && app.status !== 'Completed' && app.status !== 'Cancelled' && (
                    <a
                      href={`/appointments/telehealth/${app.videoCallRoomId}`}
                      className="px-3.5 py-1.5 bg-brand hover:bg-brand-dark text-white rounded-lg text-xs font-medium transition flex items-center gap-1.5 shadow-sm"
                    >
                      <Video className="h-3.5 w-3.5" />
                      Join Call
                    </a>
                  )}
                  {app.status === 'In Progress' && (
                    <button className="px-3.5 py-1.5 bg-brand-light text-brand hover:bg-[#d8eddcf2] rounded-lg text-xs font-medium transition">
                      Record Diagnosis
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </LayoutWrapper>
  );
}
