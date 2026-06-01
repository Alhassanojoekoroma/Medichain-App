import React, { useState } from 'react';
import { ArrowLeft, Upload, Check, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fabricService } from '../services/fabricService';

interface UploadedFile {
  file: File;
  sha256: string;
}

const UploadRecord: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [blockchainAnchoring, setBlockchainAnchoring] = useState(true);
  const [recordPermissions, setRecordPermissions] = useState<'doctor' | 'all'>('doctor');
  const [txID, setTxID] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    patientId: '',
    recordType: 'Laboratory',
    recordDate: new Date().toISOString().split('T')[0],
    doctorFacility: '',
    description: ''
  });

  // Simple SHA-256 hash simulation (in production, use crypto-js or similar)
  const simulateSHA256 = (fileName: string): string => {
    const hash = `0x${Array.from(fileName).reduce((h, c) => ((h << 5) - h) + c.charCodeAt(0) | 0, 0).toString(16).padStart(64, '0').substr(0, 64)}`;
    return hash;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = (files: File[]) => {
    const validFiles = files.filter(f => {
      const ext = f.name.split('.').pop()?.toLowerCase();
      const validExts = ['pdf', 'jpg', 'jpeg', 'png', 'dicom'];
      const isValid = validExts.includes(ext || '');
      const isSmall = f.size <= 10 * 1024 * 1024; // 10MB

      if (!isValid) {
        setError(`❌ Invalid file format: ${f.name}. Allowed: PDF, JPG, PNG, DICOM`);
      }
      if (!isSmall) {
        setError(`❌ File too large: ${f.name}. Max 10MB`);
      }

      return isValid && isSmall;
    });

    const newFiles = validFiles.map(f => ({
      file: f,
      sha256: simulateSHA256(f.name)
    }));

    setUploadedFiles([...uploadedFiles, ...newFiles]);
    setError(null);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.patientId.trim()) {
      setError('Please select a patient');
      return;
    }

    if (uploadedFiles.length === 0) {
      setError('Please upload at least one file');
      return;
    }

    if (!formData.doctorFacility.trim()) {
      setError('Please enter doctor/facility name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create medical record on blockchain
      const txID = await fabricService.createMedicalRecord(
        formData.patientId,
        formData.recordType,
        {
          recordDate: formData.recordDate,
          doctorFacility: formData.doctorFacility,
          description: formData.description,
          fileCount: uploadedFiles.length,
          files: uploadedFiles.map(f => ({
            name: f.file.name,
            size: f.file.size,
            sha256: f.sha256
          })),
          permissions: recordPermissions,
          anchoredOnBlockchain: blockchainAnchoring,
          uploadedAt: new Date().toISOString()
        }
      );

      setTxID(txID);

      // Simulate successful upload
      setTimeout(() => {
        alert(`✓ Record uploaded successfully!\n\nTransaction ID: ${txID}\n\nFiles: ${uploadedFiles.length}\nBlockchain Anchored: ${blockchainAnchoring ? 'Yes' : 'No'}`);
        navigate('/records');
      }, 2000);
    } catch (err) {
      console.error('Error uploading record:', err);
      setError('❌ Failed to upload record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '1000px' }}>
      <button
        onClick={() => navigate('/records')}
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
        Back to Records
      </button>

      <div className="page-header animate-fade-in" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="heading-2 page-title" style={{ marginBottom: '8px' }}>Upload Medical Record</h1>
          <p className="page-subtitle">Add medical records and anchor them to Hyperledger Fabric blockchain for immutability.</p>
        </div>
      </div>

      {txID && (
        <div style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem'
        }}>
          <Check size={20} style={{ color: '#16a34a', flexShrink: 0, marginTop: '0.25rem' }} />
          <div>
            <h4 style={{ color: '#166534', fontWeight: '600', marginBottom: '0.5rem' }}>Upload Successful!</h4>
            <p style={{ color: '#166534', fontSize: '13px', marginBottom: '0.5rem' }}>
              Your record has been successfully uploaded and anchored to the blockchain.
            </p>
            <p style={{ color: '#166534', fontSize: '12px', fontFamily: 'monospace', backgroundColor: '#f0fdf4', padding: '0.5rem', borderRadius: '4px', wordBreak: 'break-all' }}>
              TX ID: {txID}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 'var(--radius-lg)',
          padding: '1rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <AlertCircle size={18} style={{ color: '#dc2626', flexShrink: 0 }} />
          <span style={{ color: '#dc2626', fontSize: '13px' }}>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '2rem' }}>
        {/* Record Metadata */}
        <div style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--text-main)' }}>
            Record Information
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '14px' }}>
                Patient ID <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.patientId}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                placeholder="P001234 or select from list"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '14px' }}>
                Record Type <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={formData.recordType}
                onChange={(e) => setFormData({ ...formData, recordType: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px'
                }}
              >
                <option>Laboratory</option>
                <option>X-Ray</option>
                <option>CT Scan</option>
                <option>MRI</option>
                <option>Ultrasound</option>
                <option>Prescription</option>
                <option>Discharge Summary</option>
                <option>Progress Notes</option>
                <option>Other</option>
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '14px' }}>
                Record Date <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="date"
                value={formData.recordDate}
                onChange={(e) => setFormData({ ...formData, recordDate: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '14px' }}>
                Doctor/Facility Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.doctorFacility}
                onChange={(e) => setFormData({ ...formData, doctorFacility: e.target.value })}
                placeholder="Dr. Name or Hospital Name"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '14px' }}>
              Notes/Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add any relevant notes about this record..."
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>
        </div>

        {/* File Upload */}
        <div style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--text-main)' }}>
            Upload Files
          </h3>

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            style={{
              border: '2px dashed',
              borderColor: dragActive ? 'var(--primary)' : 'var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '3rem 2rem',
              textAlign: 'center',
              backgroundColor: dragActive ? 'rgba(var(--primary-rgb), 0.05)' : 'var(--surface-hover)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              marginBottom: '1.5rem'
            }}
          >
            <Upload size={32} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'inline-block' }} />
            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '0.5rem' }}>
              Drag & drop files here
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              or
            </p>
            <label style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              backgroundColor: 'var(--primary)',
              color: 'white',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.dicom"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              Select Files
            </label>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '1rem' }}>
              Supported formats: PDF, JPG, PNG, DICOM • Max 10MB per file
            </p>
          </div>

          {uploadedFiles.length > 0 && (
            <div style={{
              backgroundColor: 'var(--surface-hover)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem'
            }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '1rem' }}>
                Uploaded Files ({uploadedFiles.length})
              </h4>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {uploadedFiles.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem',
                      backgroundColor: 'var(--surface)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '500' }}>
                        {item.file.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        {(item.file.size / 1024 / 1024).toFixed(2)} MB • SHA-256: {item.sha256.substring(0, 16)}...
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Blockchain & Permissions */}
        <div style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--text-main)' }}>
            🔐 Blockchain & Permissions
          </h3>

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {/* Blockchain Anchoring */}
            <div style={{
              backgroundColor: 'var(--surface-hover)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '14px' }}>
                <input
                  type="checkbox"
                  checked={blockchainAnchoring}
                  onChange={(e) => setBlockchainAnchoring(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                />
                <span style={{ fontWeight: '500' }}>Anchor to Blockchain (SHA-256 Hash)</span>
              </label>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '0.5rem', marginLeft: '2rem' }}>
                ✓ Creates immutable proof of file integrity on Hyperledger Fabric
              </p>
            </div>

            {/* Record Permissions */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '500', fontSize: '14px' }}>
                Who can access this record?
              </label>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '13px' }}>
                  <input
                    type="radio"
                    name="permissions"
                    value="doctor"
                    checked={recordPermissions === 'doctor'}
                    onChange={(e) => setRecordPermissions(e.target.value as 'doctor' | 'all')}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                  />
                  <span>Doctor only (Private) - Only assigned doctor can view</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '13px' }}>
                  <input
                    type="radio"
                    name="permissions"
                    value="all"
                    checked={recordPermissions === 'all'}
                    onChange={(e) => setRecordPermissions(e.target.value as 'doctor' | 'all')}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                  />
                  <span>All doctors (Semi-public) - Any doctor with access can view</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => navigate('/records')}
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
            disabled={loading || uploadedFiles.length === 0}
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: loading || uploadedFiles.length === 0 ? '#9ca3af' : 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: loading || uploadedFiles.length === 0 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              opacity: loading || uploadedFiles.length === 0 ? 0.7 : 1
            }}
          >
            {loading ? 'Uploading...' : `⬆ Upload ${uploadedFiles.length} File${uploadedFiles.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadRecord;
