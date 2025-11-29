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

          <motion.div
            className="bg-white rounded-2xl border border-card-primary shadow-sm overflow-hidden"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
              <h2 className="text-xl font-bold text-slate-800">
                Lô hàng có sẵn (đã nhận từ Manufacturer)
              </h2>
            </div>

            {distributions.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-5xl mb-4"></div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  Chưa có lô hàng nào
                </h3>
                <p className="text-slate-600">
                  Vui lòng nhận hàng từ nhà sản xuất trước
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Từ Manufacturer
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Đơn hàng
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Số lượng NFT
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        NFT khả dụng
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Ngày nhận
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {distributions.map((dist, index) => (
                      <tr
                        key={dist._id || index}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 font-semibold text-[#003544]">
                          {getManufacturerDisplay(dist)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-cyan-50 text-cyan-700 border border-cyan-100">
                            {getInvoiceDisplay(dist)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-gray-800">
                            {getTotalQuantityDisplay(dist)}
                          </span>
                          <span className="text-xs text-slate-500 ml-1">
                            NFT
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {getAvailableNFTs(dist) === 0 ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                              {getAvailableNFTsDisplay(dist)} NFT
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                              {getAvailableNFTsDisplay(dist)} NFT
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-700 text-sm">
                          {getDateDisplay(dist.distributionDate)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center">
                            {dist.transferToPharmacy === true && getAvailableNFTs(dist) === 0 ? (
                              <div className="px-4 py-2 rounded-full font-semibold border-2 border-gray-300 text-gray-400 bg-gray-50 cursor-not-allowed">
                                Đã chuyển hết
                              </div>
                            ) : getAvailableNFTs(dist) === 0 ? (
                              <div className="px-4 py-2 rounded-full font-semibold border-2 border-gray-300 text-gray-400 bg-gray-50 cursor-not-allowed">
                                Đã chuyển hết
                              </div>
                            ) : (
                              <button
                                onClick={() => handleSelectDistribution(dist)}
                                disabled={false}
                                className="px-4 py-2 rounded-full font-semibold transition-all duration-200 border-2 border-[#3db6d9] bg-white !text-[#3db6d9] hover:bg-[#3db6d9] hover:!text-white hover:shadow-md hover:shadow-[#3db6d9]/40"
                              >
                                {dist.transferToPharmacy === true
                                  ? "Chuyển tiếp cho NT"
                                  : "Chuyển cho NT"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>

          {showDialog && selectedDistribution && !showChainView && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              onClick={() => {
                setShowDialog(false);
                setDialogLoading(false);
              }}
            >
              <div
                className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto custom-scroll"
                onClick={(e) => e.stopPropagation()}
              >
                <style>{`
                  .custom-scroll { scrollbar-width: none; -ms-overflow-style: none; }
                  .custom-scroll::-webkit-scrollbar { width: 0; height: 0; }
                  .custom-scroll::-webkit-scrollbar-track { background: transparent; }
                  .custom-scroll::-webkit-scrollbar-thumb { background: transparent; }
                `}</style>
                <div className="bg-linear-to-r from-secondary to-primary px-8 py-6 rounded-t-3xl">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold !text-white">
                        Chuyển giao NFT cho Pharmacy
                      </h2>
                      <p className="text-cyan-100 text-sm">
                        Chọn nhà thuốc và số lượng
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowDialog(false);
                        setDialogLoading(false);
                      }}
                      className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center !text-white text-xl transition"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="p-8 space-y-4 relative max-h-[500px] overflow-auto hide-scrollbar">
                  {dialogLoading && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-3xl flex items-center justify-center z-10">
                      <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-card-primary border-t-cyan-500 mb-4"></div>
                        <div className="text-slate-600 font-medium">
                          Đang tải thông tin...
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-cyan-50 rounded-xl p-4 border border-card-primary">
                    <div className="font-bold text-cyan-800 mb-3">
                      Thông tin lô hàng:
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Đơn hàng:</span>
                        <span className="font-mono font-medium">
                            {getInvoiceDisplay(selectedDistribution)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Từ:</span>
                        <span className="font-medium">
                            {getManufacturerDisplay(selectedDistribution)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Tổng số NFT:</span>
                        <span className="font-bold text-orange-700">
                            {getTotalQuantityDisplay(selectedDistribution)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">NFT khả dụng:</span>
                        <span className={`font-bold ${
                          getAvailableNFTs(selectedDistribution) === 0 
                            ? "text-red-700" 
                            : "text-green-700"
                        }`}>
                            {getAvailableNFTsDisplay(selectedDistribution)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Ngày nhận:</span>
                        <span className="font-medium">
                            {getDateDisplay(selectedDistribution.distributionDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Chọn nhà thuốc *
                    </label>
                    <select
                      value={formData.pharmacyId}
                      onChange={(e) =>
                        setFormData({ ...formData, pharmacyId: e.target.value })
                      }
                      className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-gray-400 focus:outline-none hover:border-gray-400 hover:shadow-sm transition"
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
                    <div className="bg-cyan-50 rounded-xl p-4 border border-card-primary">
                      <div className="text-sm font-semibold text-cyan-800 mb-2">
                        Thông tin nhà thuốc:
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
                        <div className="mt-3 pt-3 border-t border-card-primary">
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Số lượng NFT cần chuyển *
                    </label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({ ...formData, quantity: e.target.value })
                      }
                      className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-gray-400 focus:outline-none hover:border-gray-400 hover:shadow-sm transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Nhập số lượng"
                      min="1"
                      max={getAvailableNFTs(selectedDistribution)}
                      disabled={getAvailableNFTs(selectedDistribution) === 0}
                    />
                    <div className={`text-xs mt-1 ${
                      getAvailableNFTs(selectedDistribution) === 0 
                        ? "text-red-600" 
                        : "text-cyan-600"
                    }`}>
                      {getAvailableNFTs(selectedDistribution) === 0 
                        ? "⚠️ Không còn NFT khả dụng để chuyển"
                        : `Tối đa: ${getAvailableNFTs(selectedDistribution)} NFT khả dụng`
                      }
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ghi chú
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-gray-400 focus:outline-none hover:border-gray-400 hover:shadow-sm transition"
                      rows="3"
                      placeholder="Ghi chú về đơn chuyển giao..."
                    />
                  </div>

                  <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                    <div className="text-sm text-yellow-800">
                      ⚠️ Sau khi xác nhận, invoice sẽ được tạo với trạng thái{" "}
                      <strong>&quot;draft&quot;</strong>. NFT sẽ được chuyển
                      on-chain ngay lập tức.
                    </div>
                  </div>
                </div>

                <div className="px-8 py-6 border-t border-gray-200 bg-gray-50 rounded-b-3xl flex justify-end">
                  {getAvailableNFTs(selectedDistribution) === 0 ? (
                    <div className="px-6 py-3 rounded-full bg-gray-100 text-gray-600 font-semibold border border-gray-300 cursor-not-allowed">
                      Đã chuyển hết
                    </div>
                  ) : (
                    <TruckAnimationButton
                      onClick={handleSubmit}
                      disabled={submitLoading || getAvailableNFTs(selectedDistribution) === 0}
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
