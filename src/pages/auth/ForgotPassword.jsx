import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const response = await authService.forgotPassword(email);
      if (response.success) {
        setSuccess(true);
      } else {
        setError(response.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-teal-50 to-cyan-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border-t-4 border-cyan-500 p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-cyan-700 mb-2">Quên Mật Khẩu</h1>
          <p className="text-gray-600">
            {success 
              ? 'Chúng tôi đã gửi email hướng dẫn reset mật khẩu cho bạn'
              : 'Nhập email của bạn để nhận link reset mật khẩu'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {success ? (
          <div className="space-y-6">
            <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium">Email đã được gửi thành công!</p>
                  <p className="text-sm mt-1">
                    Chúng tôi đã gửi link reset mật khẩu đến <strong>{email}</strong>. 
                    Vui lòng kiểm tra hộp thư đến của bạn (bao gồm cả thư mục spam).
                  </p>
                  <p className="text-sm mt-2 text-green-600">
                    Link sẽ hết hạn sau 15 phút.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setSuccess(false);
                  setEmail('');
                  setError('');
                }}
                className="w-full bg-cyan-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 transition"
              >
                Gửi lại email
              </button>
              <Link
                to="/login"
                className="block text-center text-sm text-cyan-600 hover:text-cyan-800"
              >
                Quay lại trang đăng nhập
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email đăng ký
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
                placeholder="nhap@email.com"
                disabled={loading}
              />
              <p className="mt-2 text-sm text-gray-500">
                Nhập email bạn đã sử dụng để đăng ký tài khoản
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </span>
              ) : (
                'Gửi email reset mật khẩu'
              )}
            </button>

            <div className="text-center">
              <Link to="/login" className="text-sm text-cyan-600 hover:text-cyan-800">
                ← Quay lại trang đăng nhập
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

