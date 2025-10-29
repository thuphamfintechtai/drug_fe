import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        const userRole = result.data.user.role;
        switch (userRole) {
          case 'system_admin':
            navigate('/admin');
            break;
          case 'pharma_company':
            navigate('/manufacturer');
            break;
          case 'distributor':
            navigate('/distributor');
            break;
          case 'pharmacy':
            navigate('/pharmacy');
            break;
          default:
            navigate('/user');
        }
      } else {
        setError(result.message || 'Đăng nhập thất bại');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-teal-50 to-cyan-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border-t-4 border-cyan-500 p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-cyan-700 mb-2">Đăng Nhập</h1>
          <p className="text-gray-600">Chào mừng bạn trở lại</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
              placeholder="nhap@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
              placeholder="Nhập mật khẩu"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/forgot-password" className="text-sm text-cyan-600 hover:text-cyan-800">
            Quên mật khẩu?
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-center text-sm text-gray-600 mb-4">
            Chưa có tài khoản?
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/register"
              className="text-center py-2 px-4 border border-cyan-300 rounded-lg text-sm font-medium text-cyan-700 hover:bg-cyan-50 transition"
            >
              Đăng ký User
            </Link>
            <Link
              to="/register-business"
              className="text-center py-2 px-4 border border-cyan-300 rounded-lg text-sm font-medium text-cyan-700 hover:bg-cyan-50 transition"
            >
              Đăng ký Doanh nghiệp
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
