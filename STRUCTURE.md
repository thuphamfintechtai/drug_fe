# Cấu Trúc Dự Án Drug Supply Chain Frontend

## Tổng Quan

Đây là ứng dụng frontend cho hệ thống quản lý chuỗi cung ứng dược phẩm sử dụng công nghệ Blockchain (Ethereum) và IPFS. Ứng dụng được xây dựng với **React 18**, **Vite**, **TailwindCSS**, và tích hợp **Web3/Ethereum** để theo dõi NFT của thuốc.

### Công Nghệ Chính
- **Framework**: React 18.3.1 với Vite
- **Routing**: React Router DOM v7
- **State Management**: Zustand + React Query (TanStack Query)
- **UI Libraries**: Ant Design 5.27, TailwindCSS 4
- **Blockchain**: Ethers.js v6
- **Notifications**: Sonner
- **Charts**: Recharts
- **Animations**: Framer Motion, GSAP

---

## Cấu Trúc Thư Mục Chính

```
src/
├── assets/                  # Hình ảnh, icons tĩnh
├── features/               # Các module chức năng chính (Feature-based architecture)
│   ├── admin/             # Module quản trị hệ thống
│   ├── auth/              # Module xác thực và phân quyền
│   ├── distributor/       # Module nhà phân phối
│   ├── manufacturer/      # Module nhà sản xuất (pharma company)
│   ├── pharmacy/          # Module nhà thuốc
│   └── shared/            # Components, utilities dùng chung
├── utils/                 # Utilities tổng quát
├── shims/                 # Polyfills/shims
├── App.jsx               # Root component với routing
├── main.jsx              # Entry point
└── index.css             # Global styles
```

---

## Chi Tiết Các Module Features

### 1. Admin Module (`features/admin/`)
**Vai trò**: Quản trị viên hệ thống (`system_admin`)

#### Cấu trúc:
```
admin/
├── apis/
│   ├── mutations/        # Mutations (Create, Update, Delete)
│   └── queries/          # Queries (Read/Fetch data)
├── components/
│   └── SupplyChainJourney.jsx
├── constants/
│   ├── color.js
│   ├── navigationItems.jsx (×3)
│   └── supplyChainHistory.js
├── hooks/               # Custom hooks cho business logic
│   ├── useAdminDrugs.js
│   ├── useDashboard.js
│   ├── useDistributionHistory.js
│   ├── useNFT-Tracking.js
│   ├── usePasswordResetRequest.js
│   ├── useRegistrations.js
│   └── useSupplyChainHistory.js
└── pages/              # Các trang của admin
    ├── Dashboard.jsx
    ├── Drugs.jsx
    ├── DrugForm.jsx
    ├── Registrations.jsx
    ├── RegistrationDetail.jsx
    ├── SupplyChainHistory.jsx
    ├── DistributionHistory.jsx
    ├── NftTracking.jsx
    └── PasswordResetRequests.jsx
```

#### Chức năng chính:
- Quản lý đăng ký doanh nghiệp (approve/reject)
- Quản lý danh mục thuốc trong hệ thống
- Xem toàn bộ lịch sử chuỗi cung ứng
- Theo dõi NFT của các lô thuốc
- Xử lý yêu cầu reset mật khẩu
- Dashboard tổng quan hệ thống

---

### 2. Auth Module (`features/auth/`)
**Vai trò**: Xác thực, phân quyền, đăng nhập/đăng ký

#### Cấu trúc:
```
auth/
├── api/
│   ├── index.js
│   ├── mutations.js
│   └── queries.js
├── components/
│   ├── error.jsx
│   └── ProtectedRoute.jsx    # HOC bảo vệ routes theo role
├── constants/
│   ├── businessTypes.jsx     # Loại hình doanh nghiệp
│   └── roles.jsx            # Định nghĩa các roles
├── hooks/
│   ├── useAuth.js
│   ├── useLogin.js
│   ├── useRegister.js
│   ├── useRegisterBusiness.js
│   └── useForgotPassword.js
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── RegisterBusiness.jsx
│   └── ForgotPasswordBusiness.jsx
├── store/
│   └── useAuthStore.js      # Zustand store cho auth state
└── utils/
    ├── cookieUtils.js       # Quản lý cookies
    └── isValidObjectId.js
```

#### Chức năng chính:
- Đăng nhập/Đăng ký người dùng
- Đăng ký doanh nghiệp (manufacturer, distributor, pharmacy)
- Quên mật khẩu
- Protected routes theo roles (system_admin, pharma_company, distributor, pharmacy)
- Quản lý session với cookies

---

### 3. Manufacturer Module (`features/manufacturer/`)
**Vai trò**: Nhà sản xuất dược phẩm (`pharma_company`)

#### Cấu trúc:
```
manufacturer/
├── apis/
│   ├── drugAPIs.js
│   ├── manufacturerAPIs.js
│   ├── nftAPIs.js
│   └── proofAPIs.js
├── components/
│   └── manufacturerNavigation.jsx
├── constants/
│   ├── color.js
│   ├── navigationDashBoard.jsx
│   ├── navigationDrug.jsx
│   ├── navigationIPF.jsx
│   ├── navigationManufactorProductionList.jsx
│   ├── navigationProductionHistory.jsx
│   ├── navigationProductionManagement.jsx
│   ├── navigationTransferHistory.jsx
│   └── validateForm.js
├── hooks/ (21 files)
│   ├── useCreateProofOfProduction.js
│   ├── useDashboard.js
│   ├── useDrugManagement.js
│   ├── useIPFStatus.js
│   ├── useNFTManagement.js
│   ├── useProductionManagement.js
│   ├── useProductionHistory.js
│   ├── useTransferManagements.js
│   ├── useTransferhistory.js
│   └── ... (và nhiều hooks khác)
└── pages/ (20 files)
    ├── Dashboard.jsx
    ├── DrugManagement.jsx
    ├── ProductionManagement.jsx
    ├── ProductionHistory.jsx
    ├── TransferManagement.jsx
    ├── TransferHistory.jsx
    ├── IPFSStatus.jsx
    ├── NFTManagement.jsx
    ├── CreateProofOfProduction.jsx
    └── ... (và nhiều pages khác)
```

#### Chức năng chính:
- Quản lý danh sách thuốc sản xuất
- Quản lý sản xuất (tạo lô sản xuất, proof of production)
- Tạo NFT cho lô thuốc trên blockchain
- Chuyển giao thuốc cho distributor
- Xem lịch sử sản xuất và chuyển giao
- Kiểm tra trạng thái IPFS
- Dashboard thống kê sản xuất

---

### 4. Distributor Module (`features/distributor/`)
**Vai trò**: Nhà phân phối (`distributor`)

#### Cấu trúc:
```
distributor/
├── apis/
│   └── distributor.js
├── components/
│   ├── BlockchainTransferView.jsx
│   ├── columns.jsx
│   ├── columnsInvoice.jsx
│   ├── distributorNavigation.jsx
│   └── invoice.jsx
├── constants/
│   ├── color.js
│   ├── navigationItems.jsx
│   ├── navigationItemsInvoices.jsx
│   ├── navigationItemsNFT.jsx
│   ├── navigationTransferHistory.jsx
│   └── navigationTransferToPharmacy.jsx
├── hooks/ (nhiều hooks)
│   ├── useDashboard.js
│   ├── useDrugs.js
│   ├── useDistributions.jsx
│   ├── useDistributionHistory.js
│   ├── useInvoice.js
│   ├── useInvoiceCreate.js
│   ├── useInvoicesFromManufacturer.js
│   ├── useTransferToPharmacy.js
│   ├── useDeliveriesToPharmacy.js
│   ├── useCreateProofToPharmacy.js
│   └── useNFTTracking.js
└── pages/
    ├── Dashboard.jsx
    ├── Drugs.jsx
    ├── Distributions.jsx
    ├── DistributionDetail.jsx
    ├── DistributionHistory.jsx
    ├── Invoices.jsx
    ├── InvoicesFromManufacturer.jsx
    ├── InvoiceCreate.jsx
    ├── InvoiceDetail.jsx
    ├── TransferToPharmacy.jsx
    ├── TransferHistory.jsx
    ├── DeliveriesToPharmacy.jsx
    ├── DeliveryDetail.jsx
    ├── CreateProofToPharmacy.jsx
    ├── NFTTracking.jsx
    └── Profile.jsx
```

#### Chức năng chính:
- Nhận thuốc từ manufacturer
- Quản lý kho thuốc
- Tạo hóa đơn phân phối
- Chuyển thuốc đến pharmacy
- Tạo proof of delivery
- Xem lịch sử phân phối
- Theo dõi NFT/blockchain
- Dashboard thống kê

---

### 5. Pharmacy Module (`features/pharmacy/`)
**Vai trò**: Nhà thuốc (`pharmacy`)

#### Cấu trúc:
```
pharmacy/
├── apis/
│   ├── pharmacyMutations.js
│   └── pharmacyQueries.js
├── constants/
│   └── constant.jsx
├── hooks/ (5 files)
│   ├── useDashboard.js
│   ├── useDrugs.js
│   ├── useInvoices.js
│   ├── useDistributionHistory.js
│   └── useNFTTracking.js
└── pages/ (7 files)
    ├── Dashboard.jsx
    ├── Drugs.jsx
    ├── Invoices.jsx
    ├── DistributionHistory.jsx
    ├── NFTTracking.jsx
    ├── Profile.jsx
    └── index.jsx
```

#### Chức năng chính:
- Nhận thuốc từ distributor
- Quản lý tồn kho thuốc
- Xem hóa đơn nhập thuốc
- Xem lịch sử phân phối
- Theo dõi NFT/blockchain
- Dashboard thống kê

---

### 6. Shared Module (`features/shared/`)
**Vai trò**: Components, utilities dùng chung

#### Cấu trúc:
```
shared/
├── apis/
│   ├── mutations/        # 2 files
│   └── queries/          # 4 files
├── components/ (28 files)
│   ├── Badge.jsx
│   ├── Button.jsx
│   ├── Card.jsx
│   ├── DataTable.jsx
│   ├── DashboardLayout.jsx
│   ├── EmptyState.jsx
│   ├── ErrorMessage.jsx
│   ├── LoadingSpinner.jsx
│   ├── Modal.jsx
│   ├── Navbar.jsx
│   ├── Pagination.jsx
│   ├── SearchBar.jsx
│   ├── StatsCard.jsx
│   ├── BlockchainMintingView.jsx
│   ├── BlockchainTransferView.jsx
│   ├── NFTMintButton.jsx
│   ├── TruckAnimationButton.jsx
│   ├── TruckLoader.jsx
│   ├── TruckTransfer.jsx
│   ├── invoice/
│   │   └── invoice.jsx
│   └── ui/
│       ├── cardUI.jsx
│       ├── profile.jsx
│       └── search.jsx
├── context/
│   ├── AuthContext.jsx
│   └── ThemeContext.jsx
├── docs/ (2 files .md)
├── hooks/
│   ├── ReactQueryProvider.jsx
│   └── ... (3-4 files)
└── page/ (6 files)
    ├── UserHome.jsx
    ├── MetaMaskConnect.jsx
    ├── VerifyPage.jsx
    ├── NFTTracking.jsx
    ├── DrugInfo.jsx
    └── index.jsx
```

#### Chức năng chính:
- Reusable UI Components
- Layout components (DashboardLayout)
- Context providers (Auth, Theme)
- Public pages (trang chủ, tracking NFT công khai)
- Blockchain interaction components

---

## Luồng Xác Thực và Phân Quyền

### Roles trong hệ thống:
1. **system_admin** - Quản trị viên hệ thống
2. **pharma_company** - Nhà sản xuất dược phẩm
3. **distributor** - Nhà phân phối
4. **pharmacy** - Nhà thuốc

### Protected Routes:
- Sử dụng component `ProtectedRoute` để bảo vệ routes
- Kiểm tra role từ `useAuthStore` (Zustand)
- Redirect về `/login` nếu chưa đăng nhập hoặc không đủ quyền

### Auth Store (Zustand):
```javascript
// features/auth/store/useAuthStore.js
- user: thông tin user hiện tại
- isAuthenticated: trạng thái đăng nhập
- login(), logout(), initAuth()
```

---

## API và Data Fetching

### Kiến trúc API:
- **React Query (TanStack Query)**: Quản lý server state
- **Axios**: HTTP client
- **Separation**: Tách riêng `mutations` (POST/PUT/DELETE) và `queries` (GET)

### Cấu trúc API trong mỗi module:
```
apis/
├── mutations/      # Create, Update, Delete operations
│   └── *.js
└── queries/        # Read/Fetch operations
    └── *.js
```

### Custom Hooks Pattern:
Mỗi tính năng có custom hook riêng sử dụng React Query:
```javascript
// Example: useDistributions.jsx
export const useDistributions = () => {
  return useQuery({
    queryKey: ['distributions'],
    queryFn: fetchDistributions
  });
};
```

---

## UI/UX Architecture

### Styling:
- **TailwindCSS 4**: Utility-first CSS framework
- **Ant Design 5**: Component library chính
- **Framer Motion**: Animations
- **GSAP**: Advanced animations (truck animations)

### Layout Pattern:
```
DashboardLayout
├── Sidebar (navigation)
├── Header
└── Main Content Area
```

### Theme:
- Dark/Light mode support qua `ThemeContext`
- Color constants trong từng module (`constants/color.js`)

---

## Blockchain Integration

### Web3 Tools:
- **Ethers.js v6**: Tương tác với Ethereum
- **MetaMask**: Wallet connection

### Key Files:
```
src/utils/
├── web3Helper.js      # Web3 utilities
├── walletUtils.js     # Wallet connection/management
└── ipfsHelper.js      # IPFS interactions
```

### NFT Tracking:
- Mỗi lô thuốc được mint thành NFT
- Token ID để tracking qua chuỗi cung ứng
- Public route: `/track/:tokenId`

---

## Chuỗi Cung Ứng (Supply Chain Flow)

```
1. MANUFACTURER (Nhà sản xuất)
   ↓ Sản xuất thuốc
   ↓ Mint NFT trên blockchain
   ↓ Tạo Proof of Production
   ↓
2. TRANSFER to DISTRIBUTOR
   ↓ Transfer NFT ownership
   ↓ Tạo hóa đơn xuất kho
   ↓
3. DISTRIBUTOR (Nhà phân phối)
   ↓ Nhận thuốc + NFT
   ↓ Quản lý kho
   ↓ Tạo Proof of Delivery
   ↓
4. TRANSFER to PHARMACY
   ↓ Transfer NFT ownership
   ↓ Tạo hóa đơn xuất kho
   ↓
5. PHARMACY (Nhà thuốc)
   └─ Nhận thuốc + NFT
      └─ Bán cho khách hàng
```

### Tracking & Transparency:
- Mỗi bước được ghi trên blockchain
- IPFS lưu trữ documents/proofs
- Public tracking qua NFT Token ID

---

## Entry Points và Routing

### Entry Point:
```
main.jsx
  ↓
App.jsx (Root Component)
  ↓
<ThemeProvider>
  <AuthProvider>
    <Router>
      <Routes />
```

### Lazy Loading:
- Tất cả pages được lazy load
- `React.lazy()` + `Suspense`
- Giảm bundle size, tăng performance

### Route Structure:
```
Public Routes:
- / (Home)
- /login
- /register
- /register-business
- /forgot-password-business
- /track/:tokenId (NFT Tracking)
- /drug-info
- /verify
- /metamask

Protected Routes:
- /admin/*
- /manufacturer/*
- /distributor/*
- /pharmacy/*
```

---

## Utils và Helpers

### Global Utils (`src/utils/`):
```
utils/
├── api.js          # Axios instance, API config
├── helper.js       # General helpers
├── ipfsHelper.js   # IPFS upload/fetch
├── walletUtils.js  # MetaMask connection
└── web3Helper.js   # Smart contract interactions
```

### Module-specific Utils:
Mỗi feature module có thể có:
- `constants/`: Hằng số, configs
- `utils/`: Utilities riêng
- `hooks/`: Custom hooks

---

## Build và Development

### Scripts:
```bash
npm run dev          # Development server (Vite)
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
```

### Configuration Files:
- `vite.config.js` - Vite configuration
- `tailwind.config.js` - TailwindCSS config
- `postcss.config.js` - PostCSS config
- `eslint.config.js` - ESLint rules

---

## Patterns và Best Practices

### 1. Feature-Based Architecture:
- Mỗi module (admin, manufacturer, etc.) là self-contained
- Có đầy đủ apis, components, hooks, pages, constants

### 2. Custom Hooks Pattern:
- Business logic tách ra custom hooks
- Reusable và testable
- Prefix: `use*`

### 3. API Layer Separation:
- `mutations`: Write operations
- `queries`: Read operations
- Sử dụng React Query cho caching

### 4. Component Hierarchy:
```
Page Component (pages/)
  ↓ sử dụng
Custom Hook (hooks/)
  ↓ gọi
API Functions (apis/)
  ↓ call
Backend API
```

### 5. Shared Resources:
- Common components trong `features/shared/components`
- Common utilities trong `src/utils`
- Context providers trong `features/shared/context`

---

## Navigation Structure

### Mỗi module có navigation riêng:
```
constants/
├── navigationItems.jsx
├── navigationDashboard.jsx
├── navigationTransferHistory.jsx
└── ... (navigation configs cho từng trang)
```

### Navigation Component:
- Sidebar menu
- Breadcrumbs
- Role-based visibility

---

## Key Features Summary

### Manufacturer (Nhà Sản Xuất):
- Quản lý thuốc, sản xuất
- Mint NFT, tạo proofs
- Transfer đến distributor
- IPFS status monitoring

### Distributor (Nhà Phân Phối):
- Nhận từ manufacturer
- Quản lý distributions
- Tạo invoices
- Transfer đến pharmacy
- Blockchain transfers

### Pharmacy (Nhà Thuốc):
- Nhận từ distributor
- Quản lý tồn kho
- Tracking NFT
- Distribution history

### Admin (Quản Trị):
- Approve registrations
- Quản lý drugs catalog
- Monitor supply chain
- NFT tracking toàn hệ thống
- Password reset requests

---

## Đặc Điểm Nổi Bật

1. **Blockchain Integration**: NFT-based drug tracking
2. **IPFS Storage**: Decentralized document storage
3. **Role-Based Access Control**: 4 roles với permissions riêng
4. **Real-time Tracking**: Public NFT tracking
5. **Modern Stack**: React 18, Vite, TailwindCSS 4
6. **Performance**: Lazy loading, code splitting
7. **Type Safety**: PropTypes validation
8. **Developer Experience**: ESLint, hot reload, fast build (Vite)

---

## Tài Liệu Bổ Sung

Có thể tìm thêm docs trong:
```
src/features/shared/docs/
├── *.md (2 files)
```

---

**Version**: 0.0.1  
**Tech Stack**: React + Vite + TailwindCSS + Ethers.js + IPFS  
**Architecture**: Feature-based, Modular, Role-based Access Control
