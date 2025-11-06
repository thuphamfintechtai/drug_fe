import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../utils/api';

export default function ForgotPasswordBusiness() {
  const [role, setRole] = useState('pharma_company');
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    taxCode: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const roles = [
    { value: 'pharma_company', label: '🏭 Nhà sản xuất', color: 'blue' },
    { value: 'distributor', label: '🚚 Nhà phân phối', color: 'green' },
    { value: 'pharmacy', label: '🏥 Nhà thuốc', color: 'purple' },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', {
        ...formData,
        role,
      });

      if (response.data.success) {
        setSuccess(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 px-4">
        <motion.div
          className="max-w-md w-full"
          initial="hidden"
          animate="show"
          variants={fadeUp}
        >
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
              <span className="text-5xl">✅</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Yêu cầu đã được gửi!</h2>
            <p className="text-slate-600 mb-6">
              Yêu cầu đặt lại mật khẩu của bạn đã được gửi đến Admin.
              Sau khi Admin phê duyệt, bạn sẽ nhận được email với mật khẩu mới.
            </p>
            <div className="space-y-3">
              <Link
                to="/login"
                className="block w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg transition"
              >
                Quay lại đăng nhập
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const selectedRole = roles.find(r => r.value === role);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 px-4 py-12">
      <motion.div
        className="max-w-2xl w-full"
        initial="hidden"
        animate="show"
        variants={fadeUp}
      >
          {/* Header */}
          <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg mb-4">
            <span className="text-4xl">🔐</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Quên mật khẩu doanh nghiệp</h1>
          <p className="text-slate-600">Gửi yêu cầu đặt lại mật khẩu (cần Admin phê duyệt)</p>
        </div>

        {/* Role Selector */}
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roles.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={`p-4 rounded-2xl border-2 transition ${
                  role === r.value
                    ? 'border-indigo-500 bg-indigo-50 shadow-lg scale-105'
                    : 'border-slate-200 bg-white hover:border-indigo-300'
                }`}
              >
                <div className="text-2xl mb-2">{r.label.split(' ')[0]}</div>
                <div className="font-semibold text-slate-800">{r.label.split(' ').slice(1).join(' ')}</div>
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

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email *
              </label>
              <input
                  type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="email@company.com"
                  required
                  disabled={loading}
              />
            </div>

            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Tên đăng nhập *
              </label>
              <input
                type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  placeholder="username"
                required
                  disabled={loading}
              />
            </div>

            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Mã số thuế *
              </label>
              <input
                  type="text"
                name="taxCode"
                value={formData.taxCode}
                onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  placeholder="0123456789"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  placeholder="0987654321"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition transform hover:scale-[1.02] active:scale-[0.98]`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Đang gửi yêu cầu...
                </span>
              ) : (
                'Gửi yêu cầu đặt lại mật khẩu'
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold hover:underline"
            >
              ← Quay lại đăng nhập
            </Link>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-indigo-50 rounded-2xl border border-indigo-200 p-4">
          <p className="text-sm text-indigo-800">
            <strong>⏳ Lưu ý:</strong> Yêu cầu của bạn sẽ được gửi đến Admin để xác minh thông tin. 
            Sau khi được phê duyệt, bạn sẽ nhận được email chứa mật khẩu mới tạm thời. 
            Bạn có thể đăng nhập và đổi mật khẩu sau đó.
          </p>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-sm text-slate-600 hover:text-slate-800 font-medium hover:underline"
          >
            ← Về trang chủ
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
