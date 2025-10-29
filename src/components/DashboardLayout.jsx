import { useState } from 'react';
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

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
            {sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 hover:bg-cyan-600 rounded"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
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
            {navigationItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className={`flex items-center gap-3 p-3 rounded-lg transition ${
                  item.active
                    ? 'bg-cyan-600 text-white'
                    : 'text-cyan-100 hover:bg-cyan-600/50'
                }`}
              >
                {item.icon}
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            ))}
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

