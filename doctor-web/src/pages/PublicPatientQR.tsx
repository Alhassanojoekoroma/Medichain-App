import React from 'react';
import { AlertCircle, Phone, Droplets, AlertTriangle } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { MOCK_PATIENTS } from '../services/mockData';

const PublicPatientQR: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const patient = MOCK_PATIENTS.find(p => p.id === patientId);

  if (!patient) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', minHeight: '100vh', background: '#f5f7fb', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <AlertCircle size={56} style={{ color: '#DC2626', marginBottom: '1rem' }} />
        <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--dark)', marginBottom: '0.5rem' }}>
          Patient Not Found
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          The QR code may be invalid or expired.
        </p>
        <button
          onClick={() => window.location.href = '/'}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, var(--primary) 0%, #1a35cc 100%)', padding: '1rem' }}>
      {/* Emergency Banner */}
      <div
        style={{
          background: 'rgba(255,255,255,0.15)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: 'var(--radius-lg)',
          padding: '1rem',
          marginBottom: '1.5rem',
          color: 'white',
          backdropFilter: 'blur(10px)'
        }}
      >
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '0.5rem' }}>
          <AlertTriangle size={20} />
          <h1 style={{ fontSize: '16px', fontWeight: '700' }}>Emergency Medical Card</h1>
        </div>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>
          Public emergency information — no authentication required
        </p>
      </div>

      {/* Patient Card */}
      <div
        style={{
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          marginBottom: '1rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              fontSize: '24px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-md)',
              flexShrink: 0
            }}
          >
            {patient.name?.charAt(0) || 'P'}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--dark)', marginBottom: '4px' }}>
              {patient.name}
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '2px' }}>
              Patient ID: {patient.id}
            </p>
            {patient.dob && (
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Age: {new Date().getFullYear() - new Date(patient.dob).getFullYear()} years
              </p>
            )}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'var(--border)', marginBottom: '1.5rem' }} />

        {/* Critical Info */}
        <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
          {/* Blood Type */}
          {patient.bloodType && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                background: 'var(--primary-light)',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <Droplets size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px', fontWeight: '500', textTransform: 'uppercase' }}>
                  Blood Type
                </div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)' }}>
                  {patient.bloodType}
                </div>
              </div>
            </div>
          )}

          {/* Allergies */}
          {patient.allergies && patient.allergies.length > 0 && (
            <div
              style={{
                padding: '12px',
                background: '#FEF2F2',
                border: '1px solid #FEE2E2',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <AlertTriangle size={18} style={{ color: '#DC2626', marginTop: '2px', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', color: '#B91C1C', marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase' }}>
                    Allergies
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {patient.allergies.map((allergy: string, idx: number) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '12px',
                          padding: '4px 8px',
                          background: '#FEE2E2',
                          border: '1px solid #FECACA',
                          borderRadius: '4px',
                          color: '#991B1B',
                          fontWeight: '500'
                        }}
                      >
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Condition */}
          {patient.condition && (
            <div style={{ padding: '12px', background: 'var(--bg)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase' }}>
                Primary Condition
              </div>
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '12px',
                  padding: '4px 8px',
                  background: 'white',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  color: 'var(--dark)'
                }}
              >
                {patient.condition}
              </span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'var(--border)', marginBottom: '1.5rem' }} />

        {/* Contact Info */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase' }}>
            Contact Information
          </div>
          <div style={{ display: 'grid', gap: '8px' }}>
            {patient.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: 'var(--dark)' }}>{patient.phone}</span>
              </div>
            )}
            {patient.email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px' }}>✉️</span>
                <span style={{ fontSize: '13px', color: 'var(--dark)' }}>{patient.email}</span>
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'var(--border)', marginBottom: '1.5rem' }} />
      </div>

      {/* Footer Note */}
      <div
        style={{
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 'var(--radius-md)',
          padding: '12px',
          color: 'rgba(255,255,255,0.8)',
          fontSize: '11px',
          textAlign: 'center',
          backdropFilter: 'blur(10px)'
        }}
      >
        <p>
          This is a public emergency card. Additional medical records and detailed information require authentication.
        </p>
      </div>
    </div>
  );
};

export default PublicPatientQR;
