import DashboardLayout from '../../components/DashboardLayout';

export default function PharmacyDashboard() {
  const metrics = [
    {
      title: 'Đơn hàng',
      value: '67',
      subtitle: 'Đã nhận',
      detail: 'Đã xác nhận: 64',
      color: 'cyan',
    },
    {
      title: 'Chờ xác nhận',
      value: '9',
      subtitle: 'Đơn hàng',
      detail: 'Từ hôm qua: 4',
      color: 'orange',
    },
    {
      title: 'Proof of Pharmacy',
      value: '52',
      subtitle: 'Đã tạo',
      detail: 'Đã ký: 50',
      color: 'green',
    },
    {
      title: 'Tra cứu',
      value: '128',
      subtitle: 'Lượt tra cứu',
      detail: 'Hôm nay: 15',
      color: 'blue',
    },
  ];

  const navigationItems = [
    {
      path: '/pharmacy',
      label: 'Trang chủ',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      active: true,
    },
    {
      path: '/pharmacy/proof-of-pharmacy',
      label: 'Proof of Pharmacy',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      active: false,
    },
    {
      path: '/pharmacy/nft-tracking',
      label: 'NFT Tracking',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      active: false,
    },
    {
      path: '/pharmacy/invoices',
      label: 'Commercial Invoices',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      active: false,
    },
    {
      path: '/pharmacy/drugs',
      label: 'Danh sách thuốc',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7.5h18M7.5 3v18M6 12h12M12 6v12" />
        </svg>
      ),
      active: false,
    },
  ];

  return (
    <DashboardLayout metrics={metrics} navigationItems={navigationItems}>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Quản lý nhà thuốc</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Proof of Pharmacy</h3>
            <p className="text-sm text-gray-600">Nhận và xác nhận đơn giao từ nhà phân phối.</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Tra cứu nguồn gốc</h3>
            <p className="text-sm text-gray-600">Xem thông tin lô hàng và lịch sử truy xuất nguồn gốc.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
