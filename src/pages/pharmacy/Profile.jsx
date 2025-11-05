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
        className="relative overflow-hidden rounded-2xl mb-6 border border-[#7AC3DE] shadow-[0_10px_30px_rgba(75,173,209,0.15)] bg-white"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative px-6 py-8 md:px-10 md:py-12">
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-8 h-8 text-[#4BADD1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#4BADD1]">Hồ sơ nhà thuốc</h1>
          </div>
          <p className="text-[#7AC3DE] mt-2 text-lg flex items-center gap-2">
            <svg className="w-5 h-5 text-[#7AC3DE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Thông tin tài khoản và doanh nghiệp
          </p>
        </div>
      </motion.section>

      {loading ? (
        <div className="bg-white rounded-2xl border-2 border-[#7AC3DE] p-10 text-center">
          <div className="text-lg text-slate-600">Đang tải thông tin...</div>
        </div>
      ) : !profile ? (
        <div className="bg-white rounded-2xl border-2 border-[#7AC3DE] p-10 text-center">
          <div className="text-5xl mb-4 text-slate-800">■</div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Không tìm thấy thông tin</h3>
          <p className="text-slate-600">Vui lòng thử lại sau</p>
        </div>
      ) : (
        <motion.div className="space-y-6" variants={fadeUp} initial="hidden" animate="show">
          {/* Bảng 1: Thông tin người dùng */}
          <div className="bg-white rounded-2xl border-2 border-[#7AC3DE] shadow-[0_4px_12px_rgba(122,195,222,0.12)] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#4BADD1] to-[#7AC3DE] px-8 py-6 border-b-2 border-[#7AC3DE]">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg bg-white/20 backdrop-blur-sm">
                  {profile.user?.fullName?.charAt(0).toUpperCase() || 'P'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Thông tin người dùng
                  </h2>
                  <p className="text-white/90 mt-1">{profile.user?.email || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Nội dung */}
            <div className="p-8 space-y-5">
              <div>
                <label className="block text-base font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email
                </label>
                <div className="bg-slate-100 rounded-lg px-5 py-4 border border-slate-200 text-slate-800 text-lg font-semibold">
                  {profile.user?.email || 'N/A'}
                </div>
              </div>
              <div>
                <label className="block text-base font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Username
                </label>
                <div className="bg-slate-100 rounded-lg px-5 py-4 border border-slate-200 text-slate-800 font-mono text-lg font-semibold">
                  {profile.user?.username || 'N/A'}
                </div>
              </div>
              <div>
                <label className="block text-base font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Vai trò
                </label>
                <div className="bg-slate-100 rounded-lg px-5 py-4 border border-slate-200 text-slate-800 text-lg font-semibold capitalize">
                  {profile.user?.role || 'N/A'}
                </div>
              </div>
              <div>
                <label className="block text-base font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Ngày đăng ký
                </label>
                <div className="bg-slate-100 rounded-lg px-5 py-4 border border-slate-200 text-slate-800 text-lg font-semibold">
                  {profile.user?.createdAt ? new Date(profile.user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                </div>
              </div>
              {profile.user?.walletAddress && (
                <div>
                  <label className="block text-base font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Wallet Address
                  </label>
                  <div className="bg-slate-100 rounded-lg px-5 py-4 border border-slate-200 text-slate-800 font-mono text-sm break-all">
                    {profile.user.walletAddress}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bảng 2: Thông tin nhà thuốc */}
          {profile.pharmacy && (
            <div className="bg-white rounded-2xl border-2 border-[#7AC3DE] shadow-[0_4px_12px_rgba(122,195,222,0.12)] overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#4BADD1] to-[#7AC3DE] px-8 py-6 border-b-2 border-[#7AC3DE]">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg bg-white/20 backdrop-blur-sm">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Thông tin nhà thuốc
                    </h2>
                    <p className="text-white/90 mt-1">{profile.pharmacy.name || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Nội dung */}
              <div className="p-8 space-y-5">
                <div>
                  <label className="block text-base font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Tên nhà thuốc
                  </label>
                  <div className="bg-slate-100 rounded-lg px-5 py-4 border border-slate-200 text-slate-800 text-lg font-bold">
                    {profile.pharmacy.name || 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="block text-base font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Mã số thuế
                  </label>
                  <div className="bg-slate-100 rounded-lg px-5 py-4 border border-slate-200 text-slate-800 font-mono text-lg font-semibold">
                    {profile.pharmacy.taxCode || 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="block text-base font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Số giấy phép
                  </label>
                  <div className="bg-slate-100 rounded-lg px-5 py-4 border border-slate-200 text-slate-800 text-lg font-semibold">
                    {profile.pharmacy.licenseNo || 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="block text-base font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Email liên hệ
                  </label>
                  <div className="bg-slate-100 rounded-lg px-5 py-4 border border-slate-200 text-slate-800 text-lg font-semibold">
                    {profile.pharmacy.contactEmail || 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="block text-base font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    SĐT liên hệ
                  </label>
                  <div className="bg-slate-100 rounded-lg px-5 py-4 border border-slate-200 text-slate-800 text-lg font-semibold">
                    {profile.pharmacy.contactPhone || 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="block text-base font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Quốc gia
                  </label>
                  <div className="bg-slate-100 rounded-lg px-5 py-4 border border-slate-200 text-slate-800 text-lg font-semibold">
                    {profile.pharmacy.country || 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="block text-base font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Trạng thái
                  </label>
                  <div className="bg-slate-100 rounded-lg px-5 py-4 border border-slate-200">
                    <span className={`px-4 py-2 rounded-lg text-base font-semibold inline-block border-2 ${
                      profile.pharmacy.status === 'active' 
                        ? 'bg-white text-[#10B981] border-[#10B981]' 
                        : 'bg-white text-red-600 border-red-300'
                    }`}>
                      {profile.pharmacy.status === 'active' ? '✓ Active' : profile.pharmacy.status || 'N/A'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-base font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Địa chỉ
                  </label>
                  <div className="bg-slate-100 rounded-lg px-5 py-4 border border-slate-200 text-slate-800 text-lg font-semibold">
                    {profile.pharmacy.address || 'N/A'}
                  </div>
                </div>
                {profile.pharmacy.walletAddress && (
                  <div>
                    <label className="block text-base font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Địa chỉ ví
                    </label>
                    <div className="bg-slate-100 rounded-lg px-5 py-4 border border-slate-200 text-slate-800 font-mono text-sm break-all">
                      {profile.pharmacy.walletAddress}
                    </div>
                  </div>
                )}
                {(profile.pharmacy.createdAt || profile.pharmacy.updatedAt) && (
                  <div className="space-y-5">
                    {profile.pharmacy.createdAt && (
                      <div>
                        <label className="block text-base font-semibold text-slate-700 mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Ngày tạo
                        </label>
                        <div className="bg-slate-100 rounded-lg px-5 py-4 border border-slate-200 text-slate-800 text-base font-semibold">
                          {new Date(profile.pharmacy.createdAt).toLocaleString('vi-VN')}
                        </div>
                      </div>
                    )}
                    {profile.pharmacy.updatedAt && (
                      <div>
                        <label className="block text-base font-semibold text-slate-700 mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Cập nhật lần cuối
                        </label>
                        <div className="bg-slate-100 rounded-lg px-5 py-4 border border-slate-200 text-slate-800 text-base font-semibold">
                          {new Date(profile.pharmacy.updatedAt).toLocaleString('vi-VN')}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Thông báo readonly */}
          <motion.div className="bg-amber-50 rounded-2xl border-2 border-amber-200 p-6 text-center mt-6" variants={fadeUp} initial="hidden" animate="show">
            <div className="flex items-center justify-center gap-3 mb-3">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h3 className="text-lg font-bold text-amber-800">Chế độ chỉ xem</h3>
            </div>
            <p className="text-sm text-amber-700">Bạn không thể chỉnh sửa thông tin. Vui lòng liên hệ quản trị viên nếu cần cập nhật.</p>
          </motion.div>
        </motion.div>
      )}
    </DashboardLayout>
  );
}