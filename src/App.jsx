import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { AuthProvider } from "./features/shared/context/AuthContext";
import { ThemeProvider } from "./features/shared/context/ThemeContext";
import ProtectedRoute from "./features/auth/components/ProtectedRoute";
import Navbar from "./features/shared/components/Navbar";
import { useAuthStore } from "./features/auth/store";

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

// Lazy load Auth pages
const Login = lazy(() => import("./features/auth/pages").then(m => ({ default: m.Login })));
const Register = lazy(() => import("./features/auth/pages").then(m => ({ default: m.Register })));
const RegisterBusiness = lazy(() => import("./features/auth/pages").then(m => ({ default: m.RegisterBusiness })));
const ForgotPasswordBusiness = lazy(() => import("./features/auth/pages").then(m => ({ default: m.ForgotPasswordBusiness })));

// Lazy load Admin pages
const AdminDashboard = lazy(() => import("./features/admin/pages").then(m => ({ default: m.AdminDashboard })));
const AdminRegistrations = lazy(() => import("./features/admin/pages").then(m => ({ default: m.AdminRegistrations })));
const AdminRegistrationDetail = lazy(() => import("./features/admin/pages").then(m => ({ default: m.AdminRegistrationDetail })));
const AdminDrugs = lazy(() => import("./features/admin/pages").then(m => ({ default: m.AdminDrugs })));
const AdminDrugForm = lazy(() => import("./features/admin/pages").then(m => ({ default: m.AdminDrugForm })));
const AdminSupplyChainHistory = lazy(() => import("./features/admin/pages").then(m => ({ default: m.AdminSupplyChainHistory })));
const AdminDistributionHistory = lazy(() => import("./features/admin/pages").then(m => ({ default: m.AdminDistributionHistory })));
const AdminNftTracking = lazy(() => import("./features/admin/pages").then(m => ({ default: m.AdminNftTracking })));
const AdminPasswordResetRequests = lazy(() => import("./features/admin/pages").then(m => ({ default: m.AdminPasswordResetRequests })));

// Lazy load Manufacturer pages
const ManufacturerDashboard = lazy(() => import("./features/manufacturer/pages").then(m => ({ default: m.ManufacturerDashboard })));
const ManufacturerDrugManagement = lazy(() => import("./features/manufacturer/pages").then(m => ({ default: m.ManufacturerDrugManagement })));
const ManufacturerProductionManagement = lazy(() => import("./features/manufacturer/pages").then(m => ({ default: m.ManufacturerProductionManagement })));
const ManufacturerTransferManagement = lazy(() => import("./features/manufacturer/pages").then(m => ({ default: m.ManufacturerTransferManagement })));
const ManufacturerProductionHistory = lazy(() => import("./features/manufacturer/pages").then(m => ({ default: m.ManufacturerProductionHistory })));
const ManufacturerTransferHistory = lazy(() => import("./features/manufacturer/pages").then(m => ({ default: m.ManufacturerTransferHistory })));
const ManufacturerProfile = lazy(() => import("./features/manufacturer/pages").then(m => ({ default: m.ManufacturerProfile })));
const ManufacturerIPFSStatus = lazy(() => import("./features/manufacturer/pages").then(m => ({ default: m.ManufacturerIPFSStatus })));

// Lazy load Distributor pages
const DistributorDashboard = lazy(() => import("./features/distributor/pages").then(m => ({ default: m.DistributorDashboard })));
const DistributorInvoices = lazy(() => import("./features/distributor/pages").then(m => ({ default: m.DistributorInvoices })));
const DistributorTransferPharmacy = lazy(() => import("./features/distributor/pages").then(m => ({ default: m.DistributorTransferPharmacy })));
const DistributorDistributionHistory = lazy(() => import("./features/distributor/pages").then(m => ({ default: m.DistributorDistributionHistory })));
const DistributorTransferHistory = lazy(() => import("./features/distributor/pages").then(m => ({ default: m.DistributorTransferHistory })));
const DistributorDrugs = lazy(() => import("./features/distributor/pages").then(m => ({ default: m.DistributorDrugs })));
const DistributorNFTTracking = lazy(() => import("./features/distributor/pages").then(m => ({ default: m.DistributorNFTTracking })));
const DistributorProfile = lazy(() => import("./features/distributor/pages").then(m => ({ default: m.DistributorProfile })));
const DistributorCreateProofToPharmacy = lazy(() => import("./features/distributor/pages").then(m => ({ default: m.DistributorCreateProofToPharmacy })));
const DistributorDeliveriesToPharmacy = lazy(() => import("./features/distributor/pages").then(m => ({ default: m.DistributorDeliveriesToPharmacy })));
const DistributorDeliveryDetail = lazy(() => import("./features/distributor/pages").then(m => ({ default: m.DistributorDeliveryDetail })));
const DistributorDistributions = lazy(() => import("./features/distributor/pages").then(m => ({ default: m.DistributorDistributions })));
const DistributorDistributionDetail = lazy(() => import("./features/distributor/pages").then(m => ({ default: m.DistributorDistributionDetail })));
const DistributorContracts = lazy(() => import("./features/distributor/pages").then(m => ({ default: m.DistributorContracts })));
const DistributorCreateContract = lazy(() => import("./features/distributor/pages").then(m => ({ default: m.DistributorCreateContract })));
const DistributorFinalizeContract = lazy(() => import("./features/distributor/pages").then(m => ({ default: m.DistributorFinalizeContract })));

// Lazy load Pharmacy pages
const PharmacyDashboard = lazy(() => import("./features/pharmacy/pages").then(m => ({ default: m.PharmacyDashboard })));
const PharmacyInvoices = lazy(() => import("./features/pharmacy/pages").then(m => ({ default: m.PharmacyInvoices })));
const PharmacyDistributionHistory = lazy(() => import("./features/pharmacy/pages").then(m => ({ default: m.PharmacyDistributionHistory })));
const PharmacyDrugs = lazy(() => import("./features/pharmacy/pages").then(m => ({ default: m.PharmacyDrugs })));
const PharmacyNFTTracking = lazy(() => import("./features/pharmacy/pages").then(m => ({ default: m.PharmacyNFTTracking })));
const PharmacyProfile = lazy(() => import("./features/pharmacy/pages").then(m => ({ default: m.PharmacyProfile })));
const PharmacyContracts = lazy(() => import("./features/pharmacy/pages").then(m => ({ default: m.PharmacyContracts })));
const PharmacyConfirmContract = lazy(() => import("./features/pharmacy/pages").then(m => ({ default: m.PharmacyConfirmContract })));

// Lazy load Shared pages
const UserHome = lazy(() => import("./features/shared/page/index").then(m => ({ default: m.UserHome })));
const MetaMaskConnect = lazy(() => import("./features/shared/page/index").then(m => ({ default: m.MetaMaskConnect })));
const VerifyPage = lazy(() => import("./features/shared/page/index").then(m => ({ default: m.VerifyPage })));
const NFTTracking = lazy(() => import("./features/shared/page/index").then(m => ({ default: m.NFTTracking })));
const DrugInfo = lazy(() => import("./features/shared/page/index").then(m => ({ default: m.DrugInfo })));

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
      <Suspense fallback={<PageLoader />}>
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
          path="/distributor/distributions"
          element={
            <ProtectedRoute allowedRoles={["distributor"]}>
              <DistributorDistributions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/distributor/distributions/:id"
          element={
            <ProtectedRoute allowedRoles={["distributor"]}>
              <DistributorDistributionDetail />
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
        <Route
          path="/distributor/create-proof"
          element={
            <ProtectedRoute allowedRoles={["distributor"]}>
              <DistributorCreateProofToPharmacy />
            </ProtectedRoute>
          }
        />
        <Route
          path="/distributor/deliveries"
          element={
            <ProtectedRoute allowedRoles={["distributor"]}>
              <DistributorDeliveriesToPharmacy />
            </ProtectedRoute>
          }
        />
        <Route
          path="/distributor/deliveries/:id"
          element={
            <ProtectedRoute allowedRoles={["distributor"]}>
              <DistributorDeliveryDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/distributor/contracts"
          element={
            <ProtectedRoute allowedRoles={["distributor"]}>
              <DistributorContracts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/distributor/contracts/create"
          element={
            <ProtectedRoute allowedRoles={["distributor"]}>
              <DistributorCreateContract />
            </ProtectedRoute>
          }
        />
        {/* Chi tiết hợp đồng: dùng cùng component với trang finalize để hiển thị thông tin */}
        <Route
          path="/distributor/contracts/:contractId"
          element={
            <ProtectedRoute allowedRoles={["distributor"]}>
              <DistributorFinalizeContract />
            </ProtectedRoute>
          }
        />
        <Route
          path="/distributor/contracts/:contractId/finalize"
          element={
            <ProtectedRoute allowedRoles={["distributor"]}>
              <DistributorFinalizeContract />
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
        <Route
          path="/pharmacy/contracts"
          element={
            <ProtectedRoute allowedRoles={["pharmacy"]}>
              <PharmacyContracts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pharmacy/contracts/:contractId/confirm"
          element={
            <ProtectedRoute allowedRoles={["pharmacy"]}>
              <PharmacyConfirmContract />
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
      </Suspense>
    </>
  );
}

export default App;
