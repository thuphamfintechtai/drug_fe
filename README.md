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
- ✅ Đăng nhập
- ✅ Đăng ký user thông thường
- ✅ Đăng ký doanh nghiệp (Nhà sản xuất, Nhà phân phối, Nhà thuốc)
- ✅ Protected routes với role-based access

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

Mặc định API base URL được đặt trong `src/utils/api.js`:
```javascript
baseURL: 'http://localhost:5000/api'
```

Để thay đổi, sửa file `src/utils/api.js` hoặc sử dụng biến môi trường.

## Authentication Flow

1. User đăng nhập qua `/login`
2. Token được lưu trong `localStorage`
3. Token được tự động thêm vào mỗi API request qua axios interceptor
4. Protected routes kiểm tra authentication và role
5. Khi token hết hạn hoặc không hợp lệ, user được redirect về `/login`

## Lưu ý

- Tài khoản doanh nghiệp (pharma_company, distributor, pharmacy) sau khi đăng ký sẽ ở trạng thái `pending` và cần admin duyệt
- Token được lưu trong `localStorage`, xóa khi logout hoặc hết hạn
- Protected routes tự động kiểm tra role và hiển thị thông báo nếu không có quyền truy cập