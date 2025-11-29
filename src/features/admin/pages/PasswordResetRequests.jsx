import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
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
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [tempRejectReason, setTempRejectReason] = useState("");
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
                        className="px-4 py-2 rounded-full border border-primary text-[#003544] hover:bg-[#90e0ef22] transition text-sm"
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
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetailModal(false)}
            >
              <motion.div
                className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-secondary border-b border-primary/20 px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        Chi tiết yêu cầu reset mật khẩu
                      </h3>
                      <p className="text-sm text-white/80 mt-1">
                        ID: {selectedItem.id || selectedItem._id}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowDetailModal(false)}
                      className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="overflow-y-auto flex-1 p-6 space-y-6">
                  {/* Thông tin người dùng */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-primary to-secondary border-b border-primary/20 px-6 py-4">
                      <h4 className="text-base font-semibold text-white">
                        Thông tin người dùng
                      </h4>
                    </div>
                    <div className="p-6">
                      <div className="space-y-0 divide-y divide-slate-200">
                        <div className="flex flex-col sm:flex-row sm:items-center py-4 first:pt-0">
                          <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0">
                            Tên
                          </div>
                          <div className="text-base font-semibold text-slate-800 flex-1">
                            {selectedItem.user?.fullName ||
                              selectedItem.user?.username ||
                              "N/A"}
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center py-4">
                          <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0">
                            Email
                          </div>
                          <div className="text-base font-semibold text-slate-800 flex-1">
                            {selectedItem.user?.email || "N/A"}
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center py-4">
                          <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0">
                            Vai trò
                          </div>
                          <div className="text-base font-semibold text-slate-800 flex-1">
                            {getRoleName(selectedItem.user?.role)}
                          </div>
                        </div>
                        {selectedItem.user?.walletAddress && (
                          <div className="flex flex-col sm:flex-row sm:items-start py-4 last:pb-0">
                            <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0 sm:pt-1">
                              Wallet Address
                            </div>
                            <div className="text-sm font-semibold text-slate-800 font-mono break-all flex-1">
                              {selectedItem.user.walletAddress}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Thông tin xác thực */}
                  {selectedItem.verificationInfo && (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="bg-gradient-to-r from-primary to-secondary border-b border-primary/20 px-6 py-4">
                        <h4 className="text-base font-semibold text-white">
                          Thông tin xác thực
                        </h4>
                      </div>
                      <div className="p-6">
                        <div className="space-y-0 divide-y divide-slate-200">
                          {selectedItem.verificationInfo.licenseNo && (
                            <div className="flex flex-col sm:flex-row sm:items-center py-4 first:pt-0">
                              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0">
                                License No
                              </div>
                              <div className="text-base font-semibold text-slate-800 font-mono flex-1">
                                {selectedItem.verificationInfo.licenseNo}
                              </div>
                            </div>
                          )}
                          {selectedItem.verificationInfo.taxCode && (
                            <div className="flex flex-col sm:flex-row sm:items-center py-4 last:pb-0">
                              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0">
                                Tax Code
                              </div>
                              <div className="text-base font-semibold text-slate-800 font-mono flex-1">
                                {selectedItem.verificationInfo.taxCode}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Thông tin yêu cầu */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-primary to-secondary border-b border-primary/20 px-6 py-4">
                      <h4 className="text-base font-semibold text-white">
                        Thông tin yêu cầu
                      </h4>
                    </div>
                    <div className="p-6">
                      <div className="space-y-0 divide-y divide-slate-200">
                        <div className="flex flex-col sm:flex-row sm:items-center py-4 first:pt-0">
                          <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0">
                            Trạng thái
                          </div>
                          <div className="flex-1">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
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
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center py-4">
                          <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0">
                            Yêu cầu lúc
                          </div>
                          <div className="text-base font-semibold text-slate-800 flex-1">
                            {new Date(selectedItem.createdAt).toLocaleString(
                              "vi-VN"
                            )}
                          </div>
                        </div>
                        {selectedItem.expiresAt && (
                          <div className="flex flex-col sm:flex-row sm:items-center py-4">
                            <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0">
                              Hết hạn
                            </div>
                            <div
                              className={`text-base font-semibold flex-1 ${
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
                            </div>
                          </div>
                        )}
                        {selectedItem.ipAddress && (
                          <div className="flex flex-col sm:flex-row sm:items-center py-4 last:pb-0">
                            <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0">
                              IP Address
                            </div>
                            <div className="text-base font-semibold text-slate-800 font-mono flex-1">
                              {selectedItem.ipAddress}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {selectedItem.status === "pending" && (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          disabled={
                            actionLoading ||
                            new Date() > new Date(selectedItem.expiresAt)
                          }
                          onClick={() => setShowApproveModal(true)}
                          className="flex-1 px-6 py-3.5 rounded-xl !text-white bg-gradient-to-r from-emerald-500 to-green-600 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed transition font-semibold flex items-center justify-center gap-2"
                        >
                          <span className="text-xl">✓</span>
                          <span>Duyệt & Gửi mật khẩu mới</span>
                        </button>
                        <button
                          disabled={actionLoading}
                          onClick={() => {
                            setTempRejectReason(rejectReason || "");
                            setShowRejectModal(true);
                          }}
                          className="flex-1 px-6 py-3.5 rounded-xl !text-white bg-gradient-to-r from-rose-500 to-red-600 shadow-lg hover:shadow-xl disabled:opacity-60 transition font-semibold flex items-center justify-center gap-2"
                        >
                          <span className="text-xl">✕</span>
                          <span>Từ chối</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Status messages */}
                  {selectedItem.status === "approved" &&
                    selectedItem.reviewedAt && (
                      <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                        <div className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-white text-xs">✓</span>
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-emerald-700">
                              Đã duyệt lúc:{" "}
                              {new Date(selectedItem.reviewedAt).toLocaleString(
                                "vi-VN"
                              )}
                            </div>
                            <div className="text-sm text-emerald-600 mt-1">
                              Mật khẩu mới đã được gửi đến email người dùng.
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  {selectedItem.status === "rejected" && (
                    <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-white text-xs">✕</span>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-red-700">
                            Đã từ chối lúc:{" "}
                            {selectedItem.reviewedAt &&
                              new Date(selectedItem.reviewedAt).toLocaleString(
                                "vi-VN"
                              )}
                          </div>
                          {selectedItem.rejectionReason && (
                            <div className="text-sm text-red-600 mt-1">
                              Lý do: {selectedItem.rejectionReason}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Approve Confirmation Modal */}
          <AnimatePresence>
            {showApproveModal && selectedItem && (
              <motion.div
                className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowApproveModal(false)}
              >
                <motion.div
                  className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                      <span className="text-2xl text-emerald-600">✓</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">
                        Xác nhận duyệt yêu cầu
                      </h3>
                      <p className="text-sm text-slate-600">
                        Bạn có chắc chắn muốn duyệt và gửi mật khẩu mới?
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setShowApproveModal(false)}
                      className="flex-1 px-4 py-2.5 rounded-xl border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={() => {
                        handleApprove(selectedItem.id || selectedItem._id);
                        setShowApproveModal(false);
                      }}
                      disabled={actionLoading}
                      className="flex-1 px-4 py-2.5 rounded-xl text-white bg-gradient-to-r from-emerald-500 to-green-600 shadow-lg hover:shadow-xl disabled:opacity-60 transition font-semibold"
                    >
                      {actionLoading ? "Đang xử lý..." : "Xác nhận duyệt"}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reject Modal */}
          <AnimatePresence>
            {showRejectModal && selectedItem && (
              <motion.div
                className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  setShowRejectModal(false);
                  setTempRejectReason("");
                }}
              >
                <motion.div
                  className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Lý do từ chối <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={tempRejectReason}
                      onChange={(e) => setTempRejectReason(e.target.value)}
                      placeholder="Nhập lý do từ chối yêu cầu này..."
                      rows={4}
                      className="w-full border-2 border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition resize-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowRejectModal(false);
                        setTempRejectReason("");
                      }}
                      className="flex-1 px-4 py-2.5 rounded-xl border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={() => {
                        if (tempRejectReason.trim()) {
                          setRejectReason(tempRejectReason);
                          handleReject(selectedItem.id || selectedItem._id);
                          setShowRejectModal(false);
                          setTempRejectReason("");
                        }
                      }}
                      disabled={actionLoading || !tempRejectReason.trim()}
                      className="flex-1 px-4 py-2.5 rounded-xl text-white bg-gradient-to-r from-rose-500 to-red-600 shadow-lg hover:shadow-xl disabled:opacity-60 transition font-semibold"
                    >
                      {actionLoading ? "Đang xử lý..." : "Xác nhận từ chối"}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </DashboardLayout>
  );
}
