import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Video, User, X } from 'lucide-react';
import { MOCK_APPOINTMENTS } from '../services/mockData';

const Appointments: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showSchedulingModal, setShowSchedulingModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  const todayDate = new Date();
  const currentMonthYear = new Date(selectedDate).toLocaleString('default', { month: 'long', year: 'numeric' });

  const weekDays = [];
  const selectedDateObj = new Date(selectedDate);
  const day = selectedDateObj.getDay() || 7;
  const startOfWeek = new Date(selectedDateObj);
  startOfWeek.setDate(selectedDateObj.getDate() - day + 1);

  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const count = MOCK_APPOINTMENTS.filter(a => a.date === dateStr).length;
    weekDays.push({
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: d.getDate(),
      dateStr: dateStr,
      count: count,
      isSelected: dateStr === selectedDate,
      isToday: dateStr === todayDate.toISOString().split('T')[0]
    });
  }

  const selectedAppointments = MOCK_APPOINTMENTS.filter(a => a.date === selectedDate);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Upcoming': return { bg: '#DCFCE7', color: '#16A34A', border: '#bbf7d0' };
      case 'In Progress': return { bg: '#FFF7ED', color: '#EA580C', border: '#ffedd5', isPulsing: true };
      case 'Completed': return { bg: '#F1F5F9', color: '#64748B', border: '#e2e8f0' };
      case 'No-Show': return { bg: '#FEF2F2', color: '#DC2626', border: '#fecaca' };
      default: return { bg: '#F1F5F9', color: '#64748B', border: '#e2e8f0' };
    }
  };

  const handleViewAppointment = (apt: any) => {
    setSelectedAppointment(apt);
    setShowDetailModal(true);
  };

  const handleStartVideoCall = (apt: any) => {
    setSelectedAppointment(apt);
    setShowVideoCall(true);
  };

  return (
    <div className="page-container" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="page-header animate-fade-in" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="heading-2 page-title" style={{ marginBottom: '8px' }}>Appointments Schedule</h1>
          <p className="page-subtitle text-muted">Manage your daily and weekly consultations.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-outline" onClick={() => alert('Month view coming soon')}>
            <CalendarIcon size={18} />
            <span>Month View</span>
          </button>
          <button className="btn btn-primary" onClick={() => setShowSchedulingModal(true)}>
            <span>Schedule Appointment</span>
          </button>
        </div>
      </div>

      <div className="card animate-fade-in" style={{ animationDelay: '0.1s', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h2 className="heading-3" style={{ fontSize: '18px' }}>{currentMonthYear}</h2>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button className="icon-btn" style={{ width: '32px', height: '32px', border: '1px solid var(--border)' }} onClick={() => { const newDate = new Date(selectedDate); newDate.setDate(newDate.getDate() - 7); setSelectedDate(newDate.toISOString().split('T')[0]); }}>
                <ChevronLeft size={16} />
              </button>
              <button className="icon-btn" style={{ width: '32px', height: '32px', border: '1px solid var(--border)' }} onClick={() => { const newDate = new Date(selectedDate); newDate.setDate(newDate.getDate() + 7); setSelectedDate(newDate.toISOString().split('T')[0]); }}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
          <button className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '14px' }} onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}>Today</button>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {weekDays.map((wd, i) => (
            <div key={i} onClick={() => setSelectedDate(wd.dateStr)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 8px', borderRadius: '12px', cursor: 'pointer', background: wd.isSelected ? 'var(--primary)' : 'transparent', color: wd.isSelected ? 'white' : 'var(--text-main)', border: wd.isToday && !wd.isSelected ? '2px solid var(--primary-light)' : '1px solid transparent', transition: 'all 0.2s ease' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: wd.isSelected ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)', marginBottom: '4px' }}>{wd.dayName}</span>
              <span style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>{wd.dayNumber}</span>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[...Array(Math.min(wd.count, 3))].map((_, j) => (
                  <div key={j} style={{ width: '4px', height: '4px', borderRadius: '50%', background: wd.isSelected ? 'white' : 'var(--primary)' }}></div>
                ))}
                {wd.count > 3 && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: wd.isSelected ? 'white' : 'var(--primary)' }}></div>}
              </div>
            </div>
          ))}
        </div>

        <div style={{ width: '100%', height: '1px', background: 'var(--border)', margin: '16px 0' }}></div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 className="heading-3" style={{ fontSize: '16px' }}>
              {selectedDate === new Date().toISOString().split('T')[0]
                ? "Today's Schedule"
                : `Schedule for ${new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
            </h3>
            <span className="badge badge-primary" style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '6px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: '600' }}>
              {selectedAppointments.length} appointments
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {selectedAppointments.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                No appointments scheduled for this date.
              </div>
            ) : (
              selectedAppointments.map((apt) => {
                const statusStyle = getStatusColor(apt.status);
                return (
                  <div key={apt.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: '1.5px solid var(--border)', borderRadius: '12px', background: apt.status === 'Completed' ? 'var(--bg-color)' : 'white', opacity: apt.status === 'Completed' ? 0.7 : 1, transition: 'all var(--transition-fast)' }} onMouseEnter={(e) => { if (apt.status !== 'Completed') e.currentTarget.style.borderColor = 'var(--primary-light)'; }} onMouseLeave={(e) => { if (apt.status !== 'Completed') e.currentTarget.style.borderColor = 'var(--border)'; }}>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px', borderRight: '1.5px solid var(--border)', paddingRight: '20px' }}>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: apt.status === 'Completed' ? 'var(--text-muted)' : 'var(--primary)', marginBottom: '4px' }}>
                          {apt.startTime}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} /> {apt.duration || '30 mins'}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div className="avatar" style={{ width: '40px', height: '40px', background: 'var(--surface-hover)', color: 'var(--primary)', fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {apt.patientInitials}
                        </div>
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--dark)', marginBottom: '4px' }}>
                            {apt.patientName}
                          </div>
                          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                            {apt.category}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span className="badge" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: '600', background: apt.type === 'Virtual' ? '#F3E8FF' : '#DBEAFE', color: apt.type === 'Virtual' ? '#7E22CE' : '#1D4ED8' }}>
                        {apt.type === 'Virtual' ? <Video size={14} /> : <User size={14} />}
                        {apt.type}
                      </span>

                      <span className="badge" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: '600', background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}` }}>
                        {statusStyle.isPulsing && <span className="pulse" style={{ width: '8px', height: '8px', background: statusStyle.color, borderRadius: '50%', display: 'inline-block' }}></span>}
                        {apt.status}
                      </span>

                      {apt.type === 'Virtual' && apt.status === 'In Progress' && (
                        <button className="btn btn-primary" onClick={() => handleStartVideoCall(apt)} style={{ padding: '6px 16px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--success)', color: 'white' }}>
                          <Video size={14} /> Start Video Call
                        </button>
                      )}

                      {apt.status === 'Upcoming' && (
                        <button className="btn btn-outline" onClick={() => handleViewAppointment(apt)} style={{ padding: '6px 16px', fontSize: '12px' }}>
                          View Details
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Scheduling Modal */}
      {showSchedulingModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', width: '90%', maxWidth: '500px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Schedule New Appointment</h2>
              <button onClick={() => setShowSchedulingModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); alert('✓ Appointment scheduled successfully!'); setShowSchedulingModal(false); }} style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '14px' }}>Patient <span style={{ color: '#ef4444' }}>*</span></label>
                <input type="text" placeholder="Select patient..." required style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '14px' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '14px' }}>Date</label>
                  <input type="date" required style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '14px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '14px' }}>Time</label>
                  <input type="time" required style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '14px' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowSchedulingModal(false)} style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--surface-hover)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailModal && selectedAppointment && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', width: '90%', maxWidth: '600px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Appointment Details</h2>
              <button onClick={() => setShowDetailModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ display: 'grid', gap: '1rem', fontSize: '14px' }}>
              <div><strong>Patient:</strong> {selectedAppointment.patientName}</div>
              <div><strong>Date:</strong> {new Date(selectedAppointment.date).toLocaleDateString()}</div>
              <div><strong>Time:</strong> {selectedAppointment.startTime}</div>
              <div><strong>Duration:</strong> {selectedAppointment.duration}</div>
              <div><strong>Type:</strong> {selectedAppointment.type}</div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button onClick={() => setShowDetailModal(false)} style={{ flex: 1, padding: '0.75rem', backgroundColor: 'var(--surface-hover)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                  Close
                </button>
                {selectedAppointment.type === 'Virtual' && selectedAppointment.status === 'In Progress' && (
                  <button onClick={() => { setShowDetailModal(false); handleStartVideoCall(selectedAppointment); }} style={{ flex: 1, padding: '0.75rem', backgroundColor: 'var(--success)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
                    Start Call
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Call Component */}
      {showVideoCall && selectedAppointment && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ width: '100%', maxWidth: '800px', aspectRatio: '16 / 9', backgroundColor: '#1a1a1a', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'white', marginBottom: '2rem' }}>
            <Video size={64} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p style={{ fontSize: '18px', fontWeight: '600', marginBottom: '0.5rem' }}>
              Video Call with {selectedAppointment.patientName}
            </p>
            <p style={{ fontSize: '13px', color: '#999' }}>
              WebRTC/Jitsi integration point
            </p>
          </div>

          <button onClick={() => setShowVideoCall(false)} style={{ padding: '0.75rem 2rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
            End Call
          </button>
        </div>
      )}
    </div>
  );
};

export default Appointments;
