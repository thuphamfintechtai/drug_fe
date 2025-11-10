import { useEffect, useState, useRef } from "react";
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
  getStatistics,
  getDashboardStats,
  getChartOneWeek,
  getChartTodayYesterday,
  getMonthlyTrends,
} from "../../services/distributor/distributorService";

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
  fuchsia: "#d946ef",
};

const CHART_COLORS = [
  COLORS.secondary,
  COLORS.third,
  COLORS.cyan,
  COLORS.sky,
  COLORS.blue,
  COLORS.emerald,
];

export default function DistributorDashboard() {
  const [stats, setStats] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [chartData, setChartData] = useState({
    oneWeek: null,
    todayYesterday: null,
    monthly: null,
  });
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const progressIntervalRef = useRef(null);

  useEffect(() => {
    loadAllData();

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setLoadingProgress(0);

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      progressIntervalRef.current = setInterval(() => {
        setLoadingProgress((prev) => Math.min(prev + 0.02, 0.9));
      }, 50);

      // Load all data in parallel
      const [statsRes, dashboardRes, oneWeekRes, todayYesterdayRes, monthlyRes] =
        await Promise.allSettled([
          getStatistics(),
          getDashboardStats(),
          getChartOneWeek(),
          getChartTodayYesterday(),
          getMonthlyTrends(6),
        ]);

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      // Process stats
      if (statsRes.status === "fulfilled" && statsRes.value.data?.success) {
        setStats(statsRes.value.data.data);
      }

      // Process dashboard stats
      if (dashboardRes.status === "fulfilled" && dashboardRes.value.data?.success) {
        setDashboardStats(dashboardRes.value.data.data);
      }

      // Process chart data - one week
      if (oneWeekRes.status === "fulfilled" && oneWeekRes.value.data?.success) {
        const data = oneWeekRes.value.data.data;
        const formattedData = Object.entries(data.dailyStats || {})
          .map(([date, stats]) => ({
            date: new Date(date).toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
            }),
            invoicesReceived: stats.count || 0,
            quantity: stats.quantity || 0,
          }))
          .sort((a, b) => a.date.localeCompare(b.date));
        setChartData((prev) => ({ ...prev, oneWeek: formattedData }));
      }

      // Process today vs yesterday
      if (
        todayYesterdayRes.status === "fulfilled" &&
        todayYesterdayRes.value.data?.success
      ) {
        const data = todayYesterdayRes.value.data.data;
        setChartData((prev) => ({
          ...prev,
          todayYesterday: [
            { name: "Hôm qua", count: data.yesterdayCount || 0 },
            { name: "Hôm nay", count: data.todayCount || 0 },
          ],
        }));
      }

      // Process monthly trends
      if (monthlyRes.status === "fulfilled" && monthlyRes.value.data?.success) {
        const data = monthlyRes.value.data.data;
        const formattedData = (data.trends || []).map((item) => ({
          month: item.month,
          transfers: item.transfers || 0,
        }));
        setChartData((prev) => ({ ...prev, monthly: formattedData }));
      }

      setLoadingProgress(1);
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (error) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      console.error("Lỗi khi tải thống kê:", error);
    } finally {
      setLoading(false);
      setTimeout(() => setLoadingProgress(0), 500);
    }
  };

  const navigationItems = [
    {
      path: "/distributor",
      label: "Tổng quan",
      icon: null,
      active: true,
    },
    {
      path: "/distributor/invoices",
      label: "Đơn từ nhà SX",
      icon: null,
      active: false,
    },
    {
      path: "/distributor/transfer-pharmacy",
      label: "Chuyển cho NT",
      icon: null,
      active: false,
    },
    {
      path: "/distributor/distribution-history",
      label: "Lịch sử phân phối",
      icon: null,
      active: false,
    },
    {
      path: "/distributor/transfer-history",
      label: "Lịch sử chuyển NT",
      icon: null,
      active: false,
    },
    {
      path: "/distributor/drugs",
      label: "Quản lý thuốc",
      icon: null,
      active: false,
    },
    {
      path: "/distributor/nft-tracking",
      label: "Tra cứu NFT",
      icon: null,
      active: false,
    },
    {
      path: "/distributor/profile",
      label: "Hồ sơ",
      icon: null,
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

  const displayStats = dashboardStats || stats;

  // Prepare invoice status data for pie chart
  const invoiceStatusData = displayStats?.invoicesReceived?.byStatus ||
    displayStats?.invoices?.byStatus
    ? Object.entries(
        displayStats.invoicesReceived?.byStatus ||
          displayStats.invoices?.byStatus
      )
        .map(([name, value]) => ({
          name:
            name === "pending"
              ? "Chờ nhận"
              : name === "sent"
              ? "Đã nhận"
              : name === "paid"
              ? "Đã thanh toán"
              : name,
          value: value || 0,
        }))
        .filter((item) => item.value > 0)
    : [];

  // Prepare transfer to pharmacy status data
  const transferStatusData = displayStats?.transfersToPharmacy?.byStatus
    ? Object.entries(displayStats.transfersToPharmacy.byStatus)
        .map(([name, value]) => ({
          name:
            name === "draft"
              ? "Nháp"
              : name === "sent"
              ? "Đã gửi"
              : name === "paid"
              ? "Đã thanh toán"
              : name,
          value: value || 0,
        }))
        .filter((item) => item.value > 0)
    : [];

  // Prepare distribution status data
  const distributionStatusData = displayStats?.distributions?.byStatus
    ? Object.entries(displayStats.distributions.byStatus)
        .map(([name, value]) => ({
          name:
            name === "pending"
              ? "Chờ xử lý"
              : name === "confirmed"
              ? "Đã xác nhận"
              : name === "delivered"
              ? "Đã giao"
              : name === "in_transit"
              ? "Đang vận chuyển"
              : name === "rejected"
              ? "Từ chối"
              : name,
          value: value || 0,
        }))
        .filter((item) => item.value > 0)
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
          <div className="bg-white rounded-xl border border-card-primary shadow-sm p-5 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-[#007b91]">
                Quản lý nhà phân phối
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Tổng quan hệ thống và các chức năng chính
              </p>
            </div>
            <button
              onClick={loadAllData}
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

          {displayStats && (
            <div className="space-y-8">
              {/* Overview Cards */}
              <motion.div variants={fadeUp} initial="hidden" animate="show">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">
                  Tổng quan
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <Link
                    to="/distributor/invoices"
                    className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-transform hover:scale-[1.02]"
                  >
                    <div
                      className="absolute top-0 left-0 w-full h-[5px] rounded-t-2xl"
                      style={{
                        background: `linear-gradient(to right, ${COLORS.sky}, ${COLORS.cyan})`,
                      }}
                    />
                    <div className="p-5 pt-7 text-center">
                      <div className="text-sm text-slate-600 mb-1">
                        Tổng đơn nhận
                      </div>
                      <div className="text-3xl font-bold text-sky-600">
                        {displayStats?.overview?.totalInvoicesReceived ||
                          displayStats?.invoicesReceived?.total ||
                          displayStats?.invoices?.total ||
                          0}
                      </div>
                      <div className="text-xs text-slate-500 mt-2">
                        Đơn từ nhà SX
                      </div>
                    </div>
                  </Link>

                  <Link
                    to="/distributor/distribution-history"
                    className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-transform hover:scale-[1.02]"
                  >
                    <div
                      className="absolute top-0 left-0 w-full h-[5px] rounded-t-2xl"
                      style={{
                        background: `linear-gradient(to right, ${COLORS.fuchsia}, ${COLORS.purple})`,
                      }}
                    />
                    <div className="p-5 pt-7 text-center">
                      <div className="text-sm text-slate-600 mb-1">
                        Tổng phân phối
                      </div>
                      <div className="text-3xl font-bold text-fuchsia-600">
                        {displayStats?.overview?.totalDistributions ||
                          displayStats?.distributions?.total ||
                          0}
                      </div>
                      <div className="text-xs text-slate-500 mt-2">
                        Lượt phân phối
                      </div>
                    </div>
                  </Link>

                  <Link
                    to="/distributor/transfer-history"
                    className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-transform hover:scale-[1.02]"
                  >
                    <div
                      className="absolute top-0 left-0 w-full h-[5px] rounded-t-2xl"
                      style={{
                        background: `linear-gradient(to right, ${COLORS.orange}, ${COLORS.amber})`,
                      }}
                    />
                    <div className="p-5 pt-7 text-center">
                      <div className="text-sm text-slate-600 mb-1">
                        Chuyển cho NT
                      </div>
                      <div className="text-3xl font-bold text-orange-600">
                        {displayStats?.overview?.totalTransfersToPharmacy ||
                          displayStats?.transfersToPharmacy?.total ||
                          0}
                      </div>
                      <div className="text-xs text-slate-500 mt-2">
                        Lượt chuyển
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
                        {displayStats?.overview?.totalNFTs ||
                          displayStats?.nfts?.total ||
                          0}
                      </div>
                      <div className="text-xs text-slate-500 mt-2">
                        Token đang giữ
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Charts Row 1: Line Chart (7 days) and Bar Chart (Today vs Yesterday) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
                >
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">
                    Đơn hàng nhận 7 ngày gần nhất
                  </h3>
                  {chartData.oneWeek && chartData.oneWeek.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={chartData.oneWeek}>
                        <defs>
                          <linearGradient id="colorInvoicesDistributor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS.secondary} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={COLORS.secondary} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                          }}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="invoicesReceived"
                          stroke={COLORS.secondary}
                          fillOpacity={1}
                          fill="url(#colorInvoicesDistributor)"
                          name="Số đơn"
                        />
                      </AreaChart>
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
                    So sánh hôm nay và hôm qua
                  </h3>
                  {chartData.todayYesterday ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData.todayYesterday}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar
                          dataKey="count"
                          fill={COLORS.third}
                          name="Số đơn nhận"
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-slate-400">
                      Chưa có dữ liệu
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Charts Row 2: Pie Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
                >
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">
                    Phân bố đơn hàng
                  </h3>
                  {invoiceStatusData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={invoiceStatusData}
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
                          {invoiceStatusData.map((entry, index) => (
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
                    Phân bố chuyển giao cho NT
                  </h3>
                  {transferStatusData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={transferStatusData}
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
                          {transferStatusData.map((entry, index) => (
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
                    Phân bố phân phối
                  </h3>
                  {distributionStatusData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={distributionStatusData}
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
                          {distributionStatusData.map((entry, index) => (
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

              {/* Monthly Trends Chart */}
              {chartData.monthly && chartData.monthly.length > 0 && (
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
                    <LineChart data={chartData.monthly}>
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
                        dataKey="transfers"
                        stroke={COLORS.third}
                        strokeWidth={3}
                        name="Chuyển giao"
                        dot={{ fill: COLORS.third, r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </motion.div>
              )}

              {/* Detailed Statistics Cards */}
              <motion.div variants={fadeUp} initial="hidden" animate="show">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">
                  Chi tiết đơn hàng & Chuyển giao
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div
                      className="absolute top-0 left-0 w-full h-[5px] rounded-t-2xl"
                      style={{
                        background: `linear-gradient(to right, ${COLORS.amber}, ${COLORS.orange})`,
                      }}
                    />
                    <div className="p-5 pt-7 text-center">
                      <div className="text-sm text-slate-600 mb-1">Chờ nhận</div>
                      <div className="text-3xl font-bold text-amber-600">
                        {displayStats?.invoicesReceived?.byStatus?.pending ||
                          displayStats?.invoices?.byStatus?.pending ||
                          0}
                      </div>
                      <div className="text-xs text-slate-500 mt-2">Pending</div>
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
                      <div className="text-sm text-slate-600 mb-1">Đã nhận</div>
                      <div className="text-3xl font-bold text-emerald-600">
                        {displayStats?.invoicesReceived?.byStatus?.sent ||
                          displayStats?.invoices?.byStatus?.sent ||
                          0}
                      </div>
                      <div className="text-xs text-slate-500 mt-2">Sent</div>
                    </div>
                  </div>

                  <div className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div
                      className="absolute top-0 left-0 w-full h-[5px] rounded-t-2xl"
                      style={{
                        background: `linear-gradient(to right, ${COLORS.green}, ${COLORS.emerald})`,
                      }}
                    />
                    <div className="p-5 pt-7 text-center">
                      <div className="text-sm text-slate-600 mb-1">
                        Đã thanh toán
                      </div>
                      <div className="text-3xl font-bold text-green-600">
                        {displayStats?.invoicesReceived?.byStatus?.paid ||
                          displayStats?.invoices?.byStatus?.paid ||
                          0}
                      </div>
                      <div className="text-xs text-slate-500 mt-2">Paid</div>
                    </div>
                  </div>

                  <div className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div
                      className="absolute top-0 left-0 w-full h-[5px] rounded-t-2xl"
                      style={{
                        background: `linear-gradient(to right, ${COLORS.sky}, ${COLORS.cyan})`,
                      }}
                    />
                    <div className="p-5 pt-7 text-center">
                      <div className="text-sm text-slate-600 mb-1">Đã gửi NT</div>
                      <div className="text-3xl font-bold text-cyan-600">
                        {displayStats?.transfersToPharmacy?.byStatus?.sent || 0}
                      </div>
                      <div className="text-xs text-slate-500 mt-2">Sent</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="rounded-2xl border border-secondary p-6 bg-white"
              >
                <h3 className="text-lg font-semibold text-cyan-800 mb-4">
                  Hành động nhanh
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Link
                    to="/distributor/invoices"
                    className="p-4 bg-white rounded-xl border border-secondary hover:border-primary hover:shadow-md transition text-center"
                  >
                    <div className="text-sm font-text-primary">Xem đơn hàng</div>
                  </Link>
                  <Link
                    to="/distributor/transfer-pharmacy"
                    className="p-4 bg-white rounded-xl border border-secondary hover:border-primary hover:shadow-md transition text-center"
                  >
                    <div className="text-sm font-text-primary">
                      Chuyển cho nhà thuốc
                    </div>
                  </Link>
                  <Link
                    to="/distributor/nft-tracking"
                    className="p-4 bg-white rounded-xl border border-secondary hover:border-primary hover:shadow-md transition text-center"
                  >
                    <div className="text-sm font-text-primary">Tra cứu NFT</div>
                  </Link>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
