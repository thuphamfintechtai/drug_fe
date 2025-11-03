import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import pharmacyService from '../../services/pharmacy/pharmacyService';

export default function PharmacyDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await pharmacyService.getStatistics();
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
    { path: '/pharmacy', label: 'Tổng quan', active: true },
    { path: '/pharmacy/invoices', label: 'Đơn từ NPP', active: false },
    { path: '/pharmacy/distribution-history', label: 'Lịch sử phân phối', active: false },
    { path: '/pharmacy/drugs', label: 'Quản lý thuốc', active: false },
    { path: '/pharmacy/nft-tracking', label: 'Tra cứu NFT', active: false },
    { path: '/pharmacy/profile', label: 'Hồ sơ', active: false },
  ];

  const fadeUp = {
    hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <DashboardLayout navigationItems={navigationItems}>
      {/* Banner */}
      <motion.section
        className="relative overflow-hidden rounded-2xl mb-6 border border-[#90e0ef33] shadow-[0_10px_30px_rgba(0,0,0,0.06)] bg-gradient-to-tr from-emerald-600 via-green-500 to-teal-500"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.25),transparent_55%)]" />
        <div className="relative px-6 py-8 md:px-10 md:py-12 text-white">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight drop-shadow-sm">Tổng quan nhà thuốc</h1>
          <p className="text-white/90 mt-2 text-lg">Quản lý nhận hàng và phân phối thuốc</p>
        </div>
      </motion.section>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-lg text-slate-600">Đang tải dữ liệu...</div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Thống kê đơn hàng */}
          <motion.div variants={fadeUp} initial="hidden" animate="show">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">📦 Đơn hàng từ nhà phân phối</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link to="/pharmacy/invoices" className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-200 shadow-[0_10px_24px_rgba(16,185,129,0.15)] p-5 hover:shadow-[0_14px_36px_rgba(16,185,129,0.25)] transition">
                <div className="text-sm text-emerald-700 mb-1">Tổng đơn nhận</div>
                <div className="text-3xl font-bold text-emerald-600">{stats?.invoices?.total || 0}</div>
                <div className="text-xs text-emerald-600/70 mt-2">Đơn hàng</div>
              </Link>
              
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl border border-amber-200 p-5">
                <div className="text-sm text-amber-700 mb-1">Chờ nhận</div>
                <div className="text-3xl font-bold text-amber-600">{stats?.invoices?.pending || 0}</div>
                <div className="text-xs text-amber-600/70 mt-2">Pending</div>
              </div>
              
              <div className="bg-white/90 rounded-2xl border border-slate-200 p-5">
                <div className="text-sm text-slate-600 mb-1">Đã nhận</div>
                <div className="text-3xl font-bold text-cyan-600">{stats?.invoices?.received || 0}</div>
                <div className="text-xs text-slate-500 mt-2">Received</div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-5">
                <div className="text-sm text-green-700 mb-1">Đã thanh toán</div>
                <div className="text-3xl font-bold text-green-600">{stats?.invoices?.paid || 0}</div>
                <div className="text-xs text-green-600/70 mt-2">Paid</div>
              </div>
            </div>
          </motion.div>

          {/* Thống kê thuốc & NFT */}
          <motion.div variants={fadeUp} initial="hidden" animate="show">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">💊 Thuốc & NFT</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/pharmacy/drugs" className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 shadow-[0_10px_24px_rgba(59,130,246,0.15)] p-5 hover:shadow-[0_14px_36px_rgba(59,130,246,0.25)] transition">
                <div className="text-sm text-blue-700 mb-1">Tổng số thuốc</div>
                <div className="text-3xl font-bold text-blue-600">{stats?.drugs?.total || 0}</div>
                <div className="text-xs text-blue-600/70 mt-2">Loại thuốc</div>
              </Link>
              
              <div className="bg-white/90 rounded-2xl border border-slate-200 p-5">
                <div className="text-sm text-slate-600 mb-1">Tổng NFT</div>
                <div className="text-3xl font-bold text-[#003544]">{stats?.nfts?.total || 0}</div>
                <div className="text-xs text-slate-500 mt-2">Token đang giữ</div>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-200 p-5">
                <div className="text-sm text-emerald-700 mb-1">NFT Available</div>
                <div className="text-3xl font-bold text-emerald-600">{stats?.nfts?.available || 0}</div>
                <div className="text-xs text-emerald-600/70 mt-2">Sẵn sàng bán</div>
              </div>
            </div>
          </motion.div>

          {/* Thống kê phân phối */}
          <motion.div variants={fadeUp} initial="hidden" animate="show">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">📊 Phân phối</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link to="/pharmacy/distribution-history" className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200 shadow-[0_10px_24px_rgba(168,85,247,0.15)] p-5 hover:shadow-[0_14px_36px_rgba(168,85,247,0.25)] transition">
                <div className="text-sm text-purple-700 mb-1">Tổng phân phối</div>
                <div className="text-3xl font-bold text-purple-600">{stats?.distributions?.total || 0}</div>
                <div className="text-xs text-purple-600/70 mt-2">Lượt nhận</div>
              </Link>
              
              <div className="bg-white/90 rounded-2xl border border-slate-200 p-5">
                <div className="text-sm text-slate-600 mb-1">Đã bán</div>
                <div className="text-3xl font-bold text-emerald-600">{stats?.distributions?.sold || 0}</div>
                <div className="text-xs text-slate-500 mt-2">Sold</div>
              </div>
              
              <div className="bg-white/90 rounded-2xl border border-slate-200 p-5">
                <div className="text-sm text-slate-600 mb-1">Tồn kho</div>
                <div className="text-3xl font-bold text-blue-600">{stats?.distributions?.inStock || 0}</div>
                <div className="text-xs text-slate-500 mt-2">In Stock</div>
              </div>
              
              <div className="bg-white/90 rounded-2xl border border-slate-200 p-5">
                <div className="text-sm text-slate-600 mb-1">Hết hạn</div>
                <div className="text-3xl font-bold text-red-500">{stats?.distributions?.expired || 0}</div>
                <div className="text-xs text-slate-500 mt-2">Expired</div>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={fadeUp} initial="hidden" animate="show">
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-200 p-6">
              <h3 className="text-lg font-semibold text-emerald-800 mb-4">⚡ Hành động nhanh</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Link
                  to="/pharmacy/invoices"
                  className="p-4 bg-white rounded-xl border border-emerald-200 hover:border-emerald-300 hover:shadow-md transition text-center"
                >
                  <div className="text-2xl mb-2">📦</div>
                  <div className="text-sm font-medium text-emerald-700">Xem đơn hàng</div>
                </Link>
                <Link
                  to="/pharmacy/drugs"
                  className="p-4 bg-white rounded-xl border border-emerald-200 hover:border-emerald-300 hover:shadow-md transition text-center"
                >
                  <div className="text-2xl mb-2">💊</div>
                  <div className="text-sm font-medium text-emerald-700">Xem thuốc</div>
                </Link>
                <Link
                  to="/pharmacy/nft-tracking"
                  className="p-4 bg-white rounded-xl border border-emerald-200 hover:border-emerald-300 hover:shadow-md transition text-center"
                >
                  <div className="text-2xl mb-2">🔍</div>
                  <div className="text-sm font-medium text-emerald-700">Tra cứu NFT</div>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
