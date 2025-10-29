import DashboardLayout from '../../components/DashboardLayout';

export default function ManufacturerDashboard() {
  const metrics = [
    {
      title: 'Lô sản xuất',
      value: '42',
      subtitle: 'Đã sản xuất',
      detail: 'Hoàn thành: 38',
      color: 'cyan',
    },
    {
      title: 'Chờ ký',
      value: '7',
      subtitle: 'Lô hàng',
      detail: 'Từ hôm qua: 3',
      color: 'orange',
    },
    {
      title: 'Hóa đơn',
      value: '28',
      subtitle: 'Đã tạo',
      detail: 'Đã gửi: 25',
      color: 'green',
    },
    {
      title: 'NFT',
      value: '156',
      subtitle: 'Đã tạo',
      detail: 'Hoạt động: 154',
      color: 'blue',
    },
  ];

  const navigationItems = [
    {
      path: '/manufacturer',
      label: 'Trang chủ',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      active: true,
    },
    {
      path: '#',
      label: 'Proof of Production',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      active: false,
    },
    {
      path: '#',
      label: 'Hóa đơn thương mại',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      active: false,
    },
    {
      path: '#',
      label: 'Quản lý NFT',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      active: false,
    },
  ];

  return (
    <DashboardLayout metrics={metrics} navigationItems={navigationItems}>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Quản lý sản xuất</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Proof of Production</h3>
            <p className="text-sm text-gray-600">Tạo, ký và quản lý các lô sản xuất dược phẩm.</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Hóa đơn thương mại</h3>
            <p className="text-sm text-gray-600">Tạo và gửi hóa đơn cho nhà phân phối.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
