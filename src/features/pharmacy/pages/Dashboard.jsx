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
import DashboardLayout from "../../shared/components/DashboardLayout";
import TruckLoader from "../../shared/components/TruckLoader";
import { useDashboard } from "../hooks/useDashboad";
import { navigationItems, CHART_COLORS, COLORS } from "../constants/constant";

export default function PharmacyDashboard() {
  const {
    stats,
    dashboardStats,
    qualityStats,
    chartData,
    loading,
    loadingProgress,
    loadAllData,
    invoiceStatusData,
    nftStatusData,
    receiptsStatusData,
  } = useDashboard();

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
          {/* Header banner */}
          <div className="bg-white rounded-xl border border-card-primary shadow-sm p-5 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-[#007b91] flex items-center gap-2">
                Quản lý nhà thuốc
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
                    to="/pharmacy/invoices"
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
                        Tổng đơn nhận
                      </div>
                      <div className="text-3xl font-bold text-blue-600">
                        {displayStats?.overview?.totalInvoicesReceived ||
                          displayStats?.invoicesReceived?.total ||
                          displayStats?.invoices?.total ||
                          0}
                      </div>
                      <div className="text-xs text-slate-500 mt-2">
                        Đơn từ NPP
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
                      <div className="text-sm text-slate-600 mb-1">
                        Tổng biên nhận
                      </div>
                      <div className="text-3xl font-bold text-emerald-600">
                        {displayStats?.overview?.totalReceipts ||
                          displayStats?.receipts?.total ||
                          0}
                      </div>
                      <div className="text-xs text-slate-500 mt-2">
                        Biên nhận
                      </div>
                    </div>
                  </div>

                  <div className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div
                      className="absolute top-0 left-0 w-full h-[5px] rounded-t-2xl"
                      style={{
                        background: `linear-gradient(to right, ${COLORS.cyan}, ${COLORS.sky})`,
                      }}
                    />
                    <div className="p-5 pt-7 text-center">
                      <div className="text-sm text-slate-600 mb-1">
                        Tổng NFT
                      </div>
                      <div className="text-3xl font-bold text-cyan-600">
                        {displayStats?.overview?.totalNFTs ||
                          displayStats?.nfts?.total ||
                          0}
                      </div>
                      <div className="text-xs text-slate-500 mt-2">
                        Token đã nhận
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
                      <div className="text-sm text-slate-600 mb-1">Đã nhận</div>
                      <div className="text-3xl font-bold text-emerald-600">
                        {displayStats?.overview?.invoicesReceived?.byStatus?.sent ||
                          displayStats?.invoicesReceived?.byStatus?.sent ||
                          displayStats?.invoices?.byStatus?.sent ||
                          0}
                      </div>
                      <div className="text-xs text-slate-500 mt-2">
                        Đã xác nhận
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
                  {chartData.oneWeek &&
                  Array.isArray(chartData.oneWeek) &&
                  chartData.oneWeek.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={chartData.oneWeek}>
                        <defs>
                          <linearGradient
                            id="colorInvoicesPharmacy"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor={COLORS.secondary}
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor={COLORS.secondary}
                              stopOpacity={0}
                            />
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
                          fill="url(#colorInvoicesPharmacy)"
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
                  {chartData.todayYesterday &&
                  Array.isArray(chartData.todayYesterday) &&
                  chartData.todayYesterday.length > 0 ? (
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
                    Phân bố NFT
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

                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
                >
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">
                    Phân bố biên nhận
                  </h3>
                  {receiptsStatusData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={receiptsStatusData}
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
                          {receiptsStatusData.map((entry, index) => (
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
              {chartData.monthly &&
                Array.isArray(chartData.monthly) &&
                chartData.monthly.length > 0 && (
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
                          dataKey="receipts"
                          stroke={COLORS.third}
                          strokeWidth={3}
                          name="Biên nhận"
                          dot={{ fill: COLORS.third, r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </motion.div>
                )}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
