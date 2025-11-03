import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import { getStatistics } from '../../services/manufacturer/manufacturerService';

export default function ManufacturerDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await getStatistics();
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải thống kê:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigationItems = [
    {
      path: '/manufacturer',
      label: 'Tổng quan',
      icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>),
      active: true,
    },
    {
      path: '/manufacturer/drugs',
      label: 'Quản lý thuốc',
      icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>),
      active: false,
    },
    {
      path: '/manufacturer/production',
      label: 'Sản xuất thuốc',
      icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>),
      active: false,
    },
    {
      path: '/manufacturer/transfer',
      label: 'Chuyển giao',
      icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>),
      active: false,
    },
    {
      path: '/manufacturer/production-history',
      label: 'Lịch sử sản xuất',
      icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>),
      active: false,
    },
    {
      path: '/manufacturer/transfer-history',
      label: 'Lịch sử chuyển giao',
      icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
      active: false,
    },
    {
      path: '/manufacturer/profile',
      label: 'Hồ sơ',
      icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>),
      active: false,
    },
  ];

  const fadeUp = {
    hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <DashboardLayout navigationItems={navigationItems}>
      {/* Banner */}
      <motion.section
        className="relative overflow-hidden rounded-2xl mb-6 border border-[#90e0ef33] shadow-[0_10px_30px_rgba(0,0,0,0.06)] bg-gradient-to-tr from-[#00b4d8] via-[#48cae4] to-[#90e0ef]"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.25),transparent_55%)]" />
        <div className="relative px-6 py-8 md:px-10 md:py-12 text-white">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight drop-shadow-sm">Tổng quan nhà sản xuất</h1>
          <p className="text-white/90 mt-2 text-lg">Quản lý sản xuất và phân phối thuốc trên blockchain</p>
        </div>
      </motion.section>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-lg text-slate-600">Đang tải dữ liệu...</div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Thống kê thuốc */}
          <motion.div variants={fadeUp} initial="hidden" animate="show">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">💊 Quản lý thuốc</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/manufacturer/drugs" className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 shadow-[0_10px_24px_rgba(59,130,246,0.15)] p-5 hover:shadow-[0_14px_36px_rgba(59,130,246,0.25)] transition">
                <div className="text-sm text-blue-700 mb-1">Tổng số thuốc</div>
                <div className="text-3xl font-bold text-blue-600">{stats?.drugs?.total || 0}</div>
                <div className="text-xs text-blue-600/70 mt-2">
                  Active: {stats?.drugs?.active || 0} | Inactive: {stats?.drugs?.inactive || 0}
                </div>
              </Link>
              
              <div className="bg-white/90 rounded-2xl border border-slate-200 p-5">
                <div className="text-sm text-slate-600 mb-1">Thuốc hoạt động</div>
                <div className="text-3xl font-bold text-emerald-600">{stats?.drugs?.active || 0}</div>
                <div className="text-xs text-slate-500 mt-2">Đang lưu thông</div>
              </div>
              
              <div className="bg-white/90 rounded-2xl border border-slate-200 p-5">
                <div className="text-sm text-slate-600 mb-1">Thuốc ngừng hoạt động</div>
                <div className="text-3xl font-bold text-slate-500">{stats?.drugs?.inactive || 0}</div>
                <div className="text-xs text-slate-500 mt-2">Tạm ngừng</div>
              </div>
            </div>
          </motion.div>

          {/* Thống kê sản xuất & NFT */}
          <motion.div variants={fadeUp} initial="hidden" animate="show">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">🏭 Sản xuất & NFT</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link to="/manufacturer/production-history" className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200 shadow-[0_10px_24px_rgba(168,85,247,0.15)] p-5 hover:shadow-[0_14px_36px_rgba(168,85,247,0.25)] transition">
                <div className="text-sm text-purple-700 mb-1">Tổng sản xuất</div>
                <div className="text-3xl font-bold text-purple-600">{stats?.productions?.total || 0}</div>
                <div className="text-xs text-purple-600/70 mt-2">Lô sản xuất</div>
              </Link>
              
              <div className="bg-white/90 rounded-2xl border border-slate-200 p-5">
                <div className="text-sm text-slate-600 mb-1">Tổng NFT</div>
                <div className="text-3xl font-bold text-[#003544]">{stats?.nfts?.total || 0}</div>
                <div className="text-xs text-slate-500 mt-2">Token đã mint</div>
              </div>
              
              <div className="bg-white/90 rounded-2xl border border-slate-200 p-5">
                <div className="text-sm text-slate-600 mb-1">NFT Minted</div>
                <div className="text-3xl font-bold text-cyan-600">{stats?.nfts?.byStatus?.minted || 0}</div>
                <div className="text-xs text-slate-500 mt-2">Chưa chuyển giao</div>
              </div>
              
              <div className="bg-white/90 rounded-2xl border border-slate-200 p-5">
                <div className="text-sm text-slate-600 mb-1">NFT Transferred</div>
                <div className="text-3xl font-bold text-emerald-600">{stats?.nfts?.byStatus?.transferred || 0}</div>
                <div className="text-xs text-emerald-600/70 mt-2">Đã chuyển giao</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-white/90 rounded-xl border border-slate-200 p-4">
                <div className="text-sm text-slate-600 mb-3">Trạng thái NFT</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-slate-500">Sold</div>
                    <div className="text-lg font-semibold text-emerald-600">{stats?.nfts?.byStatus?.sold || 0}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Expired</div>
                    <div className="text-lg font-semibold text-red-500">{stats?.nfts?.byStatus?.expired || 0}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Recalled</div>
                    <div className="text-lg font-semibold text-orange-500">{stats?.nfts?.byStatus?.recalled || 0}</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl border border-cyan-200 p-4">
                <div className="text-sm text-cyan-700 mb-2">Hành động nhanh</div>
                <div className="space-y-2">
                  <Link to="/manufacturer/production" className="block text-sm text-cyan-600 hover:text-cyan-700 hover:underline">
                    → Tạo lô sản xuất mới (Mint NFT)
                  </Link>
                  <Link to="/manufacturer/transfer" className="block text-sm text-cyan-600 hover:text-cyan-700 hover:underline">
                    → Chuyển giao cho nhà phân phối
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Thống kê chuyển giao */}
          <motion.div variants={fadeUp} initial="hidden" animate="show">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">🚚 Chuyển giao</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link to="/manufacturer/transfer-history" className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-200 shadow-[0_10px_24px_rgba(249,115,22,0.15)] p-5 hover:shadow-[0_14px_36px_rgba(249,115,22,0.25)] transition">
                <div className="text-sm text-orange-700 mb-1">Tổng chuyển giao</div>
                <div className="text-3xl font-bold text-orange-600">{stats?.transfers?.total || 0}</div>
                <div className="text-xs text-orange-600/70 mt-2">Lượt chuyển</div>
              </Link>
              
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl border border-amber-200 p-5">
                <div className="text-sm text-amber-700 mb-1">Đang chờ</div>
                <div className="text-3xl font-bold text-amber-600">{stats?.transfers?.byStatus?.pending || 0}</div>
                <div className="text-xs text-amber-600/70 mt-2">Pending</div>
              </div>
              
              <div className="bg-white/90 rounded-2xl border border-slate-200 p-5">
                <div className="text-sm text-slate-600 mb-1">Đã gửi</div>
                <div className="text-3xl font-bold text-cyan-600">{stats?.transfers?.byStatus?.sent || 0}</div>
                <div className="text-xs text-slate-500 mt-2">Sent</div>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-200 p-5">
                <div className="text-sm text-emerald-700 mb-1">Đã thanh toán</div>
                <div className="text-3xl font-bold text-emerald-600">{stats?.transfers?.byStatus?.paid || 0}</div>
                <div className="text-xs text-emerald-600/70 mt-2">Paid</div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
