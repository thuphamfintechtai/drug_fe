# Hướng dẫn sửa lỗi Vercel Deployment

## Vấn đề
```
Error: Git author phamthianhthu@MacBook-Air-cua-pham.local must have access to the team ZuZu's projects on Vercel to create deployments.
```

## Giải pháp

### Bước 1: Đảm bảo VERCEL_TOKEN được tạo từ account owner

1. **Đăng nhập vào Vercel với account owner của team "ZuZu's projects"**
   - Mở https://vercel.com
   - Đăng nhập với tài khoản là owner của team

2. **Tạo Token mới:**
   - Vào Settings → Tokens (https://vercel.com/account/tokens)
   - Click "Create Token"
   - Đặt tên: `github-actions-deploy`
   - Chọn scope: **Full Account** (hoặc ít nhất phải có quyền deploy)
   - Copy token

3. **Cập nhật GitHub Secret:**
   - Vào GitHub repo → Settings → Secrets and variables → Actions
   - Tìm secret `VERCEL_TOKEN`
   - Cập nhật với token vừa tạo
   - Nếu chưa có, tạo secret mới với tên `VERCEL_TOKEN`

### Bước 2: (Tùy chọn) Thêm GitHub Secrets cho Git User

Nếu bạn muốn set email/name cụ thể:

1. **Vào GitHub repo → Settings → Secrets and variables → Actions**
2. **Thêm secrets (nếu cần):**
   - `GIT_USER_NAME`: Tên của bạn (ví dụ: "phamthianhthu")
   - `GIT_USER_EMAIL`: Email GitHub của bạn (email được liên kết với Vercel account)

### Bước 3: Kiểm tra VERCEL_ORG_ID và VERCEL_PROJECT_ID

1. **Lấy VERCEL_ORG_ID:**
   - Vào Vercel Dashboard → Team Settings
   - Team ID sẽ hiển thị trong URL hoặc Settings → General
   - Hoặc chạy: `vercel teams ls` (nếu có Vercel CLI)

2. **Lấy VERCEL_PROJECT_ID:**
   - Vào project trong Vercel Dashboard
   - Settings → General
   - Project ID sẽ hiển thị ở đó

3. **Cập nhật GitHub Secrets:**
   - `VERCEL_ORG_ID`: ID của team "ZuZu's projects"
   - `VERCEL_PROJECT_ID`: ID của project

### Bước 4: Đảm bảo GitHub Account được liên kết với Vercel

1. **Vào Vercel Dashboard → Settings → Git**
2. **Đảm bảo GitHub account của bạn đã được kết nối**
3. **Nếu chưa, kết nối GitHub account**

### Bước 5: Kiểm tra Team Membership

1. **Vào Vercel Dashboard → Team Settings → Members**
2. **Đảm bảo GitHub account của bạn là member của team**
3. **Nếu không, thêm bạn vào team với quyền Member hoặc Owner**

## Lưu ý quan trọng

- **VERCEL_TOKEN phải được tạo từ account owner của team** - Đây là điều quan trọng nhất
- Nếu team "ZuZu's projects" được tạo bởi account khác, bạn cần:
  - Hoặc dùng token từ account đó
  - Hoặc transfer ownership của team về account của bạn
  - Hoặc thêm account của bạn vào team với quyền Owner

## Test deployment

Sau khi cập nhật tất cả secrets:

1. Push code lên main branch (sẽ trigger deployment tự động)
2. Hoặc vào GitHub Actions → Run workflow → Deploy to Vercel

## Nếu vẫn lỗi

Nếu vẫn gặp lỗi sau khi làm các bước trên:

1. **Kiểm tra lại VERCEL_TOKEN:**
   - Token phải từ account owner của team
   - Token phải có quyền deploy

2. **Kiểm tra team ownership:**
   - Đảm bảo bạn là owner của team "ZuZu's projects"
   - Hoặc bạn có quyền deploy trong team

3. **Thử cách khác:**
   - Sử dụng Vercel GitHub Integration (kết nối trực tiếp repo với Vercel)
   - Hoặc deploy manual từ Vercel Dashboard

