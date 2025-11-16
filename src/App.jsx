import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./features/shared/context/AuthContext";
import { ThemeProvider } from "./features/shared/context/ThemeContext";
import {
  Register,
  RegisterBusiness,
  ForgotPasswordBusiness,
  Login,
} from "./features/auth/pages";
import PublicNFTTracking from "../src_broken/pages/public/NFTTracking";
import PublicDrugInfo from "../src_broken/pages/public/DrugInfo";
import AdminDashboard from "../src_broken/pages/admin/Dashboard";
import AdminRegistrations from "../src_broken/pages/admin/Registrations";
import AdminRegistrationDetail from "../src_broken/pages/admin/RegistrationDetail";
import AdminDrugs from "../src_broken/pages/admin/Drugs";
import AdminDrugForm from "../src_broken/pages/admin/DrugForm";
import AdminSupplyChainHistory from "../src_broken/pages/admin/SupplyChainHistory";
import AdminDistributionHistory from "../src_broken/pages/admin/DistributionHistory";
import AdminNftTracking from "../src_broken/pages/admin/NftTracking";
import AdminPasswordResetRequests from "../src_broken/pages/admin/PasswordResetRequests";
import ManufacturerDashboard from "../src_broken/pages/manufacturer/Dashboard";
import ManufacturerDrugManagement from "../src_broken/pages/manufacturer/DrugManagement";
import ManufacturerProductionManagement from "../src_broken/pages/manufacturer/ProductionManagement";
import ManufacturerTransferManagement from "../src_broken/pages/manufacturer/TransferManagement";
import ManufacturerProductionHistory from "../src_broken/pages/manufacturer/ProductionHistory";
import ManufacturerTransferHistory from "../src_broken/pages/manufacturer/TransferHistory";
import ManufacturerProfile from "../src_broken/pages/manufacturer/Profile";
import ManufacturerIPFSStatus from "../src_broken/pages/manufacturer/IPFSStatus";
import DistributorDashboard from "../src_broken/pages/distributor/Dashboard";
import DistributorInvoices from "../src_broken/pages/distributor/InvoicesFromManufacturer";
import DistributorTransferPharmacy from "../src_broken/pages/distributor/TransferToPharmacy";
import DistributorDistributionHistory from "../src_broken/pages/distributor/DistributionHistory";
import DistributorTransferHistory from "../src_broken/pages/distributor/TransferHistory";
import DistributorDrugs from "../src_broken/pages/distributor/Drugs";
import DistributorNFTTracking from "../src_broken/pages/distributor/NFTTracking";
import DistributorProfile from "../src_broken/pages/distributor/Profile";
import PharmacyDashboard from "../src_broken/pages/pharmacy/Dashboard";
import PharmacyInvoices from "../src_broken/pages/pharmacy/InvoicesFromDistributor";
import PharmacyDistributionHistory from "../src_broken/pages/pharmacy/DistributionHistory";
import PharmacyDrugs from "../src_broken/pages/pharmacy/Drugs";
import PharmacyNftTracking from "../src_broken/pages/pharmacy/NftTracking";
import PharmacyProfile from "../src_broken/pages/pharmacy/Profile";
import UserHome from "../src_broken/pages/public/UserHome";
import MetaMaskConnect from "../src_broken/pages/MetaMaskConnect";
import ProtectedRoute from "./features/auth/components/ProtectedRoute";
import Navbar from "../src_broken/components/Navbar";
import VerifyPage from "../src_broken/pages/public/VerifyPage";
import { useAuthStore } from "./features/auth/store";
import { useEffect } from "react";

function App() {
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

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

function AppContent() {
  const location = useLocation();
  const dashboardPrefixes = [
    "/admin",
    "/manufacturer",
    "/distributor",
    "/pharmacy",
    "/dashboard",
  ];
  const showNavbar = !dashboardPrefixes.some((prefix) =>
    location.pathname.startsWith(prefix)
  );

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-business" element={<RegisterBusiness />} />
        <Route
          path="/forgot-password-business"
          element={<ForgotPasswordBusiness />}
        />
        {/* Role-based routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["system_admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/registrations"
          element={
            <ProtectedRoute allowedRoles={["system_admin"]}>
              <AdminRegistrations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/registrations/:id"
          element={
            <ProtectedRoute allowedRoles={["system_admin"]}>
              <AdminRegistrationDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/drugs"
          element={
            <ProtectedRoute allowedRoles={["system_admin"]}>
              <AdminDrugs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/drugs/new"
          element={
            <ProtectedRoute allowedRoles={["system_admin"]}>
              <AdminDrugForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/drugs/:id"
          element={
            <ProtectedRoute allowedRoles={["system_admin"]}>
              <AdminDrugForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/supply-chain"
          element={
            <ProtectedRoute allowedRoles={["system_admin"]}>
              <AdminSupplyChainHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/distribution"
          element={
            <ProtectedRoute allowedRoles={["system_admin"]}>
              <AdminDistributionHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/nft-tracking"
          element={
            <ProtectedRoute allowedRoles={["system_admin"]}>
              <AdminNftTracking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/password-reset-requests"
          element={
            <ProtectedRoute allowedRoles={["system_admin"]}>
              <AdminPasswordResetRequests />
            </ProtectedRoute>
          }
        />
        {/* Manufacturer (Pharma Company) Routes */}
        <Route
          path="/manufacturer"
          element={
            <ProtectedRoute allowedRoles={["pharma_company"]}>
              <ManufacturerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manufacturer/drugs"
          element={
            <ProtectedRoute allowedRoles={["pharma_company"]}>
              <ManufacturerDrugManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manufacturer/production"
          element={
            <ProtectedRoute allowedRoles={["pharma_company"]}>
              <ManufacturerProductionManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manufacturer/transfer"
          element={
            <ProtectedRoute allowedRoles={["pharma_company"]}>
              <ManufacturerTransferManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manufacturer/production-history"
          element={
            <ProtectedRoute allowedRoles={["pharma_company"]}>
              <ManufacturerProductionHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manufacturer/transfer-history"
          element={
            <ProtectedRoute allowedRoles={["pharma_company"]}>
              <ManufacturerTransferHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manufacturer/ipfs-status"
          element={
            <ProtectedRoute allowedRoles={["pharma_company"]}>
              <ManufacturerIPFSStatus />
            </ProtectedRoute>
          }
        />
        {/* Trang distribution-confirmation đã được loại bỏ */}
        <Route
          path="/manufacturer/profile"
          element={
            <ProtectedRoute allowedRoles={["pharma_company"]}>
              <ManufacturerProfile />
            </ProtectedRoute>
          }
        />
        {/* Distributor Routes */}
        <Route
          path="/distributor"
          element={
            <ProtectedRoute allowedRoles={["distributor"]}>
              <DistributorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/distributor/invoices"
          element={
            <ProtectedRoute allowedRoles={["distributor"]}>
              <DistributorInvoices />
            </ProtectedRoute>
          }
        />
        <Route
          path="/distributor/transfer-pharmacy"
          element={
            <ProtectedRoute allowedRoles={["distributor"]}>
              <DistributorTransferPharmacy />
            </ProtectedRoute>
          }
        />
        <Route
          path="/distributor/distribution-history"
          element={
            <ProtectedRoute allowedRoles={["distributor"]}>
              <DistributorDistributionHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/distributor/transfer-history"
          element={
            <ProtectedRoute allowedRoles={["distributor"]}>
              <DistributorTransferHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/distributor/drugs"
          element={
            <ProtectedRoute allowedRoles={["distributor"]}>
              <DistributorDrugs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/distributor/nft-tracking"
          element={
            <ProtectedRoute allowedRoles={["distributor"]}>
              <DistributorNFTTracking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/distributor/profile"
          element={
            <ProtectedRoute allowedRoles={["distributor"]}>
              <DistributorProfile />
            </ProtectedRoute>
          }
        />

        {/* Pharmacy Routes */}
        <Route
          path="/pharmacy"
          element={
            <ProtectedRoute allowedRoles={["pharmacy"]}>
              <PharmacyDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pharmacy/invoices"
          element={
            <ProtectedRoute allowedRoles={["pharmacy"]}>
              <PharmacyInvoices />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pharmacy/distribution-history"
          element={
            <ProtectedRoute allowedRoles={["pharmacy"]}>
              <PharmacyDistributionHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pharmacy/drugs"
          element={
            <ProtectedRoute allowedRoles={["pharmacy"]}>
              <PharmacyDrugs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pharmacy/nft-tracking"
          element={
            <ProtectedRoute allowedRoles={["pharmacy"]}>
              <PharmacyNftTracking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pharmacy/profile"
          element={
            <ProtectedRoute allowedRoles={["pharmacy"]}>
              <PharmacyProfile />
            </ProtectedRoute>
          }
        />

        {/* Public Routes */}
        <Route path="/track/:tokenId" element={<PublicNFTTracking />} />
        <Route path="/track" element={<PublicNFTTracking />} />
        <Route path="/drug-info" element={<PublicDrugInfo />} />
        <Route path="/metamask" element={<MetaMaskConnect />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/" element={<UserHome />} />
      </Routes>
    </>
  );
}

export default App;
