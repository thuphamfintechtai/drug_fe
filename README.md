# Drug Traceability Frontend

Ứng dụng React với Vite và Tailwind CSS cho hệ thống truy xuất nguồn gốc thuốc.

## Cấu trúc dự án

```
src/
├── components/       # Các component tái sử dụng
│   └── ProtectedRoute.jsx  # Component bảo vệ routes theo role
├── context/          # React Context
│   └── AuthContext.jsx     # Context quản lý authentication
├── pages/            # Các trang chính
│   ├── Login.jsx            # Trang đăng nhập
│   ├── Register.jsx         # Trang đăng ký user
│   ├── RegisterBusiness.jsx # Trang đăng ký doanh nghiệp
│   └── Dashboard.jsx        # Dashboard theo role
├── services/         # API services
│   └── authService.js       # Service cho authentication
└── utils/            # Utilities
    └── api.js               # Axios instance và interceptors
```

## Cài đặt và chạy

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build cho production
npm run build
```

## Tính năng

### Authentication
-  Đăng nhập
-  Đăng ký user thông thường
-  Đăng ký doanh nghiệp (Nhà sản xuất, Nhà phân phối, Nhà thuốc)
-  Protected routes với role-based access

### Phân quyền
Hệ thống hỗ trợ các role sau:
- **system_admin**: Quản trị viên hệ thống
- **pharma_company**: Nhà sản xuất dược phẩm
- **distributor**: Nhà phân phối
- **pharmacy**: Nhà thuốc
- **user**: Người dùng thông thường

### Routes
- `/login` - Trang đăng nhập
- `/register` - Đăng ký user
- `/register-business` - Đăng ký doanh nghiệp
- `/admin` - Dashboard cho admin (chỉ system_admin)
- `/manufacturer` - Dashboard cho nhà sản xuất (chỉ pharma_company)
- `/distributor` - Dashboard cho nhà phân phối (chỉ distributor)
- `/pharmacy` - Dashboard cho nhà thuốc (chỉ pharmacy)
- `/user` - Dashboard cho user thông thường (chỉ user)
- `/dashboard` - Dashboard chung (yêu cầu đăng nhập)

## Cấu hình API

API base URL được cấu hình tự động dựa trên môi trường:

- **Development**: Sử dụng proxy `/api` (cấu hình trong `vite.config.js`)
- **Production**: Sử dụng `https://drug-be.vercel.app/api`

Để thay đổi URL production, tạo file `.env` với nội dung:
```bash
VITE_API_BASE_URL=https://your-api-url.com/api
```

## Authentication Flow

1. User đăng nhập qua `/login`
2. Token được lưu trong `localStorage`
3. Token được tự động thêm vào mỗi API request qua axios interceptor
4. Protected routes kiểm tra authentication và role
5. Khi token hết hạn hoặc không hợp lệ, user được redirect về `/login`

## MetaMask Integration

Ứng dụng yêu cầu kết nối MetaMask cho các tài khoản doanh nghiệp:

1. **Cài đặt MetaMask**: Người dùng cần cài đặt MetaMask extension
2. **Kết nối ví**: Nhấn nút "Kết nối MetaMask" trên trang đăng nhập
3. **Xác thực địa chỉ**: Địa chỉ ví phải khớp với địa chỉ đã đăng ký

### Xử lý lỗi MetaMask

Nếu gặp lỗi "User rejected the request":
- Người dùng đã từ chối kết nối MetaMask
- Cần nhấn lại nút "Kết nối MetaMask" và chấp nhận yêu cầu

## Lưu ý

- Tài khoản doanh nghiệp (pharma_company, distributor, pharmacy) sau khi đăng ký sẽ ở trạng thái `pending` và cần admin duyệt
- Token được lưu trong cookies với httpOnly flag để bảo mật
- Protected routes tự động kiểm tra role và hiển thị thông báo nếu không có quyền truy cập
- Tài khoản system_admin không yêu cầu MetaMask