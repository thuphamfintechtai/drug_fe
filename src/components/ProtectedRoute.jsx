import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useMetaMask } from "../hooks/useMetaMask";
import {
  compareWalletAddresses,
  formatWalletAddress,
} from "../utils/walletUtils";
import toast from "react-hot-toast";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const { account, isConnected, isInstalled, connect, isConnecting } =
    useMetaMask();
  const [checkingWallet, setCheckingWallet] = useState(false);
  const [walletMismatch, setWalletMismatch] = useState(false);

  // Debug logging
  console.log("ProtectedRoute check:", {
    isAuthenticated,
    userRole: user?.role,
    allowedRoles,
    userWalletAddress: user?.walletAddress,
    metaMaskAddress: account,
    isConnected,
  });

  // Kiểm tra MetaMask address khi user đã authenticated và có walletAddress
  useEffect(() => {
    const checkWalletAddress = async () => {
      // Chỉ kiểm tra nếu user đã authenticated và có walletAddress
      if (
        !isAuthenticated ||
        !user?.walletAddress ||
        loading ||
        checkingWallet
      ) {
        // Nếu không có walletAddress, không cần kiểm tra
        if (isAuthenticated && !user?.walletAddress) {
          setWalletMismatch(false);
        }
        return;
      }

      setCheckingWallet(true);

      // Nếu user có walletAddress nhưng chưa kết nối MetaMask
      if (!isInstalled) {
        setWalletMismatch(true);
        setCheckingWallet(false);
        toast.error(
          "Vui lòng cài đặt MetaMask extension để truy cập trang này."
        );
        return;
      }

      if (!isConnected || !account) {
        // Thử kết nối MetaMask tự động
        const connected = await connect();
        if (!connected) {
          setWalletMismatch(true);
          setCheckingWallet(false);
          toast.error("Vui lòng kết nối MetaMask để truy cập trang này.");
          return;
        }
        // Sau khi kết nối, account sẽ được cập nhật, useEffect sẽ chạy lại
        setCheckingWallet(false);
        return;
      }

      // So sánh địa chỉ ví
      if (!compareWalletAddresses(user.walletAddress, account)) {
        setWalletMismatch(true);
        setCheckingWallet(false);
        const requiredAddress = formatWalletAddress(user.walletAddress);
        toast.error(
          `Địa chỉ ví MetaMask không khớp. Yêu cầu: ${requiredAddress}`
        );
        return;
      }

      // Địa chỉ khớp
      setWalletMismatch(false);
      setCheckingWallet(false);
    };

    checkWalletAddress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isAuthenticated,
    user?.walletAddress,
    account,
    isConnected,
    isInstalled,
    loading,
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
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra wallet address mismatch
  if (user?.walletAddress && walletMismatch) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#4BADD1]/5 via-white to-slate-50/50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-red-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
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
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Địa chỉ ví không khớp
          </h1>
          <p className="text-slate-600 mb-4">
            Tài khoản của bạn yêu cầu địa chỉ ví MetaMask:{" "}
            <span className="font-mono font-semibold text-[#4BADD1]">
              {formatWalletAddress(user.walletAddress)}
            </span>
          </p>
          {account && (
            <p className="text-sm text-slate-500 mb-6">
              Địa chỉ ví hiện tại:{" "}
              <span className="font-mono">{formatWalletAddress(account)}</span>
            </p>
          )}
          <div className="flex flex-col gap-3">
            {!isConnected && (
              <button
                onClick={async () => {
                  const connected = await connect();
                  if (connected) {
                    toast.success("Đã kết nối MetaMask!");
                    setWalletMismatch(false);
                  }
                }}
                className="w-full py-3 bg-[#4BADD1] !text-white font-semibold rounded-xl hover:bg-[#3a9bc1] transition"
              >
                Kết nối MetaMask
              </button>
            )}
            <button
              onClick={() => {
                window.location.href = "/login";
              }}
              className="w-full py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition"
            >
              Đăng nhập lại
            </button>
            <a href="/" className="text-sm text-[#4BADD1] hover:underline">
              Về trang chủ
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Nếu có yêu cầu kiểm tra role
  if (allowedRoles.length > 0) {
    // system_admin có thể truy cập tất cả
    if (user?.role === "system_admin") {
      console.log("User is system_admin, allowing access");
      return children;
    }

    // Kiểm tra role có trong danh sách cho phép không
    if (!allowedRoles.includes(user?.role)) {
      console.log(
        "User role not in allowed roles:",
        user?.role,
        "allowed:",
        allowedRoles
      );
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
