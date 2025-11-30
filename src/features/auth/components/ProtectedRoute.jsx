import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store";
import { useMetaMask } from "../../shared/hooks/useMetaMask";
import {
  compareWalletAddresses,
  formatWalletAddress,
} from "../../utils/walletUtils";
import { toast } from "sonner";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();
  const { isAuthenticated, user, loading, initAuth } = useAuthStore();
  const {
    account,
    isConnected,
    isInstalled,
    connect,
    disconnect,
    isConnecting,
  } = useMetaMask();
  const [checkingWallet, setCheckingWallet] = useState(false);
  const [walletMismatch, setWalletMismatch] = useState(false);

  useEffect(() => {
    if (loading) {
      initAuth();
    }
  }, [loading, initAuth]);

  useEffect(() => {
    const checkWalletAddress = async () => {
      // Không tự động connect wallet nếu không authenticated hoặc đang ở trang public
      if (
        !isAuthenticated ||
        !user?.walletAddress ||
        user?.role === "system_admin" ||
        location.pathname === "/" ||
        location.pathname === "/login" ||
        location.pathname === "/register"
      ) {
        setCheckingWallet(false);
        setWalletMismatch(false);
        return;
      }

      setCheckingWallet(true);

      if (!isConnected || !account) {
        if (isInstalled) {
          const connected = await connect();
          if (!connected) {
            setWalletMismatch(false);
            setCheckingWallet(false);
            return;
          }
        } else {
          toast.error("Vui lòng cài đặt MetaMask để tiếp tục");
          setCheckingWallet(false);
          return;
        }
      }

      if (account && !compareWalletAddresses(user.walletAddress, account)) {
        setWalletMismatch(true);
        toast.error("Địa chỉ ví MetaMask không khớp với tài khoản");
      } else {
        setWalletMismatch(false);
      }

      setCheckingWallet(false);
    };

    checkWalletAddress();
  }, [
    isAuthenticated,
    user?.walletAddress,
    user?.role,
    isConnected,
    account,
    isInstalled,
    connect,
    location.pathname,
  ]);

  if (loading || checkingWallet || isConnecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#4BADD1]/5 via-white to-slate-50/50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4BADD1] mx-auto mb-4"></div>
          <p className="text-slate-600">Đang kiểm tra xác thực...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Hiển thị thông báo nếu user có walletAddress và (chưa kết nối hoặc địa chỉ không khớp)
  if (user?.walletAddress && (!isConnected || walletMismatch)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#4BADD1]/5 via-white to-slate-50/50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border-2 border-red-200 p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-10 h-10 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-3">
            {isConnected && walletMismatch
              ? "Địa chỉ ví không khớp"
              : "Yêu cầu kết nối ví MetaMask"}
          </h2>
          <p className="text-slate-600 mb-6">
            {isConnected && walletMismatch
              ? "Địa chỉ ví MetaMask hiện tại không khớp với tài khoản của bạn."
              : "Tài khoản của bạn yêu cầu kết nối với địa chỉ ví MetaMask phù hợp."}
          </p>
          <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left border border-slate-200">
            <p className="text-sm text-slate-700 mb-2">
              <span className="font-bold text-slate-900">Yêu cầu:</span>{" "}
              <span className="font-mono font-semibold text-primary">
                {formatWalletAddress(user.walletAddress)}
              </span>
            </p>
            {isConnected && account && (
              <p className="text-sm text-slate-700">
                <span className="font-bold text-slate-900">Hiện tại:</span>{" "}
                <span className="font-mono">
                  {formatWalletAddress(account)}
                </span>
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {/* Nếu đang kết nối nhưng không khớp */}
            {isConnected ? (
              <>
                <button
                  onClick={async () => {
                    try {
                      setCheckingWallet(true);
                      await disconnect();
                      setWalletMismatch(false);
                      toast.success("Đã ngắt kết nối MetaMask");
                    } catch (error) {
                      console.error("Error disconnecting MetaMask:", error);
                      toast.error("Có lỗi xảy ra khi ngắt kết nối.");
                    } finally {
                      setCheckingWallet(false);
                    }
                  }}
                  disabled={checkingWallet}
                  className="w-full py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {checkingWallet ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5"
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
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <>
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
                          d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                      <span>Ngắt kết nối</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    window.location.href = "/login";
                  }}
                  className="w-full py-3 px-6 rounded-xl font-semibold text-slate-700 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 shadow-sm hover:shadow transition-all duration-200"
                >
                  Về trang đăng nhập
                </button>
              </>
            ) : (
              /* Nếu chưa kết nối, hiển thị nút kết nối */
              <button
                onClick={async () => {
                  if (isInstalled) {
                    try {
                      setCheckingWallet(true);
                      const connected = await connect();
                      if (connected) {
                        toast.success(
                          "Đã kết nối MetaMask! Đang kiểm tra địa chỉ..."
                        );
                        // Đợi một chút để account được cập nhật
                        setTimeout(() => {
                          setCheckingWallet(false);
                        }, 1000);
                      } else {
                        setCheckingWallet(false);
                        toast.error(
                          "Không thể kết nối MetaMask. Vui lòng thử lại."
                        );
                      }
                    } catch (error) {
                      console.error("Error connecting MetaMask:", error);
                      setCheckingWallet(false);
                      toast.error("Có lỗi xảy ra khi kết nối MetaMask.");
                    }
                  } else {
                    window.open("https://metamask.io/download/", "_blank");
                  }
                }}
                disabled={checkingWallet}
                className="w-full py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {checkingWallet ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
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
                    <span>Đang kết nối...</span>
                  </>
                ) : isInstalled ? (
                  <>
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
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                    <span>Kết nối ví MetaMask</span>
                  </>
                ) : (
                  <>
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
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    <span>Cài đặt MetaMask</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (allowedRoles.length > 0) {
    if (user?.role === "system_admin") {
      return children;
    }

    if (!allowedRoles.includes(user?.role)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Không có quyền truy cập
            </h1>
            <p className="text-gray-600 mb-4">
              Bạn không có quyền truy cập trang này.
            </p>
            <p className="text-sm text-gray-500 mb-2">
              Role hiện tại: {user?.role || "N/A"}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Role được phép: {allowedRoles.join(", ")}
            </p>
            <a href="/" className="text-blue-600 hover:text-blue-800">
              Về trang chủ
            </a>
          </div>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;
