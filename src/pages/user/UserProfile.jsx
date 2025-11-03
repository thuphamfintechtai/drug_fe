import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import userService from '../../services/user/userService';

export default function UserProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const navigationItems = [
    { path: '/user', label: 'Tổng quan', active: false },
    { path: '/user/nft-tracking', label: 'Tra cứu NFT', active: false },
    { path: '/user/drugs', label: 'Thông tin thuốc', active: false },
    { path: '/user/profile', label: 'Hồ sơ', active: true },
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
        setFormData({
          fullName: response.data.fullName || '',
          phone: response.data.phone || '',
        });
      }
    } catch (error) {
      console.error('Lỗi khi tải hồ sơ:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      const response = await userService.updateProfile(formData);
      if (response.success) {
        alert('✅ Cập nhật thông tin thành công!');
        setIsEditing(false);
        loadProfile();
      }
    } catch (error) {
      console.error('Lỗi:', error);
      alert('❌ Không thể cập nhật: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('❌ Mật khẩu mới không khớp!');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert('❌ Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }

    try {
      setLoading(true);
      const response = await userService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      if (response.success) {
        alert('✅ Đổi mật khẩu thành công!');
        setShowChangePassword(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      console.error('Lỗi:', error);
      alert('❌ Không thể đổi mật khẩu: ' + (error.response?.data?.message || error.message));
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
        className="relative overflow-hidden rounded-2xl mb-6 border border-[#90e0ef33] shadow-[0_10px_30px_rgba(0,0,0,0.06)] bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.25),transparent_55%)]" />
        <div className="relative px-6 py-8 md:px-10 md:py-12 text-white">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight drop-shadow-sm">👤 Hồ sơ cá nhân</h1>
          <p className="text-white/90 mt-2">Quản lý thông tin tài khoản và mật khẩu</p>
        </div>
      </motion.section>

      {loading && !profile ? (
        <div className="bg-white/90 rounded-2xl border border-[#90e0ef55] p-10 text-center">
          <div className="text-lg text-slate-600">Đang tải thông tin...</div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Thông tin cá nhân */}
          <motion.div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-[#90e0ef55] shadow-[0_10px_24px_rgba(0,0,0,0.05)] p-6" variants={fadeUp} initial="hidden" animate="show">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {profile?.fullName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#003544]">{profile?.fullName || 'N/A'}</h2>
                  <p className="text-slate-600">{profile?.email || 'N/A'}</p>
                </div>
              </div>
              
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 text-sm font-medium transition shadow"
                >
                  ✏️ Chỉnh sửa
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        fullName: profile?.fullName || '',
                        phone: profile?.phone || '',
                      });
                    }}
                    className="px-4 py-2 rounded-lg border-2 border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-medium transition"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleUpdateProfile}
                    disabled={loading}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700 text-sm font-medium transition shadow disabled:opacity-50"
                  >
                    💾 Lưu
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200 p-4">
                <div className="text-sm text-blue-700 mb-2">👤 Họ và tên</div>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full border-2 border-blue-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                ) : (
                  <div className="font-semibold text-blue-900">{profile?.fullName || 'N/A'}</div>
                )}
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-4">
                <div className="text-sm text-purple-700 mb-2">📱 Số điện thoại</div>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border-2 border-purple-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                ) : (
                  <div className="font-semibold text-purple-900">{profile?.phone || 'Chưa cập nhật'}</div>
                )}
              </div>

              <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl border border-slate-200 p-4">
                <div className="text-sm text-slate-700 mb-2">📧 Email</div>
                <div className="font-semibold text-slate-900 truncate">{profile?.email || 'N/A'}</div>
                <div className="text-xs text-slate-500 mt-1">Không thể thay đổi</div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-200 p-4">
                <div className="text-sm text-amber-700 mb-2">📅 Ngày tham gia</div>
                <div className="font-semibold text-amber-900">
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Đổi mật khẩu */}
          <motion.div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-[#90e0ef55] shadow-[0_10px_24px_rgba(0,0,0,0.05)] p-6" variants={fadeUp} initial="hidden" animate="show">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span>🔒</span> Bảo mật
              </h3>
              {!showChangePassword && (
                <button
                  onClick={() => setShowChangePassword(true)}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 text-sm font-medium transition shadow"
                >
                  🔑 Đổi mật khẩu
                </button>
              )}
            </div>

            {showChangePassword && (
              <div className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full border-2 border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu mới</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full border-2 border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full border-2 border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => {
                      setShowChangePassword(false);
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    }}
                    className="px-4 py-2 rounded-lg border-2 border-slate-300 text-slate-700 hover:bg-slate-100 font-medium transition"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleChangePassword}
                    disabled={loading}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 font-medium transition shadow disabled:opacity-50"
                  >
                    {loading ? 'Đang xử lý...' : '✓ Đổi mật khẩu'}
                  </button>
                </div>
              </div>
            )}

            {!showChangePassword && (
              <div className="text-sm text-slate-600">
                <p>💡 Đổi mật khẩu định kỳ để bảo mật tài khoản</p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}

