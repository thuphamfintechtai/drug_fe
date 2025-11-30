import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import DashboardLayout from "../../shared/components/DashboardLayout";
import { useRegistrationDetail } from "../hooks/useRegistrationDetail";

export default function AdminRegistrationDetail() {
  const {
    item,
    loading,
    error,
    rejectReason,
    setRejectReason,
    actionLoading,
    handleApprove,
    handleReject,
    handleRetry,
    navigationItems,
  } = useRegistrationDetail();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
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
      {/* Banner */}
      <motion.section
        className="relative overflow-hidden rounded-2xl mb-6 border border-[#90e0ef33] shadow-[0_10px_30px_rgba(0,0,0,0.06)] bg-gradient-to-r from-primary to-secondary"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative px-6 py-8 md:px-10 md:py-12 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight drop-shadow-sm mb-2">
                Chi tiết đơn đăng ký
              </h1>
              <p className="text-white/90">
                Quản trị phê duyệt – minh bạch, chuẩn y tế.
              </p>
            </div>
            <Link
              to="/admin/registrations"
              className="px-6 py-3 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 text-white font-medium transition backdrop-blur-sm"
            >
              ← Quay lại
            </Link>
          </div>
        </div>
      </motion.section>

      {loading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-lg text-slate-600">Đang tải...</div>
        </div>
      ) : error ? (
        <motion.div
          className="rounded-2xl bg-white border border-red-200 shadow-sm p-6"
          variants={fadeUp}
          initial="hidden"
          animate="show"
        >
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        </motion.div>
      ) : item ? (
        <div className="space-y-6">
          {/* Thông tin đơn đăng ký */}
          <motion.div
            className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            <div className="bg-gradient-to-r from-primary to-secondary border-b border-primary/20 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  Thông tin đơn đăng ký
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                    item.status === "pending"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : item.status === "approved"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : item.status === "rejected"
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  {item.status === "pending"
                    ? "Chờ duyệt"
                    : item.status === "approved"
                    ? "Đã duyệt"
                    : item.status === "rejected"
                    ? "Đã từ chối"
                    : item.status}
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-0 divide-y divide-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center py-4 first:pt-0">
                  <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0">
                    ID
                  </div>
                  <div className="text-base font-semibold text-slate-800 font-mono flex-1">
                    {item._id}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center py-4 last:pb-0">
                  <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0">
                    Vai trò
                  </div>
                  <div className="text-base font-semibold text-slate-800 flex-1">
                    {item.role === "pharma_company"
                      ? "Nhà sản xuất"
                      : item.role === "distributor"
                      ? "Nhà phân phối"
                      : item.role === "pharmacy"
                      ? "Nhà thuốc"
                      : item.role}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Thông tin người dùng */}
          <motion.div
            className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            <div className="bg-gradient-to-r from-primary to-secondary border-b border-primary/20 px-6 py-4">
              <h3 className="text-lg font-semibold text-white">Người dùng</h3>
            </div>
            <div className="p-6">
              <div className="space-y-0 divide-y divide-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center py-4 first:pt-0">
                  <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0">
                    Họ tên
                  </div>
                  <div className="text-base font-semibold text-slate-800 flex-1">
                    {item.user?.fullName || item.user?.username || "N/A"}
                  </div>
                </div>
                {item.user?.email && (
                  <div className="flex flex-col sm:flex-row sm:items-center py-4">
                    <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0">
                      Email
                    </div>
                    <div className="text-base font-semibold text-slate-800 flex-1">
                      {item.user.email}
                    </div>
                  </div>
                )}
                {item.user?.walletAddress && (
                  <div className="flex flex-col sm:flex-row sm:items-start py-4 last:pb-0">
                    <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0 sm:pt-1">
                      Wallet Address
                    </div>
                    <div className="text-base font-semibold text-slate-800 flex-1">
                      {item.user.walletAddress}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Thông tin doanh nghiệp */}
          <motion.div
            className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            <div className="bg-gradient-to-r from-primary to-secondary border-b border-primary/20 px-6 py-4">
              <h3 className="text-lg font-semibold text-white">
                Thông tin doanh nghiệp
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-0 divide-y divide-slate-200">
                {item.companyInfo?.name && (
                  <div className="flex flex-col sm:flex-row sm:items-center py-4 first:pt-0">
                    <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0">
                      Tên doanh nghiệp
                    </div>
                    <div className="text-base font-semibold text-slate-800 flex-1">
                      {item.companyInfo.name}
                    </div>
                  </div>
                )}
                {item.companyInfo?.licenseNo && (
                  <div className="flex flex-col sm:flex-row sm:items-center py-4">
                    <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0">
                      Số giấy phép
                    </div>
                    <div className="text-base font-semibold text-slate-800 flex-1">
                      {item.companyInfo.licenseNo}
                    </div>
                  </div>
                )}
                {item.companyInfo?.taxCode && (
                  <div className="flex flex-col sm:flex-row sm:items-center py-4">
                    <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0">
                      Mã số thuế
                    </div>
                    <div className="text-base font-semibold text-slate-800 font-mono flex-1">
                      {item.companyInfo.taxCode}
                    </div>
                  </div>
                )}
                {item.role === "pharma_company" &&
                  item.companyInfo?.gmpCertNo && (
                    <div className="flex flex-col sm:flex-row sm:items-center py-4">
                      <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0">
                        Chứng nhận GMP
                      </div>
                      <div className="text-base font-semibold text-slate-800 flex-1">
                        {item.companyInfo.gmpCertNo}
                      </div>
                    </div>
                  )}
                {item.companyInfo?.walletAddress && (
                  <div className="flex flex-col sm:flex-row sm:items-start py-4 last:pb-0">
                    <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0 sm:pt-1">
                      Wallet Address
                    </div>
                    <div className="text-base font-semibold text-slate-800 font-mono text-xs break-all flex-1">
                      {item.companyInfo.walletAddress}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Blockchain */}
          {(item.transactionHash || item.contractAddress) && (
            <motion.div
              className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden"
              variants={fadeUp}
              initial="hidden"
              animate="show"
            >
              <div className="bg-gradient-to-r from-primary to-secondary border-b border-primary/20 px-6 py-4">
                <h3 className="text-lg font-semibold text-white">Blockchain</h3>
              </div>
              <div className="p-6">
                <div className="space-y-0 divide-y divide-slate-200">
                  {item.transactionHash && (
                    <div className="flex flex-col sm:flex-row sm:items-start py-4 first:pt-0">
                      <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0 sm:pt-1">
                        Transaction Hash
                      </div>
                      <div className="text-base font-semibold text-slate-800 font-mono text-xs break-all flex-1">
                        {item.transactionHash}
                      </div>
                    </div>
                  )}
                  {item.contractAddress && (
                    <div className="flex flex-col sm:flex-row sm:items-start py-4 last:pb-0">
                      <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0 sm:pt-1">
                        Contract Address
                      </div>
                      <div className="text-base font-semibold text-slate-800 font-mono text-xs break-all flex-1">
                        {item.contractAddress}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <motion.div
            className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            {item.status === "pending" && (
              <div className="flex flex-col sm:flex-row gap-3 justify-end items-center">
                <button
                  disabled={actionLoading}
                  onClick={() => setShowApproveModal(true)}
                  className="px-8 py-3.5 rounded-xl text-white bg-gradient-to-r from-emerald-500 to-green-600 shadow-lg hover:shadow-xl disabled:opacity-60 transition font-semibold text-base flex items-center justify-center gap-2"
                >
                  <span className="text-xl text-white">✓</span>
                  <span className=" text-white">Duyệt đơn</span>
                </button>
                <button
                  disabled={actionLoading}
                  onClick={() => {
                    setTempRejectReason(rejectReason || "");
                    setShowRejectModal(true);
                  }}
                  className="px-8 py-3.5 rounded-xl text-white bg-gradient-to-r from-rose-500 to-red-600 shadow-lg hover:shadow-xl disabled:opacity-60 transition font-semibold text-base flex items-center justify-center gap-2"
                >
                  <span className="text-xl text-white">✕</span>
                  <span className=" text-white">Từ chối</span>
                </button>
              </div>
            )}
            {item.status === "blockchain_failed" && (
              <button
                disabled={actionLoading}
                onClick={handleRetry}
                className="px-6 py-3 rounded-xl text-white bg-gradient-to-r from-primary to-secondary shadow-lg hover:shadow-xl disabled:opacity-60 transition font-semibold"
              >
                🔄 Retry blockchain
              </button>
            )}
            {item.status !== "pending" &&
              item.status !== "blockchain_failed" && (
                <div className="text-center text-slate-500 py-4">
                  Đơn đăng ký đã được xử lý
                </div>
              )}
          </motion.div>
        </div>
      ) : (
        <motion.div
          className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6"
          variants={fadeUp}
          initial="hidden"
          animate="show"
        >
          <div className="text-center text-slate-600 py-8">
            Không tìm thấy dữ liệu
          </div>
        </motion.div>
      )}

      {/* Approve Confirmation Modal */}
      <AnimatePresence>
        {showApproveModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
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
                    Xác nhận duyệt đơn
                  </h3>
                  <p className="text-sm text-slate-600">
                    Bạn có chắc chắn muốn duyệt đơn đăng ký này?
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
                    handleApprove();
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
        {showRejectModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowRejectModal(false)}
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
                  placeholder="Nhập lý do từ chối đơn đăng ký này..."
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
                      handleReject();
                      setShowRejectModal(false);
                      setTempRejectReason("");
                    }
                  }}
                  disabled={actionLoading || !tempRejectReason.trim()}
                  className="flex-1 px-4 py-2.5 rounded-xl !text-white bg-gradient-to-r from-rose-500 to-red-600 shadow-lg hover:shadow-xl disabled:opacity-60 transition font-semibold"
                >
                  {actionLoading ? "Đang xử lý..." : "Xác nhận từ chối"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
