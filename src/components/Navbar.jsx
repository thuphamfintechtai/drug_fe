import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-white shadow-sm border-b-2 border-cyan-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="text-lg font-bold text-cyan-600">DrugTrace</Link>

        <div className="flex items-center gap-3">
          {!isAuthenticated && (
            <>
              <Link to="/login" className="px-3 py-1.5 rounded-md border border-cyan-300 text-cyan-700 hover:bg-cyan-50">Đăng nhập</Link>
              <Link to="/register" className="px-3 py-1.5 rounded-md bg-cyan-600 text-white hover:bg-cyan-700">Đăng ký</Link>
            </>
          )}

          {isAuthenticated && (
            <>
              {user?.role === 'system_admin' && <Link to="/admin" className="px-3 py-1.5 rounded-md border border-cyan-300 text-cyan-700 hover:bg-cyan-50">Admin</Link>}
              {user?.role === 'pharma_company' && <Link to="/manufacturer" className="px-3 py-1.5 rounded-md border border-cyan-300 text-cyan-700 hover:bg-cyan-50">Nhà sản xuất</Link>}
              {user?.role === 'distributor' && <Link to="/distributor" className="px-3 py-1.5 rounded-md border border-cyan-300 text-cyan-700 hover:bg-cyan-50">Nhà phân phối</Link>}
              {user?.role === 'pharmacy' && <Link to="/pharmacy" className="px-3 py-1.5 rounded-md border border-cyan-300 text-cyan-700 hover:bg-cyan-50">Nhà thuốc</Link>}
              {user?.role === 'user' && <Link to="/user" className="px-3 py-1.5 rounded-md border border-cyan-300 text-cyan-700 hover:bg-cyan-50">Tài khoản</Link>}
              <button onClick={logout} className="px-3 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700">Đăng xuất</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
