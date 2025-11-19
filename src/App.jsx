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
import {
  AdminDashboard,
  AdminRegistrations,
  AdminRegistrationDetail,
  AdminDrugs,
  AdminDrugForm,
  AdminSupplyChainHistory,
  AdminDistributionHistory,
  AdminNftTracking,
  AdminPasswordResetRequests,
} from "./features/admin/pages";
import {
  ManufacturerDashboard,
  ManufacturerDrugManagement,
  ManufacturerProductionManagement,
  ManufacturerTransferManagement,
  ManufacturerProductionHistory,
  ManufacturerTransferHistory,
  ManufacturerProfile,
  ManufacturerIPFSStatus,
} from "./features/manufacturer/pages";
import {
  DistributorDashboard,
  DistributorInvoices,
  DistributorTransferPharmacy,
  DistributorDistributionHistory,
  DistributorTransferHistory,
  DistributorDrugs,
  DistributorNFTTracking,
  DistributorProfile,
} from "./features/distributor/pages";
import {
  PharmacyDashboard,
  PharmacyInvoices,
  PharmacyDistributionHistory,
  PharmacyDrugs,
  PharmacyNFTTracking,
  PharmacyProfile,
} from "./features/pharmacy/pages";
import {
  UserHome,
  MetaMaskConnect,
  VerifyPage,
  NFTTracking,
  DrugInfo,
} from "./features/shared/page/index";
import ProtectedRoute from "./features/auth/components/ProtectedRoute";
import Navbar from "./features/shared/components/Navbar";
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
              <PharmacyNFTTracking />
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
        <Route path="/track/:tokenId" element={<NFTTracking />} />
        <Route path="/track" element={<NFTTracking />} />
        <Route path="/drug-info" element={<DrugInfo />} />
        <Route path="/metamask" element={<MetaMaskConnect />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/" element={<UserHome />} />
      </Routes>
    </>
  );
}

export default App;
