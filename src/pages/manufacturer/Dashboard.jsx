import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import { getStatistics } from '../../services/manufacturer/manufacturerService';

export default function ManufacturerDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getStatistics();
      
      if (response.data.success) {
        setStats(response.data.data);
      } else {
        setError(response.data.message || 'Không thể tải thống kê');
      }
    } catch (error) {
      console.error('Lỗi khi tải thống kê:', error);
      
      if (error.response) {
        // Server responded with error
        setError(error.response.data?.message || `Lỗi server (${error.response.status})`);
      } else if (error.request) {
        // Request was made but no response
        setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      } else {
        // Something else happened
        setError(error.message || 'Đã xảy ra lỗi không xác định');
      }
    } finally {
      setLoading(false);
    }
  };

  const navigationItems = [
    // ... (giữ nguyên)
  ];

  const fadeUp = {
    hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <DashboardLayout navigationItems={navigationItems}>
      <div className="space-y-8">
        {/* Header banner */}
        <div className="bg-white rounded-xl border border-cyan-200 shadow-sm p-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[#007b91] flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#007b91]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M5 10h14M4 14h16M6 18h12" />
              </svg>
              Quản lý nhà sản xuất
            </h1>
            <p className="text-slate-500 text-sm mt-1">Tổng quan hệ thống và các chức năng chính</p>
          </div>
          
          {/* Refresh Button */}
          <button 
            onClick={loadStats}
            disabled={loading}
            className="p-2.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 transition disabled:opacity-50"
            title="Làm mới dữ liệu"
          >
            <svg 
              className={`w-5 h-5 text-cyan-600 transition-transform ${loading ? 'animate-spin' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Loading State */}
        {loading && !stats ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="text-lg text-slate-600">Đang tải dữ liệu...</div>
          </div>
        ) : error ? (
          /* Error State */
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-600 text-lg mb-4">{error}</p>
            <button 
              onClick={loadStats}
              className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Thử lại
            </button>
          </div>
        ) : stats ? (
          <div className="space-y-8">
            {/* Thống kê thuốc */}
            <motion.div variants={fadeUp} initial="hidden" animate="show">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Quản lý thuốc</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Cards giữ nguyên */}
                {/* ... */}
              </div>
            </motion.div>

            {/* Thống kê sản xuất & NFT */}
            <motion.div variants={fadeUp} initial="hidden" animate="show">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Sản xuất & NFT</h2>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                
                {/* Tổng sản xuất */}
                <Link
                  to="/manufacturer/production-history"
                  className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-transform hover:scale-[1.02]"
                >
                  <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-purple-400 to-pink-400 rounded-t-2xl" />
                  <div className="p-5 pt-7 text-center">
                    <div className="text-sm text-slate-600 mb-1">Tổng sản xuất</div>
                    <div className="text-3xl font-bold text-purple-600">{stats?.productions?.total || 0}</div>
                    <div className="text-xs text-slate-500 mt-2">Lô sản xuất</div>
                  </div>
                </Link>

                {/* ✅ Sửa: Chuyển về production-history thay vì /nfts */}
                <Link
                  to="/manufacturer/production-history"
                  className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-transform hover:scale-[1.02]"
                >
                  <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-cyan-400 to-sky-400 rounded-t-2xl" />
                  <div className="p-5 pt-7 text-center">
                    <div className="text-sm text-slate-600 mb-1">Tổng NFT</div>
                    <div className="text-3xl font-bold text-cyan-600">{stats?.nfts?.total || 0}</div>
                    <div className="text-xs text-slate-500 mt-2">Token đã mint</div>
                  </div>
                </Link>

                {/* NFT Minted */}
                <Link
                  to="/manufacturer/production-history?status=minted"
                  className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-transform hover:scale-[1.02]"
                >
                  <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-blue-400 to-cyan-400 rounded-t-2xl" />
                  <div className="p-5 pt-7 text-center">
                    <div className="text-sm text-slate-600 mb-1">NFT Minted</div>
                    <div className="text-3xl font-bold text-blue-600">{stats?.nfts?.byStatus?.minted || 0}</div>
                    <div className="text-xs text-slate-500 mt-2">Chưa chuyển giao</div>
                  </div>
                </Link>

                {/* NFT Transferred */}
                <Link
                  to="/manufacturer/production-history?status=transferred"
                  className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-transform hover:scale-[1.02]"
                >
                  <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-emerald-400 to-green-400 rounded-t-2xl" />
                  <div className="p-5 pt-7 text-center">
                    <div className="text-sm text-slate-600 mb-1">NFT Transferred</div>
                    <div className="text-3xl font-bold text-emerald-600">{stats?.nfts?.byStatus?.transferred || 0}</div>
                    <div className="text-xs text-emerald-600/70 mt-2">Đã chuyển giao</div>
                  </div>
                </Link>
              </div>
            </motion.div>

            {/* Thống kê chuyển giao - giữ nguyên */}
            {/* ... */}
          </div>
        ) : (
          /* No data state */
          <div className="text-center py-20 text-slate-500">
            Không có dữ liệu
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}