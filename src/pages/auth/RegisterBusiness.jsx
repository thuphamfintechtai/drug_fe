import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../utils/api';

export default function RegisterBusiness() {
  const [businessType, setBusinessType] = useState('pharma_company');
  const [formData, setFormData] = useState({
    // User info
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    walletAddress: '',
    
    // Company info
    name: '',
    taxCode: '',
    address: '',
    companyEmail: '',
    companyPhone: '',
    website: '',
    licenseNumber: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const businessTypes = [
    { value: 'pharma_company', label: '🏭 Nhà sản xuất dược phẩm', color: 'from-blue-600 to-cyan-600' },
    { value: 'distributor', label: '🚚 Nhà phân phối', color: 'from-green-600 to-emerald-600' },
    { value: 'pharmacy', label: '🏥 Nhà thuốc', color: 'from-purple-600 to-pink-600' },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, companyEmail, companyPhone, ...registerData } = formData;
      
      const payload = {
        ...registerData,
        company: {
          name: registerData.name,
          taxCode: registerData.taxCode,
          address: registerData.address,
          email: companyEmail,
          phone: companyPhone,
          website: registerData.website,
          licenseNumber: registerData.licenseNumber,
          description: registerData.description,
        }
      };

      // Remove company fields from root
      delete payload.name;
      delete payload.taxCode;
      delete payload.address;
      delete payload.website;
      delete payload.licenseNumber;
      delete payload.description;

      const response = await api.post(`/auth/register/${businessType}`, payload);
      
      if (response.data.success) {
        alert('✅ Đăng ký thành công! Vui lòng chờ admin phê duyệt.');
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  const selectedType = businessTypes.find(t => t.value === businessType);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 px-4 py-12">
      <motion.div
        className="max-w-4xl w-full"
        initial="hidden"
        animate="show"
        variants={fadeUp}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-600 shadow-lg mb-4">
            <span className="text-4xl">🏢</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Đăng ký doanh nghiệp</h1>
          <p className="text-slate-600">Tham gia hệ thống truy xuất nguồn gốc thuốc</p>
        </div>

        {/* Business Type Selector */}
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {businessTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setBusinessType(type.value)}
                className={`p-4 rounded-2xl border-2 transition ${
                  businessType === type.value
                    ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                    : 'border-slate-200 bg-white hover:border-blue-300'
                }`}
              >
                <div className="text-2xl mb-2">{type.label.split(' ')[0]}</div>
                <div className="font-semibold text-slate-800">{type.label.split(' ').slice(1).join(' ')}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 p-8">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl"
            >
              <p className="text-red-700 text-sm font-medium">❌ {error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section: Thông tin tài khoản */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span>👤</span> Thông tin tài khoản
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Họ và tên *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Tên đăng nhập *</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Số điện thoại *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Mật khẩu *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition pr-12"
                      required
                      minLength={6}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Xác nhận mật khẩu *</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Section: Thông tin doanh nghiệp */}
            <div className="pt-6 border-t border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span>🏢</span> Thông tin doanh nghiệp
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Tên doanh nghiệp *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Mã số thuế *</label>
                  <input
                    type="text"
                    name="taxCode"
                    value={formData.taxCode}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Số giấy phép</label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    disabled={loading}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Địa chỉ *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email doanh nghiệp</label>
                  <input
                    type="email"
                    name="companyEmail"
                    value={formData.companyEmail}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">SĐT doanh nghiệp</label>
                  <input
                    type="tel"
                    name="companyPhone"
                    value={formData.companyPhone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Website</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Địa chỉ ví (Wallet)</label>
                  <input
                    type="text"
                    name="walletAddress"
                    value={formData.walletAddress}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    placeholder="0x..."
                    disabled={loading}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Mô tả</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    rows="3"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 bg-gradient-to-r ${selectedType.color} text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition transform hover:scale-[1.02] active:scale-[0.98]`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Đang gửi đăng ký...
                </span>
              ) : (
                'Gửi đăng ký'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-slate-600">
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 rounded-2xl border border-blue-200 p-4">
          <p className="text-sm text-blue-800">
            <strong>⏳ Lưu ý:</strong> Sau khi gửi đăng ký, tài khoản của bạn cần được Admin phê duyệt. 
            Bạn sẽ nhận được thông báo qua email khi tài khoản được kích hoạt.
          </p>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-slate-600 hover:text-slate-800 font-medium hover:underline">
            ← Về trang chủ
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
