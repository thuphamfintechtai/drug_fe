import DashboardLayout from '../../components/DashboardLayout';
import CreateProofDialog from './CreateProofDialog';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function ManufacturerDashboard() {
  const navigate = useNavigate();
  
  // State for CreateProofDialog
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [proofFormData, setProofFormData] = useState({
    drugId: '',
    mfgDate: '',
    expDate: '',
    quantity: '',
    qaInspector: '',
    qaReportUri: ''
  });

  // Mock drugs data - replace with actual data later
  const mockDrugs = [
    { _id: '1', tradeName: 'Paracetamol 500mg', genericName: 'Paracetamol', atcCode: 'N02BE01' },
    { _id: '2', tradeName: 'Amoxicillin 250mg', genericName: 'Amoxicillin', atcCode: 'J01CA04' }
  ];

  const handleCreateProof = () => {
    setIsProofModalOpen(true);
  };

  const handleCloseProofModal = () => {
    setIsProofModalOpen(false);
    // Reset form
    setProofFormData({
      drugId: '',
      mfgDate: '',
      expDate: '',
      quantity: '',
      qaInspector: '',
      qaReportUri: ''
    });
  };

  const handleSubmitProof = () => {
    console.log('Submitting proof:', proofFormData);
    // TODO: Implement actual submission logic
    alert('Tạo chứng nhận thành công!');
    handleCloseProofModal();
  };

  // Metrics for DashboardLayout
  const metrics = [
    {
      title: 'Lô sản xuất',
      value: '42',
      subtitle: 'Đã sản xuất',
      detail: 'Hoàn thành: 38',
      color: 'cyan',
      icon: 'fa-boxes',
      emoji: '📦'
    },
    {
      title: 'Chờ ký',
      value: '7',
      subtitle: 'Lô hàng',
      detail: 'Từ hôm qua: 3',
      color: 'cyan',
      icon: 'fa-clock',
      emoji: '⏰'
    },
    {
      title: 'Hóa đơn',
      value: '28',
      subtitle: 'Đã tạo',
      detail: 'Đã gửi: 25',
      color: 'cyan',
      icon: 'fa-file-invoice',
      emoji: '📄'
    },
    {
      title: 'NFT',
      value: '156',
      subtitle: 'Đã tạo',
      detail: 'Hoạt động: 154',
      color: 'cyan',
      icon: 'fa-tag',
      emoji: '🏷️'
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
      path: '/manufacturer/search',
      label: 'Tìm kiếm Manufacturer',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      active: false,
    },
    {
      path: '/manufacturer/production-list',
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

  // Recent activities
  const recentActivities = [
    {
      id: 1,
      type: 'production',
      message: 'Hoàn thành sản xuất lô Paracetamol 500mg - Batch #PP2024110001',
      time: '2 giờ trước',
      icon: '🏭',
      color: 'text-cyan-600'
    },
    {
      id: 2, 
      type: 'proof',
      message: 'Tạo Proof of Production mới cho Amoxicillin 250mg',
      time: '4 giờ trước',
      icon: '📋',
      color: 'text-cyan-600'
    },
    {
      id: 3,
      type: 'distribution',
      message: 'Gửi lô hàng đến nhà phân phối ABC Pharma',
      time: '6 giờ trước', 
      icon: '📦',
      color: 'text-cyan-600'
    },
    {
      id: 4,
      type: 'nft',
      message: 'Tạo NFT cho batch #PP2024110001',
      time: '1 ngày trước',
      icon: '🏷️',
      color: 'text-cyan-600'
    }
  ];

  const quickActions = [
    {
      title: 'Tạo Proof of Production',
      desc: 'Tạo chứng nhận sản xuất cho lô thuốc mới',
      icon: '➕',
      color: 'bg-gradient-to-br from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700',
      action: () => handleCreateProof()
    },
    {
      title: 'Quản lý Thuốc',
      desc: 'Tạo và quản lý danh sách thuốc',
      icon: '💊',
      color: 'bg-gradient-to-br from-cyan-400 to-cyan-600 hover:from-cyan-500 hover:to-cyan-700',
      action: () => navigate('/manufacturer/drugs')
    },
    {
      title: 'Tìm Nhà Sản Xuất',
      desc: 'Tra cứu thông tin nhà sản xuất khác',
      icon: '🔍',
      color: 'bg-gradient-to-br from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700',
      action: () => navigate('/manufacturer/search')
    },
    {
      title: 'Proof of Distribution',
      desc: 'Xem và quản lý phân phối',
      icon: '📦',
      color: 'bg-gradient-to-br from-cyan-500 to-cyan-700 hover:from-cyan-600 hover:to-cyan-800',
      action: () => navigate('/manufacturer/distribution-list')
    },
    {
      title: 'Quản lý NFT',
      desc: 'Theo dõi và quản lý NFT tracking',
      icon: '🏷️',
      color: 'bg-gradient-to-br from-cyan-600 to-teal-700 hover:from-cyan-700 hover:to-teal-800',
      action: () => navigate('/manufacturer/nft-tracking')
    },
    {
      title: 'Xem Thống Kê',
      desc: 'Báo cáo và phân tích dữ liệu',
      icon: '📊',
      color: 'bg-gradient-to-br from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700',
      action: () => navigate('/manufacturer/stats')
    }
  ];

  return (
    <DashboardLayout metrics={metrics} navigationItems={navigationItems}>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-br from-cyan-600 via-teal-600 to-cyan-700 rounded-3xl shadow-2xl p-8 mb-8 relative overflow-hidden">
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between">
            <div className="flex-1 mb-6 lg:mb-0">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-white bg-opacity-20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-3xl">🏭</span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold text-white drop-shadow-lg">
                  Chào mừng đến với Hệ thống Quản lý Nhà Sản Xuất Dược Phẩm
                </h1>
              </div>
              <p className="text-white text-lg mb-8 opacity-95 max-w-2xl">
                Quản lý sản xuất, Proof of Production, phân phối và theo dõi NFT một cách hiệu quả
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-white bg-opacity-25 backdrop-blur-md rounded-2xl px-8 py-5 shadow-xl hover:bg-opacity-30 transition-all duration-300 transform hover:scale-105 border border-white border-opacity-20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-white bg-opacity-30 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📦</span>
                    </div>
                    <div className="text-5xl font-bold text-white">42</div>
                  </div>
                  <div className="text-white text-sm font-medium opacity-95">Lô sản xuất</div>
                </div>
                <div className="bg-white bg-opacity-25 backdrop-blur-md rounded-2xl px-8 py-5 shadow-xl hover:bg-opacity-30 transition-all duration-300 transform hover:scale-105 border border-white border-opacity-20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-white bg-opacity-30 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">✅</span>
                    </div>
                    <div className="text-5xl font-bold text-white">90%</div>
                  </div>
                  <div className="text-white text-sm font-medium opacity-95">Hoàn thành</div>
                </div>
                <div className="bg-white bg-opacity-25 backdrop-blur-md rounded-2xl px-8 py-5 shadow-xl hover:bg-opacity-30 transition-all duration-300 transform hover:scale-105 border border-white border-opacity-20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-white bg-opacity-30 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🏷️</span>
                    </div>
                    <div className="text-5xl font-bold text-white">156</div>
                  </div>
                  <div className="text-white text-sm font-medium opacity-95">NFT đã tạo</div>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="w-56 h-56 bg-white bg-opacity-15 backdrop-blur-md rounded-full flex items-center justify-center relative shadow-2xl border border-white border-opacity-20">
                <div className="text-9xl">🏭</div>
                <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-10"></div>
                <div className="absolute inset-0 border-4 border-white border-opacity-20 rounded-full animate-spin" style={{ animationDuration: '20s' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-800">Hành Động Nhanh</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {quickActions.map((action, index) => (
              <div 
                key={index} 
                onClick={action.action}
                className={`${action.color} rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 cursor-pointer flex items-center gap-4 border border-white border-opacity-20 relative overflow-hidden group`}
              >
                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                <div className="w-16 h-16 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">{action.icon}</span>
                </div>
                <div className="flex-1 relative z-10">
                  <div className="text-xl font-bold mb-2">{action.title}</div>
                  <div className="text-white opacity-90 text-sm leading-relaxed">{action.desc}</div>
                </div>
                <div className="text-3xl opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">→</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities and System Health Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🕒</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Hoạt Động Gần Đây</h3>
            </div>
            <div className="space-y-3">
              {recentActivities.map((activity, idx) => (
                <div 
                  key={activity.id} 
                  className="flex items-start gap-4 p-5 rounded-xl bg-gradient-to-r from-cyan-50 to-teal-50 hover:from-cyan-100 hover:to-teal-100 transition-all duration-300 border border-cyan-100 hover:border-cyan-300 hover:shadow-md transform hover:-translate-y-0.5 cursor-pointer group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">{activity.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-gray-800 font-semibold mb-1.5 leading-snug">{activity.message}</div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div>
                      <div className="text-sm text-cyan-600 font-medium">{activity.time}</div>
                    </div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-cyan-500 mt-2 group-hover:scale-150 transition-transform duration-300"></div>
                </div>
              ))}
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🟢</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Trạng Thái Hệ Thống</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-5 rounded-xl bg-gradient-to-r from-cyan-50 to-teal-50 hover:from-cyan-100 hover:to-teal-100 transition-all duration-300 border border-cyan-100 hover:border-cyan-300 hover:shadow-md transform hover:-translate-y-0.5 cursor-pointer group">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">🔗</span>
                </div>
                <div className="flex-1">
                  <div className="text-gray-800 font-semibold mb-1">API Connection</div>
                  <div className="text-sm text-cyan-600 font-medium">Hoạt động tốt</div>
                </div>
                <div className="relative">
                  <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg"></div>
                  <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-400 animate-ping"></div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-5 rounded-xl bg-gradient-to-r from-cyan-50 to-teal-50 hover:from-cyan-100 hover:to-teal-100 transition-all duration-300 border border-cyan-100 hover:border-cyan-300 hover:shadow-md transform hover:-translate-y-0.5 cursor-pointer group">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">🔒</span>
                </div>
                <div className="flex-1">
                  <div className="text-gray-800 font-semibold mb-1">Blockchain</div>
                  <div className="text-sm text-cyan-600 font-medium">Đồng bộ 100%</div>
                </div>
                <div className="relative">
                  <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg"></div>
                  <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-400 animate-ping"></div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-5 rounded-xl bg-gradient-to-r from-cyan-50 to-teal-50 hover:from-cyan-100 hover:to-teal-100 transition-all duration-300 border border-cyan-100 hover:border-cyan-300 hover:shadow-md transform hover:-translate-y-0.5 cursor-pointer group">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">📊</span>
                </div>
                <div className="flex-1">
                  <div className="text-gray-800 font-semibold mb-1">Database</div>
                  <div className="text-sm text-cyan-600 font-medium">Sẵn sàng</div>
                </div>
                <div className="relative">
                  <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg"></div>
                  <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-400 animate-ping"></div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 transition-all duration-300 border border-amber-100 hover:border-amber-300 hover:shadow-md transform hover:-translate-y-0.5 cursor-pointer group">
                <div className="w-12 h-12 bg-amber-100 pb rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform攝影 duration-300">
                  <span className="text-2xl">⚠️</span>
                </div>
                <div className="flex-1">
                  <div className="text-gray-800 font-semibold mb-1">Storage</div>
                  <div className="text-sm text-amber-600 font-medium">75% đã dùng</div>
                </div>
                <div className="relative">
                  <div className="w-3 h-3 rounded-full bg-amber-500 shadow-lg"></div>
                  <div className="absolute inset-0 w-3 h-3 rounded-full bg-amber-400 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CreateProofDialog Modal */}
      <CreateProofDialog
        open={isProofModalOpen}
        onClose={handleCloseProofModal}
        formData={proofFormData}
        setFormData={setProofFormData}
        drugs={mockDrugs}
        loading={false}
        onSubmit={handleSubmitProof}
      />
    </DashboardLayout>
  );
}
