# 🏭 Hướng dẫn sử dụng giao diện Manufacturer (Pharma Company)

## 📋 Tổng quan

Hệ thống giao diện manufacturer đã được xây dựng đầy đủ với các chức năng chính:

1. **Dashboard** - Tổng quan và quản lý
2. **Drug Management** - Quản lý thuốc
3. **Proof of Production** - Tạo chứng nhận sản xuất và mint NFT
4. **NFT Management** - Quản lý NFT
5. **Search Manufacturers** - Tìm kiếm nhà sản xuất khác

## 🎯 Các tính năng chính

### 1. Dashboard (`/manufacturer`)
- Hiển thị tổng quan: số lượng Proof, NFT, Thuốc
- Quick actions để truy cập nhanh các chức năng
- Hiển thị danh sách Proof gần đây
- Metrics có thể click để điều hướng

### 2. Quản lý Thuốc (`/manufacturer/drugs`)
- Xem danh sách thuốc của công ty
- Tạo thuốc mới
- Thông tin chi tiết: tên thương mại, hoạt chất, ATC code, dạng bào chế, hàm lượng, etc.

### 3. Tạo Proof of Production (`/manufacturer/proofs/create`)
**Luồng tạo Proof với NFT Minting (4 bước):**

#### Bước 1: Điền thông tin sản xuất
- Chọn thuốc
- Ngày sản xuất, ngày hết hạn
- Số lượng
- Kiểm định viên (tùy chọn)
- URL báo cáo QA (tùy chọn)

#### Bước 2: Xem trước Metadata NFT
- Backend tạo metadata NFT
- Hiển thị preview metadata
- Kết nối ví MetaMask (nếu chưa)

#### Bước 3: Mint NFT trên Blockchain
- Upload metadata lên IPFS
- Gọi smart contract MyNFT.mintNFT() qua MetaMask
- Xác nhận transaction
- Nhận tokenId và transactionHash

#### Bước 4: Lưu vào hệ thống
- Backend verify ownership trên blockchain
- Lưu thông tin Proof và NFT vào database
- Redirect về danh sách Proof

### 4. Danh sách Proof (`/manufacturer/proofs`)
- Xem tất cả Proof của manufacturer
- Thông tin: Mã lô, tên thuốc, số lượng, ngày sản xuất, ngày hết hạn
- Click để xem chi tiết
- Pagination

### 5. Chi tiết Proof (`/manufacturer/proofs/:id`)
- Thông tin đầy đủ về Proof
- Thông tin NFT liên quan
- Link đến transaction trên blockchain
- NFT metadata

### 6. Quản lý NFT (`/manufacturer/nfts`)
- Xem tất cả NFT đã mint
- Hiển thị dạng grid card
- Thông tin: Token ID, Batch Number, Drug, Quantity, Status
- Modal chi tiết khi click
- Link đến IPFS và blockchain explorer

### 7. Tìm kiếm Manufacturer (`/manufacturer/search`)
- Tìm kiếm nhà sản xuất khác theo tên
- Hiển thị thông tin: tên, email, quốc gia

## 🔧 Cấu trúc Code

### Services (`src/services/manufacturer/`)
```
drugService.js          - API calls cho thuốc
proofService.js         - API calls cho Proof of Production
nftService.js           - API calls cho NFT
manufacturerService.js  - API calls cho manufacturer
```

### Utilities (`src/utils/`)
```
web3Helper.js          - Tương tác với smart contract (mintNFT, verify ownership)
ipfsHelper.js          - Upload metadata lên IPFS
```

### Components (`src/pages/manufacturer/`)
```
Dashboard.jsx                  - Dashboard chính
DrugManagement.jsx            - Quản lý thuốc
CreateProofOfProduction.jsx   - Tạo Proof với NFT minting
ProofList.jsx                 - Danh sách Proof
ProofDetail.jsx               - Chi tiết Proof
NFTManagement.jsx             - Quản lý NFT
ManufactorSearchPage.jsx      - Tìm kiếm manufacturer
```

## 🚀 Cách sử dụng

### Yêu cầu
1. **MetaMask**: Cài đặt extension MetaMask
2. **Network**: Kết nối đúng blockchain network (Hardhat local hoặc testnet)
3. **Account**: Địa chỉ ví của manufacturer phải được đăng ký trong smart contract
4. **Pinata** (tùy chọn): API keys để upload lên IPFS thực

### Cấu hình Environment Variables
Tạo file `.env` trong thư mục `drug_fe`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_SECRET_KEY=your_pinata_secret_key
```

### Chạy ứng dụng
```bash
cd drug_fe
npm install
npm run dev
```

### Luồng sử dụng điển hình

1. **Đăng nhập** với tài khoản manufacturer (pharma_company role)

2. **Thêm thuốc** (nếu chưa có):
   - Vào `/manufacturer/drugs`
   - Click "Tạo thuốc mới"
   - Điền thông tin và lưu

3. **Tạo Proof of Production**:
   - Vào `/manufacturer/proofs/create`
   - Chọn thuốc và điền thông tin
   - Kết nối MetaMask
   - Xác nhận mint NFT
   - Chờ transaction confirm
   - Hệ thống tự động lưu

4. **Xem NFT đã tạo**:
   - Vào `/manufacturer/nfts`
   - Xem danh sách NFT
   - Click để xem chi tiết

## 🔐 Smart Contract Integration

### MyNFT Contract
- **Address**: Lấy từ `deployed_addresses.json`
- **Functions sử dụng**:
  - `mintNFT(tokenURIs)`: Mint NFT với metadata
  - `ownerOf(tokenId)`: Verify ownership
  - `tokenURI(tokenId)`: Lấy metadata URL
  - `getTrackingHistory(tokenId)`: Lấy lịch sử tracking

### Luồng xác thực
1. Frontend mint NFT qua MetaMask
2. Backend verify ownership bằng `getNFTOwner(tokenId)`
3. So sánh owner address với manufacturer wallet address
4. Chỉ lưu vào DB nếu verification thành công

## 📊 API Endpoints sử dụng

### Drugs
- `GET /api/drugs` - Lấy danh sách thuốc
- `POST /api/drugs` - Tạo thuốc mới
- `GET /api/drugs/:id` - Chi tiết thuốc

### Proof of Production
- `POST /api/proof-of-production/generate-metadata` - Tạo metadata NFT
- `POST /api/proof-of-production` - Tạo Proof (sau khi mint NFT)
- `GET /api/proof-of-production/manufacturer/my-proofs` - Lấy danh sách Proof
- `GET /api/proof-of-production/:id` - Chi tiết Proof

### NFT
- `GET /api/nft-tracking/my-nfts` - Lấy danh sách NFT
- `GET /api/nft-tracking/:id` - Chi tiết NFT
- `GET /api/nft-tracking/history/:tokenId` - Lịch sử tracking

### Manufacturers
- `GET /api/manufactors` - Lấy tất cả manufacturers
- `GET /api/manufactors/:name` - Tìm kiếm theo tên

## ⚠️ Lưu ý quan trọng

1. **MetaMask**: Luôn đảm bảo MetaMask đã kết nối và có đủ gas fee
2. **Network**: Phải kết nối đúng network với smart contract đã deploy
3. **Wallet Address**: Address trong MetaMask phải trùng với address đã đăng ký trong database
4. **Transaction Confirmation**: Đợi transaction được confirm trên blockchain trước khi backend verify
5. **IPFS**: Nếu không có Pinata keys, hệ thống sẽ tạo mock IPFS URL cho development

## 🐛 Troubleshooting

### Lỗi: "MetaMask is not installed"
- Cài đặt MetaMask extension
- Reload trang

### Lỗi: "Transaction was rejected by user"
- User đã reject transaction trong MetaMask
- Thử lại và approve transaction

### Lỗi: "NFT không thuộc về ví của nhà sản xuất"
- Đảm bảo đăng nhập đúng tài khoản manufacturer
- Wallet address trong MetaMask phải trùng với database

### Lỗi: "Không thể xác thực quyền sở hữu NFT"
- Kiểm tra smart contract đã deploy đúng chưa
- Kiểm tra network đã kết nối đúng chưa
- Đảm bảo tokenId tồn tại trên blockchain

## 📝 TODO / Improvements

- [ ] Thêm chức năng transfer NFT sang Distributor
- [ ] Thêm chức năng xem lịch sử tracking NFT
- [ ] Thêm notification khi transaction thành công
- [ ] Thêm loading state chi tiết hơn
- [ ] Thêm error handling và retry mechanism
- [ ] Thêm chức năng export danh sách Proof
- [ ] Thêm dashboard charts/statistics

## 🎨 UI/UX Features

- ✅ Modern gradient design
- ✅ Responsive layout
- ✅ Loading states
- ✅ Empty states
- ✅ Error handling
- ✅ Smooth transitions
- ✅ Hover effects
- ✅ Step wizard cho tạo Proof
- ✅ Modal dialogs
- ✅ Toast notifications (cần implement)

## 📞 Support

Nếu có vấn đề, vui lòng kiểm tra:
1. Console log trong browser (F12)
2. Network tab để xem API calls
3. MetaMask console để xem blockchain transactions
4. Backend logs để xem server errors

---

**Lưu ý**: Đây là hệ thống demo/development. Trong production cần thêm:
- Security measures
- Error tracking (Sentry)
- Analytics
- Performance optimization
- Unit tests & E2E tests

