import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import RegisterBusiness from './pages/auth/RegisterBusiness';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/user/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import AdminRegistrations from './pages/admin/Registrations';
import AdminRegistrationDetail from './pages/admin/RegistrationDetail';
import AdminDrugs from './pages/admin/Drugs';
import AdminDrugForm from './pages/admin/DrugForm';
import AdminProofOfProduction from './pages/admin/ProofOfProduction';
import AdminProofOfProductionDetail from './pages/admin/ProofOfProductionDetail';
import AdminProofOfDistribution from './pages/admin/ProofOfDistribution';
import AdminProofOfDistributionDetail from './pages/admin/ProofOfDistributionDetail';
import AdminProofOfPharmacy from './pages/admin/ProofOfPharmacy';
import AdminProofOfPharmacyDetail from './pages/admin/ProofOfPharmacyDetail';
import AdminInvoices from './pages/admin/Invoices';
import AdminInvoiceDetail from './pages/admin/InvoiceDetail';
import AdminInvoiceCreate from './pages/admin/InvoiceCreate';
import AdminManufacturers from './pages/admin/Manufacturers';
import AdminNftTracking from './pages/admin/NftTracking';
import ManufacturerDashboard from './pages/manufacturer/Dashboard';
import ManufactorProductionList from './pages/manufacturer/ManufactorProductionList';
import ManufactorSearchPage from './pages/manufacturer/ManufactorSearchPage';
import DrugManagement from './pages/manufacturer/DrugManagement';
import CreateProofOfProduction from './pages/manufacturer/CreateProofOfProduction';
import ProofList from './pages/manufacturer/ProofList';
import ProofDetail from './pages/manufacturer/ProofDetail';
import NFTManagement from './pages/manufacturer/NFTManagement';
import DistributorDashboard from './pages/distributor/Dashboard';
import PharmacyDashboard from './pages/pharmacy/Dashboard';
import PharmacyInvoices from './pages/pharmacy/Invoices';
import PharmacyInvoiceDetail from './pages/pharmacy/InvoiceDetail';
import PharmacyMyInvoices from './pages/pharmacy/MyInvoices';
import PharmacyProofList from './pages/pharmacy/ProofOfPharmacy';
import PharmacyProofDetail from './pages/pharmacy/ProofOfPharmacyDetail';
import PharmacyProofConfirm from './pages/pharmacy/ProofOfPharmacyConfirm';
import PharmacyMyReceipts from './pages/pharmacy/MyReceipts';
import PharmacyProofStats from './pages/pharmacy/ProofStats';
import PharmacyDrugs from './pages/pharmacy/Drugs';
import PharmacyDrugDetail from './pages/pharmacy/DrugDetail';
import PharmacyNftTracking from './pages/pharmacy/NftTracking';
import UserHome from './pages/public/UserHome';
import MetaMaskConnect from './pages/MetaMaskConnect';
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
  const dashboardPrefixes = ['/admin', '/manufacturer', '/distributor', '/pharmacy', '/user', '/dashboard'];
  const showNavbar = !dashboardPrefixes.some(prefix => location.pathname.startsWith(prefix));

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-business" element={<RegisterBusiness />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
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
        <Route path="/admin/proof-of-production" element={<ProtectedRoute allowedRoles={['system_admin']}><AdminProofOfProduction /></ProtectedRoute>} />
        <Route path="/admin/proof-of-production/:id" element={<ProtectedRoute allowedRoles={['system_admin']}><AdminProofOfProductionDetail /></ProtectedRoute>} />
        <Route path="/admin/proof-of-distribution" element={<ProtectedRoute allowedRoles={['system_admin']}><AdminProofOfDistribution /></ProtectedRoute>} />
        <Route path="/admin/proof-of-distribution/:id" element={<ProtectedRoute allowedRoles={['system_admin']}><AdminProofOfDistributionDetail /></ProtectedRoute>} />
        <Route path="/admin/proof-of-pharmacy" element={<ProtectedRoute allowedRoles={['system_admin']}><AdminProofOfPharmacy /></ProtectedRoute>} />
        <Route path="/admin/proof-of-pharmacy/:id" element={<ProtectedRoute allowedRoles={['system_admin']}><AdminProofOfPharmacyDetail /></ProtectedRoute>} />
        <Route path="/admin/invoices" element={<ProtectedRoute allowedRoles={['system_admin']}><AdminInvoices /></ProtectedRoute>} />
        <Route path="/admin/invoices/new" element={<ProtectedRoute allowedRoles={['system_admin']}><AdminInvoiceCreate /></ProtectedRoute>} />
        <Route path="/admin/invoices/:id" element={<ProtectedRoute allowedRoles={['system_admin']}><AdminInvoiceDetail /></ProtectedRoute>} />
        <Route path="/admin/manufacturers" element={<ProtectedRoute allowedRoles={['system_admin']}><AdminManufacturers /></ProtectedRoute>} />
        <Route path="/admin/nft-tracking" element={<ProtectedRoute allowedRoles={['system_admin']}><AdminNftTracking /></ProtectedRoute>} />
        <Route
          path="/manufacturer"
          element={
            <ProtectedRoute allowedRoles={['pharma_company']}>
              <ManufacturerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manufacturer/production-list"
          element={
            <ProtectedRoute allowedRoles={['pharma_company']}>
              <ManufactorProductionList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manufacturer/search"
          element={
            <ProtectedRoute allowedRoles={['pharma_company']}>
              <ManufactorSearchPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manufacturer/drugs"
          element={
            <ProtectedRoute allowedRoles={['pharma_company']}>
              <DrugManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manufacturer/proofs"
          element={
            <ProtectedRoute allowedRoles={['pharma_company']}>
              <ProofList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manufacturer/proofs/create"
          element={
            <ProtectedRoute allowedRoles={['pharma_company']}>
              <CreateProofOfProduction />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manufacturer/proofs/:id"
          element={
            <ProtectedRoute allowedRoles={['pharma_company']}>
              <ProofDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manufacturer/nfts"
          element={
            <ProtectedRoute allowedRoles={['pharma_company']}>
              <NFTManagement />
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
        <Route path="/pharmacy/invoices" element={<ProtectedRoute allowedRoles={['pharmacy']}><PharmacyInvoices /></ProtectedRoute>} />
        <Route path="/pharmacy/invoices/my" element={<ProtectedRoute allowedRoles={['pharmacy']}><PharmacyMyInvoices /></ProtectedRoute>} />
        <Route path="/pharmacy/invoices/:id" element={<ProtectedRoute allowedRoles={['pharmacy']}><PharmacyInvoiceDetail /></ProtectedRoute>} />
        <Route path="/pharmacy/proof-of-pharmacy" element={<ProtectedRoute allowedRoles={['pharmacy']}><PharmacyProofList /></ProtectedRoute>} />
        <Route path="/pharmacy/proof-of-pharmacy/stats" element={<ProtectedRoute allowedRoles={['pharmacy']}><PharmacyProofStats /></ProtectedRoute>} />
        <Route path="/pharmacy/proof-of-pharmacy/:id" element={<ProtectedRoute allowedRoles={['pharmacy']}><PharmacyProofDetail /></ProtectedRoute>} />
        <Route path="/pharmacy/proof-of-pharmacy/:id/confirm" element={<ProtectedRoute allowedRoles={['pharmacy']}><PharmacyProofConfirm /></ProtectedRoute>} />
        <Route path="/pharmacy/proof-of-pharmacy/my" element={<ProtectedRoute allowedRoles={['pharmacy']}><PharmacyMyReceipts /></ProtectedRoute>} />
        <Route path="/pharmacy/drugs" element={<ProtectedRoute allowedRoles={['pharmacy']}><PharmacyDrugs /></ProtectedRoute>} />
        <Route path="/pharmacy/drugs/:id" element={<ProtectedRoute allowedRoles={['pharmacy']}><PharmacyDrugDetail /></ProtectedRoute>} />
        <Route path="/pharmacy/nft-tracking" element={<ProtectedRoute allowedRoles={['pharmacy']}><PharmacyNftTracking /></ProtectedRoute>} />
        <Route
          path="/user"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/metamask" element={<MetaMaskConnect />} />
        <Route path="/" element={<UserHome />} />
      </Routes>
    </>
  );
}

export default App;

