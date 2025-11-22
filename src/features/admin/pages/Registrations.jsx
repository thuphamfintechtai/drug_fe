import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardLayout from "../../shared/components/DashboardLayout";
import TruckLoader from "../../shared/components/TruckLoader";
import { useRegistrations } from "../hooks/useRegistrations";
import { navigationItems } from "../constants/navigationItems3";

export default function AdminRegistrations() {
  const {
    items,
    loading,
    error,
    stats,
    loadingProgress,
    retryingIds,
    updateFilter,
    role,
    status,
    translateRole,
    translateStatus,
    page,
    handleRetryBlockchain,
  } = useRegistrations();
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
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="w-full max-w-2xl">
            <TruckLoader height={72} progress={loadingProgress} showTrack />
          </div>
          <div className="text-lg text-slate-600 mt-6">Đang tải dữ liệu...</div>
        </div>
      ) : (
        <>
          {/* Banner */}
          <div className="bg-white rounded-xl border border-card-primary shadow-sm p-5 mb-4">
            <h2 className="text-xl font-semibold text-[#007b91]">
              Duyệt đăng ký
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Lọc theo vai trò và trạng thái – xử lý nhanh, chính xác.
            </p>
          </div>

          {/* Filters */}
          <motion.div
            className="rounded-2xl bg-white border border-card-primary shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-4 mb-4"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            <div className="flex flex-col md:flex-row gap-3 md:items-end">
              <div className="flex-1 max-w-xs">
                <label className="block text-sm text-[#003544]/70 mb-1">
                  Vai trò
                </label>
                <select
                  className="w-full h-12 rounded-full border border-gray-200 bg-white text-gray-700 px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-[#48cae4] transition"
                  value={role}
                  onChange={(e) =>
                    updateFilter({ role: e.target.value, page: 1 })
                  }
                >
                  <option value="">Tất cả</option>
                  <option value="pharma_company">Nhà sản xuất</option>
                  <option value="distributor">Nhà phân phối</option>
                  <option value="pharmacy">Nhà thuốc</option>
                </select>
              </div>
              <div className="flex-1 max-w-xs">
                <label className="block text-sm text-[#003544]/70 mb-1">
                  Trạng thái
                </label>
                <select
                  className="w-full h-12 rounded-full border border-gray-200 bg-white text-gray-700 px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-[#48cae4] transition"
                  value={status}
                  onChange={(e) =>
                    updateFilter({ status: e.target.value, page: 1 })
                  }
                >
                  <option value="pending">Đang chờ</option>
                  <option value="approved_pending_blockchain">
                    Đã duyệt - Chờ blockchain
                  </option>
                  <option value="approved">Đã duyệt</option>
                  <option value="blockchain_failed">Lỗi blockchain</option>
                  <option value="rejected">Từ chối</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          {stats && (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4"
              variants={fadeUp}
              initial="hidden"
              animate="show"
            >
              <div className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-cyan-400 to-blue-400 rounded-t-2xl" />
                <div className="p-5 pt-7 text-center">
                  <div className="text-sm text-slate-600">Tổng số</div>
                  <div className="text-2xl font-bold text-cyan-600">
                    {stats.total || 0}
                  </div>
                </div>
              </div>
              <div className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-amber-400 to-yellow-400 rounded-t-2xl" />
                <div className="p-5 pt-7 text-center">
                  <div className="text-sm text-slate-600">Đang chờ</div>
                  <div className="text-2xl font-bold text-amber-600">
                    {stats.byStatus?.pending || 0}
                  </div>
                </div>
              </div>
              <div className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-emerald-400 to-green-400 rounded-t-2xl" />
                <div className="p-5 pt-7 text-center">
                  <div className="text-sm text-slate-600">Đã duyệt</div>
                  <div className="text-2xl font-bold text-emerald-600">
                    {(stats.byStatus?.approved || 0) +
                      (stats.byStatus?.approved_pending_blockchain || 0)}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    ({stats.byStatus?.approved || 0} hoàn tất,{" "}
                    {stats.byStatus?.approved_pending_blockchain || 0} chờ
                    blockchain)
                  </div>
                </div>
              </div>
              <div className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-rose-400 to-red-400 rounded-t-2xl" />
                <div className="p-5 pt-7 text-center">
                  <div className="text-sm text-slate-600">Lỗi blockchain</div>
                  <div className="text-2xl font-bold text-rose-600">
                    {stats.byStatus?.blockchain_failed || 0}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Table */}
          <motion.div
            className="bg-white rounded-2xl border border-card-primary shadow-sm overflow-x-auto"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            {error ? (
              <div className="p-6 text-red-600">{error}</div>
            ) : (
              <table className="min-w-full border-collapse">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr className="text-left text-gray-700">
                    <th className="px-4 py-3">Người dùng</th>
                    <th className="px-4 py-3">Vai trò</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Ngày tạo</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((r) => (
                    <tr
                      key={r._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-[#003544]">
                          {r?.user?.fullName || 
                           r?.user?.username || 
                           r?.companyInfo?.name || 
                           "N/A"}
                        </div>
                        <div className="text-sm text-[#003544]/70">
                          {r?.user?.email || 
                           r?.companyInfo?.contactEmail || 
                           "N/A"}
                        </div>
                        {r?.user?.walletAddress && (
                          <div className="text-xs text-[#003544]/50 mt-1">
                            {r.user.walletAddress.slice(0, 6)}...{r.user.walletAddress.slice(-4)}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[#003544]/80">
                        {translateRole(r.role)}
                      </td>
                      <td className="px-4 py-3 text-[#003544]/80">
                        {translateStatus(r.status)}
                      </td>
                      <td className="px-4 py-3 text-[#003544]/80">
                        {new Date(r.createdAt).toLocaleString("vi-VN")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/registrations/${r._id}`}
                            className="inline-flex items-center px-3 py-2 rounded-full border border-cyan-200 text-[#003544] hover:bg-[#90e0ef22] transition"
                          >
                            Chi tiết
                          </Link>
                          {r.status === "blockchain_failed" && (
                            <button
                              onClick={() => handleRetryBlockchain(r._id)}
                              disabled={retryingIds.has(r._id)}
                              className="px-4 py-2 border-2 border-[#3db6d9] bg-white !text-[#3db6d9] rounded-full font-semibold hover:bg-[#3db6d9] hover:!text-white hover:shadow-md hover:shadow-[#3db6d9]/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {retryingIds.has(r._id)
                                ? "Đang xử lý..."
                                : "Retry Blockchain"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td className="px-4 py-4 text-slate-600" colSpan={5}>
                        Không có dữ liệu
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </motion.div>

          {/* Pagination */}
          <div className="flex items-center justify-end gap-2 mt-4">
            <button
              disabled={page <= 1}
              onClick={() => updateFilter({ page: page - 1 })}
              className={`px-3 py-2 rounded-xl ${
                page <= 1
                  ? "bg-slate-200 text-slate-400"
                  : "bg-white border border-cyan-200 hover:bg-[#f5fcff]"
              }`}
            >
              Trước
            </button>
            <span className="text-sm text-slate-700">Trang {page}</span>
            <button
              onClick={() => updateFilter({ page: page + 1 })}
              className="px-3 py-2 rounded-xl !text-white bg-linear-to-r from-secondary to-primary shadow-[0_10px_24px_rgba(0,180,216,0.30)] hover:shadow-[0_14px_36px_rgba(0,180,216,0.40)]"
            >
              Sau
            </button>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
