import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import LogoutButton from './LogoutButton';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ 
        y: 0, 
        opacity: 1,
        backgroundColor: scrolled ? 'rgba(75, 173, 209, 0.95)' : 'rgba(75, 173, 209, 0.85)',
        backdropFilter: `blur(${scrolled ? 16 : 12}px)`,
      }}
      transition={{ 
        default: { duration: 0.6, ease: "easeOut" },
        backgroundColor: { duration: 0.3, ease: "easeOut" },
        backdropFilter: { duration: 0.3, ease: "easeOut" }
      }}
      className="fixed top-0 left-0 right-0 z-50 shadow-lg border-b border-[#4BADD1]/30"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center"
          >
            {isAuthenticated && user?.role === 'Distributor' && (
              <motion.span 
                className="text-sm font-medium text-white/90 mr-4 px-3 py-1 bg-white/20 rounded-lg backdrop-blur-sm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Nhà phân phối (Dashboard)
              </motion.span>
            )}
            <Link to="/" className="flex items-center gap-3 group">
              <motion.span 
                className="font-bold text-xl text-white drop-shadow-md tracking-tight"
                whileHover={{ 
                  scale: 1.05,
                  textShadow: "0 2px 8px rgba(255,255,255,0.5)"
                }}
              >
                DrugTrace
              </motion.span>
            </Link>
          </motion.div>

          <div className="hidden md:flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <motion.div 
                  whileHover={{ scale: 1.05, y: -2 }} 
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Link
                    to="/login"
                    className="px-5 py-2 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-lg transition shadow-lg border border-white/30"
                  >
                    Đăng nhập
                  </Link>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05, y: -2 }} 
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Link
                    to="/register-business"
                    className="px-5 py-2 bg-white text-[#4BADD1] font-semibold rounded-lg transition shadow-lg"
                  >
                    Đăng ký
                  </Link>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div 
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.svg 
                    className="w-6 h-6 text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </motion.svg>
                  <div>
                    <div className="text-sm font-semibold text-white">{user?.fullName || user?.username}</div>
                    <div className="text-xs text-white/80">{user?.role}</div>
                  </div>
                </motion.div>
                <button
                  onClick={handleLogout}
                  className="px-5 py-2 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition"
                >
                  Đăng xuất
                </button>
              </>
            )}
          </div>

          <motion.button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-white/20 transition text-white"
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1 }} // Thay vì rotate
            transition={{ duration: 0.3 }}
          >
            <motion.svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              animate={{ rotate: mobileMenuOpen ? 90 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </motion.svg>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-[#4BADD1]/98 backdrop-blur-xl border-t border-white/20"
          >
            <div className="px-4 py-4 space-y-3">
              {!isAuthenticated ? (
                <>
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full text-center px-4 py-3 text-white bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl font-medium transition border border-white/30"
                    >
                      Đăng nhập
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full text-center px-4 py-3 bg-white text-[#4BADD1] backdrop-blur-sm font-semibold rounded-xl border border-white/20 hover:bg-white/90 transition"
                    >
                      Đăng ký
                    </Link>
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.div 
                    className="flex items-center gap-3 p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.3)" }}
                  >
                    <motion.svg 
                      className="w-10 h-10 text-white" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </motion.svg>
                    <div>
                      <div className="text-sm font-semibold text-white">{user?.fullName || user?.username}</div>
                      <div className="text-xs text-white/80">{user?.role}</div>
                    </div>
                  </motion.div>
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
    </motion.nav>
  );
}