import DashboardLayout from '../../components/DashboardLayout';

export default function AdminDashboard() {
  const metrics = [
    {
      title: 'Tổng quan',
      value: '21',
      subtitle: 'Yêu cầu chờ duyệt',
      detail: 'Đã duyệt: 13',
      color: 'blue',
    },
    {
      title: 'Quá hạn',
      value: '5',
      subtitle: 'Yêu cầu',
      detail: 'Từ hôm qua: 2',
      color: 'red',
    },
    {
      title: 'Vấn đề',
      value: '8',
      subtitle: 'Cần xử lý',
      detail: 'Đã xử lý hôm nay: 6',
      color: 'orange',
    },
    {
      title: 'Người dùng',
      value: '154',
      subtitle: 'Tổng số',
      detail: 'Hoạt động: 142',
      color: 'green',
    },
  ];

  const navigationItems = [
    {
      path: '/admin',
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
      label: 'Duyệt đăng ký',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      active: false,
    },
    {
      path: '#',
      label: 'Quản trị người dùng',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      active: false,
    },
    {
      path: '#',
      label: 'Hệ thống',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      active: false,
    },
  ];

  return (
    <DashboardLayout metrics={metrics} navigationItems={navigationItems}>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Tổng quan hệ thống</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Duyệt đăng ký doanh nghiệp</h3>
            <p className="text-sm text-gray-600">Xem và duyệt các yêu cầu đăng ký từ nhà sản xuất, nhà phân phối, nhà thuốc.</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Quản trị hệ thống</h3>
            <p className="text-sm text-gray-600">Quản lý quyền, người dùng, và cấu hình hệ thống.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
