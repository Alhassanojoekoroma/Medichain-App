import React, { useState } from 'react';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fabricService } from '../services/fabricService';

const NewPatient: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [allergies, setAllergies] = useState<string[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);
  const [medications, setMedications] = useState<string[]>([]);
  const [allergyInput, setAllergyInput] = useState('');
  const [conditionInput, setConditionInput] = useState('');
  const [medicationInput, setMedicationInput] = useState('');
  const [allowQRAccess, setAllowQRAccess] = useState(false);
  const [qrPermissions, setQRPermissions] = useState({
    name: true,
    bloodType: true,
    allergies: true,
    emergencyContact: true
  });

  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: 'Male',
    nationalId: '',
    bloodType: 'O+',
    phoneNumber: '',
    email: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    address: '',
    primaryDoctor: '',
    insuranceProvider: '',
    insuranceId: ''
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.nationalId.trim()) newErrors.nationalId = 'Patient ID is required';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.emergencyContactName.trim()) newErrors.emergencyContactName = 'Emergency contact name is required';
    if (!formData.emergencyContactPhone.trim()) newErrors.emergencyContactPhone = 'Emergency contact phone is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddTag = (value: string, type: 'allergy' | 'condition' | 'medication') => {
    if (value.trim()) {
      if (type === 'allergy') {
        setAllergies([...allergies, value.trim()]);
        setAllergyInput('');
      } else if (type === 'condition') {
        setConditions([...conditions, value.trim()]);
        setConditionInput('');
      } else if (type === 'medication') {
        setMedications([...medications, value.trim()]);
        setMedicationInput('');
      }
    }
  };

  const handleRemoveTag = (index: number, type: 'allergy' | 'condition' | 'medication') => {
    if (type === 'allergy') {
      setAllergies(allergies.filter((_, i) => i !== index));
    } else if (type === 'condition') {
      setConditions(conditions.filter((_, i) => i !== index));
    } else if (type === 'medication') {
      setMedications(medications.filter((_, i) => i !== index));
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setProfilePhoto(e.target.files[0]);
    }
  };

  const generatePatientId = () => {
    const id = `P${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`;
    setFormData({ ...formData, nationalId: id });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Prepare patient data
      const patientData = {
        ...formData,
        allergies,
        conditions,
        medications,
        allowQRAccess,
        qrPermissions,
        createdAt: new Date().toISOString()
      };

      // Write to blockchain
      const txID = await fabricService.createPatientRecord(patientData);

      // Show success
      alert(`✓ Patient record created successfully!\n\nTransaction ID: ${txID}\n\nPatient ID: ${formData.nationalId}`);

      // Redirect to patient detail page
      setTimeout(() => {
        navigate(`/patients/${formData.nationalId}`);
      }, 1000);
    } catch (error) {
      console.error('Error creating patient:', error);
      alert('❌ Failed to create patient record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const FormField: React.FC<{
    label: string;
    required?: boolean;
    error?: string;
    children: React.ReactNode;
  }> = ({ label, required, error, children }) => (
    <div style={{ marginBottom: '1.5rem' }}>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '14px' }}>
        {label}
        {required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
      </label>
      {children}
      {error && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '0.25rem' }}>{error}</div>}
    </div>
  );

  return (
    <div className="page-container" style={{ maxWidth: '1000px' }}>
      <button
        onClick={() => navigate('/patients')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'none',
          border: 'none',
          color: 'var(--primary)',
          cursor: 'pointer',
          fontSize: '14px',
          marginBottom: '1.5rem',
          padding: 0
        }}
      >
        <ArrowLeft size={18} />
        Back to Patients
      </button>

      <div className="page-header animate-fade-in" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="heading-2 page-title" style={{ marginBottom: '8px' }}>Create New Patient Record</h1>
          <p className="page-subtitle">Add a new patient to the system and save to Hyperledger Fabric blockchain.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '2rem' }}>
        {/* Personal Information */}
        <div style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--text-main)' }}>
            Personal Information
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <FormField label="Full Name" required error={errors.fullName}>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Enter full name"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: errors.fullName ? '1px solid #ef4444' : '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px'
                }}
              />
            </FormField>

            <FormField label="Date of Birth" required error={errors.dateOfBirth}>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: errors.dateOfBirth ? '1px solid #ef4444' : '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px'
                }}
              />
            </FormField>

            <FormField label="Gender" required>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px'
                }}
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </FormField>

            <FormField label="Blood Type" required>
              <select
                value={formData.bloodType}
                onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px'
                }}
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bt => (
                  <option key={bt}>{bt}</option>
                ))}
              </select>
            </FormField>

            <div style={{ position: 'relative' }}>
              <FormField label="National ID / Patient ID" required error={errors.nationalId}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={formData.nationalId}
                    onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                    placeholder="Enter or generate ID"
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      border: errors.nationalId ? '1px solid #ef4444' : '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '14px'
                    }}
                  />
                  <button
                    type="button"
                    onClick={generatePatientId}
                    style={{
                      padding: '0.75rem 1rem',
                      backgroundColor: 'var(--surface-hover)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '500',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Generate
                  </button>
                </div>
              </FormField>
            </div>

            <FormField label="Profile Photo (Optional)">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px'
                }}
              />
              {profilePhoto && <div style={{ fontSize: '12px', marginTop: '0.25rem', color: 'var(--text-muted)' }}>Selected: {profilePhoto.name}</div>}
            </FormField>
          </div>
        </div>

        {/* Contact Information */}
        <div style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--text-main)' }}>
            Contact Information
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <FormField label="Phone Number" required error={errors.phoneNumber}>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="+1 (555) 000-0000"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: errors.phoneNumber ? '1px solid #ef4444' : '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px'
                }}
              />
            </FormField>

            <FormField label="Email Address (Optional)">
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="patient@email.com"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px'
                }}
              />
            </FormField>

            <FormField label="Emergency Contact Name" required error={errors.emergencyContactName}>
              <input
                type="text"
                value={formData.emergencyContactName}
                onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                placeholder="Name"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: errors.emergencyContactName ? '1px solid #ef4444' : '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px'
                }}
              />
            </FormField>

            <FormField label="Emergency Contact Phone" required error={errors.emergencyContactPhone}>
              <input
                type="tel"
                value={formData.emergencyContactPhone}
                onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: errors.emergencyContactPhone ? '1px solid #ef4444' : '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px'
                }}
              />
            </FormField>
          </div>

          <FormField label="Home Address" required error={errors.address}>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Street, City, Country"
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: errors.address ? '1px solid #ef4444' : '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </FormField>
        </div>

        {/* Medical Information */}
        <div style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--text-main)' }}>
            Medical Information
          </h3>

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {/* Allergies */}
            <div>
              <FormField label="Allergies (Add comma-separated values)">
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    value={allergyInput}
                    onChange={(e) => setAllergyInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag(allergyInput, 'allergy');
                      }
                    }}
                    placeholder="Type and press Enter..."
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '14px'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddTag(allergyInput, 'allergy')}
                    style={{
                      padding: '0.75rem 1rem',
                      backgroundColor: 'var(--primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {allergies.map((allergy, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '13px'
                      }}
                    >
                      {allergy}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(idx, 'allergy')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </FormField>
            </div>

            {/* Chronic Conditions */}
            <div>
              <FormField label="Chronic Conditions">
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    value={conditionInput}
                    onChange={(e) => setConditionInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag(conditionInput, 'condition');
                      }
                    }}
                    placeholder="Type and press Enter..."
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '14px'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddTag(conditionInput, 'condition')}
                    style={{
                      padding: '0.75rem 1rem',
                      backgroundColor: 'var(--primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {conditions.map((condition, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        backgroundColor: '#fef3c7',
                        color: '#b45309',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '13px'
                      }}
                    >
                      {condition}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(idx, 'condition')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </FormField>
            </div>

            {/* Current Medications */}
            <div>
              <FormField label="Current Medications">
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    value={medicationInput}
                    onChange={(e) => setMedicationInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag(medicationInput, 'medication');
                      }
                    }}
                    placeholder="Type and press Enter..."
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '14px'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddTag(medicationInput, 'medication')}
                    style={{
                      padding: '0.75rem 1rem',
                      backgroundColor: 'var(--primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {medications.map((med, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        backgroundColor: '#dbeafe',
                        color: '#1d4ed8',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '13px'
                      }}
                    >
                      {med}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(idx, 'medication')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </FormField>
            </div>

            <FormField label="Primary Doctor">
              <select
                value={formData.primaryDoctor}
                onChange={(e) => setFormData({ ...formData, primaryDoctor: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px'
                }}
              >
                <option value="">Select a doctor...</option>
                <option>Dr. Sarah Wilson</option>
                <option>Dr. Michael Chen</option>
                <option>Dr. Emily Rodriguez</option>
              </select>
            </FormField>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <FormField label="Insurance Provider">
                <input
                  type="text"
                  value={formData.insuranceProvider}
                  onChange={(e) => setFormData({ ...formData, insuranceProvider: e.target.value })}
                  placeholder="Insurance company name"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px'
                  }}
                />
              </FormField>

              <FormField label="Insurance ID">
                <input
                  type="text"
                  value={formData.insuranceId}
                  onChange={(e) => setFormData({ ...formData, insuranceId: e.target.value })}
                  placeholder="Policy number"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px'
                  }}
                />
              </FormField>
            </div>
          </div>
        </div>

        {/* QR Code Permissions */}
        <div style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--text-main)' }}>
            🔐 QR Code Permissions
          </h3>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '14px' }}>
              <input
                type="checkbox"
                checked={allowQRAccess}
                onChange={(e) => setAllowQRAccess(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
              />
              <span>Allow public QR code access (what strangers see when scanning)</span>
            </label>
            {allowQRAccess && (
              <div style={{ marginTop: '1rem', paddingLeft: '2rem', borderLeft: '2px solid var(--border)' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  Select which fields are visible on emergency QR cards:
                </p>
                {Object.entries(qrPermissions).map(([key, value]) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '0.5rem', fontSize: '13px' }}>
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setQRPermissions({ ...qrPermissions, [key]: e.target.checked })}
                      style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                    />
                    <span>
                      {key === 'name' && 'Full Name'}
                      {key === 'bloodType' && 'Blood Type'}
                      {key === 'allergies' && 'Allergies'}
                      {key === 'emergencyContact' && 'Emergency Contact'}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => navigate('/patients')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'var(--surface-hover)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: loading ? '#9ca3af' : 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Writing to blockchain...' : '✓ Save to Blockchain'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewPatient;
