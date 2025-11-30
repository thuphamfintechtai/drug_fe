import { motion } from "framer-motion";
import DashboardLayout from "../../shared/components/DashboardLayout";
import TruckLoader from "../../shared/components/TruckLoader";
import { useDistributionHistory } from "../hooks/useDistributionHistory";

export default function DistributionHistory() {
  const {
    items,
    loading,
    error,
    loadingProgress,
    pagination,
    navigationItems,
    handleSearch,
    handleClearSearch,
    updateFilter,
    distributorIdInput,
    pharmacyIdInput,
    drugIdInput,
    validationErrors,
    setPharmacyIdInput,
    setDistributorIdInput,
    setValidationErrors,
    setDrugIdInput,
    status,
    page,
  } = useDistributionHistory();

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
          <motion.section
            className="relative overflow-hidden rounded-2xl mb-6 border border-[#90e0ef33] shadow-[0_10px_30px_rgba(0,0,0,0.06)] bg-gradient-to-r from-primary to-secondary"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative px-6 py-8 md:px-10 md:py-12 text-white">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight drop-shadow-sm mb-2">
                Lịch sử phân phối thuốc
              </h1>
              <p className="text-white/90">
                Theo dõi việc chuyển giao thuốc từ nhà phân phối đến nhà thuốc
              </p>
            </div>
          </motion.section>

          <motion.div
            className="rounded-2xl bg-white border border-card-primary shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-4 mb-4"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">
                  Mã NPP
                </label>
                <input
                  type="text"
                  value={distributorIdInput}
                  onChange={(e) => {
                    setDistributorIdInput(e.target.value);
                    if (validationErrors.distributorId) {
                      setValidationErrors({
                        ...validationErrors,
                        distributorId: undefined,
                      });
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSearch();
                    }
                  }}
                  placeholder="Nhập ObjectId NPP..."
                  className={`w-full h-12 rounded-xl border-2 bg-white text-slate-700 px-4 focus:outline-none focus:ring-2 transition ${
                    validationErrors.distributorId
                      ? "border-red-300 focus:ring-red-400"
                      : "border-slate-300 focus:ring-primary focus:border-primary"
                  }`}
                />
                {validationErrors.distributorId && (
                  <p className="text-xs text-red-600 mt-1">
                    {validationErrors.distributorId}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">
                  Mã nhà thuốc
                </label>
                <input
                  type="text"
                  value={pharmacyIdInput}
                  onChange={(e) => {
                    setPharmacyIdInput(e.target.value);
                    if (validationErrors.pharmacyId) {
                      setValidationErrors({
                        ...validationErrors,
                        pharmacyId: undefined,
                      });
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSearch();
                    }
                  }}
                  placeholder="Nhập ObjectId nhà thuốc..."
                  className={`w-full h-12 rounded-xl border-2 bg-white text-slate-700 px-4 focus:outline-none focus:ring-2 transition ${
                    validationErrors.pharmacyId
                      ? "border-red-300 focus:ring-red-400"
                      : "border-slate-300 focus:ring-primary focus:border-primary"
                  }`}
                />
                {validationErrors.pharmacyId && (
                  <p className="text-xs text-red-600 mt-1">
                    {validationErrors.pharmacyId}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">
                  Mã thuốc
                </label>
                <input
                  type="text"
                  value={drugIdInput}
                  onChange={(e) => {
                    setDrugIdInput(e.target.value);
                    if (validationErrors.drugId) {
                      setValidationErrors({
                        ...validationErrors,
                        drugId: undefined,
                      });
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSearch();
                    }
                  }}
                  placeholder="Nhập ObjectId thuốc..."
                  className={`w-full h-12 rounded-xl border-2 bg-white text-slate-700 px-4 focus:outline-none focus:ring-2 transition ${
                    validationErrors.drugId
                      ? "border-red-300 focus:ring-red-400"
                      : "border-slate-300 focus:ring-primary focus:border-primary"
                  }`}
                />
                {validationErrors.drugId && (
                  <p className="text-xs text-red-600 mt-1">
                    {validationErrors.drugId}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">
                  Trạng thái
                </label>
                <select
                  value={status}
                  onChange={(e) =>
                    updateFilter({ status: e.target.value, page: 1 })
                  }
                  className="w-full h-12 rounded-xl border-2 border-slate-300 bg-white text-slate-700 px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                >
                  <option value="">Tất cả</option>
                  <option value="pending">Đang chờ</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="confirmed">Đã xác nhận</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-end">
              {(distributorIdInput || pharmacyIdInput || drugIdInput) && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="px-5 py-2.5 rounded-xl border-2 border-slate-300 text-slate-700 hover:bg-slate-50 transition text-sm font-semibold"
                >
                  Xóa tìm kiếm
                </button>
              )}
              <button
                type="button"
                onClick={handleSearch}
                className="px-6 py-2.5 rounded-xl !text-white bg-gradient-to-r from-primary to-secondary shadow-lg hover:shadow-xl transition font-semibold"
              >
                Tìm kiếm
              </button>
            </div>
          </motion.div>

          {error ? (
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
          ) : items.length === 0 ? (
            <motion.div
              className="rounded-2xl bg-white border border-slate-200 shadow-sm p-10 text-center"
              variants={fadeUp}
              initial="hidden"
              animate="show"
            >
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                Không có dữ liệu
              </h3>
              <p className="text-slate-600">
                Không tìm thấy lịch sử phân phối phù hợp
              </p>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {items.map((item, idx) => (
                <motion.div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden"
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  transition={{ delay: idx * 0.1 }}
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-primary to-secondary border-b border-primary/20 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {item.type === "full_record"
                            ? "Giao dịch phân phối"
                            : "Xác nhận nhận hàng"}
                        </h3>
                        <p className="text-sm text-white/80 mt-1">
                          {new Date(
                            item.invoice?.createdAt || item.proof?.createdAt
                          ).toLocaleString("vi-VN")}
                        </p>
                      </div>
                      {(item.invoice?.status || item.proof?.status) && (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            item.invoice?.status === "completed" ||
                            item.proof?.status === "confirmed"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : item.invoice?.status === "pending" ||
                                item.proof?.status === "pending"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-slate-50 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {item.invoice?.status === "pending"
                            ? "Đang chờ"
                            : item.invoice?.status === "completed"
                            ? "Hoàn thành"
                            : item.proof?.status === "confirmed"
                            ? "Đã xác nhận"
                            : item.invoice?.status || item.proof?.status}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-6">
                    <div
                      className={`grid gap-6 ${
                        item.invoice && item.proof
                          ? "grid-cols-1 md:grid-cols-2"
                          : "grid-cols-1"
                      }`}
                    >
                      {item.invoice && (
                        <div className="bg-white rounded-xl  border border-slate-200 shadow-sm">
                          <h4 className="font-semibold p-5 text-slate-800 mb-6 text-xl border-b border-slate-200 pb-2">
                            Hóa đơn
                          </h4>
                          <div className="space-y-0 divide-y divide-slate-200 p-5">
                            {item.invoice.invoiceNumber && (
                              <div className="flex flex-col sm:flex-row sm:items-center py-3 first:pt-0">
                                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-40 shrink-0 mb-1 sm:mb-0">
                                  Số hóa đơn
                                </div>
                                <div className="text-sm font-semibold text-slate-800 font-mono flex-1">
                                  {item.invoice.invoiceNumber}
                                </div>
                              </div>
                            )}

                            {item.invoice.fromDistributor && (
                              <div className="flex flex-col sm:flex-row sm:items-center py-3">
                                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-40 shrink-0 mb-1 sm:mb-0">
                                  Từ NPP
                                </div>
                                <div className="text-sm font-semibold text-slate-800 flex-1">
                                  {item.invoice.fromDistributor.fullName ||
                                    item.invoice.fromDistributor.username}
                                </div>
                              </div>
                            )}

                            {item.invoice.toPharmacy && (
                              <div className="flex flex-col sm:flex-row sm:items-center py-3">
                                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-40 shrink-0 mb-1 sm:mb-0">
                                  Đến nhà thuốc
                                </div>
                                <div className="text-sm font-semibold text-slate-800 flex-1">
                                  {item.invoice.toPharmacy.fullName ||
                                    item.invoice.toPharmacy.username}
                                </div>
                              </div>
                            )}

                            {item.invoice.drug && (
                              <div className="flex flex-col sm:flex-row sm:items-center py-3">
                                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-40 shrink-0 mb-1 sm:mb-0">
                                  Thuốc
                                </div>
                                <div className="text-sm font-semibold text-slate-800 flex-1">
                                  {item.invoice.drug.tradeName} (
                                  {item.invoice.drug.atcCode})
                                </div>
                              </div>
                            )}

                            {item.invoice.quantity && (
                              <div className="flex flex-col sm:flex-row sm:items-center py-3">
                                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-40 shrink-0 mb-1 sm:mb-0">
                                  Số lượng
                                </div>
                                <div className="text-sm font-semibold text-slate-800 flex-1">
                                  {item.invoice.quantity}
                                </div>
                              </div>
                            )}

                            {item.invoice.chainTxHash && (
                              <div className="flex flex-col sm:flex-row sm:items-start py-3 last:pb-0">
                                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-40 shrink-0 mb-1 sm:mb-0 sm:pt-1">
                                  TX Hash
                                </div>
                                <div className="text-sm font-semibold text-slate-800 flex-1">
                                  <a
                                    href={`https://sepolia.etherscan.io/tx/${item.invoice.chainTxHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-mono text-xs text-primary hover:text-secondary hover:underline break-all"
                                  >
                                    {item.invoice.chainTxHash}
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {item.proof && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                          <h4 className="font-semibold p-5 text-slate-800 mb-4 text-xl border-b border-slate-200 pb-2">
                            Xác nhận nhận hàng
                          </h4>
                          <div className="space-y-0 divide-y divide-slate-200 p-5">
                            {item.proof.fromDistributor && (
                              <div className="flex flex-col sm:flex-row sm:items-center py-3 first:pt-0">
                                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-40 shrink-0 mb-1 sm:mb-0">
                                  Từ NPP
                                </div>
                                <div className="text-sm font-semibold text-slate-800 flex-1">
                                  {item.proof.fromDistributor.fullName ||
                                    item.proof.fromDistributor.username}
                                </div>
                              </div>
                            )}

                            {item.proof.toPharmacy && (
                              <div className="flex flex-col sm:flex-row sm:items-center py-3">
                                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-40 shrink-0 mb-1 sm:mb-0">
                                  Nhà thuốc
                                </div>
                                <div className="text-sm font-semibold text-slate-800 flex-1">
                                  {item.proof.toPharmacy.fullName ||
                                    item.proof.toPharmacy.username}
                                </div>
                              </div>
                            )}

                            {item.proof.drug && (
                              <div className="flex flex-col sm:flex-row sm:items-center py-3">
                                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-40 shrink-0 mb-1 sm:mb-0">
                                  Thuốc
                                </div>
                                <div className="text-sm font-semibold text-slate-800 flex-1">
                                  {item.proof.drug.tradeName} (
                                  {item.proof.drug.atcCode})
                                </div>
                              </div>
                            )}

                            {item.proof.receivedQuantity && (
                              <div className="flex flex-col sm:flex-row sm:items-center py-3">
                                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-40 shrink-0 mb-1 sm:mb-0">
                                  Số lượng nhận
                                </div>
                                <div className="text-sm font-semibold text-slate-800 flex-1">
                                  {item.proof.receivedQuantity}
                                </div>
                              </div>
                            )}

                            {item.proof.receiptDate && (
                              <div className="flex flex-col sm:flex-row sm:items-center py-3">
                                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-40 shrink-0 mb-1 sm:mb-0">
                                  Ngày nhận
                                </div>
                                <div className="text-sm font-semibold text-slate-800 flex-1">
                                  {new Date(
                                    item.proof.receiptDate
                                  ).toLocaleDateString("vi-VN")}
                                </div>
                              </div>
                            )}

                            {item.proof.receiptTxHash && (
                              <div className="flex flex-col sm:flex-row sm:items-start py-3">
                                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-40 shrink-0 mb-1 sm:mb-0 sm:pt-1">
                                  TX Hash
                                </div>
                                <div className="text-sm font-semibold text-slate-800 flex-1">
                                  <a
                                    href={`https://sepolia.etherscan.io/tx/${item.proof.receiptTxHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-mono text-xs text-primary hover:text-secondary hover:underline break-all"
                                  >
                                    {item.proof.receiptTxHash}
                                  </a>
                                </div>
                              </div>
                            )}

                            {item.proof.supplyChainCompleted !== undefined && (
                              <div className="flex flex-col sm:flex-row sm:items-center py-3 last:pb-0">
                                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-40 shrink-0 mb-1 sm:mb-0">
                                  Supply chain
                                </div>
                                <div className="flex-1">
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                      item.proof.supplyChainCompleted
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                        : "bg-amber-50 text-amber-700 border border-amber-200"
                                    }`}
                                  >
                                    {item.proof.supplyChainCompleted
                                      ? "Hoàn tất"
                                      : "Chưa hoàn tất"}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {items.length > 0 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-slate-600">
                Hiển thị {items.length} / {pagination?.total || 0} giao dịch
              </div>
              <div className="flex items-center justify-end gap-2 mt-4">
                <button
                  disabled={page <= 1}
                  onClick={() => updateFilter({ page: page - 1 })}
                  className={`px-3 py-2 rounded-xl ${
                    page <= 1
                      ? "bg-slate-200 text-slate-400"
                      : "bg-white border !border-primary hover:bg-[#f5fcff]"
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
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
