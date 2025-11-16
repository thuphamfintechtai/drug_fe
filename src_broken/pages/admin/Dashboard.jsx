import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import DashboardLayout from "../../components/DashboardLayout";
import TruckLoader from "../../components/TruckLoader";
import {
  getSystemStats,
  getRegistrationStats,
  getDrugStats,
  getMonthlyTrends,
  getBlockchainStats,
  getComplianceStats,
  getAlertsStats,
} from "../../services/admin/statsService";

// App colors from index.css
const COLORS = {
  primary: "#054f67",
  secondary: "#077ca3",
  third: "#00c0e8",
  purple: "#8b5cf6",
  pink: "#ec4899",
  cyan: "#06b6d4",
  sky: "#0ea5e9",
  blue: "#3b82f6",
  emerald: "#10b981",
  green: "#22c55e",
  amber: "#f59e0b",
  orange: "#f97316",
  rose: "#f43f5e",
  indigo: "#6366f1",
  teal: "#14b8a6",
};

const CHART_COLORS = [
  COLORS.secondary,
  COLORS.third,
  COLORS.cyan,
  COLORS.sky,
  COLORS.blue,
  COLORS.emerald,
  COLORS.purple,
  COLORS.pink,
];

export default function AdminDashboard() {
  const [systemStats, setSystemStats] = useState(null);
  const [registrationStats, setRegistrationStats] = useState(null);
  const [drugStats, setDrugStats] = useState(null);
  const [blockchainStats, setBlockchainStats] = useState(null);
  const [complianceStats, setComplianceStats] = useState(null);
  const [alertsStats, setAlertsStats] = useState(null);
  const [monthlyTrends, setMonthlyTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const progressIntervalRef = useRef(null);

  useEffect(() => {
    loadAllStats();

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, []);

  const loadAllStats = async () => {
    try {
      setLoading(true);
      setLoadingProgress(0);

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      progressIntervalRef.current = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev < 0.9) {
            return Math.min(prev + 0.02, 0.9);
          }
          return prev;
        });
      }, 50);

      // Load all stats in parallel
      const [
        sysRes,
        regRes,
        drugRes,
        monthlyRes,
        blockchainRes,
        complianceRes,
        alertsRes,
      ] = await Promise.allSettled([
        getSystemStats(),
        getRegistrationStats(),
        getDrugStats(),
        getMonthlyTrends(6),
        getBlockchainStats(),
        getComplianceStats(),
        getAlertsStats(),
      ]);

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      // Process results
      if (sysRes.status === "fulfilled" && sysRes.value.success) {
        setSystemStats(sysRes.value.data);
      }
      if (regRes.status === "fulfilled" && regRes.value.success) {
        setRegistrationStats(regRes.value.data);
      }
      if (drugRes.status === "fulfilled" && drugRes.value.success) {
        setDrugStats(drugRes.value.data);
      }
      if (monthlyRes.status === "fulfilled" && monthlyRes.value.success) {
        const data = monthlyRes.value.data;
        const formattedData = (data.trends || []).map((item) => ({
          month: item.month,
          productions: item.productions || 0,
          transfers: item.transfers || 0,
          receipts: item.receipts || 0,
        }));
        setMonthlyTrends(formattedData);
      }
      if (blockchainRes.status === "fulfilled" && blockchainRes.value.success) {
        setBlockchainStats(blockchainRes.value.data);
      }
      if (complianceRes.status === "fulfilled" && complianceRes.value.success) {
        setComplianceStats(complianceRes.value.data);
      }
      if (alertsRes.status === "fulfilled" && alertsRes.value.success) {
        setAlertsStats(alertsRes.value.data);
      }

      setLoadingProgress(1);
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (error) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      console.error("Error loading admin stats:", error);
      setLoadingProgress(0);
    } finally {
      setLoading(false);
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

  // Prepare user role data for pie chart
  const userRoleData = systemStats?.users?.byRole
    ? Object.entries(systemStats.users.byRole)
        .filter(([_, value]) => value > 0)
        .map(([role, value]) => ({
          name:
            role === "pharma_company"
              ? "Nhà SX"
              : role === "distributor"
              ? "Nhà PP"
              : role === "pharmacy"
              ? "Nhà thuốc"
              : role === "system_admin"
              ? "Admin"
              : role === "user"
              ? "Người dùng"
              : role,
          value: value || 0,
        }))
    : [];

  // Prepare registration status data
  const registrationStatusData = registrationStats?.byStatus
    ? Object.entries(registrationStats.byStatus)
        .filter(([_, value]) => value > 0)
        .map(([status, value]) => ({
          name:
            status === "pending"
              ? "Chờ duyệt"
              : status === "approved"
              ? "Đã duyệt"
              : status === "blockchain_failed"
              ? "Lỗi Blockchain"
              : status === "rejected"
              ? "Từ chối"
              : status,
          value: value || 0,
        }))
    : [];

  // Prepare NFT status data
  const nftStatusData = drugStats?.nfts?.byStatus
    ? Object.entries(drugStats.nfts.byStatus)
        .filter(([_, value]) => value > 0)
        .map(([status, value]) => ({
          name:
            status === "minted"
              ? "Đã mint"
              : status === "transferred"
              ? "Đã chuyển"
              : status === "sold"
              ? "Đã bán"
              : status === "expired"
              ? "Hết hạn"
              : status === "recalled"
              ? "Thu hồi"
              : status,
          value: value || 0,
        }))
    : [];

  return (
    <DashboardLayout navigationItems={navigationItems}>
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="w-full max-w-2xl">
            <TruckLoader height={72} progress={loadingProgress} showTrack />
          </div>
          <div className="text-lg text-slate-600 mt-6">Đang tải dữ liệu...</div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Banner */}
          <div className="bg-white rounded-xl border border-card-primary shadow-sm p-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-[#007b91]">
                Tổng quan hệ thống
              </h1>
              <p className="text-slate-500 text-sm mt-2">
                Giám sát và quản lý toàn bộ hệ thống truy xuất nguồn gốc thuốc
              </p>
            </div>
            <button
              onClick={loadAllStats}
              disabled={loading}
              className="p-2.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 transition disabled:opacity-50"
              title="Làm mới dữ liệu"
            >
              <svg
                className={`w-5 h-5 text-cyan-600 transition-transform ${
                  loading ? "animate-spin" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-8">
            {/* Alerts Card */}
            {alertsStats && (
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 shadow-sm p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-amber-800 mb-2">
                      Cảnh báo hệ thống
                    </h3>
                    <p className="text-amber-700 text-sm">
                      Tổng số cảnh báo: {alertsStats.alerts?.totalAlerts || 0}
                    </p>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-amber-600">
                        {alertsStats.alerts?.expired || 0}
                      </div>
                      <div className="text-xs text-amber-700">Hết hạn</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {alertsStats.alerts?.expiringSoon || 0}
                      </div>
                      <div className="text-xs text-amber-700">Sắp hết hạn</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {alertsStats.alerts?.recalled || 0}
                      </div>
                      <div className="text-xs text-amber-700">Thu hồi</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {alertsStats.alerts?.pendingActions || 0}
                      </div>
                      <div className="text-xs text-amber-700">Chờ xử lý</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Charts Row 1: User Role and Registration Status Pie Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
              >
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  Phân bố người dùng theo vai trò
                </h3>
                {userRoleData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={userRoleData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {userRoleData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-slate-400">
                    Chưa có dữ liệu
                  </div>
                )}
              </motion.div>

              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
              >
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  Phân bố đơn đăng ký theo trạng thái
                </h3>
                {registrationStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={registrationStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {registrationStatusData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-slate-400">
                    Chưa có dữ liệu
                  </div>
                )}
              </motion.div>
            </div>

            {/* Charts Row 2: NFT Status and Monthly Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
              >
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  Phân bố NFT theo trạng thái
                </h3>
                {nftStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={nftStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {nftStatusData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-slate-400">
                    Chưa có dữ liệu
                  </div>
                )}
              </motion.div>

              {/* Blockchain & Compliance Stats */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
              >
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  Blockchain & Tuân thủ
                </h3>
                <div className="space-y-4">
                  {blockchainStats && (
                    <div className="p-4 bg-cyan-50 rounded-lg">
                      <div className="text-sm text-cyan-700 mb-2">
                        Blockchain Coverage
                      </div>
                      <div className="text-2xl font-bold text-cyan-600">
                        {blockchainStats.blockchainCoverage || "0%"}
                      </div>
                      <div className="text-xs text-cyan-600 mt-1">
                        NFTs có TxHash: {blockchainStats.nftsWithTxHash || 0} /{" "}
                        {blockchainStats.totalNFTs || 0}
                      </div>
                    </div>
                  )}
                  {complianceStats && (
                    <div className="p-4 bg-emerald-50 rounded-lg">
                      <div className="text-sm text-emerald-700 mb-2">
                        Tỷ lệ tuân thủ
                      </div>
                      <div className="text-2xl font-bold text-emerald-600">
                        {complianceStats.compliance?.complianceRate || "0"}%
                      </div>
                      <div className="text-xs text-emerald-600 mt-1">
                        Giao dịch: {complianceStats.compliance?.blockchainTransactions || 0} /{" "}
                        {complianceStats.compliance?.totalRecords || 0}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Monthly Trends Chart */}
            {monthlyTrends && monthlyTrends.length > 0 && (
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
              >
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  Xu hướng 6 tháng gần nhất
                </h3>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="productions"
                      stroke={COLORS.secondary}
                      strokeWidth={3}
                      name="Sản xuất"
                      dot={{ fill: COLORS.secondary, r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="transfers"
                      stroke={COLORS.third}
                      strokeWidth={3}
                      name="Chuyển giao"
                      dot={{ fill: COLORS.third, r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="receipts"
                      stroke={COLORS.cyan}
                      strokeWidth={3}
                      name="Biên nhận"
                      dot={{ fill: COLORS.cyan, r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {/* User & Registration Stats */}
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
                  <div
                    className="absolute top-0 left-0 w-full h-[5px] rounded-t-2xl"
                    style={{
                      background: `linear-gradient(to right, ${COLORS.blue}, ${COLORS.cyan})`,
                    }}
                  />
                  <div className="p-5 pt-7 text-center">
                    <div className="text-sm text-slate-600 mb-1">
                      Tổng người dùng
                    </div>
                    <div className="text-3xl font-bold" style={{ color: COLORS.primary }}>
                      {systemStats?.users?.total || 0}
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                      Hoạt động: {systemStats?.users?.byStatus?.active || 0} | Đang
                      chờ: {systemStats?.users?.byStatus?.pending || 0}
                    </div>
                  </div>
                </div>

                <Link
                  to="/admin/registrations?status=pending"
                  className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-transform hover:scale-[1.02]"
                >
                  <div
                    className="absolute top-0 left-0 w-full h-[5px] rounded-t-2xl"
                    style={{
                      background: `linear-gradient(to right, ${COLORS.amber}, ${COLORS.orange})`,
                    }}
                  />
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
                  <div
                    className="absolute top-0 left-0 w-full h-[5px] rounded-t-2xl"
                    style={{
                      background: `linear-gradient(to right, ${COLORS.rose}, ${COLORS.pink})`,
                    }}
                  />
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
                  <div
                    className="absolute top-0 left-0 w-full h-[5px] rounded-t-2xl"
                    style={{
                      background: `linear-gradient(to right, ${COLORS.emerald}, ${COLORS.green})`,
                    }}
                  />
                  <div className="p-5 pt-7 text-center">
                    <div className="text-sm text-slate-600 mb-1">Đã duyệt</div>
                    <div className="text-3xl font-bold text-emerald-600">
                      {registrationStats?.byStatus?.approved || 0}
                    </div>
                    <div className="text-xs text-slate-500 mt-2">Thành công</div>
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
                  <div
                    className="absolute top-0 left-0 w-full h-[5px] rounded-t-xl"
                    style={{
                      background: `linear-gradient(to right, ${COLORS.cyan}, ${COLORS.blue})`,
                    }}
                  />
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

            {/* Drug & NFT Stats */}
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
                  <div
                    className="absolute top-0 left-0 w-full h-[5px] rounded-t-2xl"
                    style={{
                      background: `linear-gradient(to right, ${COLORS.blue}, ${COLORS.cyan})`,
                    }}
                  />
                  <div className="p-5 pt-7 text-center">
                    <div className="text-sm text-slate-600 mb-1">
                      Tổng số thuốc
                    </div>
                    <div className="text-3xl font-bold text-blue-600">
                      {drugStats?.drugs?.total || drugStats?.total || 0}
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                      Hoạt động: {drugStats?.drugs?.byStatus?.active || 0} | Không
                      hoạt động: {drugStats?.drugs?.byStatus?.inactive || 0}
                    </div>
                  </div>
                </Link>

                <div className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                  <div
                    className="absolute top-0 left-0 w-full h-[5px] rounded-t-2xl"
                    style={{
                      background: `linear-gradient(to right, ${COLORS.cyan}, ${COLORS.sky})`,
                    }}
                  />
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
                  <div
                    className="absolute top-0 left-0 w-full h-[5px] rounded-t-2xl"
                    style={{
                      background: `linear-gradient(to right, ${COLORS.sky}, ${COLORS.blue})`,
                    }}
                  />
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
                  <div
                    className="absolute top-0 left-0 w-full h-[5px] rounded-t-2xl"
                    style={{
                      background: `linear-gradient(to right, ${COLORS.emerald}, ${COLORS.green})`,
                    }}
                  />
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
                            {item.manufacturerName ||
                              item.manufacturerInfo?.companyName ||
                              "N/A"}
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
                      <div className="text-xs text-orange-600 mb-1">Thu hồi</div>
                      <div className="text-xl font-semibold text-orange-600">
                        {drugStats?.nfts?.byStatus?.recalled || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Supply Chain Stats */}
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
                  <div
                    className="absolute top-0 left-0 w-full h-[5px] rounded-t-2xl"
                    style={{
                      background: `linear-gradient(to right, ${COLORS.purple}, ${COLORS.pink})`,
                    }}
                  />
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
                  <div
                    className="absolute top-0 left-0 w-full h-[5px] rounded-t-2xl"
                    style={{
                      background: `linear-gradient(to right, ${COLORS.indigo}, ${COLORS.purple})`,
                    }}
                  />
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
                  <div
                    className="absolute top-0 left-0 w-full h-[5px] rounded-t-2xl"
                    style={{
                      background: `linear-gradient(to right, ${COLORS.teal}, ${COLORS.cyan})`,
                    }}
                  />
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
