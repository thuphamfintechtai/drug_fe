import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const MetricCard = ({ title, value, subtitle, detail, color }) => {
  const colorClasses = {
    blue: 'text-blue-600',
    red: 'text-red-600',
    orange: 'text-orange-600',
    green: 'text-green-600',
    cyan: 'text-cyan-600',
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md relative">
      <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>
      <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
      <p className={`text-4xl font-bold ${colorClasses[color] || colorClasses.cyan} mb-1`}>
        {value}
      </p>
      <p className="text-sm text-gray-500 mb-2">{subtitle}</p>
      <p className="text-xs text-gray-400">{detail}</p>
    </div>
  );
};

export default function DashboardLayout({ 
  welcomeMessage, 
  metrics = [], 
  navigationItems = [], 
  children 
}) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved === null ? true : saved === 'true';
  });
  const navigate = useNavigate();
  const location = useLocation();
  // Default admin navigation (always shown under /admin regardless of page-provided items)
  const adminNavigationItems = [
    {
      path: '/admin',
      label: 'Trang chủ',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9.75L12 3l9 6.75V20a1 1 0 01-1 1h-5.25a1 1 0 01-1-1v-4.5h-3.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.75z" />
        </svg>
      ),
    },
    {
      path: '/admin/registrations',
      label: 'Duyệt đăng ký',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75l2.25 2.25L15.75 10.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      path: '/admin/drugs',
      label: 'Quản lý thuốc',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7.5h18M7.5 3v18M6 12h12M12 6v12" />
        </svg>
      ),
    },
    {
      path: '/admin/proof-of-production',
      label: 'Proof of Production',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 6.75h15M6.75 4.5v15M8.25 9.75h7.5m-7.5 4.5h7.5" />
        </svg>
      ),
    },
    {
      path: '/admin/proof-of-distribution',
      label: 'Proof of Distribution',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 15l2.25-6.75h12l2.25 6.75M6 15h12m-9 0v3.75m6-3.75v3.75" />
        </svg>
      ),
    },
    {
      path: '/admin/proof-of-pharmacy',
      label: 'Proof of Pharmacy',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7.5 4.5h9a2 2 0 012 2v11a2 2 0 01-2 2h-9a2 2 0 01-2-2v-11a2 2 0 012-2zM9.75 9.75h4.5M9.75 13.5h4.5" />
        </svg>
      ),
    },
    {
      path: '/admin/invoices',
      label: 'Invoices',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 3.75h7.5L19.5 7.5v12a.75.75 0 01-.75.75H5.25A.75.75 0 014.5 19.5v-15a.75.75 0 01.75-.75zM8.25 9h7.5M8.25 12.75h7.5M8.25 16.5h4.5" />
        </svg>
      ),
    },
    {
      path: '/admin/manufacturers',
      label: 'Nhà sản xuất',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 9.75L12 3l8.25 6.75V20.25H3.75zM8.25 20.25v-6h7.5v6" />
        </svg>
      ),
    },
    {
      path: '/admin/nft-tracking',
      label: 'NFT Tracking',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3.75l7.5 4.5v7.5L12 20.25l-7.5-4.5v-7.5L12 3.75zM12 8.25v7.5" />
        </svg>
      ),
    },
  ];
  // Default pharmacy navigation (always shown under /pharmacy regardless of page-provided items)
  const pharmacyNavigationItems = [
    {
      path: '/pharmacy',
      label: 'Trang chủ',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      path: '/pharmacy/proof-of-pharmacy',
      label: 'Proof of Pharmacy',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      path: '/pharmacy/proof-of-pharmacy/my',
      label: 'Biên nhận của tôi',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      path: '/pharmacy/proof-of-pharmacy/new',
      label: 'Tạo Proof of Pharmacy',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      ),
    },
    {
      path: '/pharmacy/invoices',
      label: 'Commercial Invoices',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 3.75h7.5L19.5 7.5v12a.75.75 0 01-.75.75H5.25A.75.75 0 014.5 19.5v-15a.75.75 0 01.75-.75zM8.25 9h7.5M8.25 12.75h7.5M8.25 16.5h4.5" />
        </svg>
      ),
    },
    {
      path: '/pharmacy/invoices/my',
      label: 'Hóa đơn của tôi',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      path: '/pharmacy/drugs',
      label: 'Danh sách thuốc',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7.5h18M7.5 3v18M6 12h12M12 6v12" />
        </svg>
      ),
    },
    {
      path: '/pharmacy/nft-tracking',
      label: 'NFT Tracking',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3.75l7.5 4.5v7.5L12 20.25l-7.5-4.5v-7.5L12 3.75zM12 8.25v7.5" />
        </svg>
      ),
    },
  ];

  const navItems = location.pathname.startsWith('/admin') && (user?.role === 'system_admin')
    ? adminNavigationItems
    : (location.pathname.startsWith('/pharmacy') && (user?.role === 'pharmacy')
      ? pharmacyNavigationItems
      : navigationItems);

  useEffect(() => {
    localStorage.setItem('sidebarOpen', sidebarOpen ? 'true' : 'false');
  }, [sidebarOpen]);

  const getRoleLabel = (role) => {
    const labels = {
      system_admin: 'Quản trị viên',
      pharma_company: 'Nhà sản xuất',
      distributor: 'Nhà phân phối',
      pharmacy: 'Nhà thuốc',
      user: 'Người dùng',
    };
    return labels[role] || role;
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside
        className={`bg-gradient-to-b from-cyan-700 to-teal-800 text-white transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } fixed h-full`}
      >
        <div className="p-4">
          {/* Logo & Header */}
          <div className={`flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'} mb-8`}>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => !sidebarOpen && setSidebarOpen(true)}>
              <div className="w-10 h-10 bg-cyan-400 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-cyan-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 11.09a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3a1 1 0 00-.787 0l-7 3a1 1 0 000 1.838l7 3z" />
                </svg>
              </div>
              {sidebarOpen && <span className="font-bold text-lg">DrugTrace</span>}
            </div>
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="p-1 hover:bg-cyan-600 rounded"
              aria-label={sidebarOpen ? 'Thu gọn sidebar' : 'Mở rộng sidebar'}
            >
              {sidebarOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* User Profile */}
          <div className="mb-8 pb-6 border-b border-cyan-600">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-cyan-400 rounded-full flex items-center justify-center text-cyan-700 font-bold text-lg">
                {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{user?.fullName || user?.username || 'User'}</p>
                  <p className="text-xs text-cyan-200 truncate">{user?.email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {navItems.map((item, index) => {
              const isActive =
                item.active !== undefined
                  ? item.active
                  : location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              return (
              <Link
                key={index}
                to={item.path}
                className={`flex items-center gap-3 p-3 rounded-lg transition text-cyan-100 hover:bg-cyan-600/20 ${
                  isActive ? 'font-semibold underline underline-offset-4 decoration-2 text-white' : ''
                }`}
              >
                {item.icon}
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4 flex items-center justify-end">
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          {/* Welcome Section */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {welcomeMessage || `Chào mừng trở lại, ${user?.fullName || user?.username || 'User'}!`}
            </h1>
            <p className="text-gray-600">
              Bạn có 2 tin nhắn mới và 15 nhiệm vụ mới
            </p>
          </div>

          {/* Metrics Cards */}
          {metrics.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {metrics.map((metric, index) => (
                <MetricCard key={index} {...metric} />
              ))}
            </div>
          )}

          {/* Main Content */}
          {children}
        </main>
      </div>
    </div>
  );
}

