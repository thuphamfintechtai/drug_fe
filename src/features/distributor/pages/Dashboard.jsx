import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
import { COLORS } from "../constants/color";
import { useDashboard } from "../hooks/useDashboard";
import { navigationItems } from "../constants/navigationItems";

export default function DistributorDashboard() {
  const {
    isLoading,
    isRefreshing,
    isFetching,
    displayStats,
    overview,
    chartOneWeekData,
    chartTodayYesterdayData,
    chartMonthlyData,
    handleRefresh,
    invoiceStatusData,
    transferStatusData,
    distributionStatusData,
  } = useDashboard();

  // Debug: Log displayStats để kiểm tra
  console.log("Dashboard - displayStats:", displayStats);
  console.log("Dashboard - invoices.total:", displayStats?.invoices?.total);
  console.log(
    "Dashboard - distributions.total:",
    displayStats?.distributions?.total
  );
  console.log(
    "Dashboard - transfersToPharmacy.total:",
    displayStats?.transfersToPharmacy?.total
  );
  console.log("Dashboard - nfts.total:", displayStats?.nfts?.total);

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
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="w-full max-w-2xl">
            <TruckLoader height={72} progress={0.5} showTrack />
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
              onClick={handleRefresh}
              disabled={isRefreshing || isFetching}
              className="p-2.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 transition disabled:opacity-50"
              title="Làm mới dữ liệu"
            >
              <svg
                className={`w-5 h-5 text-cyan-600 transition-transform ${
                  isRefreshing || isFetching ? "animate-spin" : ""
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
                      {displayStats?.invoices?.total ||
                        displayStats?.overview?.totalInvoicesReceived ||
                        displayStats?.invoicesReceived?.total ||
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
                      {displayStats?.distributions?.total ||
                        displayStats?.overview?.totalDistributions ||
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
                      {displayStats?.transfersToPharmacy?.total ||
                        displayStats?.overview?.totalTransfersToPharmacy ||
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
                      {displayStats?.nfts?.total ||
                        displayStats?.overview?.totalNFTs ||
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
                {chartOneWeekData ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartOneWeekData}>
                      <defs>
                        <linearGradient
                          id="colorInvoicesDistributor"
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
                {chartTodayYesterdayData ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartTodayYesterdayData}>
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

            {/* Monthly Trends Chart */}
            {chartMonthlyData && chartMonthlyData.length > 0 && (
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
                  <LineChart data={chartMonthlyData}>
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
                      dataKey="invoicesReceived"
                      stroke={COLORS.primary}
                      strokeWidth={2}
                      name="Đơn hàng nhận"
                      dot={{ fill: COLORS.primary, r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="distributions"
                      stroke={COLORS.secondary}
                      strokeWidth={2}
                      name="Phân phối"
                      dot={{ fill: COLORS.secondary, r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="transfersToPharmacy"
                      stroke={COLORS.third}
                      strokeWidth={2}
                      name="Chuyển giao cho nhà thuốc"
                      dot={{ fill: COLORS.third, r: 4 }}
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
                      {overview?.invoicesReceived?.byStatus?.pending ||
                        displayStats?.invoicesReceived?.byStatus?.pending ||
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
                      {overview?.invoicesReceived?.byStatus?.sent ||
                        displayStats?.invoicesReceived?.byStatus?.sent ||
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
                      {overview?.invoicesReceived?.byStatus?.paid ||
                        displayStats?.invoicesReceived?.byStatus?.paid ||
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
                      {overview?.transfersToPharmacy?.byStatus?.sent ||
                        displayStats?.transfersToPharmacy?.byStatus?.sent ||
                        0}
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
        </div>
      )}
    </DashboardLayout>
  );
}
