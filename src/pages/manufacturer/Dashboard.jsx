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
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-lg text-slate-600">Đang tải dữ liệu...</div>
          </div>
        ) : (
          <div className="space-y-8">

            {/* Thống kê thuốc */}
            <motion.div variants={fadeUp} initial="hidden" animate="show">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Quản lý thuốc</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                {/* Tổng số thuốc */}
                <Link
                  to="/manufacturer/drugs"
                  className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-transform hover:scale-[1.02]"
                >
                  <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-cyan-400 to-sky-400 rounded-t-2xl" />
                  <div className="p-5 pt-7 text-center">
                    <div className="text-sm text-slate-600 mb-1">Tổng số thuốc</div>
                    <div className="text-3xl font-bold text-cyan-600">{stats?.drugs?.total || 0}</div>
                    <div className="text-xs text-slate-500 mt-2">
                      Hoạt động: {stats?.drugs?.active || 0} | Không hoạt động: {stats?.drugs?.inactive || 0}
                    </div>
                  </div>
                </Link>

                {/* Thuốc hoạt động */}
                <Link
                  to="/manufacturer/drugs?status=active"
                  className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-transform hover:scale-[1.02]"
                >
                  <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-emerald-400 to-green-400 rounded-t-2xl" />
                  <div className="p-5 pt-7 text-center">
                    <div className="text-sm text-slate-600 mb-1">Thuốc hoạt động</div>
                    <div className="text-3xl font-bold text-emerald-600">{stats?.drugs?.active || 0}</div>
                    <div className="text-xs text-slate-500 mt-2">Đang lưu thông</div>
                  </div>
                </Link>

                {/* Thuốc ngừng hoạt động */}
                <Link
                  to="/manufacturer/drugs?status=inactive"
                  className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-transform hover:scale-[1.02]"
                >
                  <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-slate-400 to-gray-300 rounded-t-2xl" />
                  <div className="p-5 pt-7 text-center">
                    <div className="text-sm text-slate-600 mb-1">Thuốc ngừng hoạt động</div>
                    <div className="text-3xl font-bold text-slate-500">{stats?.drugs?.inactive || 0}</div>
                    <div className="text-xs text-slate-500 mt-2">Tạm ngừng</div>
                  </div>
                </Link>

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

                {/* Tổng NFT */}
                <Link
                  to="/manufacturer/nfts"
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
                  to="/manufacturer/nfts?status=minted"
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
                  to="/manufacturer/nfts?status=transferred"
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


            {/* Thống kê chuyển giao */}
            <motion.div variants={fadeUp} initial="hidden" animate="show">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Chuyển giao</h2>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">

                {/* Tổng chuyển giao */}
                <Link
                  to="/manufacturer/transfer-history"
                  className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-transform hover:scale-[1.02]"
                >
                  <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-orange-400 to-amber-400 rounded-t-2xl" />
                  <div className="p-5 pt-7 text-center">
                    <div className="text-sm text-slate-600 mb-1">Tổng chuyển giao</div>
                    <div className="text-3xl font-bold text-orange-600">
                      {stats?.transfers?.total || 0}
                    </div>
                    <div className="text-xs text-slate-500 mt-2">Lượt chuyển</div>
                  </div>
                </Link>

                {/* Đang chờ */}
                <Link
                  to="/manufacturer/transfer-history?status=pending"
                  className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-transform hover:scale-[1.02]"
                >
                  <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-amber-400 to-yellow-400 rounded-t-2xl" />
                  <div className="p-5 pt-7 text-center">
                    <div className="text-sm text-slate-600 mb-1">Đang chờ</div>
                    <div className="text-3xl font-bold text-amber-600">
                      {stats?.transfers?.byStatus?.pending || 0}
                    </div>
                    <div className="text-xs text-slate-500 mt-2">Pending</div>
                  </div>
                </Link>

                {/* Đã gửi */}
                <Link
                  to="/manufacturer/transfer-history?status=sent"
                  className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-transform hover:scale-[1.02]"
                >
                  <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-sky-400 to-cyan-400 rounded-t-2xl" />
                  <div className="p-5 pt-7 text-center">
                    <div className="text-sm text-slate-600 mb-1">Đã gửi</div>
                    <div className="text-3xl font-bold text-cyan-600">
                      {stats?.transfers?.byStatus?.sent || 0}
                    </div>
                    <div className="text-xs text-slate-500 mt-2">Sent</div>
                  </div>
                </Link>

                {/* Đã thanh toán */}
                <Link
                  to="/manufacturer/transfer-history?status=paid"
                  className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-transform hover:scale-[1.02]"
                >
                  <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-green-400 to-emerald-400 rounded-t-2xl" />
                  <div className="p-5 pt-7 text-center">
                    <div className="text-sm text-slate-600 mb-1">Đã thanh toán</div>
                    <div className="text-3xl font-bold text-emerald-600">
                      {stats?.transfers?.byStatus?.paid || 0}
                    </div>
                    <div className="text-xs text-emerald-600/70 mt-2">Paid</div>
                  </div>
                </Link>

              </div>
            </motion.div>

          </div>
        )}
      </div>
    </DashboardLayout>
  );
  
}
