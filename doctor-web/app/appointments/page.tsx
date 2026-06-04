'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutWrapper } from '@/components/dashboard/layout-wrapper';
import { MOCK_APPOINTMENTS } from '@/data/mockData';
import { useAuth } from '@/hooks/useAuth';
import { 
  Calendar as CalendarIcon, Video, MapPin, Clock, Search, Filter, 
  CheckCircle2, XCircle, AlertCircle, HelpCircle, X, Plus, Calendar 
} from 'lucide-react';
import type { Appointment, AppointmentStatus } from '@/types';
import { backendApi } from '@/services/backendApi';

export default function AppointmentsPage() {
  useAuth(); // Require authentication
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'past'>('today');
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [patients, setPatients] = useState<any[]>([]);

  // Schedule Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('10:30');
  const [type, setType] = useState<'Virtual' | 'In-Person'>('In-Person');
  const [notes, setNotes] = useState('');

  const TODAY = new Date().toISOString().split('T')[0];

  useEffect(() => {
    backendApi.getAccessiblePatients()
      .then(res => {
        setPatients(res.patients || []);
      })
      .catch(err => {
        console.error('Failed to load patients for schedule selector', err);
      });
  }, []);

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

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !date || !startTime || !endTime) return;

    const patient = patients.find(p => p.id === selectedPatientId);
    const patientName = patient ? patient.name : 'Unknown Patient';
    const patientInitials = patientName
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'PT';

    const newApp: Appointment = {
      id: `APT-${Math.floor(100000 + Math.random() * 900000)}`,
      patientId: selectedPatientId,
      patientName,
      patientInitials,
      patientGender: 'Female', // default for mockup details
      patientAge: 28, // default for mockup details
      date,
      startTime,
      endTime,
      status: 'Upcoming',
      type,
      category: 'Consultation',
      videoCallRoomId: type === 'Virtual' ? `room-${Math.random().toString(36).substring(2, 8)}` : undefined,
      notes: notes || undefined
    };

    setAppointments(prev => [newApp, ...prev]);
    
    // Reset form
    setSelectedPatientId('');
    setDate('');
    setStartTime('10:00');
    setEndTime('10:30');
    setType('In-Person');
    setNotes('');
    setIsModalOpen(false);
  };

  const filteredAppointments = appointments.filter((app) => {
    const tabMatch = getAppointmentTabCategory(app.date) === activeTab;
    const nameMatch = (app.patientName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                      (app.id || '').toLowerCase().includes(searchTerm.toLowerCase());
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
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm"
            >
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
                  <button 
                    onClick={() => router.push(`/patients/${app.patientId}`)}
                    className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 transition"
                  >
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
                  <button 
                    onClick={() => router.push(`/records/upload?patientId=${app.patientId}`)}
                    className="px-3.5 py-1.5 bg-brand-light text-brand hover:bg-[#d8eddcf2] rounded-lg text-xs font-medium transition"
                  >
                    Record Diagnosis
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Schedule Appointment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200 text-left">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand" /> Schedule Appointment
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-950 hover:bg-slate-100 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              {/* Select Patient */}
              <div>
                <label className="block text-xs font-semibold text-[#5D6582] mb-1">Select Patient *</label>
                <select
                  required
                  value={selectedPatientId}
                  onChange={e => setSelectedPatientId(e.target.value)}
                  className="w-full border border-[#D8DCE8] bg-slate-50 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition cursor-pointer text-slate-700"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.id.substring(0,8)}...)</option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-semibold text-[#5D6582] mb-1">Date *</label>
                <input
                  required
                  type="date"
                  min={TODAY}
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full border border-[#D8DCE8] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
                />
              </div>

              {/* Time Slots */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5D6582] mb-1">Start Time *</label>
                  <input
                    required
                    type="time"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full border border-[#D8DCE8] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5D6582] mb-1">End Time *</label>
                  <input
                    required
                    type="time"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full border border-[#D8DCE8] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition"
                  />
                </div>
              </div>

              {/* Consultation Type */}
              <div>
                <label className="block text-xs font-semibold text-[#5D6582] mb-1">Consultation Type *</label>
                <div className="flex gap-4 mt-1">
                  <label className="flex items-center gap-2 text-sm text-slate-700 font-medium cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      checked={type === 'In-Person'}
                      onChange={() => setType('In-Person')}
                      className="accent-brand h-4 w-4"
                    />
                    In-Person
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700 font-medium cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      checked={type === 'Virtual'}
                      onChange={() => setType('Virtual')}
                      className="accent-brand h-4 w-4"
                    />
                    Virtual (Telehealth)
                  </label>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-[#5D6582] mb-1">Clinical Notes / Reason</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Reason for consultation..."
                  className="w-full border border-[#D8DCE8] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 border border-[#D8DCE8] hover:bg-[#EAEEF2] text-[#5D6582] py-2.5 rounded-xl text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-brand hover:bg-brand-dark text-white py-2.5 rounded-xl text-sm font-semibold transition shadow-sm"
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </LayoutWrapper>
  );
}
