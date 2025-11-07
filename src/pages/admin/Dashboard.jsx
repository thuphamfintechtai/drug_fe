import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardLayout from "../../components/DashboardLayout";
import TruckLoader from "../../components/TruckLoader";
import {
  getSystemStats,
  getRegistrationStats,
  getDrugStats,
} from "../../services/admin/statsService";

export default function AdminDashboard() {
  const [systemStats, setSystemStats] = useState(null);
  const [registrationStats, setRegistrationStats] = useState(null);
  const [drugStats, setDrugStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const progressIntervalRef = useRef(null);

  useEffect(() => {
    loadStats();

    return () => {
      // Cleanup progress interval nếu có
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, []);

  const loadStats = async () => {
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

      const [sysRes, regRes, drugRes] = await Promise.all([
        getSystemStats(),
        getRegistrationStats(),
        getDrugStats(),
      ]);

      // Clear interval khi có response
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      // Xử lý data trước
      if (sysRes.success) {
        setSystemStats(sysRes.data);
      }
      if (regRes.success) {
        setRegistrationStats(regRes.data);
      }
      if (drugRes.success) {
        setDrugStats(drugRes.data);
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

      console.error("Error loading admin stats:", error);
      setLoadingProgress(0);
    } finally {
      setLoading(false);
      // Reset progress sau 0.5s
      setTimeout(() => {
        setLoadingProgress(0);
      }, 500);
    }
  };

  const navigationItems = [
    {
      path: "/admin",
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
      active: true,
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
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      active: false,
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
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
          />
        </svg>
      ),
      active: false,
    },
    {
      path: "/admin/supply-chain",
      label: "Lịch sử truy xuất",
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
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
      ),
      active: false,
    },
    {
      path: "/admin/nft-tracking",
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
      path: "/admin/password-reset-requests",
      label: "Reset mật khẩu",
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
            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
          />
        </svg>
      ),
      active: false,
    },
  ];

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
      ) : (
        <div className="space-y-8">
          {/* Banner (đồng bộ kiểu card trắng viền cyan) */}
          <div className="bg-white rounded-xl border border-card-primary shadow-sm p-6">
            <h1 className="text-2xl font-semibold text-[#007b91]">
              Tổng quan hệ thống
            </h1>
            <p className="text-slate-500 text-sm mt-2">
              Giám sát và quản lý toàn bộ hệ thống truy xuất nguồn gốc thuốc
            </p>
          </div>

          <div className="space-y-8">
            {/* Thống kê người dùng và đơn đăng ký */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold text-slate-800">
                Người dùng & Đơn đăng ký
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-blue-400 to-cyan-400 rounded-t-2xl" />
                  <div className="p-5 pt-7 text-center">
                    <div className="text-sm text-slate-600 mb-1">
                      Tổng người dùng
                    </div>
                    <div className="text-3xl font-bold text-[#003544]">
                      {systemStats?.users?.total || 0}
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                      Hoạt động: {systemStats?.users?.byStatus?.active || 0} |
                      Đang chờ: {systemStats?.users?.byStatus?.pending || 0}
                    </div>
                  </div>
                </div>

                <Link
                  to="/admin/registrations?status=pending"
                  className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-transform hover:scale-[1.02]"
                >
                  <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-amber-400 to-yellow-400 rounded-t-2xl" />
                  <div className="p-5 pt-7 text-center">
                    <div className="text-sm text-slate-600 mb-1">Chờ duyệt</div>
                    <div className="text-3xl font-bold text-amber-600">
                      {registrationStats?.byStatus?.pending || 0}
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                      Đơn đăng ký cần xử lý
                    </div>
                  </div>
                </Link>

                <Link
                  to="/admin/registrations?status=blockchain_failed"
                  className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-transform hover:scale-[1.02]"
                >
                  <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-rose-400 to-red-400 rounded-t-2xl" />
                  <div className="p-5 pt-7 text-center">
                    <div className="text-sm text-slate-600 mb-1">
                      Lỗi Blockchain
                    </div>
                    <div className="text-3xl font-bold text-rose-600">
                      {registrationStats?.byStatus?.blockchain_failed || 0}
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                      Cần thử lại blockchain
                    </div>
                  </div>
                </Link>

                <div className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-emerald-400 to-green-400 rounded-t-2xl" />
                  <div className="p-5 pt-7 text-center">
                    <div className="text-sm text-slate-600 mb-1">Đã duyệt</div>
                    <div className="text-3xl font-bold text-emerald-600">
                      {registrationStats?.byStatus?.approved || 0}
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                      Thành công
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                  <div className="text-sm font-semibold text-slate-700 mb-3">
                    Doanh nghiệp
                  </div>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                      <span className="text-slate-600">Nhà sản xuất</span>
                      <span className="font-semibold text-slate-800">
                        {systemStats?.businesses?.pharmaCompanies || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                      <span className="text-slate-600">Nhà phân phối</span>
                      <span className="font-semibold text-slate-800">
                        {systemStats?.businesses?.distributors || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-slate-600">Nhà thuốc</span>
                      <span className="font-semibold text-slate-800">
                        {systemStats?.businesses?.pharmacies || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                  <div className="text-sm font-semibold text-slate-700 mb-3">
                    Đơn đăng ký theo vai trò
                  </div>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                      <span className="text-slate-600">Nhà sản xuất</span>
                      <span className="font-semibold text-slate-800">
                        {registrationStats?.byRole?.pharma_company || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                      <span className="text-slate-600">Nhà phân phối</span>
                      <span className="font-semibold text-slate-800">
                        {registrationStats?.byRole?.distributor || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-slate-600">Nhà thuốc</span>
                      <span className="font-semibold text-slate-800">
                        {registrationStats?.byRole?.pharmacy || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="relative rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-cyan-400 to-blue-400 rounded-t-xl" />
                  <div className="p-5 pt-7 text-center">
                    <div className="text-sm text-slate-600 mb-2">
                      7 ngày gần đây
                    </div>
                    <div className="text-3xl font-bold text-cyan-600">
                      {registrationStats?.recentRequests || 0}
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                      Đơn đăng ký mới
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Thống kê thuốc và NFT */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold text-slate-800">
                Thuốc & NFT
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Link
                  to="/admin/drugs"
                  className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-transform hover:scale-[1.02]"
                >
                  <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-blue-400 to-cyan-400 rounded-t-2xl" />
                  <div className="p-5 pt-7 text-center">
                    <div className="text-sm text-slate-600 mb-1">
                      Tổng số thuốc
                    </div>
                    <div className="text-3xl font-bold text-blue-600">
                      {drugStats?.drugs?.total || 0}
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                      Hoạt động: {drugStats?.drugs?.byStatus?.active || 0} |
                      Không hoạt động:{" "}
                      {drugStats?.drugs?.byStatus?.inactive || 0}
                    </div>
                  </div>
                </Link>

                <div className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-cyan-400 to-sky-400 rounded-t-2xl" />
                  <div className="p-5 pt-7 text-center">
                    <div className="text-sm text-slate-600 mb-1">Tổng NFT</div>
                    <div className="text-3xl font-bold text-cyan-600">
                      {drugStats?.nfts?.total || 0}
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                      Token đã mint
                    </div>
                  </div>
                </div>

                <div className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-sky-400 to-blue-400 rounded-t-2xl" />
                  <div className="p-5 pt-7 text-center">
                    <div className="text-sm text-slate-600 mb-1">
                      NFT đã chuyển
                    </div>
                    <div className="text-3xl font-bold text-sky-600">
                      {drugStats?.nfts?.byStatus?.transferred || 0}
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                      Đang lưu thông
                    </div>
                  </div>
                </div>

                <div className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-emerald-400 to-green-400 rounded-t-2xl" />
                  <div className="p-5 pt-7 text-center">
                    <div className="text-sm text-slate-600 mb-1">
                      NFT đã bán
                    </div>
                    <div className="text-3xl font-bold text-emerald-600">
                      {drugStats?.nfts?.byStatus?.sold || 0}
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                      Đã bán cho nhà thuốc
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                  <div className="text-sm font-semibold text-slate-700 mb-4">
                    Top nhà sản xuất
                  </div>
                  <div className="space-y-2.5">
                    {drugStats?.drugs?.byManufacturer
                      ?.slice(0, 5)
                      .map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0"
                        >
                          <span className="text-slate-700 truncate text-sm">
                            {item.manufacturerName || "N/A"}
                          </span>
                          <span className="font-semibold text-cyan-600 ml-2">
                            {item.count}
                          </span>
                        </div>
                      ))}
                    {!drugStats?.drugs?.byManufacturer?.length && (
                      <div className="text-sm text-slate-400 py-4 text-center">
                        Chưa có dữ liệu
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                  <div className="text-sm font-semibold text-slate-700 mb-4">
                    Trạng thái NFT
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <div className="text-xs text-slate-500 mb-1">Đã mint</div>
                      <div className="text-xl font-semibold text-slate-700">
                        {drugStats?.nfts?.byStatus?.minted || 0}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-xs text-red-600 mb-1">Hết hạn</div>
                      <div className="text-xl font-semibold text-red-600">
                        {drugStats?.nfts?.byStatus?.expired || 0}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-xs text-orange-600 mb-1">
                        Thu hồi
                      </div>
                      <div className="text-xl font-semibold text-orange-600">
                        {drugStats?.nfts?.byStatus?.recalled || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Thống kê supply chain */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold text-slate-800">
                Chuỗi cung ứng
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-purple-400 to-pink-400 rounded-t-2xl" />
                  <div className="p-5 pt-7 text-center">
                    <div className="text-sm text-slate-600 mb-1">
                      Chứng nhận sản xuất
                    </div>
                    <div className="text-3xl font-bold text-purple-600">
                      {systemStats?.proofs?.production || 0}
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                      Lô sản xuất
                    </div>
                  </div>
                </div>

                <div className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-indigo-400 to-purple-400 rounded-t-2xl" />
                  <div className="p-5 pt-7 text-center">
                    <div className="text-sm text-slate-600 mb-1">
                      Chứng nhận phân phối
                    </div>
                    <div className="text-3xl font-bold text-indigo-600">
                      {systemStats?.proofs?.distribution || 0}
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                      Chuyển giao cho NPP
                    </div>
                  </div>
                </div>

                <div className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-teal-400 to-cyan-400 rounded-t-2xl" />
                  <div className="p-5 pt-7 text-center">
                    <div className="text-sm text-slate-600 mb-1">
                      Chứng nhận nhà thuốc
                    </div>
                    <div className="text-3xl font-bold text-teal-600">
                      {systemStats?.proofs?.pharmacy || 0}
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                      Chuyển giao cho nhà thuốc
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                  <div className="text-sm font-semibold text-slate-700 mb-3">
                    Hóa đơn
                  </div>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                      <span className="text-slate-600">
                        Hóa đơn nhà sản xuất
                      </span>
                      <span className="font-semibold text-slate-800">
                        {systemStats?.invoices?.manufacturer || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-slate-600">Hóa đơn thương mại</span>
                      <span className="font-semibold text-slate-800">
                        {systemStats?.invoices?.commercial || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl border border-cyan-200 shadow-sm p-5">
                  <div className="text-sm font-semibold text-cyan-700 mb-3">
                    Hành động nhanh
                  </div>
                  <div className="space-y-2.5">
                    <Link
                      to="/admin/supply-chain"
                      className="block text-sm text-cyan-600 hover:text-cyan-700 hover:underline py-1.5 transition"
                    >
                      Xem lịch sử truy xuất toàn bộ
                    </Link>
                    <Link
                      to="/admin/distribution"
                      className="block text-sm text-cyan-600 hover:text-cyan-700 hover:underline py-1.5 transition"
                    >
                      Xem lịch sử phân phối
                    </Link>
                    <Link
                      to="/admin/nft-tracking"
                      className="block text-sm text-cyan-600 hover:text-cyan-700 hover:underline py-1.5 transition"
                    >
                      Tra cứu NFT
                    </Link>
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
