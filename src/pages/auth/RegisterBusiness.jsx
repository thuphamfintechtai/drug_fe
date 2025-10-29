import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RegisterBusiness() {
  const [role, setRole] = useState('pharma_company');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    country: '',
    address: '',
    walletAddress: '',
    name: '',
    licenseNo: '',
    taxCode: '',
    gmpCertNo: '', // Only for pharma_company
    contactEmail: '',
    contactPhone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setError('');
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
      const { confirmPassword, ...registerData } = formData;
      const result = await register(registerData, role);
      
      if (result.success) {
        alert(result.message || 'Đăng ký thành công! Tài khoản đang chờ admin duyệt.');
        navigate('/login');
      } else {
        setError(result.message || 'Đăng ký thất bại');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const roleLabels = {
    pharma_company: 'Nhà Sản Xuất Dược Phẩm',
    distributor: 'Nhà Phân Phối',
    pharmacy: 'Nhà Thuốc',
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-teal-50 to-cyan-100 px-4 py-8">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl border-t-4 border-cyan-500 p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-cyan-700 mb-2">Đăng Ký Doanh Nghiệp</h1>
          <p className="text-gray-600">Chọn loại doanh nghiệp của bạn</p>
        </div>

        {/* Role Selection */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          {Object.entries(roleLabels).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => handleRoleChange(value)}
              className={`py-3 px-4 rounded-lg border-2 font-medium transition ${
                role === value
                  ? 'border-cyan-600 bg-cyan-50 text-cyan-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Personal Information */}
          <div className="border-b border-gray-200 pb-4 mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cá nhân</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Tên đăng nhập *
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Xác nhận mật khẩu *
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên *
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại *
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                  Quốc gia *
                </label>
                <input
                  id="country"
                  name="country"
                  type="text"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ ví (Wallet)
                </label>
                <input
                  id="walletAddress"
                  name="walletAddress"
                  type="text"
                  value={formData.walletAddress}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:border-transparent outline-none"
                  placeholder="0x..."
                />
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Địa chỉ *
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Company Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin doanh nghiệp</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Tên doanh nghiệp *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label htmlFor="licenseNo" className="block text-sm font-medium text-gray-700 mb-1">
                  Số giấy phép *
                </label>
                <input
                  id="licenseNo"
                  name="licenseNo"
                  type="text"
                  value={formData.licenseNo}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus-border-transparent outline-none"
                />
              </div>

              <div>
                <label htmlFor="taxCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Mã số thuế *
                </label>
                <input
                  id="taxCode"
                  name="taxCode"
                  type="text"
                  value={formData.taxCode}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus-border-transparent outline-none"
                />
              </div>

              {role === 'pharma_company' && (
                <div>
                  <label htmlFor="gmpCertNo" className="block text-sm font-medium text-gray-700 mb-1">
                    Số chứng nhận GMP *
                  </label>
                  <input
                    id="gmpCertNo"
                    name="gmpCertNo"
                    type="text"
                    value={formData.gmpCertNo}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus-border-transparent outline-none"
                  />
                </div>
              )}

              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Email liên hệ *
                </label>
                <input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus-border-transparent outline-none"
                />
              </div>

              <div>
                <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại liên hệ *
                </label>
                <input
                  id="contactPhone"
                  name="contactPhone"
                  type="tel"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus-border-transparent outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Đang đăng ký...' : `Đăng Ký ${roleLabels[role]}`}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-cyan-600 hover:text-cyan-800 font-medium">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
