import { useMemo } from "react";
import DashboardLayout from "../../shared/components/DashboardLayout";
import TruckAnimationButton from "../../shared/components/TruckAnimationButton";
import BlockchainTransferView from "../../shared/components/BlockchainTransferView";
import { navigationItems } from "../constants/navigationProductionManagement";
import { CardUI } from "../../shared/components/ui/cardUI";
import { useTransferManagements } from "../hooks/useTransferManagements";

export default function TransferManagement() {
  const {
    productions,
    loading,
    distributors,
    selectedDistributor,
    showDialog,
    selectedProduction,
    availableTokenIds,
    loadingTokens,
    buttonAnimating,
    buttonDone,
    showBlockchainView,
    transferProgress,
    transferStatus,
    formData,
    setFormData,
    handleSelectProduction,
    handleSubmit,
    handleCloseDialog,
    formatDate,
    getStatusInfo,
    setButtonAnimating,
    setButtonDone,
    setShowBlockchainView,
    setTransferProgress,
    setTransferStatus,
  } = useTransferManagements();

  const handleDistributorChange = (e) => {
    setFormData({
      ...formData,
      distributorId: e.target.value,
    });
  };

  const handleNotesChange = (e) => {
    setFormData({ ...formData, notes: e.target.value });
  };

  const handleCloseBlockchainView = () => {
    setShowBlockchainView(false);
    setTransferProgress(0);
    setTransferStatus("minting");
    setButtonAnimating(false);
    setButtonDone(false);
  };

  const productionStats = useMemo(() => {
    if (!selectedProduction) return null;
    return {
      totalNFTs: selectedProduction.quantity,
      availableNFTs: loadingTokens ? "..." : availableTokenIds.length,
      transferredNFTs: loadingTokens
        ? "..."
        : selectedProduction.quantity - availableTokenIds.length,
    };
  }, [selectedProduction, availableTokenIds, loadingTokens]);

  return (
    <DashboardLayout navigationItems={navigationItems}>
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-600"></div>
          <div className="text-lg text-slate-600 mt-6">Đang tải dữ liệu...</div>
        </div>
      ) : (
        <div className="space-y-6">
          <CardUI
            title="Chuyển giao cho nhà phân phối"
            subtitle="Chọn lô sản xuất và distributor để chuyển quyền sở hữu NFT - Hệ thống tự động lưu sau khi chuyển"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7h18M5 10h14M4 14h16M6 18h12"
                />
              </svg>
            }
            content={{
              title: "Quy trình chuyển giao (Tự động)",
              step1: {
                title: "Chọn lô sản xuất & Distributor",
                description: "Chọn NFT cần chuyển và nhà phân phối nhận hàng",
              },
              step2: {
                title: "Ký giao dịch blockchain",
                description: "Xác nhận transfer NFT qua MetaMask",
              },
              step3: {
                title: "Tự động lưu vào hệ thống",
                description: "Hệ thống tự động cập nhật invoice (có retry 3 lần)",
              },
            }}
          />

          <div className="bg-white rounded-2xl border border-card-primary shadow-sm overflow-hidden">
            {productions.length === 0 ? (
              <div className="p-16 flex flex-col items-center justify-center text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-12 h-12 mb-3 opacity-60"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7h18M5 10h14M4 14h16M6 18h12"
                  />
                </svg>
                <p className="text-gray-500 text-sm">Không có dữ liệu</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Thuốc
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Số lô
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Số lượng NFT
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Ngày SX
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        HSD
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {productions.map((prod, index) => {
                      const statusInfo = getStatusInfo(prod.status);
                      return (
                        <tr
                          key={prod.id || index}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 font-medium text-gray-800">
                            {prod.drug?.tradeName || "N/A"}
                            <div className="text-xs text-slate-500">
                              {prod.drug?.atcCode}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-cyan-50 text-cyan-700 border border-cyan-100">
                              {prod.batchNumber}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            <span className="font-semibold text-gray-800">
                              {prod.quantity}
                            </span>
                            <span className="text-xs text-slate-500 ml-1">
                              NFT
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {formatDate(prod.mfgDate)}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {formatDate(prod.expDate)}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 w-24 justify-center rounded-full text-xs font-semibold border ${statusInfo.className}`}
                            >
                              {statusInfo.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleSelectProduction(prod)}
                              disabled={!statusInfo.canTransfer}
                              className={`px-4 py-2 text-sm whitespace-nowrap justify-center border-2 rounded-full font-semibold transition-all duration-200 ${
                                !statusInfo.canTransfer
                                  ? "border-gray-300 text-gray-400 cursor-not-allowed"
                                  : "border-secondary text-secondary hover:bg-secondary hover:!text-white hover:shadow-md hover:shadow-secondary/40"
                              }`}
                            >
                              {statusInfo.buttonText}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Blockchain View Dialog */}
      {showDialog && showBlockchainView && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-5xl px-4 flex justify-center">
            <BlockchainTransferView
              status={transferStatus}
              progress={transferProgress}
              onClose={handleCloseBlockchainView}
              transferType="manufacturer-to-distributor"
            />
          </div>
        </div>
      )}

      {/* Main Transfer Dialog - SIMPLIFIED (No transaction hash input) */}
      {showDialog && selectedProduction && !showBlockchainView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto custom-scroll">
            <style>{`
              .custom-scroll { 
                scrollbar-width: none; 
                -ms-overflow-style: none; 
              }
              .custom-scroll::-webkit-scrollbar { 
                width: 0; 
                height: 0; 
              }
            `}</style>

            {/* Header */}
            <div className="bg-gradient-to-r from-secondary to-primary px-8 py-6 rounded-t-3xl flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold !text-white">
                  Chuyển giao NFT
                </h2>
                <p className="text-cyan-100 text-sm">
                  Chọn distributor và ký giao dịch - Hệ thống sẽ tự động lưu
                </p>
              </div>
              <button
                onClick={handleCloseDialog}
                disabled={buttonAnimating}
                className={`w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center !text-white text-xl transition ${
                  buttonAnimating ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div
              className={`relative ${
                loadingTokens ? "pointer-events-none" : ""
              }`}
            >
              {/* Loading Overlay */}
              {loadingTokens && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-b-3xl">
                  <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center">
                    <svg
                      className="animate-spin h-10 w-10 text-secondary mb-3"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <p className="text-gray-700 font-medium">
                      Đang tải danh sách token...
                    </p>
                  </div>
                </div>
              )}

              <div className="p-8 space-y-4">
                {/* Production Info */}
                <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-200">
                  <div className="font-bold text-cyan-800 mb-3">
                    Thông tin lô sản xuất:
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Thuốc:</span>
                      <span className="font-medium">
                        {selectedProduction.drug?.tradeName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Số lô:</span>
                      <span className="font-mono font-medium">
                        {selectedProduction.batchNumber || "—"}
                      </span>
                    </div>
                    {productionStats && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Tổng số NFT:</span>
                          <span className="font-bold text-orange-700">
                            {productionStats.totalNFTs}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">NFT khả dụng:</span>
                          <span className="font-bold text-green-700">
                            {productionStats.availableNFTs}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">NFT đã chuyển:</span>
                          <span className="font-bold text-red-700">
                            {productionStats.transferredNFTs}
                          </span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-600">IPFS Hash:</span>
                      <span className="font-mono text-xs text-slate-700 break-all">
                        {selectedProduction.ipfsHash?.slice(0, 20)}...
                      </span>
                    </div>
                  </div>
                </div>

                {/* Distributor Selection */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Chọn nhà phân phối *
                  </label>
                  <select
                    value={formData.distributorId}
                    onChange={handleDistributorChange}
                    className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-700 focus:ring-2 focus:ring-secondary focus:border-secondary focus:outline-none hover:border-gray-400 hover:shadow-sm transition-all duration-150"
                    disabled={loadingTokens || buttonAnimating}
                  >
                    <option value="">-- Chọn nhà phân phối --</option>
                    {distributors.map((distributor) => (
                      <option
                        key={distributor._id || distributor.id}
                        value={distributor._id || distributor.id}
                      >
                        {distributor.name || distributor.businessName || "N/A"}
                        {distributor.taxCode ? ` (${distributor.taxCode})` : ""}
                      </option>
                    ))}
                  </select>
                  {distributors.length === 0 && (
                    <div className="text-xs text-red-600 mt-1">
                      Không có nhà phân phối nào khả dụng
                    </div>
                  )}
                </div>

                {/* Quantity Display */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Số lượng NFT (tự động)
                  </label>
                  <input
                    type="text"
                    value={loadingTokens ? "..." : availableTokenIds.length}
                    readOnly
                    className="w-full border-2 border-gray-200 rounded-xl p-3 text-gray-500 bg-gray-50 cursor-not-allowed"
                  />
                  <div className="text-xs text-cyan-700 mt-1">
                    Hệ thống sẽ chuyển tất cả {availableTokenIds.length} NFT khả dụng
                  </div>

                  {/* Selected Distributor Info */}
                  {selectedDistributor && (
                    <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-200 mt-3">
                      <div className="text-sm font-semibold text-cyan-800 mb-2">
                        Thông tin distributor:
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-slate-600">Tên:</span>{" "}
                          <span className="font-medium">
                            {selectedDistributor.name || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600">Mã số thuế:</span>{" "}
                          <span className="font-medium">
                            {selectedDistributor.taxCode || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600">Quốc gia:</span>{" "}
                          <span className="font-medium">
                            {selectedDistributor.country || "N/A"}
                          </span>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-slate-600">Địa chỉ:</span>{" "}
                          <span className="font-medium">
                            {selectedDistributor.address || "N/A"}
                          </span>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-slate-600">Wallet:</span>{" "}
                          <span className="font-mono text-xs break-all">
                            {selectedDistributor.walletAddress ||
                              selectedDistributor.user?.walletAddress ||
                              "Chưa có"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  <div className="mt-3">
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Ghi chú
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={handleNotesChange}
                      className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-secondary focus:border-secondary focus:outline-none hover:border-gray-400 hover:shadow-sm transition-all duration-150"
                      rows="3"
                      placeholder="Ghi chú về đơn chuyển giao... (tối đa 500 ký tự)"
                      maxLength={500}
                      disabled={loadingTokens || buttonAnimating}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {formData.notes.length}/500 ký tự
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions - SIMPLIFIED */}
              <div className="px-8 py-6 border-t border-gray-200 bg-gray-50 rounded-b-3xl flex flex-wrap justify-end gap-3">
                <button
                  onClick={handleCloseDialog}
                  disabled={buttonAnimating}
                  className={`px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-full font-semibold transition-all duration-200 hover:bg-gray-100 ${
                    buttonAnimating ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Hủy
                </button>

                <TruckAnimationButton
                  onClick={handleSubmit}
                  disabled={
                    loadingTokens ||
                    buttonAnimating ||
                    availableTokenIds.length === 0 ||
                    !formData.distributorId
                  }
                  buttonState={
                    buttonDone
                      ? "completed"
                      : buttonAnimating
                      ? "uploading"
                      : "idle"
                  }
                  defaultText="Chuyển giao NFT"
                  uploadingText="Đang xử lý..."
                  successText="Hoàn thành!"
                  animationMode="infinite"
                  animationDuration={3}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}