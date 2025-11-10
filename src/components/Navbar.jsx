import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { useMetaMask } from "../hooks/useMetaMask";
import toast from "react-hot-toast";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const {
    account,
    isConnected,
    isInstalled,
    isConnecting,
    connect,
    disconnect,
    chainId,
  } = useMetaMask();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);


  const handleLogout = async () => {
    setDropdownOpen(false);
    // Disconnect MetaMask trước khi logout
    if (isConnected) {
      await disconnect();
      toast.success("Đã ngắt kết nối MetaMask");
    }
    // Sau đó logout khỏi hệ thống
    await logout();
    // Redirect về trang chủ
    navigate("/");
  };

  const handleConnectMetaMask = async () => {
    if (!isInstalled) {
      toast.error(
        "MetaMask chưa được cài đặt. Vui lòng cài đặt MetaMask extension."
      );
      window.open("https://metamask.io/download/", "_blank");
      return;
    }

    const success = await connect();
    if (success) {
      toast.success("Đã kết nối với MetaMask!");
    } else {
      toast.error("Không thể kết nối với MetaMask.");
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleWalletClick = () => {
    setDropdownOpen(false);
    // Dispatch custom event để UserHome mở modal
    window.dispatchEvent(new CustomEvent('openWalletModal'));
  };

  const getProfileRoute = () => {
    if (!user?.role) return "/";
    const roleMap = {
      system_admin: "/admin",
      pharma_company: "/manufacturer/profile",
      distributor: "/distributor/profile",
      pharmacy: "/pharmacy/profile",
    };
    return roleMap[user.role] || "/";
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{
        y: 0,
        opacity: 1,
        backgroundColor: scrolled ? "rgba(75, 173, 209, 0.95)" : "#077ca3",
        backdropFilter: `blur(${scrolled ? 16 : 12}px)`,
      }}
      transition={{
        default: { duration: 0.6, ease: "easeOut" },
        backgroundColor: { duration: 0.3, ease: "easeOut" },
        backdropFilter: { duration: 0.3, ease: "easeOut" },
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
            {isAuthenticated && user?.role === "Distributor" && (
              <motion.span
                className="text-sm font-medium !text-white/90 mr-4 px-3 py-1 bg-white/20 rounded-lg backdrop-blur-sm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Nhà phân phối (Dashboard)
              </motion.span>
            )}
            <Link to="/" className="flex items-center gap-3 group">
              <motion.span
                className="font-bold text-xl !text-white drop-shadow-md tracking-tight"
                whileHover={{
                  scale: 1.05,
                  textShadow: "0 2px 8px rgba(255,255,255,0.5)",
                }}
              >
                DrugTrace
              </motion.span>
            </Link>
          </motion.div>

          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <Link
                to="/login"
                className="px-4 md:px-6 py-1.5 md:py-1 text-base md:text-lg bg-white text-gray-900 font-semibold rounded-lg shadow-md hover:bg-gray-50 transition-colors duration-200"
              >
                Đăng nhập
              </Link>
            ) : (
              <div className="relative" ref={dropdownRef}>
                {/* Nút tròn màu vàng */}
                <motion.button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-10 h-10 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 border-2 border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-200 flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500"></div>
                </motion.button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-72 md:w-80 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden z-50"
                    >
                      <div className="p-4 space-y-4">
                        {/* Email */}
                        {user?.email && (
                          <div className="text-gray-900 text-sm font-medium">
                            {user.email}
                          </div>
                        )}

                        {/* Wallet Address */}
                        {isConnected && account ? (
                          <button
                            onClick={handleWalletClick}
                            className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                          >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center flex-shrink-0">
                              <svg
                                className="w-6 h-6 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <div className="text-gray-900 text-sm font-mono">
                                {formatAddress(account)}
                              </div>
                              <div className="h-1 bg-gray-300 rounded-full mt-1"></div>
                            </div>
                          </button>
                        ) : (
                          <button
                            onClick={handleConnectMetaMask}
                            disabled={isConnecting || !isInstalled}
                            className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center flex-shrink-0">
                              <svg
                                className="w-6 h-6 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                              </svg>
                            </div>
                            <span className="text-gray-900 text-sm">
                              {isConnecting
                                ? "Đang kết nối..."
                                : "Kết nối MetaMask"}
                            </span>
                          </button>
                        )}

                        {/* Menu Items */}
                        <div className="space-y-1">
                          <button
                            onClick={() => {
                              setDropdownOpen(false);
                              navigate(getProfileRoute());
                            }}
                            className="w-full text-left px-4 py-2 text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                          >
                            Tài khoản của tôi
                          </button>

                          <button
                            onClick={() => {
                              setDropdownOpen(false);
                              if (isConnected) {
                                // Dispatch event để UserHome mở modal
                                window.dispatchEvent(new CustomEvent('openWalletModal'));
                              } else {
                                handleConnectMetaMask();
                              }
                            }}
                            className="w-full text-left px-4 py-2 text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                          >
                            Ví của tôi
                          </button>

                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-between px-4 py-2 text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                          >
                            <span>Đăng xuất</span>
                            <svg
                              className="w-4 h-4 text-gray-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
