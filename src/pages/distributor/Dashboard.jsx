import DashboardLayout from '../../components/DashboardLayout';

export default function DistributorDashboard() {
  const metrics = [
    {
      title: 'Lô hàng',
      value: '35',
      subtitle: 'Đã nhận',
      detail: 'Đã chuyển: 32',
      color: 'cyan',
    },
    {
      title: 'Đang vận chuyển',
      value: '12',
      subtitle: 'Lô hàng',
      detail: 'Từ hôm qua: 5',
      color: 'orange',
    },
    {
      title: 'Proof of Distribution',
      value: '48',
      subtitle: 'Đã tạo',
      detail: 'Đã ký: 46',
      color: 'green',
    },
    {
      title: 'NFT',
      value: '89',
      subtitle: 'Đã cập nhật',
      detail: 'Hoạt động: 87',
      color: 'blue',
    },
  ];

  const navigationItems = [
    {
      path: '/distributor',
      label: 'Trang chủ',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      active: true,
    },
    {
      path: '/distributor/proof-of-distribution',
      label: 'Proof of Distribution',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      active: false,
    },
    {
      path: '/distributor/shipping',
      label: 'Theo dõi vận chuyển',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      active: false,
    },
    {
      path: '/distributor/nft',
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
        <h2 className="text-xl font-bold mb-4">Quản lý phân phối</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Proof of Distribution</h3>
            <p className="text-sm text-gray-600">Nhận và chuyển giao lô hàng từ nhà sản xuất đến nhà thuốc.</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Theo dõi vận chuyển</h3>
            <p className="text-sm text-gray-600">Cập nhật trạng thái và tracking lô hàng trong quá trình vận chuyển.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
