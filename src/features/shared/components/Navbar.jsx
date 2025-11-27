/* eslint-disable no-undef */
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { useMetaMask } from "../hooks/useMetaMask";
import { useAuthStore } from "../../auth/store";
import { clearAuthCookies } from "../../auth/utils/cookieUtils";
import { toast } from "sonner";

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
    if (isConnected) {
      await disconnect();
    }
    useAuthStore.getState().clearAuthState();
    clearAuthCookies();
    navigate("/", { replace: true });
    try {
      await logout();
    } catch (error) {
      console.error("Logout API error:", error);
    }
  };

  const handleConnectMetaMask = async () => {
    // Nếu đã kết nối, ngắt kết nối
    if (isConnected) {
      await disconnect();
      toast.success("Đã ngắt kết nối với MetaMask");
      return;
    }

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
    if (!addr) {
      return "";
    }
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleWalletClick = () => {
    setDropdownOpen(false);
    // Dispatch custom event để UserHome mở modal
    window.dispatchEvent(new CustomEvent("openWalletModal"));
  };

  const getProfileRoute = () => {
    if (!user?.role) {
      return "/";
    }
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-3 flex-row w-[52vh] sm:w-full justify-between sm:items-center py-3 sm:h-16">
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
              <>
                <button
                  type="button"
                  onClick={handleConnectMetaMask}
                  disabled={isConnecting || (!isInstalled && !isConnected)}
                  className=" bg-transparent hover:bg-white/10 rounded-lg transition-colors duration-200 inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 507.83 470.86"
                    className="w-7 h-7 md:w-7 md:h-7 flex-shrink-0"
                  >
                    <defs>
                      <style>{`
                        .a{fill:#e2761b;stroke:#e2761b;}
                        .a,.b,.c,.d,.e,.f,.g,.h,.i,.j{stroke-linecap:round;stroke-linejoin:round;}
                        .b{fill:#e4761b;stroke:#e4761b;}
                        .c{fill:#d7c1b3;stroke:#d7c1b3;}
                        .d{fill:#233447;stroke:#233447;}
                        .e{fill:#cd6116;stroke:#cd6116;}
                        .f{fill:#e4751f;stroke:#e4751f;}
                        .g{fill:#f6851b;stroke:#f6851b;}
                        .h{fill:#c0ad9e;stroke:#c0ad9e;}
                        .i{fill:#161616;stroke:#161616;}
                        .j{fill:#763d16;stroke:#763d16;}
                      `}</style>
                    </defs>
                    <title>metamask</title>
                    <polygon
                      className="a"
                      points="482.09 0.5 284.32 147.38 320.9 60.72 482.09 0.5"
                    />
                    <polygon
                      className="b"
                      points="25.54 0.5 221.72 148.77 186.93 60.72 25.54 0.5"
                    />
                    <polygon
                      className="b"
                      points="410.93 340.97 358.26 421.67 470.96 452.67 503.36 342.76 410.93 340.97"
                    />
                    <polygon
                      className="b"
                      points="4.67 342.76 36.87 452.67 149.57 421.67 96.9 340.97 4.67 342.76"
                    />
                    <polygon
                      className="b"
                      points="143.21 204.62 111.8 252.13 223.7 257.1 219.73 136.85 143.21 204.62"
                    />
                    <polygon
                      className="b"
                      points="364.42 204.62 286.91 135.46 284.32 257.1 396.03 252.13 364.42 204.62"
                    />
                    <polygon
                      className="b"
                      points="149.57 421.67 216.75 388.87 158.71 343.55 149.57 421.67"
                    />
                    <polygon
                      className="b"
                      points="290.88 388.87 358.26 421.67 348.92 343.55 290.88 388.87"
                    />
                    <polygon
                      className="c"
                      points="358.26 421.67 290.88 388.87 296.25 432.8 295.65 451.28 358.26 421.67"
                    />
                    <polygon
                      className="c"
                      points="149.57 421.67 212.18 451.28 211.78 432.8 216.75 388.87 149.57 421.67"
                    />
                    <polygon
                      className="d"
                      points="213.17 314.54 157.12 298.04 196.67 279.95 213.17 314.54"
                    />
                    <polygon
                      className="d"
                      points="294.46 314.54 310.96 279.95 350.71 298.04 294.46 314.54"
                    />
                    <polygon
                      className="e"
                      points="149.57 421.67 159.11 340.97 96.9 342.76 149.57 421.67"
                    />
                    <polygon
                      className="e"
                      points="348.72 340.97 358.26 421.67 410.93 342.76 348.72 340.97"
                    />
                    <polygon
                      className="e"
                      points="396.03 252.13 284.32 257.1 294.66 314.54 311.16 279.95 350.91 298.04 396.03 252.13"
                    />
                    <polygon
                      className="e"
                      points="157.12 298.04 196.87 279.95 213.17 314.54 223.7 257.1 111.8 252.13 157.12 298.04"
                    />
                    <polygon
                      className="f"
                      points="111.8 252.13 158.71 343.55 157.12 298.04 111.8 252.13"
                    />
                    <polygon
                      className="f"
                      points="350.91 298.04 348.92 343.55 396.03 252.13 350.91 298.04"
                    />
                    <polygon
                      className="f"
                      points="223.7 257.1 213.17 314.54 226.29 382.31 229.27 293.07 223.7 257.1"
                    />
                    <polygon
                      className="f"
                      points="284.32 257.1 278.96 292.87 281.34 382.31 294.66 314.54 284.32 257.1"
                    />
                    <polygon
                      className="g"
                      points="294.66 314.54 281.34 382.31 290.88 388.87 348.92 343.55 350.91 298.04 294.66 314.54"
                    />
                    <polygon
                      className="g"
                      points="157.12 298.04 158.71 343.55 216.75 388.87 226.29 382.31 213.17 314.54 157.12 298.04"
                    />
                    <polygon
                      className="h"
                      points="295.65 451.28 296.25 432.8 291.28 428.42 216.35 428.42 211.78 432.8 212.18 451.28 149.57 421.67 171.43 439.55 215.75 470.36 291.88 470.36 336.4 439.55 358.26 421.67 295.65 451.28"
                    />
                    <polygon
                      className="i"
                      points="290.88 388.87 281.34 382.31 226.29 382.31 216.75 388.87 211.78 432.8 216.35 428.42 291.28 428.42 296.25 432.8 290.88 388.87"
                    />
                    <polygon
                      className="j"
                      points="490.44 156.92 507.33 75.83 482.09 0.5 290.88 142.41 364.42 204.62 468.37 235.03 491.43 208.2 481.49 201.05 497.39 186.54 485.07 177 500.97 164.87 490.44 156.92"
                    />
                    <polygon
                      className="j"
                      points="0.5 75.83 17.39 156.92 6.66 164.87 22.56 177 10.44 186.54 26.34 201.05 16.4 208.2 39.26 235.03 143.21 204.62 216.75 142.41 25.54 0.5 0.5 75.83"
                    />
                    <polygon
                      className="g"
                      points="468.37 235.03 364.42 204.62 396.03 252.13 348.92 343.55 410.93 342.76 503.36 342.76 468.37 235.03"
                    />
                    <polygon
                      className="g"
                      points="143.21 204.62 39.26 235.03 4.67 342.76 96.9 342.76 158.71 343.55 111.8 252.13 143.21 204.62"
                    />
                    <polygon
                      className="g"
                      points="284.32 257.1 290.88 142.41 321.1 60.72 186.93 60.72 216.75 142.41 223.7 257.1 226.09 293.27 226.29 382.31 281.34 382.31 281.74 293.27 284.32 257.1"
                    />
                  </svg>
                </button>
                <Link
                  to="/login"
                  className="px-4 md:px-6 py-1.5 md:py-1 text-base md:text-lg bg-white text-gray-900 font-semibold rounded-lg shadow-md hover:bg-gray-50 transition-colors duration-200"
                >
                  Đăng nhập
                </Link>
              </>
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
                                window.dispatchEvent(
                                  new CustomEvent("openWalletModal")
                                );
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
