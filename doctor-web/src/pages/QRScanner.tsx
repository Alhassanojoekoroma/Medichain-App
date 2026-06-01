import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import jsQR from 'jsqr';
import { MOCK_PATIENTS } from '../services/mockData';

const QRScanner: React.FC = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanning, setScanning] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [scannedData, setScannedData] = useState<any>(null);
  const [cameraPermission, setCameraPermission] = useState<'pending' | 'granted' | 'denied'>('pending');

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraPermission('granted');
        }
      } catch (error) {
        console.error('Camera access denied:', error);
        setCameraPermission('denied');
        setErrorMsg('Camera permission denied. Please enable camera access in your browser settings.');
        setScanning(false);
      }
    };

    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  // Scanning loop
  useEffect(() => {
    const scanQR = () => {
      if (!scanning || !videoRef.current || !canvasRef.current || cameraPermission !== 'granted') {
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      try {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          // Try to parse as patient ID or full data
          try {
            const data = JSON.parse(code.data);
            setScannedData(data);
            setScanning(false);
          } catch {
            // If not JSON, treat as patient ID
            const patientId = code.data.trim();
            const patient = MOCK_PATIENTS.find(p => p.id === patientId);
            if (patient) {
              setScannedData(patient);
              setScanning(false);
            }
          }
        }
      } catch (err) {
        console.error('QR scan error:', err);
      }

      if (scanning) {
        requestAnimationFrame(scanQR);
      }
    };

    if (scanning && cameraPermission === 'granted') {
      requestAnimationFrame(scanQR);
    }
  }, [scanning, cameraPermission]);

  const handleViewPatient = () => {
    if (scannedData?.id) {
      navigate(`/patients/${scannedData.id}`);
    }
  };

  const handleRescan = () => {
    setScannedData(null);
    setErrorMsg('');
    setScanning(true);
  };

  return (
    <div className="page-container" style={{ padding: 0, maxWidth: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem', background: 'white', borderBottom: '1px solid var(--border)' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)'
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--dark)' }}>QR Code Scanner</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Scan patient QR code to access records</p>
        </div>
      </div>

      {/* Camera Permission Denied State */}
      {cameraPermission === 'denied' && (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <AlertCircle size={48} style={{ margin: '0 auto 1rem', color: '#DC2626' }} />
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--dark)', marginBottom: '0.5rem' }}>
            Camera Access Required
          </h2>
          <p style={{ fontSize: '14px', marginBottom: '1.5rem', lineHeight: '1.6' }}>
            This app needs camera access to scan QR codes. Please enable camera permissions in your browser settings.
          </p>
          <div style={{ background: 'var(--primary-light)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '12px', color: 'var(--primary)' }}>
            <strong>How to enable camera:</strong>
            <ul style={{ textAlign: 'left', marginTop: '0.5rem', marginLeft: '1.5rem' }}>
              <li>Chrome: Settings → Privacy → Camera → Allow</li>
              <li>Firefox: Preferences → Privacy → Camera → Allow</li>
              <li>Safari: Settings → Websites → Camera → Allow</li>
            </ul>
          </div>
          <button
            onClick={() => window.location.reload()}
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
            Try Again
          </button>
        </div>
      )}

      {/* Scanning State */}
      {cameraPermission === 'granted' && scanning && !scannedData && !errorMsg && (
        <div style={{ position: 'relative', width: '100%', height: '100vh', background: '#000', overflow: 'hidden' }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* Targeting Overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at center, transparent 25%, rgba(0,0,0,0.6) 100%)',
              pointerEvents: 'none'
            }}
          />

          {/* Scan Frame */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '280px',
              height: '280px',
              border: '3px solid #2952FF',
              borderRadius: '12px',
              boxShadow: '0 0 0 2px rgba(41, 82, 255, 0.2)',
              pointerEvents: 'none'
            }}
          />

          {/* Scanning Indicator */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '280px',
              height: '4px',
              background: 'linear-gradient(90deg, transparent, #2952FF, transparent)',
              animation: 'slide 2s infinite',
              pointerEvents: 'none'
            }}
          />

          {/* Instructions */}
          <div
            style={{
              position: 'absolute',
              bottom: '3rem',
              left: 0,
              right: 0,
              textAlign: 'center',
              color: 'white',
              zIndex: 10
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '0.5rem' }}>
              <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: '14px', fontWeight: '500' }}>Scanning...</span>
            </div>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Position QR code within frame</p>
          </div>

          {/* Close Button */}
          <button
            onClick={() => navigate(-1)}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(0,0,0,0.6)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              zIndex: 20
            }}
          >
            ×
          </button>

          <style>{`
            @keyframes slide {
              0% { transform: translateX(-50%, -50%) translateY(0); }
              50% { transform: translateX(-50%, -50%) translateY(140px); }
              100% { transform: translateX(-50%, -50%) translateY(0); }
            }
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      {/* Scanned Successfully State */}
      {scannedData && (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <CheckCircle size={56} style={{ margin: '0 auto 1rem', color: 'var(--green)' }} />
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--dark)', marginBottom: '0.5rem' }}>
            QR Code Scanned
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Patient record found
          </p>

          <div
            style={{
              background: 'white',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', gap: '12px', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 'var(--radius-md)',
                  flexShrink: 0
                }}
              >
                {scannedData.name?.charAt(0) || 'P'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--dark)', marginBottom: '4px' }}>
                  {scannedData.name}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  ID: {scannedData.id || scannedData.nationalId}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {scannedData.bloodType && `Blood Type: ${scannedData.bloodType}`}
                </div>
              </div>
            </div>

            {scannedData.status && (
              <div
                style={{
                  fontSize: '12px',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  background:
                    scannedData.status === 'Active'
                      ? 'var(--green-light)'
                      : scannedData.status === 'Critical'
                        ? '#FEF2F2'
                        : 'var(--bg)',
                  color:
                    scannedData.status === 'Active'
                      ? '#0D9226'
                      : scannedData.status === 'Critical'
                        ? '#DC2626'
                        : 'var(--text-muted)'
                }}
              >
                Status: {scannedData.status}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleRescan}
              style={{
                flex: 1,
                padding: '0.75rem 1.5rem',
                backgroundColor: 'var(--surface-hover)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                color: 'var(--dark)'
              }}
            >
              Scan Another
            </button>
            <button
              onClick={handleViewPatient}
              style={{
                flex: 1,
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
              View Full Record
            </button>
          </div>
        </div>
      )}

      {/* Error State */}
      {errorMsg && (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <AlertCircle size={48} style={{ margin: '0 auto 1rem', color: '#DC2626' }} />
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--dark)', marginBottom: '0.5rem' }}>
            Scan Error
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
            {errorMsg}
          </p>
          <button
            onClick={handleRescan}
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
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
