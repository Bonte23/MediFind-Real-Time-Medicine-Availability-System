import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Common Components
import Navbar from './Components/NavBar';
import Footer from './Components/Footer';
import ProtectedRoute from './Components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import HowItWorks from './pages/HowItWorks';
import SearchMedicines from './pages/SearchMedicines';
import PharmacyLocator from './pages/PharmacyLocator';
import PharmacyDetails from './pages/PharmacyDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Contact from './pages/Contact';

// Patient Portal Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientReservations from './pages/patient/PatientReservations';
import PrescriptionUpload from './pages/patient/PrescriptionUpload';
import PatientNotifications from './pages/patient/PatientNotifications';
import PatientComplaints from './pages/patient/PatientComplaints';
import PatientProfile from './pages/patient/PatientProfile';

// Pharmacist Portal Pages
import PharmacistDashboard from './pages/pharmacist/PharmacistDashboard';
import InventoryManagement from './pages/pharmacist/InventoryManagement';
import PharmacyReservations from './pages/pharmacist/PharmacyReservations';
import PrescriptionRequests from './pages/pharmacist/PrescriptionRequests';
import PharmacyProfile from './pages/pharmacist/PharmacyProfile';
import PharmacyReports from './pages/pharmacist/PharmacyReports';

// Admin Portal Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import PharmacyApprovals from './pages/admin/PharmacyApprovals';
import UserManagement from './pages/admin/UserManagement';
import MedicineCatalog from './pages/admin/MedicineCatalog';
import AdminReservations from './pages/admin/AdminReservations';
import AdminComplaints from './pages/admin/AdminComplaints';
import AdminReports from './pages/admin/AdminReports';
import SystemLogs from './pages/admin/SystemLogs';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 selection:bg-sky-500 selection:text-white">
            
            {/* Global Navbar */}
            <Navbar />

            {/* Main Content Area */}
            <main className="flex-1">
              <Routes>
                
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/search" element={<SearchMedicines />} />
                <Route path="/locator" element={<PharmacyLocator />} />
                <Route path="/pharmacy-details/:id" element={<PharmacyDetails />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/contact" element={<Contact />} />

                {/* Patient Protected Routes */}
                <Route
                  path="/patient/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['patient', 'pharmacist', 'admin']}>
                      <PatientDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/patient/reservations"
                  element={
                    <ProtectedRoute allowedRoles={['patient', 'pharmacist', 'admin']}>
                      <PatientReservations />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/patient/prescriptions"
                  element={
                    <ProtectedRoute allowedRoles={['patient', 'pharmacist', 'admin']}>
                      <PrescriptionUpload />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/patient/notifications"
                  element={
                    <ProtectedRoute allowedRoles={['patient', 'pharmacist', 'admin']}>
                      <PatientNotifications />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/patient/complaints"
                  element={
                    <ProtectedRoute allowedRoles={['patient', 'pharmacist', 'admin']}>
                      <PatientComplaints />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/patient/profile"
                  element={
                    <ProtectedRoute allowedRoles={['patient', 'pharmacist', 'admin']}>
                      <PatientProfile />
                    </ProtectedRoute>
                  }
                />

                {/* Pharmacist Protected Routes */}
                <Route
                  path="/pharmacy/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['pharmacist', 'admin']}>
                      <PharmacistDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/pharmacy/inventory"
                  element={
                    <ProtectedRoute allowedRoles={['pharmacist', 'admin']}>
                      <InventoryManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/pharmacy/reservations"
                  element={
                    <ProtectedRoute allowedRoles={['pharmacist', 'admin']}>
                      <PharmacyReservations />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/pharmacy/prescriptions"
                  element={
                    <ProtectedRoute allowedRoles={['pharmacist', 'admin']}>
                      <PrescriptionRequests />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/pharmacy/profile"
                  element={
                    <ProtectedRoute allowedRoles={['pharmacist', 'admin']}>
                      <PharmacyProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/pharmacy/reports"
                  element={
                    <ProtectedRoute allowedRoles={['pharmacist', 'admin']}>
                      <PharmacyReports />
                    </ProtectedRoute>
                  }
                />

                {/* Administrator Protected Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/pharmacies"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <PharmacyApprovals />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <UserManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/medicines"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <MedicineCatalog />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/reservations"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminReservations />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/complaints"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminComplaints />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/reports"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminReports />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/logs"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <SystemLogs />
                    </ProtectedRoute>
                  }
                />

                {/* Legacy Fallbacks */}
                <Route path="/userlogin" element={<Navigate to="/login" replace />} />
                <Route path="/userRegistration" element={<Navigate to="/register" replace />} />
                <Route path="/pharmacist/login" element={<Navigate to="/login" replace />} />
                <Route path="/pharmacist/registration" element={<Navigate to="/register" replace />} />
                <Route path="/user/dashboard" element={<Navigate to="/patient/dashboard" replace />} />

                {/* 404 Catch All */}
                <Route path="*" element={<Navigate to="/" replace />} />

              </Routes>
            </main>

            {/* Global Footer */}
            <Footer />

          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
