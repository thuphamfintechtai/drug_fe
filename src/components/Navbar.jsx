import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition">
              <span className="text-2xl">💊</span>
            </div>
            <span className="font-bold text-xl text-slate-800 hidden sm:block">
              Drug Traceability
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-slate-700 hover:text-blue-600 font-medium transition"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg transition transform hover:scale-105"
                >
                  Đăng ký
                </Link>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl">
                  <span className="text-2xl">👤</span>
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{user?.fullName || user?.username}</div>
                    <div className="text-xs text-slate-500">{user?.role}</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-5 py-2 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition"
                >
                  Đăng xuất
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-slate-200"
          >
            <div className="px-4 py-4 space-y-3">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center px-4 py-3 text-slate-700 hover:bg-slate-100 rounded-xl font-medium transition"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl"
                  >
                    Đăng ký
                  </Link>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 p-3 bg-slate-100 rounded-xl">
                    <span className="text-3xl">👤</span>
                    <div>
                      <div className="text-sm font-semibold text-slate-800">{user?.fullName || user?.username}</div>
                      <div className="text-xs text-slate-500">{user?.role}</div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="block w-full px-4 py-3 bg-red-500 text-white font-semibold rounded-xl"
                  >
                    Đăng xuất
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
