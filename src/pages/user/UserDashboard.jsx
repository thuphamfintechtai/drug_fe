import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import userService from '../../services/user/userService';

export default function UserDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigationItems = [
    { path: '/user', label: 'Tổng quan', active: true },
    { path: '/user/nft-tracking', label: 'Tra cứu NFT', active: false },
    { path: '/user/drugs', label: 'Thông tin thuốc', active: false },
    { path: '/user/profile', label: 'Hồ sơ', active: false },
  ];

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await userService.getProfile();
      if (response.success) {
        setProfile(response.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải hồ sơ:', error);
    } finally {
      setLoading(false);
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <DashboardLayout navigationItems={navigationItems}>
      {/* Banner */}
      <motion.section
        className="relative overflow-hidden rounded-2xl mb-6 border border-[#90e0ef33] shadow-[0_10px_30px_rgba(0,0,0,0.06)] bg-gradient-to-tr from-blue-600 via-cyan-500 to-teal-500"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.25),transparent_55%)]" />
        <div className="relative px-6 py-8 md:px-10 md:py-12 text-white">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight drop-shadow-sm">
            Xin chào{profile ? `, ${profile.fullName}` : ''}! 👋
          </h1>
          <p className="text-white/90 mt-2 text-lg">Chào mừng bạn đến với hệ thống truy xuất nguồn gốc thuốc</p>
        </div>
      </motion.section>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-lg text-slate-600">Đang tải dữ liệu...</div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Thông tin cá nhân */}
          <motion.div variants={fadeUp} initial="hidden" animate="show">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-[#90e0ef55] shadow-[0_10px_24px_rgba(0,0,0,0.05)] p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {profile?.fullName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#003544]">{profile?.fullName || 'N/A'}</h2>
                    <p className="text-slate-600">{profile?.email || 'N/A'}</p>
                  </div>
                </div>
                <Link
                  to="/user/profile"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 text-white hover:from-blue-600 hover:to-cyan-700 text-sm font-medium transition shadow"
                >
                  ✏️ Xem hồ sơ
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200 p-4">
                  <div className="text-sm text-blue-700 mb-1">📧 Email</div>
                  <div className="font-semibold text-blue-900 truncate">{profile?.email || 'N/A'}</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-4">
                  <div className="text-sm text-purple-700 mb-1">📱 Số điện thoại</div>
                  <div className="font-semibold text-purple-900">{profile?.phone || 'Chưa cập nhật'}</div>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-200 p-4">
                  <div className="text-sm text-amber-700 mb-1">📅 Ngày tham gia</div>
                  <div className="font-semibold text-amber-900">
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={fadeUp} initial="hidden" animate="show">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">⚡ Chức năng chính</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to="/user/nft-tracking"
                className="group bg-gradient-to-br from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 rounded-2xl border border-indigo-200 shadow-[0_10px_24px_rgba(99,102,241,0.15)] hover:shadow-[0_14px_36px_rgba(99,102,241,0.25)] p-6 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl shadow-lg group-hover:scale-110 transition">
                    🔍
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-indigo-900 mb-1">Tra cứu NFT</h3>
                    <p className="text-sm text-indigo-700">Theo dõi hành trình thuốc từ sản xuất đến phân phối</p>
                  </div>
                  <svg className="w-6 h-6 text-indigo-400 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>

              <Link
                to="/user/drugs"
                className="group bg-gradient-to-br from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 rounded-2xl border border-emerald-200 shadow-[0_10px_24px_rgba(16,185,129,0.15)] hover:shadow-[0_14px_36px_rgba(16,185,129,0.25)] p-6 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center text-white text-2xl shadow-lg group-hover:scale-110 transition">
                    💊
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-emerald-900 mb-1">Thông tin thuốc</h3>
                    <p className="text-sm text-emerald-700">Tìm kiếm và xem thông tin chi tiết các loại thuốc</p>
                  </div>
                  <svg className="w-6 h-6 text-emerald-400 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            </div>
          </motion.div>

          {/* Hướng dẫn sử dụng */}
          <motion.div variants={fadeUp} initial="hidden" animate="show">
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl border border-cyan-200 p-6">
              <h3 className="text-lg font-semibold text-cyan-900 mb-4 flex items-center gap-2">
                <span>📖</span> Hướng dẫn sử dụng
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 bg-white rounded-xl p-4 border border-cyan-200">
                  <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold flex-shrink-0">1</div>
                  <div>
                    <h4 className="font-semibold text-cyan-900 mb-1">Tra cứu hành trình thuốc</h4>
                    <p className="text-sm text-cyan-700">Nhập NFT ID (Token ID) để xem toàn bộ hành trình của thuốc từ nhà sản xuất đến nhà thuốc</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white rounded-xl p-4 border border-cyan-200">
                  <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold flex-shrink-0">2</div>
                  <div>
                    <h4 className="font-semibold text-cyan-900 mb-1">Tìm kiếm thông tin thuốc</h4>
                    <p className="text-sm text-cyan-700">Tra cứu thông tin chi tiết về các loại thuốc: thành phần, liều lượng, nhà sản xuất...</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white rounded-xl p-4 border border-cyan-200">
                  <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold flex-shrink-0">3</div>
                  <div>
                    <h4 className="font-semibold text-cyan-900 mb-1">Quản lý tài khoản</h4>
                    <p className="text-sm text-cyan-700">Cập nhật thông tin cá nhân và thay đổi mật khẩu tại trang Hồ sơ</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Thông tin hệ thống */}
          <motion.div variants={fadeUp} initial="hidden" animate="show">
            <div className="bg-white/90 rounded-2xl border border-[#90e0ef55] p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">ℹ️ Về hệ thống</h3>
              <div className="space-y-2 text-sm text-slate-600">
                <p>🔐 <strong>Bảo mật cao:</strong> Dữ liệu được mã hóa và lưu trên blockchain</p>
                <p>✅ <strong>Minh bạch:</strong> Theo dõi toàn bộ chuỗi cung ứng thuốc</p>
                <p>🚀 <strong>Nhanh chóng:</strong> Tra cứu thông tin tức thì</p>
                <p>💡 <strong>Dễ sử dụng:</strong> Giao diện thân thiện, dễ thao tác</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}

