import DashboardLayout from "../../shared/components/DashboardLayout";
import TruckAnimationButton from "../../shared/components/TruckAnimationButton";
import BlockchainTransferView from "../../shared/components/BlockchainTransferView";
import TruckLoader from "../../shared/components/TruckLoader";
import { navigationItems } from "../constants/navigationTransferManagement";
import { Card } from "../../shared/components/ui/cardUI";
import { useTransferManagements } from "../hooks/useTransferManagements";

export default function TransferManagement() {
  const {
    productions,
    loading,
    loadingProgress,
    showDialog,
    selectedProduction,
    availableTokenIds,
    loadingTokens,
    buttonAnimating,
    setButtonAnimating,
    buttonDone,
    setButtonDone,
    showBlockchainView,
    setShowBlockchainView,
    transferProgress,
    setTransferProgress,
    transferStatus,
    setTransferStatus,
    formData,
    setFormData,
    handleSelectProduction,
    handleSubmit,
    handleCloseDialog,
    formatDate,
    safeDistributors,
    selectedDistributor,
  } = useTransferManagements();
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
        <div className="space-y-6">
          {/* Banner */}
          {/* Instructions */}
          <Card
            title="Chuyển giao cho nhà phân phối"
            subtitle="Chọn lô sản xuất và distributor để chuyển quyền sở hữu NFT"
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
              title: "Quy trình chuyển giao",
              step1: {
                title: "Chọn lô sản xuất & Distributor",
                description: "Chọn NFT cần chuyển và nhà phân phối nhận hàng",
              },
              step2: {
                title: "Xác nhận trên hệ thống",
                description: "Lưu vào database với trạng thái 'pending'",
              },
              step3: {
                title: "Chuyển quyền sở hữu NFT",
                description: "Transfer NFT qua Smart Contract",
              },
            }}
          />

          {/* Productions Table */}
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
                    {productions.map((prod, index) => (
                      <tr
                        key={prod._id || index}
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
                          {prod.transferStatus === "transferred" ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                              Đã chuyển
                            </span>
                          ) : prod.transferStatus === "pending" ? (
                            <span className="inline-flex items-center px-2.5 py-1 w-26 justify-center rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">
                              Chưa chuyển
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                              Không xác định
                            </span>
                          )}
                        </td>
                        <td className="px-6  py-4 text-center">
                          <button
                            onClick={() => handleSelectProduction(prod)}
                            disabled={prod.transferStatus === "transferred"}
                            className={`px-4 py-2 text-sm whitespace-nowrap justify-center border-2 rounded-full font-semibold transition-all duration-200 ${
                              prod.transferStatus === "transferred"
                                ? "border-gray-300 text-gray-400 cursor-not-allowed"
                                : "border-secondary text-secondary hover:bg-secondary hover:!text-white hover:shadow-md hover:shadow-secondary/40"
                            }`}
                          >
                            {prod.transferStatus === "transferred"
                              ? "Đã chuyển"
                              : "Chuyển giao"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Blockchain Animation Overlay */}
      {showDialog && showBlockchainView && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-5xl px-4 flex justify-center">
            <BlockchainTransferView
              status={transferStatus}
              progress={transferProgress}
              onClose={() => {
                setShowBlockchainView(false);
                setTransferProgress(0);
                setTransferStatus("minting");
                setButtonAnimating(false);
                setButtonDone(false);
              }}
              transferType="manufacturer-to-distributor"
            />
          </div>
        </div>
      )}

      {/* Transfer Dialog */}
      {showDialog && selectedProduction && !showBlockchainView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto custom-scroll">
            <style>{`
              /* Ẩn scrollbar trong modal để giao diện sạch hơn */
              .custom-scroll { scrollbar-width: none; -ms-overflow-style: none; }
              .custom-scroll::-webkit-scrollbar { width: 0; height: 0; }
              .custom-scroll::-webkit-scrollbar-track { background: transparent; }
              .custom-scroll::-webkit-scrollbar-thumb { background: transparent; }
            `}</style>

            <div className="bg-gradient-to-r from-secondary to-primary px-8 py-6 rounded-t-3xl flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold !text-white">
                  Chuyển giao NFT
                </h2>
                <p className="text-cyan-100 text-sm">
                  Chọn distributor và số lượng
                </p>
              </div>
              <button
                onClick={handleCloseDialog}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center !text-white text-xl transition"
              >
                ✕
              </button>
            </div>

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
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tổng số NFT:</span>
                    <span className="font-bold text-orange-700">
                      {selectedProduction.quantity}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">IPFS Hash:</span>
                    <span className="font-mono text-xs text-slate-700">
                      {selectedProduction.ipfsHash?.slice(0, 20)}...
                    </span>
                  </div>
                </div>
              </div>

              {/* Loading Tokens Indicator */}
              {loadingTokens && (
                <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                  <div className="text-sm text-blue-700 flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
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
                    Đang tải danh sách token khả dụng...
                  </div>
                </div>
              )}

              {/* Select Distributor */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Chọn nhà phân phối *
                </label>
                <select
                  value={formData.distributorId}
                  onChange={(e) =>
                    setFormData({ ...formData, distributorId: e.target.value })
                  }
                  className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-gray-400 focus:outline-none hover:border-gray-400 hover:shadow-sm transition-all duration-150"
                  disabled={loadingTokens}
                >
                  <option value="">-- Chọn distributor --</option>
                  {safeDistributors.map((dist) => (
                    <option key={dist._id} value={dist._id}>
                      {dist.name} ({dist.taxCode})
                    </option>
                  ))}
                </select>
              </div>

              {selectedDistributor && (
                <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-200">
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

              {/* Quantity */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Số lượng NFT *
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-gray-400 focus:outline-none hover:border-gray-400 hover:shadow-sm transition-all duration-150"
                  placeholder="Nhập số lượng"
                  min="1"
                  max={selectedProduction.quantity}
                  disabled={loadingTokens}
                />
                <div className="text-xs text-cyan-600 mt-1">
                  Tối đa: {selectedProduction.quantity} NFT{" "}
                  {availableTokenIds.length > 0 && (
                    <span>({availableTokenIds.length} khả dụng)</span>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Ghi chú
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-gray-400 focus:outline-none hover:border-gray-400 hover:shadow-sm transition-all duration-150"
                  rows="3"
                  placeholder="Ghi chú về đơn chuyển giao..."
                  disabled={loadingTokens}
                />
              </div>

              <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                <div className="text-sm text-yellow-800">
                  Sau khi xác nhận, hệ thống sẽ tạo yêu cầu chuyển giao và gọi
                  smart contract để transfer NFT.
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-gray-200 bg-gray-50 rounded-b-3xl flex justify-end">
              <TruckAnimationButton
                onClick={handleSubmit}
                disabled={loadingTokens || buttonAnimating}
                buttonState={
                  buttonDone
                    ? "completed"
                    : buttonAnimating
                    ? "uploading"
                    : "idle"
                }
                defaultText="Xác nhận chuyển giao"
                uploadingText="Đang xử lý..."
                successText="Hoàn thành"
                animationMode="infinite"
                animationDuration={3}
              />
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
