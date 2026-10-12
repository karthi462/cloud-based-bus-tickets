import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { PassengerLogin } from './pages/auth/PassengerLogin';
import { PassengerRegister } from './pages/auth/PassengerRegister';
import { ConductorLogin } from './pages/auth/ConductorLogin';
import { AdminLogin } from './pages/auth/AdminLogin';

// Passenger
import { PassengerDashboard } from './pages/passenger/PassengerDashboard';
import { PassengerWallet } from './pages/passenger/PassengerWallet';
import { PassengerCredit } from './pages/passenger/PassengerCredit';
import { PassengerTickets } from './pages/passenger/PassengerTickets';
import { PassengerProfile } from './pages/passenger/PassengerProfile';
import { BusTracker } from './pages/passenger/BusTracker';

// Conductor
import { ConductorDashboard } from './pages/conductor/ConductorDashboard';
import { ConductorTicketGenerator } from './pages/conductor/ConductorTicketGenerator';
import { ConductorTicketValidator } from './pages/conductor/ConductorTicketValidator';

// Admin
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminPassengers } from './pages/admin/AdminPassengers';
import { AdminEmployees } from './pages/admin/AdminEmployees';
import { AdminFareRules } from './pages/admin/AdminFareRules';
import { AdminWithdrawals } from './pages/admin/AdminWithdrawals';
import { AdminAuditLogs } from './pages/admin/AdminAuditLogs';
import { CloudHealthDashboard } from './pages/admin/CloudHealthDashboard';

// Errors
import { NotFound } from './pages/NotFound';
import { Unauthorized } from './pages/Unauthorized';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/passenger/login" element={<PassengerLogin />} />
              <Route path="/passenger/register" element={<PassengerRegister />} />
              <Route path="/conductor/login" element={<ConductorLogin />} />
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Passenger Protected Routes */}
              <Route
                path="/passenger"
                element={
                  <ProtectedRoute allowedRoles={['PASSENGER', 'ADMIN']}>
                    <PassengerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/passenger/wallet"
                element={
                  <ProtectedRoute allowedRoles={['PASSENGER', 'ADMIN']}>
                    <PassengerWallet />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/passenger/credit"
                element={
                  <ProtectedRoute allowedRoles={['PASSENGER', 'ADMIN']}>
                    <PassengerCredit />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/passenger/tickets"
                element={
                  <ProtectedRoute allowedRoles={['PASSENGER', 'ADMIN']}>
                    <PassengerTickets />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/passenger/profile"
                element={
                  <ProtectedRoute allowedRoles={['PASSENGER', 'ADMIN']}>
                    <PassengerProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/passenger/track-bus"
                element={
                  <ProtectedRoute allowedRoles={['PASSENGER', 'ADMIN']}>
                    <BusTracker />
                  </ProtectedRoute>
                }
              />

              {/* Conductor Protected Routes */}
              <Route
                path="/conductor"
                element={
                  <ProtectedRoute allowedRoles={['CONDUCTOR', 'ADMIN']}>
                    <ConductorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/conductor/generate-ticket"
                element={
                  <ProtectedRoute allowedRoles={['CONDUCTOR', 'ADMIN']}>
                    <ConductorTicketGenerator />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/conductor/validate-ticket"
                element={
                  <ProtectedRoute allowedRoles={['CONDUCTOR', 'ADMIN']}>
                    <ConductorTicketValidator />
                  </ProtectedRoute>
                }
              />

              {/* Administrator Protected Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/passengers"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminPassengers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/employees"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminEmployees />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/fare-rules"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminFareRules />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/withdrawals"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminWithdrawals />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/audit-logs"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminAuditLogs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/cloud-health"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <CloudHealthDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Error and Fallback */}
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
