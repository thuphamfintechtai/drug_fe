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
    { 
      value: 'pharma_company', 
      label: 'Nhà sản xuất',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 2.18l8 4v8.18c0 4.24-2.8 8.18-8 9.82-5.2-1.64-8-5.58-8-9.82V8.18l8-4z"/>
          <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
        </svg>
      )
    },
    { 
      value: 'distributor', 
      label: 'Nhà phân phối',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
        </svg>
      )
    },
    { 
      value: 'pharmacy', 
      label: 'Nhà thuốc',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
          <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
        </svg>
      )
    },
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#4BADD1]/5 via-white to-slate-50/50 px-4">
        <motion.div
          className="max-w-md w-full"
          initial="hidden"
          animate="show"
          variants={fadeUp}
        >
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#4BADD1]/10 mb-6">
              <svg className="w-10 h-10 text-[#4BADD1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Yêu cầu đã được gửi!</h2>
            <p className="text-slate-600 mb-6">
              Yêu cầu đặt lại mật khẩu của bạn đã được gửi đến Admin.
              Sau khi Admin phê duyệt, bạn sẽ nhận được email với mật khẩu mới.
            </p>
            <div className="space-y-3">
              <Link
                to="/login"
                className="block w-full py-3 bg-[#4BADD1] text-white font-semibold rounded-xl hover:bg-[#3a9db8] hover:shadow-lg transition"
              >
                Quay lại đăng nhập
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#4BADD1]/5 via-white to-slate-50/50 px-4 py-12">
      <motion.div
        className="max-w-2xl w-full"
        initial="hidden"
        animate="show"
        variants={fadeUp}
      >
          {/* Header */}
          <div className="text-center mb-8">
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
                className={`p-4 rounded-2xl border-2 transition flex flex-col items-center ${
                  role === r.value
                    ? 'border-[#4BADD1] bg-[#4BADD1]/10 shadow-lg scale-105'
                    : 'border-slate-200 bg-white hover:border-[#4BADD1]/50'
                }`}
              >
                <div className={`mb-2 ${role === r.value ? 'text-[#4BADD1]' : 'text-slate-800'}`}>
                  {r.icon}
                </div>
                <div className={`font-semibold text-center ${role === r.value ? 'text-[#4BADD1]' : 'text-slate-800'}`}>
                  {r.label}
                </div>
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
              className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-2"
            >
              <svg className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <p className="text-red-700 text-sm font-medium">{error}</p>
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
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4BADD1] focus:border-[#4BADD1] transition"
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
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4BADD1] focus:border-[#4BADD1] transition"
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
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4BADD1] focus:border-[#4BADD1] transition"
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
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4BADD1] focus:border-[#4BADD1] transition"
                  placeholder="0987654321"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#4BADD1] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:bg-[#3a9db8] disabled:opacity-50 disabled:cursor-not-allowed transition transform hover:scale-[1.02] active:scale-[0.98]"
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
              className="text-sm text-[#4BADD1] hover:text-[#3a9db8] font-semibold hover:underline"
            >
              ← Quay lại đăng nhập
            </Link>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 rounded-2xl border border-blue-200 p-4">
          <p className="text-sm text-blue-800 flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-800 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              <strong>Lưu ý:</strong> Yêu cầu của bạn sẽ được gửi đến Admin để xác minh thông tin. 
              Sau khi được phê duyệt, bạn sẽ nhận được email chứa mật khẩu mới tạm thời. 
              Bạn có thể đăng nhập và đổi mật khẩu sau đó.
            </span>
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
