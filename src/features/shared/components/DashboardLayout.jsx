/* eslint-disable no-undef */
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth";
import { useAuthStore } from "../../auth/store";
import { clearAuthCookies } from "../../auth/utils/cookieUtils";
import {
  connectWallet,
  isWalletConnected,
  getCurrentWalletAddress,
  isMetaMaskInstalled,
  disconnectWallet,
} from "../../utils/web3Helper";
import LogoutButton from "./LogoutButton";
import { toast } from "sonner";

const MetricCard = ({ title, value, subtitle, detail, color }) => {
  const colorClasses = {
    blue: "text-blue-600",
    red: "text-red-600",
    orange: "text-orange-600",
    green: "text-green-600",
    cyan: "text-cyan-600",
  };

  return (
    <div className="p-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200 relative transition-shadow duration-200 hover:shadow-[0_6px_20px_rgba(2,132,199,0.08)]">
      <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-150">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>
      <h3 className="text-sm font-medium text-slate-600 mb-2">{title}</h3>
      <p
        className={`text-4xl font-bold ${
          colorClasses[color] || colorClasses.cyan
        } mb-1`}
      >
        {value}
      </p>
      <p className="text-sm text-slate-500 mb-2">{subtitle}</p>
      <p className="text-xs text-slate-400">{detail}</p>
    </div>
  );
};

export default function DashboardLayout({
  welcomeMessage,
  metrics = [],
  navigationItems = [],
  children,
}) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidebarOpen");
    return saved === null ? true : saved === "true";
  });
  const navigate = useNavigate();
  const location = useLocation();
  const [walletAddress, setWalletAddress] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [showLabels, setShowLabels] = useState(() => {
    const saved = localStorage.getItem("sidebarOpen");
    const initialOpen = saved === null ? true : saved === "true";
    return initialOpen;
  });

  const adminNavigationItems = [
    {
      path: "/admin",
      label: "Trang chủ",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 9.75L12 3l9 6.75V20a1 1 0 01-1 1h-5.25a1 1 0 01-1-1v-4.5h-3.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.75z"
          />
        </svg>
      ),
    },
    {
      path: "/admin/registrations",
      label: "Duyệt đăng ký",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12.75l2.25 2.25L15.75 10.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      path: "/admin/drugs",
      label: "Quản lý thuốc",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7.5h18M7.5 3v18M6 12h12M12 6v12"
          />
        </svg>
      ),
    },
    {
      path: "/admin/supply-chain",
      label: "Lịch sử chuỗi cung ứng",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h10M4 18h7"
          />
        </svg>
      ),
    },
    {
      path: "/admin/distribution",
      label: "Lịch sử phân phối",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7h18M6 12h12M10 17h8"
          />
        </svg>
      ),
    },
    {
      path: "/admin/password-reset-requests",
      label: "Yêu cầu đặt lại mật khẩu",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5 9 6.343 9 8s1.343 3 3 3zm0 2a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      path: "/admin/nft-tracking",
      label: "NFT Tracking",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3.75l7.5 4.5v7.5L12 20.25l-7.5-4.5v-7.5L12 3.75zM12 8.25v7.5"
          />
        </svg>
      ),
    },
  ];

  const navItems =
    location.pathname.startsWith("/admin") && user?.role === "system_admin"
      ? adminNavigationItems
      : navigationItems;

  useEffect(() => {
    localStorage.setItem("sidebarOpen", sidebarOpen ? "true" : "false");
  }, [sidebarOpen]);

  useEffect(() => {
    const checkWalletConnection = async () => {
      try {
        const connected = await isWalletConnected();
        if (connected) {
          const address = await getCurrentWalletAddress();
          setWalletAddress(address);
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    };

    checkWalletConnection();

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        } else {
          setWalletAddress(null);
        }
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", () => {});
      }
    };
  }, []);

  const handleConnectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      toast.error("Vui lòng cài đặt MetaMask để kết nối ví!");
      window.open("https://metamask.io/download/", "_blank");
      return;
    }

    setIsConnecting(true);
    try {
      const result = await connectWallet();
      setWalletAddress(result.address);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast.error("Không thể kết nối ví. Vui lòng thử lại!");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCopyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  const formatAddress = (address) => {
    if (!address) {
      return "";
    }
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  const handleLogout = async () => {
    // Disconnect wallet trước khi logout
    try {
      const connected = await isWalletConnected();
      if (connected) {
        await disconnectWallet();
      }
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }

    // Call logout API first (while we still have auth token)
    try {
      if (logout) {
        await logout();
      }
    } catch (error) {
      // Ignore logout API errors, still clear local state
      console.error("Logout API error:", error);
    } finally {
      // Clear local state and cookies after API call
      useAuthStore.getState().clearAuthState();
      clearAuthCookies();
      navigate("/", { replace: true });
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 6 },
    show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Sidebar */}
      <aside
        onTransitionEnd={() => setShowLabels(sidebarOpen)}
        className={`fixed left-0 top-0 h-full z-50 !text-white
        bg-linear-to-b from-[#007b91] to-[#009fbf] shadow-lg
        transition-all duration-200 ease-linear
        ${sidebarOpen ? "w-64" : "w-20"}`}
      >
        <div className="flex flex-col h-full p-3">
          <div
            className={`flex items-center mb-6 ${
              showLabels ? "justify-between" : "justify-center"
            }`}
          >
            {showLabels && <h2 className="text-lg font-semibold">DrugTrace</h2>}
            <button
              onClick={() => {
                // Khi thu gọn: ẩn label ngay để tránh giật khi width đang đổi
                if (sidebarOpen) {
                  setShowLabels(false);
                }
                setSidebarOpen((v) => !v);
              }}
              className="p-2 rounded-md hover:bg-white/10 transition-colors duration-150 w-8 h-8 flex items-center justify-center"
            >
              {sidebarOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Search removed by request */}

          <nav className="flex-1 flex flex-col justify-start pt-4">
            <ul className="space-y-2">
              {navItems.map((item, i) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== "/admin" &&
                    location.pathname.startsWith(item.path + "/"));
                return (
                  <li key={i}>
                    <Link
                      to={item.path}
                      className={`w-full h-11 flex items-center ${
                        showLabels ? "px-3 justify-start" : "justify-center"
                      } gap-3 rounded-md transition-colors duration-150 ease-out
                        ${
                          isActive
                            ? "bg-white/20 !text-white"
                            : "hover:bg-white/10 !text-white/90"
                        }`}
                    >
                      <span className="text-xl shrink-0">{item.icon}</span>
                      {showLabels && (
                        <span className="font-medium whitespace-nowrap">
                          {item.label}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Avatar removed by request */}
        </div>
      </aside>

      {/* Main Content */}
      <div className={`min-h-screen ${sidebarOpen ? "ml-64" : "ml-20"}`}>
        <header className="bg-white/95 backdrop-blur-sm border-b border-slate-200">
          <div className="px-6 h-16 flex items-center justify-between">
            <div className="text-slate-700 font-semibold">
              {showLabels ? welcomeMessage : null}
            </div>
            <div className="flex items-center gap-3">
              {walletAddress ? (
                <div className="relative group">
                  <button
                    onClick={handleCopyAddress}
                    className="flex items-center gap-2 h-10 px-4 rounded-full bg-secondary  !text-white hover:from-cyan-600 hover:to-teal-700 transition-colors shadow-sm hover:shadow-md"
                  >
                    <svg
                      className="w-5 h-5 !text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                    <span className="font-medium text-sm !text-white">
                      {formatAddress(walletAddress)}
                    </span>
                    {showCopied && (
                      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 !text-white text-xs rounded whitespace-nowrap">
                        Đã sao chép!
                      </span>
                    )}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleConnectWallet}
                  disabled={isConnecting}
                  className="flex items-center gap-2 h-10 px-4 rounded-full bg-linear-to-r from-secondary to-primary !text-white hover:from-cyan-600 hover:to-teal-700 transition-colors shadow-sm hover:shadow-md disabled:opacity-50"
                >
                  {isConnecting ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 !text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span className="font-medium text-sm !text-white">
                        Đang kết nối...
                      </span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5 !text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                      <span className="font-medium text-sm !text-white">
                        Kết nối ví
                      </span>
                    </>
                  )}
                </button>
              )}

              <LogoutButton onLogout={handleLogout} />
            </div>
          </div>
        </header>

        <motion.main
          className="p-6"
          variants={fadeUp}
          initial="hidden"
          animate="show"
        >
          {metrics.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {metrics.map((metric, index) => (
                <MetricCard key={index} {...metric} />
              ))}
            </div>
          )}
          {children}
        </motion.main>
      </div>
    </div>
  );
}
