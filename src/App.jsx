import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import RegisterBusiness from './pages/auth/RegisterBusiness';
import Dashboard from './pages/user/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import ManufacturerDashboard from './pages/manufacturer/Dashboard';
import DistributorDashboard from './pages/distributor/Dashboard';
import PharmacyDashboard from './pages/pharmacy/Dashboard';
import UserHome from './pages/public/UserHome';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

// Component để ẩn Navbar khi ở dashboard pages
function AppContent() {
  const location = useLocation();
  const dashboardRoutes = ['/admin', '/manufacturer', '/distributor', '/pharmacy', '/user', '/dashboard'];
  const showNavbar = !dashboardRoutes.includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-business" element={<RegisterBusiness />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        {/* Role-based routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['system_admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manufacturer"
          element={
            <ProtectedRoute allowedRoles={['pharma_company']}>
              <ManufacturerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/distributor"
          element={
            <ProtectedRoute allowedRoles={['distributor']}>
              <DistributorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pharmacy"
          element={
            <ProtectedRoute allowedRoles={['pharmacy']}>
              <PharmacyDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<UserHome />} />
      </Routes>
    </>
  );
}

export default App;

