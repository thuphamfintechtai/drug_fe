import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import { getStatistics } from '../../services/distributor/distributorService';

export default function DistributorDashboard() {
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
      path: '/distributor',
      label: 'Tổng quan',
      icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>),
      active: true,
    },
    {
      path: '/distributor/invoices',
      label: 'Đơn từ nhà SX',
      icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>),
      active: false,
    },
    {
      path: '/distributor/transfer-pharmacy',
      label: 'Chuyển cho NT',
      icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>),
      active: false,
    },
    {
      path: '/distributor/distribution-history',
      label: 'Lịch sử phân phối',
      icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>),
      active: false,
    },
    {
      path: '/distributor/transfer-history',
      label: 'Lịch sử chuyển NT',
      icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
      active: false,
    },
    {
      path: '/distributor/drugs',
      label: 'Quản lý thuốc',
      icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>),
      active: false,
    },
    {
      path: '/distributor/nft-tracking',
      label: 'Tra cứu NFT',
      icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>),
      active: false,
    },
    {
      path: '/distributor/profile',
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
      {/* Banner card (trắng, viền top gradient) */}
      <motion.section
        className="relative mb-6"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
          <div className="h-[3px] w-full rounded-t-2xl bg-gradient-to-r from-[#00b4d8] via-[#48cae4] to-[#90e0ef]" />
          <div className="px-6 py-5 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00b4d8] to-[#48cae4] text-white flex items-center justify-center shadow-sm">
              <span className="text-xl">🚚</span>
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-semibold text-slate-800">Quản lý nhà phân phối</h1>
              <p className="text-slate-500 text-sm">Tổng quan hệ thống và các chức năng chính</p>
            </div>
          </div>
        </div>
      </motion.section>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-lg text-slate-600">Đang tải dữ liệu...</div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Hàng thẻ thống kê (4 box, viền top màu) */}
          <motion.div variants={fadeUp} initial="hidden" animate="show">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link to="/distributor/invoices" className="relative overflow-hidden bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="absolute left-3 right-3 top-2 h-1.5 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500" />
                <div className="text-sm text-slate-500 mt-2">Tổng đơn nhận</div>
                <div className="text-3xl font-bold text-sky-600">{stats?.invoicesFromManufacturer?.total || 0}</div>
              </Link>
              <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="absolute left-3 right-3 top-2 h-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500" />
                <div className="text-sm text-slate-500 mt-2">Chờ nhận</div>
                <div className="text-3xl font-bold text-amber-600">{stats?.invoicesFromManufacturer?.pending || 0}</div>
              </div>
              <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="absolute left-3 right-3 top-2 h-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-green-500" />
                <div className="text-sm text-slate-500 mt-2">Đã nhận</div>
                <div className="text-3xl font-bold text-emerald-600">{stats?.invoicesFromManufacturer?.received || 0}</div>
              </div>
              <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="absolute left-3 right-3 top-2 h-1.5 rounded-full bg-gradient-to-r from-rose-500 to-red-500" />
                <div className="text-sm text-slate-500 mt-2">Đã thanh toán</div>
                <div className="text-3xl font-bold text-rose-600">{stats?.invoicesFromManufacturer?.paid || 0}</div>
              </div>
            </div>
          </motion.div>

          {/* Thống kê phân phối */}
          <motion.div variants={fadeUp} initial="hidden" animate="show">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">📊 Phân phối & NFT</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link to="/distributor/distribution-history" className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200 shadow-[0_10px_24px_rgba(168,85,247,0.15)] p-5 hover:shadow-[0_14px_36px_rgba(168,85,247,0.25)] transition">
                <div className="text-sm text-purple-700 mb-1">Tổng phân phối</div>
                <div className="text-3xl font-bold text-purple-600">{stats?.distributions?.total || 0}</div>
                <div className="text-xs text-purple-600/70 mt-2">Lượt phân phối</div>
              </Link>
              
              <div className="bg-white/90 rounded-2xl border border-slate-200 p-5">
                <div className="text-sm text-slate-600 mb-1">Tổng NFT</div>
                <div className="text-3xl font-bold text-[#003544]">{stats?.nfts?.total || 0}</div>
                <div className="text-xs text-slate-500 mt-2">Token đang giữ</div>
              </div>
              
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl border border-cyan-200 p-5">
                <div className="text-sm text-cyan-700 mb-1">NFT Available</div>
                <div className="text-3xl font-bold text-cyan-600">{stats?.nfts?.available || 0}</div>
                <div className="text-xs text-cyan-600/70 mt-2">Chưa chuyển</div>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-200 p-5">
                <div className="text-sm text-emerald-700 mb-1">NFT Transferred</div>
                <div className="text-3xl font-bold text-emerald-600">{stats?.nfts?.transferred || 0}</div>
                <div className="text-xs text-emerald-600/70 mt-2">Đã chuyển NT</div>
              </div>
            </div>
          </motion.div>

          {/* Thống kê chuyển cho Pharmacy */}
          <motion.div variants={fadeUp} initial="hidden" animate="show">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">🏥 Chuyển giao cho nhà thuốc</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link to="/distributor/transfer-history" className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-200 shadow-[0_10px_24px_rgba(249,115,22,0.15)] p-5 hover:shadow-[0_14px_36px_rgba(249,115,22,0.25)] transition">
                <div className="text-sm text-orange-700 mb-1">Tổng chuyển NT</div>
                <div className="text-3xl font-bold text-orange-600">{stats?.transfersToPharmacy?.total || 0}</div>
                <div className="text-xs text-orange-600/70 mt-2">Lượt chuyển</div>
              </Link>
              
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl border border-amber-200 p-5">
                <div className="text-sm text-amber-700 mb-1">Đang chờ</div>
                <div className="text-3xl font-bold text-amber-600">{stats?.transfersToPharmacy?.pending || 0}</div>
                <div className="text-xs text-amber-600/70 mt-2">Pending</div>
              </div>
              
              <div className="bg-white/90 rounded-2xl border border-slate-200 p-5">
                <div className="text-sm text-slate-600 mb-1">Đã gửi</div>
                <div className="text-3xl font-bold text-cyan-600">{stats?.transfersToPharmacy?.sent || 0}</div>
                <div className="text-xs text-slate-500 mt-2">Sent</div>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-200 p-5">
                <div className="text-sm text-emerald-700 mb-1">Đã thanh toán</div>
                <div className="text-3xl font-bold text-emerald-600">{stats?.transfersToPharmacy?.paid || 0}</div>
                <div className="text-xs text-emerald-600/70 mt-2">Paid</div>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={fadeUp} initial="hidden" animate="show">
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl border border-cyan-200 p-6">
              <h3 className="text-lg font-semibold text-cyan-800 mb-4">⚡ Hành động nhanh</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Link
                  to="/distributor/invoices"
                  className="p-4 bg-white rounded-xl border border-cyan-200 hover:border-cyan-300 hover:shadow-md transition text-center"
                >
                  <div className="text-2xl mb-2">📦</div>
                  <div className="text-sm font-medium text-cyan-700">Xem đơn hàng</div>
                </Link>
                <Link
                  to="/distributor/transfer-pharmacy"
                  className="p-4 bg-white rounded-xl border border-cyan-200 hover:border-cyan-300 hover:shadow-md transition text-center"
                >
                  <div className="text-2xl mb-2">🚚</div>
                  <div className="text-sm font-medium text-cyan-700">Chuyển cho nhà thuốc</div>
                </Link>
                <Link
                  to="/distributor/nft-tracking"
                  className="p-4 bg-white rounded-xl border border-cyan-200 hover:border-cyan-300 hover:shadow-md transition text-center"
                >
                  <div className="text-2xl mb-2">🔍</div>
                  <div className="text-sm font-medium text-cyan-700">Tra cứu NFT</div>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
