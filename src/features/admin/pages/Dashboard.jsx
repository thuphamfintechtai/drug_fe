import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import DashboardLayout from "../../shared/components/DashboardLayout";
import TruckLoader from "../../shared/components/TruckLoader";
import { useDashboard } from "../hooks/useDashboard";
import { CHART_COLORS, COLORS } from "../constants/color";

export default function AdminDashboard() {
  const {
    systemStats,
    registrationStats,
    drugStats,
    blockchainStats,
    complianceStats,
    alertsStats,
    monthlyTrends,
    loading,
    loadingProgress,
    navigationItems,
    loadAllStats,
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
                        Giao dịch:{" "}
                        {complianceStats.compliance?.blockchainTransactions ||
                          0}{" "}
                        / {complianceStats.compliance?.totalRecords || 0}
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
                    <div
                      className="text-3xl font-bold"
                      style={{ color: COLORS.primary }}
                    >
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
                      Hoạt động: {drugStats?.drugs?.byStatus?.active || 0} |
                      Không hoạt động:{" "}
                      {drugStats?.drugs?.byStatus?.inactive || 0}
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
