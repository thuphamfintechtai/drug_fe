import { motion } from "framer-motion";
import DashboardLayout from "../../shared/components/DashboardLayout";
import TruckLoader from "../../shared/components/TruckLoader";
import usePasswordResetRequest from "../hooks/usePasswordResetRequest";
export default function PasswordResetRequests() {
  const {
    items,
    loading,
    error,
    loadingProgress,
    navigationItems,
    updateFilter,
    handleApprove,
    handleReject,
    openDetailModal,
    getRoleName,
    getStatusColor,
    status,
    page,
    selectedItem,
    showDetailModal,
    setShowDetailModal,
    actionLoading,
    rejectReason,
    setRejectReason,
  } = usePasswordResetRequest();
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
              Yêu cầu reset mật khẩu
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Duyệt yêu cầu reset mật khẩu của nhà sản xuất, nhà phân phối, nhà
              thuốc
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
              <div>
                <label className="block text-sm text-[#003544]/70 mb-1">
                  Trạng thái
                </label>
                <select
                  value={status}
                  onChange={(e) =>
                    updateFilter({ status: e.target.value, page: 1 })
                  }
                  className="w-full h-12 rounded-full border border-gray-200 bg-white text-gray-700 px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-[#48cae4] transition"
                >
                  <option value="pending">Đang chờ</option>
                  <option value="approved">Đã duyệt</option>
                  <option value="rejected">Đã từ chối</option>
                  <option value="">Tất cả</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* List */}
          <motion.div
            className="bg-white rounded-2xl border border-card-primary shadow-sm p-6"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            {error ? (
              <div className="p-6 text-red-600">{error}</div>
            ) : items.length === 0 ? (
              <div className="p-6 text-slate-600">Không có dữ liệu</div>
            ) : (
              <div className="space-y-4">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-[#003544]">
                            {item.user?.fullName ||
                              item.user?.username ||
                              "N/A"}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                              item.status
                            )}`}
                          >
                            {item.status === "pending"
                              ? "Đang chờ"
                              : item.status === "approved"
                              ? "Đã duyệt"
                              : item.status === "rejected"
                              ? "Đã từ chối"
                              : item.status}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-slate-600">
                          <div>Email: {item.user?.email}</div>
                          <div>Vai trò: {getRoleName(item.user?.role)}</div>
                          <div>
                            Yêu cầu lúc:{" "}
                            {new Date(item.createdAt).toLocaleString("vi-VN")}
                          </div>
                          {item.expiresAt && (
                            <div
                              className={
                                new Date() > new Date(item.expiresAt)
                                  ? "text-red-600"
                                  : ""
                              }
                            >
                              Hết hạn:{" "}
                              {new Date(item.expiresAt).toLocaleString("vi-VN")}
                              {new Date() > new Date(item.expiresAt) &&
                                " (Đã hết hạn)"}
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => openDetailModal(item)}
                        className="px-4 py-2 rounded-full border border-cyan-200 text-[#003544] hover:bg-[#90e0ef22] transition text-sm"
                      >
                        Chi tiết
                      </button>
                    </div>

                    {item.verificationInfo && (
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-sm">
                        <div className="font-semibold text-slate-800 mb-2">
                          Thông tin xác thực:
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-slate-600">License No:</span>
                            <span className="ml-2 font-mono text-slate-800">
                              {item.verificationInfo.licenseNo}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-600">Tax Code:</span>
                            <span className="ml-2 font-mono text-slate-800">
                              {item.verificationInfo.taxCode}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Pagination */}
          <div className="flex items-center justify-end gap-2 mt-4">
            <button
              disabled={page <= 1}
              onClick={() => updateFilter({ page: page - 1 })}
              className={`px-3 py-2 rounded-xl ${
                page <= 1
                  ? "bg-slate-200 !text-slate-400"
                  : "bg-white border border-card-primary hover:bg-[#f5fcff]"
              }`}
            >
              Trước
            </button>
            <span className="text-sm text-slate-700">Trang {page}</span>
            <button
              onClick={() => updateFilter({ page: page + 1 })}
              className="px-3 py-2 rounded-xl !text-white bg-secondary shadow-[0_10px_24px_rgba(0,180,216,0.30)] hover:shadow-[0_14px_36px_rgba(0,180,216,0.40)]"
            >
              Sau
            </button>
          </div>

          {/* Detail Modal */}
          {showDetailModal && selectedItem && (
            <div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowDetailModal(false)}
            >
              <div
                className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-secondary !text-white p-6 rounded-t-2xl">
                  <h3 className="text-2xl font-bold">
                    Chi tiết yêu cầu reset mật khẩu
                  </h3>
                </div>

                <div className="p-6 space-y-4">
                  {/* User info */}
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="font-semibold text-slate-800 mb-3">
                      Thông tin người dùng
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Tên:</span>
                        <span className="font-medium text-slate-800">
                          {selectedItem.user?.fullName ||
                            selectedItem.user?.username}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Email:</span>
                        <span className="font-medium text-slate-800">
                          {selectedItem.user?.email}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Vai trò:</span>
                        <span className="font-medium text-slate-800">
                          {getRoleName(selectedItem.user?.role)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Wallet:</span>
                        <span className="font-mono text-xs text-slate-800">
                          {selectedItem.user?.walletAddress || "Chưa có"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Verification info */}
                  {selectedItem.verificationInfo && (
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <h4 className="font-semibold text-slate-800 mb-3">
                        Thông tin xác thực
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">License No:</span>
                          <span className="font-mono text-slate-800">
                            {selectedItem.verificationInfo.licenseNo}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Tax Code:</span>
                          <span className="font-mono text-slate-800">
                            {selectedItem.verificationInfo.taxCode}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Request info */}
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="font-semibold text-slate-800 mb-3">
                      Thông tin yêu cầu
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Trạng thái:</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            selectedItem.status
                          )}`}
                        >
                          {selectedItem.status === "pending"
                            ? "Đang chờ"
                            : selectedItem.status === "approved"
                            ? "Đã duyệt"
                            : selectedItem.status === "rejected"
                            ? "Đã từ chối"
                            : selectedItem.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Yêu cầu lúc:</span>
                        <span className="font-medium text-slate-800">
                          {new Date(selectedItem.createdAt).toLocaleString(
                            "vi-VN"
                          )}
                        </span>
                      </div>
                      {selectedItem.expiresAt && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Hết hạn:</span>
                          <span
                            className={`font-medium ${
                              new Date() > new Date(selectedItem.expiresAt)
                                ? "text-red-600"
                                : "text-slate-800"
                            }`}
                          >
                            {new Date(selectedItem.expiresAt).toLocaleString(
                              "vi-VN"
                            )}
                            {new Date() > new Date(selectedItem.expiresAt) &&
                              " (Đã hết hạn)"}
                          </span>
                        </div>
                      )}
                      {selectedItem.ipAddress && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">IP Address:</span>
                          <span className="font-mono text-xs text-slate-800">
                            {selectedItem.ipAddress}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {selectedItem.status === "pending" && (
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <button
                          disabled={
                            actionLoading ||
                            new Date() > new Date(selectedItem.expiresAt)
                          }
                          onClick={() => handleApprove(selectedItem._id)}
                          className="flex-1 px-4 py-3 rounded-xl !text-white bg-secondary shadow hover:shadow-emerald-200/60 disabled:opacity-60 disabled:cursor-not-allowed font-medium"
                        >
                          {actionLoading
                            ? "Đang xử lý..."
                            : "Duyệt & Gửi mật khẩu mới"}
                        </button>
                      </div>

                      <div className="space-y-2">
                        <input
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Nhập lý do từ chối (bắt buộc)"
                          className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400"
                        />
                        <button
                          disabled={actionLoading}
                          onClick={() => handleReject(selectedItem._id)}
                          className="w-full px-4 py-3 rounded-xl !text-white bg-gradient-to-r from-rose-500 to-red-600 shadow hover:shadow-rose-200/60 disabled:opacity-60 font-medium"
                        >
                          {actionLoading ? "Đang xử lý..." : "Từ chối yêu cầu"}
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedItem.status === "approved" &&
                    selectedItem.reviewedAt && (
                      <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                        <div className="text-sm text-emerald-700">
                          Đã duyệt lúc:{" "}
                          {new Date(selectedItem.reviewedAt).toLocaleString(
                            "vi-VN"
                          )}
                        </div>
                        <div className="text-sm text-emerald-600 mt-1">
                          Mật khẩu mới đã được gửi đến email người dùng.
                        </div>
                      </div>
                    )}

                  {selectedItem.status === "rejected" && (
                    <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                      <div className="text-sm text-red-700">
                        Đã từ chối lúc:{" "}
                        {new Date(selectedItem.reviewedAt).toLocaleString(
                          "vi-VN"
                        )}
                      </div>
                      {selectedItem.rejectionReason && (
                        <div className="text-sm text-red-600 mt-1">
                          Lý do: {selectedItem.rejectionReason}
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
