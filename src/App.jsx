import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Register from './pages/auth/Register';
import RegisterBusiness from './pages/auth/RegisterBusiness';
import ForgotPasswordBusiness from './pages/auth/ForgotPasswordBusiness';
import PublicNFTTracking from './pages/public/NFTTracking';
import PublicDrugInfo from './pages/public/DrugInfo';
import AdminDashboard from './pages/admin/Dashboard';
import AdminRegistrations from './pages/admin/Registrations';
import AdminRegistrationDetail from './pages/admin/RegistrationDetail';
import AdminDrugs from './pages/admin/Drugs';
import AdminDrugForm from './pages/admin/DrugForm';
import AdminSupplyChainHistory from './pages/admin/SupplyChainHistory';
import AdminDistributionHistory from './pages/admin/DistributionHistory';
import AdminNftTracking from './pages/admin/NftTracking';
import AdminPasswordResetRequests from './pages/admin/PasswordResetRequests';
import ManufacturerDashboard from './pages/manufacturer/Dashboard';
import ManufacturerDrugManagement from './pages/manufacturer/DrugManagement';
import ManufacturerProductionManagement from './pages/manufacturer/ProductionManagement';
import ManufacturerTransferManagement from './pages/manufacturer/TransferManagement';
import ManufacturerProductionHistory from './pages/manufacturer/ProductionHistory';
import ManufacturerTransferHistory from './pages/manufacturer/TransferHistory';
import ManufacturerProfile from './pages/manufacturer/Profile';
import DistributorDashboard from './pages/distributor/Dashboard';
import DistributorInvoices from './pages/distributor/InvoicesFromManufacturer';
import DistributorTransferPharmacy from './pages/distributor/TransferToPharmacy';
import DistributorDistributionHistory from './pages/distributor/DistributionHistory';
import DistributorTransferHistory from './pages/distributor/TransferHistory';
import DistributorDrugs from './pages/distributor/Drugs';
import DistributorNFTTracking from './pages/distributor/NFTTracking';
import DistributorProfile from './pages/distributor/Profile';
import PharmacyDashboard from './pages/pharmacy/Dashboard';
import PharmacyInvoices from './pages/pharmacy/InvoicesFromDistributor';
import PharmacyDistributionHistory from './pages/pharmacy/DistributionHistory';
import PharmacyDrugs from './pages/pharmacy/Drugs';
import PharmacyNftTracking from './pages/pharmacy/NFTTracking';
import PharmacyProfile from './pages/pharmacy/Profile';
import UserHome from './pages/public/UserHome';
import MetaMaskConnect from './pages/MetaMaskConnect';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/auth/Login';
import VerifyPage from './pages/public/VerifyPage';
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

// Component để ẩn Navbar khi ở dashboard pages
function AppContent() {
  const location = useLocation();
  const dashboardPrefixes = ['/admin', '/manufacturer', '/distributor', '/pharmacy', '/dashboard'];
  const showNavbar = !dashboardPrefixes.some(prefix => location.pathname.startsWith(prefix));

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-business" element={<RegisterBusiness />} />
        <Route path="/forgot-password-business" element={<ForgotPasswordBusiness />} />
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
          path="/admin/registrations"
          element={
            <ProtectedRoute allowedRoles={['system_admin']}>
              <AdminRegistrations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/registrations/:id"
          element={
            <ProtectedRoute allowedRoles={['system_admin']}>
              <AdminRegistrationDetail />
            </ProtectedRoute>
          }
        />
        <Route path="/admin/drugs" element={<ProtectedRoute allowedRoles={['system_admin']}><AdminDrugs /></ProtectedRoute>} />
        <Route path="/admin/drugs/new" element={<ProtectedRoute allowedRoles={['system_admin']}><AdminDrugForm /></ProtectedRoute>} />
        <Route path="/admin/drugs/:id" element={<ProtectedRoute allowedRoles={['system_admin']}><AdminDrugForm /></ProtectedRoute>} />
        <Route path="/admin/supply-chain" element={<ProtectedRoute allowedRoles={['system_admin']}><AdminSupplyChainHistory /></ProtectedRoute>} />
        <Route path="/admin/distribution" element={<ProtectedRoute allowedRoles={['system_admin']}><AdminDistributionHistory /></ProtectedRoute>} />
        <Route path="/admin/nft-tracking" element={<ProtectedRoute allowedRoles={['system_admin']}><AdminNftTracking /></ProtectedRoute>} />
        <Route path="/admin/password-reset-requests" element={<ProtectedRoute allowedRoles={['system_admin']}><AdminPasswordResetRequests /></ProtectedRoute>} />
        {/* Manufacturer (Pharma Company) Routes */}
        <Route path="/manufacturer" element={<ProtectedRoute allowedRoles={['pharma_company']}><ManufacturerDashboard /></ProtectedRoute>} />
        <Route path="/manufacturer/drugs" element={<ProtectedRoute allowedRoles={['pharma_company']}><ManufacturerDrugManagement /></ProtectedRoute>} />
        <Route path="/manufacturer/production" element={<ProtectedRoute allowedRoles={['pharma_company']}><ManufacturerProductionManagement /></ProtectedRoute>} />
        <Route path="/manufacturer/transfer" element={<ProtectedRoute allowedRoles={['pharma_company']}><ManufacturerTransferManagement /></ProtectedRoute>} />
        <Route path="/manufacturer/production-history" element={<ProtectedRoute allowedRoles={['pharma_company']}><ManufacturerProductionHistory /></ProtectedRoute>} />
        <Route path="/manufacturer/transfer-history" element={<ProtectedRoute allowedRoles={['pharma_company']}><ManufacturerTransferHistory /></ProtectedRoute>} />
        {/* Trang distribution-confirmation đã được loại bỏ */}
        <Route path="/manufacturer/profile" element={<ProtectedRoute allowedRoles={['pharma_company']}><ManufacturerProfile /></ProtectedRoute>} />
        {/* Distributor Routes */}
        <Route path="/distributor" element={<ProtectedRoute allowedRoles={['distributor']}><DistributorDashboard /></ProtectedRoute>} />
        <Route path="/distributor/invoices" element={<ProtectedRoute allowedRoles={['distributor']}><DistributorInvoices /></ProtectedRoute>} />
        <Route path="/distributor/transfer-pharmacy" element={<ProtectedRoute allowedRoles={['distributor']}><DistributorTransferPharmacy /></ProtectedRoute>} />
        <Route path="/distributor/distribution-history" element={<ProtectedRoute allowedRoles={['distributor']}><DistributorDistributionHistory /></ProtectedRoute>} />
        <Route path="/distributor/transfer-history" element={<ProtectedRoute allowedRoles={['distributor']}><DistributorTransferHistory /></ProtectedRoute>} />
        <Route path="/distributor/drugs" element={<ProtectedRoute allowedRoles={['distributor']}><DistributorDrugs /></ProtectedRoute>} />
        <Route path="/distributor/nft-tracking" element={<ProtectedRoute allowedRoles={['distributor']}><DistributorNFTTracking /></ProtectedRoute>} />
        <Route path="/distributor/profile" element={<ProtectedRoute allowedRoles={['distributor']}><DistributorProfile /></ProtectedRoute>} />
        
        {/* Pharmacy Routes */}
        <Route path="/pharmacy" element={<ProtectedRoute allowedRoles={['pharmacy']}><PharmacyDashboard /></ProtectedRoute>} />
        <Route path="/pharmacy/invoices" element={<ProtectedRoute allowedRoles={['pharmacy']}><PharmacyInvoices /></ProtectedRoute>} />
        <Route path="/pharmacy/distribution-history" element={<ProtectedRoute allowedRoles={['pharmacy']}><PharmacyDistributionHistory /></ProtectedRoute>} />
        <Route path="/pharmacy/drugs" element={<ProtectedRoute allowedRoles={['pharmacy']}><PharmacyDrugs /></ProtectedRoute>} />
        <Route path="/pharmacy/nft-tracking" element={<ProtectedRoute allowedRoles={['pharmacy']}><PharmacyNftTracking /></ProtectedRoute>} />
        <Route path="/pharmacy/profile" element={<ProtectedRoute allowedRoles={['pharmacy']}><PharmacyProfile /></ProtectedRoute>} />
        
        {/* Public Routes */}
        <Route path="/track/:tokenId" element={<PublicNFTTracking />} />
        <Route path="/track" element={<PublicNFTTracking />} />
        <Route path="/drug-info" element={<PublicDrugInfo />} />
        <Route path="/metamask" element={<MetaMaskConnect />} />
        <Route path="/verify" element={<VerifyPage/>} />
        <Route path="/" element={<UserHome />} />
      </Routes>
    </>
  );
}

export default App;

