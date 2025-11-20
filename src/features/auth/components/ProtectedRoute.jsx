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
  const { account, isConnected, isInstalled, connect, isConnecting } =
    useMetaMask();
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

  if (user?.walletAddress && walletMismatch) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#4BADD1]/5 via-white to-slate-50/50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-red-200 p-8 text-center">
          <div className="mb-4">
            <svg
              className="w-16 h-16 text-red-500 mx-auto"
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
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Địa chỉ ví không khớp
          </h2>
          <p className="text-slate-600 mb-4">
            Địa chỉ ví MetaMask hiện tại không khớp với tài khoản của bạn.
          </p>
          <div className="bg-slate-50 rounded-lg p-4 mb-4 text-left">
            <p className="text-sm text-slate-600 mb-1">
              <span className="font-semibold">Yêu cầu:</span>{" "}
              {formatWalletAddress(user.walletAddress)}
            </p>
            <p className="text-sm text-slate-600">
              <span className="font-semibold">Hiện tại:</span>{" "}
              {account ? formatWalletAddress(account) : "Chưa kết nối"}
            </p>
          </div>
          <button
            onClick={async () => {
              if (isInstalled) {
                await connect();
              } else {
                window.open("https://metamask.io/download/", "_blank");
              }
            }}
            className="w-full py-2 px-4 bg-[#4BADD1] text-white rounded-lg hover:bg-[#3a9bc1] transition"
          >
            {isInstalled ? "Kết nối lại MetaMask" : "Cài đặt MetaMask"}
          </button>
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
