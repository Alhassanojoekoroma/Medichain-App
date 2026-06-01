
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import Records from './pages/Records';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import AccessLog from './pages/AccessLog';
import Notifications from './pages/Notifications';
import QRScanner from './pages/QRScanner';
import PublicPatientQR from './pages/PublicPatientQR';
import PatientDetail from './pages/PatientDetail';
import NewPatient from './pages/NewPatient';
import UploadRecord from './pages/UploadRecord';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/public/patient-qr/:patientId" element={<PublicPatientQR />} />

        {/* Authenticated Routes */}
        <Route
          path="/*"
          element={
            <div className="app-container">
              <Sidebar />
              
              <main className="main-content">
                <TopHeader />
                
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/patients" element={<Patients />} />
                  <Route path="/patients/new" element={<NewPatient />} />
                  <Route path="/patients/:id" element={<PatientDetail />} />
                  <Route path="/appointments" element={<Appointments />} />
                  <Route path="/records" element={<Records />} />
                  <Route path="/upload" element={<UploadRecord />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/access-log" element={<AccessLog />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/scan" element={<QRScanner />} />
                </Routes>
              </main>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
