import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import pharmacyService from '../../services/pharmacy/pharmacyService';

export default function PharmacyProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigationItems = [
    { path: '/pharmacy', label: 'Tổng quan', active: false },
    { path: '/pharmacy/invoices', label: 'Đơn từ NPP', active: false },
    { path: '/pharmacy/distribution-history', label: 'Lịch sử phân phối', active: false },
    { path: '/pharmacy/drugs', label: 'Quản lý thuốc', active: false },
    { path: '/pharmacy/nft-tracking', label: 'Tra cứu NFT', active: false },
    { path: '/pharmacy/profile', label: 'Hồ sơ', active: true },
  ];

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await pharmacyService.getProfile();
      if (response.data.success) {
        setProfile(response.data.data);
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
      <motion.section
        className="relative overflow-hidden rounded-2xl mb-6 border border-[#90e0ef33] shadow-[0_10px_30px_rgba(0,0,0,0.06)] bg-gradient-to-tr from-teal-600 via-emerald-500 to-green-500"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.25),transparent_55%)]" />
        <div className="relative px-6 py-8 md:px-10 md:py-12 text-white">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight drop-shadow-sm">👤 Hồ sơ nhà thuốc</h1>
          <p className="text-white/90 mt-2">Thông tin tài khoản và doanh nghiệp</p>
        </div>
      </motion.section>

      {loading ? (
        <div className="bg-white/90 rounded-2xl border border-[#90e0ef55] p-10 text-center">
          <div className="text-lg text-slate-600">Đang tải thông tin...</div>
        </div>
      ) : !profile ? (
        <div className="bg-white/90 rounded-2xl border border-[#90e0ef55] p-10 text-center">
          <div className="text-5xl mb-4">❌</div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Không tìm thấy thông tin</h3>
          <p className="text-slate-600">Vui lòng thử lại sau</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Thông tin người dùng */}
          <motion.div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-[#90e0ef55] shadow-[0_10px_24px_rgba(0,0,0,0.05)] p-6" variants={fadeUp} initial="hidden" animate="show">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {profile.user?.fullName?.charAt(0).toUpperCase() || 'P'}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#003544]">{profile.user?.fullName || 'N/A'}</h2>
                <p className="text-slate-600">{profile.user?.email || 'N/A'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-200 p-4">
                <div className="text-sm text-emerald-700 mb-1">📧 Email</div>
                <div className="font-semibold text-emerald-900">{profile.user?.email || 'N/A'}</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200 p-4">
                <div className="text-sm text-blue-700 mb-1">📱 Số điện thoại</div>
                <div className="font-semibold text-blue-900">{profile.user?.phone || 'N/A'}</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-4">
                <div className="text-sm text-purple-700 mb-1">🏷️ Vai trò</div>
                <div className="font-semibold text-purple-900 capitalize">{profile.user?.role || 'N/A'}</div>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-200 p-4">
                <div className="text-sm text-amber-700 mb-1">📅 Ngày đăng ký</div>
                <div className="font-semibold text-amber-900">
                  {profile.user?.createdAt ? new Date(profile.user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Thông tin nhà thuốc */}
          {profile.pharmacy && (
            <motion.div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-[#90e0ef55] shadow-[0_10px_24px_rgba(0,0,0,0.05)] p-6" variants={fadeUp} initial="hidden" animate="show">
              <h3 className="text-xl font-bold text-[#003544] mb-4 flex items-center gap-2">
                <span>🏥</span> Thông tin nhà thuốc
              </h3>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-200 p-5">
                  <div className="text-sm text-emerald-700 mb-1">🏢 Tên nhà thuốc</div>
                  <div className="text-lg font-bold text-emerald-900">{profile.pharmacy.name || 'N/A'}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                    <div className="text-sm text-slate-700 mb-1">📜 Mã số thuế</div>
                    <div className="font-mono font-semibold text-slate-900">{profile.pharmacy.taxCode || 'N/A'}</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                    <div className="text-sm text-slate-700 mb-1">📞 Số điện thoại</div>
                    <div className="font-semibold text-slate-900">{profile.pharmacy.phone || 'N/A'}</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                    <div className="text-sm text-slate-700 mb-1">✉️ Email</div>
                    <div className="font-semibold text-slate-900">{profile.pharmacy.email || 'N/A'}</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                    <div className="text-sm text-slate-700 mb-1">🌐 Website</div>
                    <div className="font-semibold text-slate-900">{profile.pharmacy.website || 'N/A'}</div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                  <div className="text-sm text-slate-700 mb-1">📍 Địa chỉ</div>
                  <div className="font-semibold text-slate-900">{profile.pharmacy.address || 'N/A'}</div>
                </div>

                {profile.pharmacy.walletAddress && (
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200 p-4">
                    <div className="text-sm text-blue-700 mb-1">💼 Địa chỉ ví</div>
                    <div className="font-mono text-sm text-blue-900 break-all">{profile.pharmacy.walletAddress}</div>
                  </div>
                )}

                {profile.pharmacy.licenseNumber && (
                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-200 p-4">
                    <div className="text-sm text-amber-700 mb-1">📋 Số giấy phép</div>
                    <div className="font-semibold text-amber-900">{profile.pharmacy.licenseNumber}</div>
                  </div>
                )}

                {profile.pharmacy.description && (
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                    <div className="text-sm text-slate-700 mb-1">📝 Mô tả</div>
                    <div className="text-slate-900">{profile.pharmacy.description}</div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Thông báo readonly */}
          <motion.div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl border border-amber-200 p-5 text-center" variants={fadeUp} initial="hidden" animate="show">
            <div className="text-4xl mb-2">🔒</div>
            <h3 className="text-lg font-bold text-amber-800 mb-1">Chế độ chỉ xem</h3>
            <p className="text-sm text-amber-700">Bạn không thể chỉnh sửa thông tin. Vui lòng liên hệ quản trị viên nếu cần cập nhật.</p>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}

