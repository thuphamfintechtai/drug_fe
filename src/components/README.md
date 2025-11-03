# 🎨 Reusable Components

Thư viện components tái sử dụng cho dự án Drug Traceability System.

## 📦 Components List

### 1. **Badge**
Hiển thị trạng thái hoặc nhãn ngắn.
```jsx
import { Badge } from '../components';

<Badge variant="success">Đã duyệt</Badge>
<Badge variant="warning">Chờ duyệt</Badge>
<Badge variant="danger">Từ chối</Badge>
```

### 2. **Button**
Nút bấm với nhiều variants và states.
```jsx
import { Button } from '../components';

<Button variant="primary" onClick={handleClick}>
  Xác nhận
</Button>
<Button variant="danger" loading={isLoading}>
  Xóa
</Button>
```

### 3. **Card**
Container với shadow và border.
```jsx
import { Card } from '../components';

<Card title="Thống kê" subtitle="Tháng này">
  <p>Nội dung</p>
</Card>
```

### 4. **DataTable**
Bảng dữ liệu với loading và empty states.
```jsx
import { DataTable } from '../components';

const columns = [
  { header: 'Tên', accessor: 'name' },
  { header: 'Email', accessor: 'email' },
  { 
    header: 'Hành động', 
    render: (row) => <button>Xem</button> 
  }
];

<DataTable 
  columns={columns} 
  data={users} 
  loading={loading}
  onRowClick={handleRowClick}
/>
```

### 5. **EmptyState**
Hiển thị khi không có dữ liệu.
```jsx
import { EmptyState } from '../components';

<EmptyState 
  icon="📭"
  title="Không có đơn hàng"
  description="Chưa có đơn hàng nào trong hệ thống"
  action={{ 
    label: 'Tạo đơn mới', 
    onClick: handleCreate 
  }}
/>
```

### 6. **ErrorMessage**
Hiển thị thông báo lỗi.
```jsx
import { ErrorMessage } from '../components';

<ErrorMessage 
  message={error} 
  onRetry={handleRetry}
/>
```

### 7. **LoadingSpinner**
Spinner loading.
```jsx
import { LoadingSpinner } from '../components';

<LoadingSpinner size="lg" message="Đang tải dữ liệu..." />
```

### 8. **Modal**
Dialog/Modal popup.
```jsx
import { Modal } from '../components';

<Modal 
  isOpen={showModal} 
  onClose={handleClose}
  title="Xác nhận xóa"
  size="md"
>
  <p>Bạn có chắc muốn xóa?</p>
  <Button onClick={handleDelete}>Xóa</Button>
</Modal>
```

### 9. **Pagination**
Phân trang.
```jsx
import { Pagination } from '../components';

<Pagination 
  currentPage={page}
  totalPages={totalPages}
  onPageChange={setPage}
/>
```

### 10. **SearchBar**
Thanh tìm kiếm.
```jsx
import { SearchBar } from '../components';

<SearchBar 
  placeholder="Tìm kiếm thuốc..."
  onSearch={handleSearch}
/>
```

### 11. **StatsCard**
Card hiển thị thống kê.
```jsx
import { StatsCard } from '../components';

<StatsCard 
  icon="📦"
  title="Tổng đơn hàng"
  value={150}
  subtitle="Tháng này"
  color="blue"
  trend={12}
/>
```

## 🎨 Design System

### Colors
- **Primary**: Blue to Cyan gradient
- **Success**: Green to Emerald gradient
- **Warning**: Orange to Amber gradient
- **Danger**: Red to Rose gradient
- **Info**: Cyan gradient

### Animations
Sử dụng `framer-motion` cho smooth animations.

## 📚 Usage Tips

1. Import từ index: `import { Button, Card } from '../components'`
2. Tất cả components đều responsive
3. Sử dụng Tailwind CSS classes
4. Có dark mode support (future)

## 🚀 Future Improvements

- [ ] Thêm Dark Mode
- [ ] Toast notifications
- [ ] Dropdown menu
- [ ] Date picker
- [ ] File uploader

