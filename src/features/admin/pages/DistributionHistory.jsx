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
          <div className="bg-white rounded-xl border border-card-primary shadow-sm p-5 mb-4">
            <h2 className="text-xl font-semibold text-[#007b91]">
              Lịch sử phân phối thuốc
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Theo dõi việc chuyển giao thuốc từ nhà phân phối đến nhà thuốc
            </p>
          </div>

          <motion.div
            className="rounded-2xl bg-white border border-card-primary shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-4 mb-4"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
              <div>
                <label className="block text-sm text-[#003544]/70 mb-1">
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
                  placeholder="Lọc theo NPP (ObjectId)"
                  className={`w-full h-12 rounded-full border bg-white text-gray-700 px-4 pr-8 focus:outline-none focus:ring-2 transition ${
                    validationErrors.distributorId
                      ? "border-red-300 focus:ring-red-400"
                      : "border-gray-200 focus:ring-[#48cae4]"
                  }`}
                />
                {validationErrors.distributorId && (
                  <p className="text-xs text-red-600 mt-1">
                    {validationErrors.distributorId}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm text-[#003544]/70 mb-1">
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
                  placeholder="Lọc theo Nhà thuốc (ObjectId)"
                  className={`w-full h-12 rounded-full border bg-white text-gray-700 px-4 pr-8 focus:outline-none focus:ring-2 transition ${
                    validationErrors.pharmacyId
                      ? "border-red-300 focus:ring-red-400"
                      : "border-gray-200 focus:ring-[#48cae4]"
                  }`}
                />
                {validationErrors.pharmacyId && (
                  <p className="text-xs text-red-600 mt-1">
                    {validationErrors.pharmacyId}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm text-[#003544]/70 mb-1">
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
                  placeholder="Lọc theo thuốc (ObjectId)"
                  className={`w-full h-12 rounded-full border bg-white text-gray-700 px-4 pr-8 focus:outline-none focus:ring-2 transition ${
                    validationErrors.drugId
                      ? "border-red-300 focus:ring-red-400"
                      : "border-gray-200 focus:ring-[#48cae4]"
                  }`}
                />
                {validationErrors.drugId && (
                  <p className="text-xs text-red-600 mt-1">
                    {validationErrors.drugId}
                  </p>
                )}
              </div>

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
                  className="px-4 py-2 rounded-full border border-gray-300 text-slate-700 hover:bg-gray-50 transition text-sm font-medium"
                >
                  Xóa tìm kiếm
                </button>
              )}
              <button
                type="button"
                onClick={handleSearch}
                className="px-6 py-2 rounded-full bg-secondary hover:bg-primary !text-white font-medium transition text-sm shadow-md"
              >
                Tìm kiếm
              </button>
            </div>
          </motion.div>

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
                      <div>
                        <h3 className="text-lg font-semibold text-[#003544]">
                          {item.type === "full_record"
                            ? "Giao dịch phân phối"
                            : "Xác nhận nhận hàng"}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1">
                          {new Date(
                            item.invoice?.createdAt || item.proof?.createdAt
                          ).toLocaleString("vi-VN")}
                        </p>
                      </div>

                      {(item.invoice?.status || item.proof?.status) && (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            item.invoice?.status === "completed" ||
                            item.proof?.status === "confirmed"
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                              : item.invoice?.status === "pending" ||
                                item.proof?.status === "pending"
                              ? "bg-amber-100 text-amber-700 border border-amber-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {item.invoice && (
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                          <h4 className="font-semibold text-slate-800 mb-3">
                            Hóa đơn
                          </h4>
                          <div className="space-y-2 text-sm">
                            {item.invoice.invoiceNumber && (
                              <div>
                                <span className="text-slate-600">
                                  Số hóa đơn:
                                </span>
                                <span className="ml-2 font-mono text-xs bg-white px-2 py-1 rounded text-slate-700">
                                  {item.invoice.invoiceNumber}
                                </span>
                              </div>
                            )}

                            {item.invoice.fromDistributor && (
                              <div>
                                <span className="text-slate-600">Từ NPP:</span>
                                <span className="ml-2 font-medium text-slate-800">
                                  {item.invoice.fromDistributor.fullName ||
                                    item.invoice.fromDistributor.username}
                                </span>
                              </div>
                            )}

                            {item.invoice.toPharmacy && (
                              <div>
                                <span className="text-slate-600">
                                  Đến nhà thuốc:
                                </span>
                                <span className="ml-2 font-medium text-slate-800">
                                  {item.invoice.toPharmacy.fullName ||
                                    item.invoice.toPharmacy.username}
                                </span>
                              </div>
                            )}

                            {item.invoice.drug && (
                              <div>
                                <span className="text-slate-600">Thuốc:</span>
                                <span className="ml-2 font-medium text-slate-800">
                                  {item.invoice.drug.tradeName} (
                                  {item.invoice.drug.atcCode})
                                </span>
                              </div>
                            )}

                            {item.invoice.quantity && (
                              <div>
                                <span className="text-slate-600">
                                  Số lượng:
                                </span>
                                <span className="ml-2 font-semibold text-slate-800">
                                  {item.invoice.quantity}
                                </span>
                              </div>
                            )}

                            {item.invoice.chainTxHash && (
                              <div>
                                <span className="text-slate-600">TX Hash:</span>
                                <a
                                  href={`https://sepolia.etherscan.io/tx/${item.invoice.chainTxHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-2 font-mono text-xs text-cyan-600 hover:text-cyan-700 hover:underline"
                                >
                                  {item.invoice.chainTxHash.slice(0, 10)}...
                                  {item.invoice.chainTxHash.slice(-8)}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {item.proof && (
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                          <h4 className="font-semibold text-slate-800 mb-3">
                            Xác nhận nhận hàng
                          </h4>
                          <div className="space-y-2 text-sm">
                            {item.proof.fromDistributor && (
                              <div>
                                <span className="text-slate-600">Từ NPP:</span>
                                <span className="ml-2 font-medium text-slate-800">
                                  {item.proof.fromDistributor.fullName ||
                                    item.proof.fromDistributor.username}
                                </span>
                              </div>
                            )}

                            {item.proof.toPharmacy && (
                              <div>
                                <span className="text-slate-600">
                                  Nhà thuốc:
                                </span>
                                <span className="ml-2 font-medium text-slate-800">
                                  {item.proof.toPharmacy.fullName ||
                                    item.proof.toPharmacy.username}
                                </span>
                              </div>
                            )}

                            {item.proof.drug && (
                              <div>
                                <span className="text-slate-600">Thuốc:</span>
                                <span className="ml-2 font-medium text-slate-800">
                                  {item.proof.drug.tradeName} (
                                  {item.proof.drug.atcCode})
                                </span>
                              </div>
                            )}

                            {item.proof.receivedQuantity && (
                              <div>
                                <span className="text-slate-600">
                                  Số lượng nhận:
                                </span>
                                <span className="ml-2 font-semibold text-slate-800">
                                  {item.proof.receivedQuantity}
                                </span>
                              </div>
                            )}

                            {item.proof.receiptDate && (
                              <div>
                                <span className="text-slate-600">
                                  Ngày nhận:
                                </span>
                                <span className="ml-2 text-slate-800">
                                  {new Date(
                                    item.proof.receiptDate
                                  ).toLocaleDateString("vi-VN")}
                                </span>
                              </div>
                            )}

                            {item.proof.receiptTxHash && (
                              <div>
                                <span className="text-slate-600">TX Hash:</span>
                                <a
                                  href={`https://sepolia.etherscan.io/tx/${item.proof.receiptTxHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-2 font-mono text-xs text-cyan-600 hover:text-cyan-700 hover:underline"
                                >
                                  {item.proof.receiptTxHash.slice(0, 10)}...
                                  {item.proof.receiptTxHash.slice(-8)}
                                </a>
                              </div>
                            )}

                            {item.proof.supplyChainCompleted !== undefined && (
                              <div>
                                <span className="text-slate-600">
                                  Supply chain hoàn tất:
                                </span>
                                <span
                                  className={`ml-2 px-2 py-0.5 rounded text-xs ${
                                    item.proof.supplyChainCompleted
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-amber-100 text-amber-700"
                                  }`}
                                >
                                  {item.proof.supplyChainCompleted
                                    ? "Hoàn tất"
                                    : "Chưa hoàn tất"}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

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
              className="px-3 py-2 rounded-xl !text-white bg-secondary shadow-[0_10px_24px_rgba(0,180,216,0.30)] hover:shadow-[0_14px_36px_rgba(0,180,216,0.40)]"
            >
              Sau
            </button>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
