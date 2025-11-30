import { motion } from "framer-motion";
import DashboardLayout from "../../shared/components/DashboardLayout";
import TruckLoader from "../../shared/components/TruckLoader";
import TruckAnimationButton from "../../shared/components/TruckAnimationButton";
import BlockchainTransferView from "../components/BlockchainTransferView";
import { CardUI } from "../../shared/components/ui/cardUI";
import { useTransferToPharmacy } from "../hooks/useTransferToPharmacy";
import { navigationItems } from "../constants/navigationItems";
export default function TransferToPharmacy() {
  const {
    distributions,
    pharmacies,
    loading,
    showDialog,
    setShowDialog,
    selectedDistribution,
    formData,
    setFormData,
    loadingProgress,
    dialogLoading,
    setDialogLoading,
    showChainView,
    setShowChainView,
    chainStatus,
    chainProgress,
    submitLoading,
    handleSelectDistribution,
    handleSubmit,
  } = useTransferToPharmacy();

  const fadeUp = {
    hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const safePharmacies = Array.isArray(pharmacies) ? pharmacies : [];
  const selectedPharmacy = safePharmacies.find(
    (p) => p._id === formData.pharmacyId
  );

  const getManufacturerDisplay = (record) =>
    record?.manufacturer?.fullName ||
    record?.manufacturer?.name ||
    record?.manufacturer?.username ||
    record?.fromManufacturer?.fullName ||
    record?.fromManufacturer?.username ||
    record?.manufacturerId ||
    "N/A";

  const getInvoiceDisplay = (record) =>
    record?.manufacturerInvoice?.invoiceNumber ||
    record?.invoiceNumber ||
    record?.invoice?.invoiceNumber ||
    record?.code ||
    record?._id ||
    record?.id ||
    "N/A";

  // ✅ NEW: Get total quantity (tổng số NFT nhận được)
  const getTotalQuantityValue = (record) => {
    const value =
      record?.quantity ??
      record?.distributedQuantity ??
      (Array.isArray(record?.tokenIds) ? record.tokenIds.length : undefined);
    return typeof value === "number" ? value : undefined;
  };

  const getTotalQuantityDisplay = (record) => {
    const value = getTotalQuantityValue(record);
    return typeof value === "number" ? value : "N/A";
  };

  // ✅ NEW: Get available NFTs (NFT khả dụng)
  const getAvailableNFTs = (record) => {
    return typeof record?.availableNFTs === "number" ? record.availableNFTs : 0;
  };

  const getAvailableNFTsDisplay = (record) => {
    const value = getAvailableNFTs(record);
    return value;
  };

  const getDateDisplay = (value) =>
    value ? new Date(value).toLocaleDateString("vi-VN") : "N/A";

  return (
    <DashboardLayout navigationItems={navigationItems}>
      {showChainView && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-md">
          <BlockchainTransferView
            status={chainStatus}
            progress={chainProgress}
            onClose={() => setShowChainView(false)}
            transferType="distributor-to-pharmacy"
          />
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="w-full max-w-2xl">
            <TruckLoader height={72} progress={loadingProgress} showTrack />
          </div>
          <div className="text-lg text-slate-600 mt-6">Đang tải dữ liệu...</div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Banner */}

          {/* Process Explanation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <CardUI
              title="Chuyển giao cho nhà thuốc"
              subtitle="Chọn NFT và pharmacy để chuyển quyền sở hữu"
              content={{
                title: "Quy trình chuyển giao",
                step1: {
                  title: "Chọn NFT & Pharmacy",
                  description:
                    "Chọn lô hàng đã nhận từ manufacturer và nhà thuốc nhận hàng",
                },
                step2: {
                  title: "Tạo invoice",
                  description:
                    "Frontend gọi API Backend để tạo invoice với trạng thái 'draft'",
                },
                step3: {
                  title: "Chuyển quyền sở hữu NFT",
                  description:
                    "Frontend gọi Smart Contract để transfer NFT từ Distributor wallet → Pharmacy wallet",
                },
                step4: {
                  title: "Lưu transaction hash",
                  description:
                    "Frontend gọi API Backend để lưu transaction hash, invoice status chuyển từ 'draft' → 'sent'",
                },
              }}
            />
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            <style>{`
              .scrollbar-thin {
                scrollbar-width: thin;
                scrollbar-color: #cbd5e1 #f1f5f9;
              }
              .scrollbar-thin::-webkit-scrollbar {
                height: 8px;
                width: 8px;
              }
              .scrollbar-thin::-webkit-scrollbar-track {
                background: #f1f5f9;
                border-radius: 4px;
              }
              .scrollbar-thin::-webkit-scrollbar-thumb {
                background: #cbd5e1;
                border-radius: 4px;
              }
              .scrollbar-thin::-webkit-scrollbar-thumb:hover {
                background: #94a3b8;
              }
            `}</style>
            <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800">
                Lô hàng có sẵn (đã nhận từ Manufacturer)
              </h2>
            </div>

            {distributions.length === 0 ? (
              <div className="p-8 md:p-16 flex flex-col items-center justify-center">
                <div className="p-4 bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-12 h-12 md:w-16 md:h-16 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <h3 className="text-base md:text-lg font-semibold text-slate-700 mb-2 text-center">
                  Chưa có lô hàng nào
                </h3>
                <p className="text-slate-500 text-sm text-center px-4">
                  Vui lòng nhận hàng từ nhà sản xuất trước
                </p>
              </div>
            ) : (
              <div className="w-full overflow-x-auto scrollbar-thin">
                <div className="inline-block min-w-full">
                  <table
                    className="w-full border-collapse"
                    style={{ minWidth: "1000px" }}
                  >
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                          Từ Manufacturer
                        </th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                          Đơn hàng
                        </th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                          Số lượng NFT
                        </th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                          NFT khả dụng
                        </th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                          Ngày nhận
                        </th>
                        <th className="px-6 py-3.5 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                          Hành động
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                      {distributions.map((dist, index) => (
                        <tr
                          key={dist._id || index}
                          className="hover:bg-slate-50 transition-colors duration-150"
                        >
                          <td className="px-6 py-4 font-semibold text-slate-800 whitespace-nowrap">
                            {getManufacturerDisplay(dist)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-mono font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
                              {getInvoiceDisplay(dist)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-semibold text-slate-800">
                              {getTotalQuantityDisplay(dist)}
                            </span>
                            <span className="text-xs text-slate-500 ml-1">
                              NFT
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getAvailableNFTs(dist) === 0 ? (
                              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                                {getAvailableNFTsDisplay(dist)} NFT
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                                {getAvailableNFTsDisplay(dist)} NFT
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-slate-700 text-sm whitespace-nowrap">
                            {getDateDisplay(dist.distributionDate)}
                          </td>
                          <td className="px-6 py-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center">
                              {dist.transferToPharmacy === true &&
                              getAvailableNFTs(dist) === 0 ? (
                                <span className="px-4 py-2 rounded-xl font-semibold text-sm border-2 border-slate-300 text-slate-500 bg-slate-50">
                                  Đã chuyển hết
                                </span>
                              ) : getAvailableNFTs(dist) === 0 ? (
                                <span className="px-4 py-2 rounded-xl font-semibold text-sm border-2 border-slate-300 text-slate-500 bg-slate-50">
                                  Đã chuyển hết
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleSelectDistribution(dist)}
                                  disabled={false}
                                  className="px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 border-2 border-primary bg-white text-primary hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-primary/40"
                                >
                                  Chuyển cho NT
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>

          {showDialog && selectedDistribution && !showChainView && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              onClick={() => {
                setShowDialog(false);
                setDialogLoading(false);
              }}
            >
              <div
                className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-secondary px-6 md:px-8 py-6 rounded-t-2xl">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h2 className="text-xl md:text-2xl font-bold !text-white mb-1">
                        Chuyển giao NFT cho Pharmacy
                      </h2>
                      <p className="text-white/90 text-sm">
                        Chọn nhà thuốc và số lượng
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowDialog(false);
                        setDialogLoading(false);
                      }}
                      className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center !text-white text-xl transition shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 relative">
                  {dialogLoading && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
                      <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
                        <div className="text-slate-600 font-medium">
                          Đang tải thông tin...
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Thông tin lô hàng */}
                  <div className="bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5 rounded-xl p-5 border-2 border-primary/20">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-lg">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <h3 className="font-bold text-slate-800 text-lg">
                        Thông tin lô hàng
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex flex-col">
                        <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
                          Đơn hàng:
                        </span>
                        <span className="font-mono font-semibold text-slate-800 break-all">
                          {getInvoiceDisplay(selectedDistribution)}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
                          Từ:
                        </span>
                        <span className="font-semibold text-slate-800">
                          {getManufacturerDisplay(selectedDistribution)}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
                          Tổng số NFT:
                        </span>
                        <span className="font-bold text-primary text-lg">
                          {getTotalQuantityDisplay(selectedDistribution)} NFT
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
                          NFT khả dụng:
                        </span>
                        <span
                          className={`font-bold text-lg ${
                            getAvailableNFTs(selectedDistribution) === 0
                              ? "text-red-700"
                              : "text-green-700"
                          }`}
                        >
                          {getAvailableNFTsDisplay(selectedDistribution)} NFT
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
                          Ngày nhận:
                        </span>
                        <span className="font-medium text-slate-800">
                          {getDateDisplay(
                            selectedDistribution.distributionDate
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Chọn nhà thuốc <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.pharmacyId}
                      onChange={(e) =>
                        setFormData({ ...formData, pharmacyId: e.target.value })
                      }
                      className="w-full h-14 border-2 border-slate-300 rounded-xl px-4 text-slate-700 focus:ring-2 focus:ring-primary focus:outline-none focus:border-primary hover:border-slate-400 transition"
                    >
                      <option value="">-- Chọn pharmacy --</option>
                      {safePharmacies.map((pharm) => (
                        <option key={pharm._id} value={pharm._id}>
                          {pharm.name} ({pharm.taxCode})
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedPharmacy && (
                    <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-5 border-2 border-slate-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-lg">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg">
                          Thông tin nhà thuốc
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-slate-600">Tên:</span>{" "}
                          <span className="font-medium">
                            {selectedPharmacy.name || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600">Mã số thuế:</span>{" "}
                          <span className="font-medium">
                            {selectedPharmacy.taxCode || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600">Số giấy phép:</span>{" "}
                          <span className="font-medium">
                            {selectedPharmacy.licenseNo || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600">Quốc gia:</span>{" "}
                          <span className="font-medium">
                            {selectedPharmacy.country || "N/A"}
                          </span>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-slate-600">Địa chỉ:</span>{" "}
                          <span className="font-medium">
                            {selectedPharmacy.address || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600">Email:</span>{" "}
                          <span className="font-medium">
                            {selectedPharmacy.contactEmail || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600">SĐT:</span>{" "}
                          <span className="font-medium">
                            {selectedPharmacy.contactPhone || "N/A"}
                          </span>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-slate-600">Wallet:</span>{" "}
                          <span className="font-mono text-xs break-all">
                            {selectedPharmacy.walletAddress ||
                              selectedPharmacy.user?.walletAddress ||
                              "Chưa có"}
                          </span>
                        </div>
                      </div>

                      {selectedPharmacy.user && (
                        <div className="mt-3 pt-3 ">
                          <div className="text-xs font-semibold text-cyan-700 mb-1">
                            Thông tin tài khoản:
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-xs">
                            <div>
                              <span className="text-slate-600">Tên:</span>{" "}
                              <span className="font-medium">
                                {selectedPharmacy.user.fullName ||
                                  selectedPharmacy.user.username ||
                                  "N/A"}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-600">Username:</span>{" "}
                              <span className="font-mono">
                                {selectedPharmacy.user.username || "N/A"}
                              </span>
                            </div>
                            <div className="md:col-span-2">
                              <span className="text-slate-600">Email:</span>{" "}
                              <span className="font-medium">
                                {selectedPharmacy.user.email || "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Số lượng NFT cần chuyển{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({ ...formData, quantity: e.target.value })
                      }
                      className="w-full h-14 border-2 border-slate-300 rounded-xl px-4 text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-primary focus:outline-none focus:border-primary hover:border-slate-400 transition disabled:bg-slate-100 disabled:cursor-not-allowed"
                      placeholder="Nhập số lượng"
                      min="1"
                      max={getAvailableNFTs(selectedDistribution)}
                      disabled={getAvailableNFTs(selectedDistribution) === 0}
                    />
                    <div
                      className={`text-xs mt-1 font-medium ${
                        getAvailableNFTs(selectedDistribution) === 0
                          ? "text-red-600"
                          : "text-primary"
                      }`}
                    >
                      {getAvailableNFTs(selectedDistribution) === 0
                        ? "⚠️ Không còn NFT khả dụng để chuyển"
                        : `Tối đa: ${getAvailableNFTs(
                            selectedDistribution
                          )} NFT khả dụng`}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Ghi chú
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      className="w-full border-2 border-slate-300 rounded-xl p-3 text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-primary focus:outline-none focus:border-primary hover:border-slate-400 transition resize-none"
                      rows="3"
                      placeholder="Ghi chú về đơn chuyển giao..."
                    />
                  </div>

                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border-2 border-yellow-200">
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-sm text-yellow-800 leading-relaxed">
                        Sau khi xác nhận, invoice sẽ được tạo với trạng thái{" "}
                        <strong>&quot;draft&quot;</strong>. NFT sẽ được chuyển
                        on-chain ngay lập tức.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 md:px-8 py-6 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowDialog(false);
                      setDialogLoading(false);
                    }}
                    className="px-6 py-3 rounded-xl bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-semibold shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    Hủy
                  </button>
                  {getAvailableNFTs(selectedDistribution) === 0 ? (
                    <div className="px-6 py-3 rounded-xl bg-slate-100 text-slate-600 font-semibold border-2 border-slate-300 cursor-not-allowed">
                      Đã chuyển hết
                    </div>
                  ) : (
                    <TruckAnimationButton
                      onClick={handleSubmit}
                      disabled={
                        submitLoading ||
                        getAvailableNFTs(selectedDistribution) === 0
                      }
                      buttonState={submitLoading ? "uploading" : "idle"}
                      defaultText="Xác nhận chuyển giao"
                      uploadingText="Đang xử lý..."
                      successText="Hoàn thành"
                      animationMode="infinite"
                      animationDuration={3}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
