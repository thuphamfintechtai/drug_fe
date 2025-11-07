import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "../../components/DashboardLayout";
import TruckLoader from "../../components/TruckLoader";
import { useAuth } from "../../context/AuthContext";
import { getProfile } from "../../services/distributor/distributorService";

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const progressIntervalRef = useRef(null);

  const navigationItems = [
    {
      path: "/distributor",
      label: "Tổng quan",
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
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      active: false,
    },
    {
      path: "/distributor/invoices",
      label: "Đơn từ nhà SX",
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      active: false,
    },
    {
      path: "/distributor/transfer-pharmacy",
      label: "Chuyển cho NT",
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
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
      ),
      active: false,
    },
    {
      path: "/distributor/distribution-history",
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
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
      active: false,
    },
    {
      path: "/distributor/transfer-history",
      label: "Lịch sử chuyển NT",
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
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      active: false,
    },
    {
      path: "/distributor/drugs",
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
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
          />
        </svg>
      ),
      active: false,
    },
    {
      path: "/distributor/nft-tracking",
      label: "Tra cứu NFT",
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
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      ),
      active: false,
    },
    {
      path: "/distributor/profile",
      label: "Hồ sơ",
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
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      active: true,
    },
  ];

  useEffect(() => {
    loadProfile();

    return () => {
      // Cleanup progress interval nếu có
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setLoadingProgress(0);

      // Clear interval cũ nếu có
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      // Simulate progress từ 0 đến 90% trong khi đang load
      progressIntervalRef.current = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev < 0.9) {
            return Math.min(prev + 0.02, 0.9);
          }
          return prev;
        });
      }, 50);

      const response = await getProfile();

      // Clear interval khi có response
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      // Xử lý data trước
      if (response.data.success) {
        setProfile(response.data.data);
      }

      // Nếu xe chưa chạy hết (progress < 0.9), tăng tốc cùng một chiếc xe để chạy đến 100%
      let currentProgress = 0;
      setLoadingProgress((prev) => {
        currentProgress = prev;
        return prev;
      });

      // Đảm bảo xe chạy đến 100% trước khi hiển thị page
      if (currentProgress < 0.9) {
        // Tăng tốc độ nhanh để cùng một chiếc xe chạy đến 100%
        await new Promise((resolve) => {
          const speedUpInterval = setInterval(() => {
            setLoadingProgress((prev) => {
              if (prev < 1) {
                const newProgress = Math.min(prev + 0.15, 1);
                if (newProgress >= 1) {
                  clearInterval(speedUpInterval);
                  resolve();
                }
                return newProgress;
              }
              clearInterval(speedUpInterval);
              resolve();
              return 1;
            });
          }, 30);

          // Safety timeout
          setTimeout(() => {
            clearInterval(speedUpInterval);
            setLoadingProgress(1);
            resolve();
          }, 500);
        });
      } else {
        setLoadingProgress(1);
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      // Đảm bảo progress đã đạt 100% trước khi tiếp tục
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      // Clear interval khi có lỗi
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      console.error("Lỗi khi tải thông tin:", error);
      setLoadingProgress(0);
    } finally {
      setLoading(false);
      // Reset progress sau 0.5s
      setTimeout(() => {
        setLoadingProgress(0);
      }, 500);
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <DashboardLayout navigationItems={navigationItems}>
      {/* Loading State - chỉ hiển thị khi đang tải, không hiển thị content cho đến khi loading = false */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="w-full max-w-2xl">
            <TruckLoader height={72} progress={loadingProgress} showTrack />
          </div>
          <div className="text-lg text-slate-600 mt-6">Đang tải dữ liệu...</div>
        </div>
      ) : !profile ? (
        <div className="space-y-6 ">
          <div className="bg-white rounded-xl border border-cyan-200 shadow-sm p-5 mb-6">
            <h1 className="text-xl font-semibold text-[#007b91]">
              Thông tin cá nhân
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Xem thông tin tài khoản và công ty (chỉ đọc)
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-cyan-200 p-10 text-center text-red-600">
            Không thể tải thông tin
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-card-primary shadow-sm p-5 mb-6">
            <h1 className="text-xl font-semibold text-[#007b91]">
              Thông tin cá nhân
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Xem thông tin tài khoản và công ty (chỉ đọc)
            </p>
          </div>
          <div className="space-y-5">
            <motion.div
              className="bg-white rounded-2xl border border-cyan-100 shadow-sm overflow-hidden"
              variants={fadeUp}
              initial="hidden"
              animate="show"
            >
              <div className="px-6 py-4 bg-secondary ">
                <h2 className="text-xl font-bold text-white">
                  Thông tin tài khoản
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs text-slate-500 mb-1">
                      Tên đầy đủ
                    </div>
                    <div className="font-semibold text-slate-800">
                      {profile.user?.fullName || "N/A"}
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs text-slate-500 mb-1">Email</div>
                    <div className="font-semibold text-slate-800">
                      {profile.user?.email || "N/A"}
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs text-slate-500 mb-1">Vai trò</div>
                    <div className="font-semibold text-slate-800">
                      <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">
                        Distributor (Nhà phân phối)
                      </span>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs text-slate-500 mb-1">
                      Trạng thái
                    </div>
                    <div className="font-semibold text-slate-800">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          profile.user?.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {profile.user?.status || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-200">
                  <div className="text-xs text-cyan-700 mb-1">
                    Wallet Address
                  </div>
                  <div className="font-mono text-sm text-cyan-800 break-all">
                    {profile.user?.walletAddress || "Chưa có"}
                  </div>
                </div>
              </div>
            </motion.div>

            {profile.company && (
              <motion.div
                className="bg-white rounded-2xl border border-cyan-100 shadow-sm overflow-hidden"
                variants={fadeUp}
                initial="hidden"
                animate="show"
              >
                <div className="px-6 py-4 bg-linear-to-r from-[#00b4d8] to-[#48cae4]">
                  <h2 className="text-xl font-bold text-white">
                    Thông tin công ty
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-200">
                      <div className="text-xs text-cyan-700 mb-1">
                        Tên công ty
                      </div>
                      <div className="font-bold text-cyan-900 text-lg">
                        {profile.company.name || "N/A"}
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="text-xs text-slate-500 mb-1">
                        Mã số thuế
                      </div>
                      <div className="font-mono font-semibold text-slate-800">
                        {profile.company.taxCode || "N/A"}
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="text-xs text-slate-500 mb-1">
                        Giấy phép kinh doanh
                      </div>
                      <div className="font-mono font-semibold text-slate-800">
                        {profile.company.licenseNo || "N/A"}
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="text-xs text-slate-500 mb-1">
                        Trạng thái
                      </div>
                      <div className="font-semibold text-slate-800">
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            profile.company.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {profile.company.status || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs text-slate-500 mb-1">Địa chỉ</div>
                    <div className="font-medium text-slate-800">
                      {profile.company.address || "N/A"}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="text-xs text-slate-500 mb-1">
                        Số điện thoại
                      </div>
                      <div className="font-medium text-slate-800">
                        {profile.company.phone || "N/A"}
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="text-xs text-slate-500 mb-1">Website</div>
                      <div className="font-medium text-slate-800">
                        {profile.company.website || "N/A"}
                      </div>
                    </div>
                  </div>

                  {profile.company.contractAddress && (
                    <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                      <div className="text-xs text-emerald-700 mb-1">
                        Contract Address
                      </div>
                      <div className="font-mono text-sm text-emerald-800 break-all">
                        {profile.company.contractAddress}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            <motion.div
              className="bg-yellow-50 rounded-2xl border border-yellow-200 p-5"
              variants={fadeUp}
              initial="hidden"
              animate="show"
            >
              <div className="flex items-start gap-3">
                <div>
                  <div className="font-semibold text-yellow-800 mb-1">
                    Lưu ý quan trọng
                  </div>
                  <div className="text-sm text-yellow-700">
                    Thông tin này chỉ được xem và{" "}
                    <strong>không thể chỉnh sửa</strong>. Nếu cần thay đổi thông
                    tin công ty, vui lòng liên hệ với quản trị viên hệ thống.
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
