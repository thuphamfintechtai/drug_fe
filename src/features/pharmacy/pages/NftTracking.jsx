import { motion } from "framer-motion";
import DashboardLayout from "../../shared/components/DashboardLayout";
import TruckLoader from "../../shared/components/TruckLoader";
import { useNFTTracking } from "../hooks/useNFTTracking";
import { navigationItems } from "../constants/constant";

export default function PharmacyNFTTracking() {
  const {
    nftId,
    setNftId,
    data,
    loading,
    error,
    pageLoading,
    pageProgress,
    handleSearch,
    formatDate,
    short,
    setError,
    setData,
  } = useNFTTracking();
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
      {pageLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="w-full max-w-2xl">
            <TruckLoader height={72} progress={pageProgress} showTrack />
          </div>
          <div className="text-lg text-slate-600 mt-6">Đang tra cứu...</div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-card-primary shadow-sm p-5 mb-6">
            <h1 className="text-xl font-semibold text-[#007b91]">
              Tra cứu NFT
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Theo dõi hành trình thuốc qua NFT ID
            </p>
          </div>

          <motion.div
            className="rounded-2xl bg-white/85 backdrop-blur-xl border border-card-primary shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-8 mb-5"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            <div className="max-w-3xl mx-auto">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
                    />
                  </svg>
                </span>

                <input
                  type="text"
                  value={nftId}
                  onChange={(e) => setNftId(e.target.value)}
                  placeholder="Nhập NFT ID..."
                  className="w-full h-12 pl-11 pr-40 rounded-full border border-gray-200 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#48cae4] transition"
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />

                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="absolute right-1 top-1 bottom-1 px-6 rounded-full bg-secondary hover:bg-primary !text-white font-medium transition disabled:opacity-50"
                >
                  {loading ? "Đang tra cứu..." : "Tìm Kiếm"}
                </button>
              </div>
              {error && (
                <div className="mt-6 bg-white rounded-2xl border border-card-primary shadow-sm p-10 text-center">
                  <h3 className="text-lg font-semibold text-[#007b91] mb-2">
                    Không tìm thấy kết quả
                  </h3>
                  <p className="text-slate-500 text-sm mb-1">
                    Không có dữ liệu nào khớp với NFT ID bạn đã nhập.
                  </p>
                  <p className="text-slate-400 text-sm mb-5">
                    Vui lòng kiểm tra lại hoặc thử với mã khác.
                  </p>
                  <button
                    onClick={() => {
                      setError("");
                      setData(null);
                      setNftId("");
                    }}
                    className="px-6 py-2.5 rounded-full bg-[#3db6d9] hover:bg-[#2fa2c5] !text-white font-medium transition"
                  >
                    Thử lại
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {data && (
            <motion.div
              className="space-y-5"
              variants={fadeUp}
              initial="hidden"
              animate="show"
            >
              <div className="bg-white rounded-2xl border border-card-primary shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-lg font-semibold text-[#007b91]">
                    Thông tin chi tiết thuốc
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div className="space-y-2">
                    <div className="text-slate-500">Token ID</div>
                    <div className="font-mono text-cyan-700 font-semibold">
                      #{data?.nft?.tokenId || nftId || "N/A"}
                    </div>
                    <div className="text-slate-500 mt-4">Số serial</div>
                    <div className="font-mono">
                      {data?.nft?.serialNumber || "N/A"}
                    </div>
                    <div className="text-slate-500 mt-4">Số lô</div>
                    <div className="font-medium">
                      {data?.nft?.batchNumber || "N/A"}
                    </div>
                    <div className="text-slate-500 mt-4">Ngày sản xuất</div>
                    <div className="font-medium">
                      {formatDate(data?.nft?.mfgDate)}
                    </div>
                    <div className="text-slate-500 mt-4">Hạn sử dụng</div>
                    <div className="font-medium">
                      {formatDate(data?.nft?.expDate)}
                    </div>
                    <div className="text-slate-500 mt-4">Trạng thái</div>
                    <div className="font-medium">
                      <span className="px-2 py-1 rounded-full text-xs bg-emerald-50 text-emerald-600 border border-emerald-100">
                        {data?.nft?.status || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-slate-500">Tên thuốc</div>
                    <div className="font-medium">
                      {data?.nft?.drug?.tradeName || "N/A"}
                    </div>
                    <div className="text-slate-500 mt-4">Tên hoạt chất</div>
                    <div className="font-medium">
                      {data?.nft?.drug?.genericName || "N/A"}
                    </div>
                    <div className="text-slate-500 mt-4">Mã ATC</div>
                    <div className="font-mono">
                      {data?.nft?.drug?.atcCode || "N/A"}
                    </div>
                    <div className="text-slate-500 mt-4">Dạng bào chế</div>
                    <div className="font-medium">
                      {data?.nft?.drug?.dosageForm || "N/A"}
                    </div>
                    <div className="text-slate-500 mt-4">Hàm lượng</div>
                    <div className="font-medium">
                      {data?.nft?.drug?.strength || "N/A"}
                    </div>
                    <div className="text-slate-500 mt-4">Quy cách đóng gói</div>
                    <div className="font-medium">
                      {data?.nft?.drug?.packaging || "N/A"}
                    </div>
                    <div className="text-slate-500 mt-4">
                      Chủ sở hữu hiện tại
                    </div>
                    <div className="font-medium">
                      {(() => {
                        const owner = data?.nft?.currentOwner;
                        if (!owner) return "N/A";
                        if (typeof owner === "object" && owner !== null) {
                          return owner.fullName || owner.name || owner.username || owner.email || "N/A";
                        }
                        return owner || "N/A";
                      })()}
                    </div>
                  </div>
                </div>

                {/* Chuỗi cung ứng */}
                {data?.supplyChain && (
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">
                      Chuỗi cung ứng
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {data.supplyChain.manufacturer && (
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                          <div className="text-xs font-semibold text-blue-800 mb-2">
                            Nhà sản xuất
                          </div>
                          <div className="text-sm font-medium text-slate-800">
                            {data.supplyChain.manufacturer.name || "N/A"}
                          </div>
                          {data.supplyChain.manufacturer.email && (
                            <div className="text-xs text-slate-600 mt-1">
                              {data.supplyChain.manufacturer.email}
                            </div>
                          )}
                        </div>
                      )}
                      {data.supplyChain.distributor && (
                        <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-200">
                          <div className="text-xs font-semibold text-cyan-800 mb-2">
                            Nhà phân phối
                          </div>
                          <div className="text-sm font-medium text-slate-800">
                            {data.supplyChain.distributor.name || "N/A"}
                          </div>
                          {data.supplyChain.distributor.email && (
                            <div className="text-xs text-slate-600 mt-1">
                              {data.supplyChain.distributor.email}
                            </div>
                          )}
                        </div>
                      )}
                      {data.supplyChain.pharmacy && (
                        <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                          <div className="text-xs font-semibold text-emerald-800 mb-2">
                            Nhà thuốc
                          </div>
                          <div className="text-sm font-medium text-slate-800">
                            {data.supplyChain.pharmacy.name || "N/A"}
                          </div>
                          {data.supplyChain.pharmacy.email && (
                            <div className="text-xs text-slate-600 mt-1">
                              {data.supplyChain.pharmacy.email}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Hành trình phân phối */}
                {data?.journey && Array.isArray(data.journey) && data.journey.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-700 mb-4">
                      Hành trình phân phối ({data.journey.length} bước)
                    </h3>
                    <div className="space-y-4">
                      {data.journey.map((step, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-50 rounded-lg p-4 border border-slate-200"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-slate-800">
                                {step.description || step.stage || `Bước ${idx + 1}`}
                              </h4>
                              <div className="text-xs text-slate-500 mt-1">
                                {step.date
                                  ? new Date(step.date).toLocaleString("vi-VN")
                                  : "N/A"}
                              </div>
                            </div>
                            {step.stage && (
                              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200 capitalize">
                                {step.stage}
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            {step.from && (
                              <div>
                                <span className="text-slate-500">Từ:</span>
                                <span className="font-medium ml-1 text-slate-800">
                                  {typeof step.from === "object" && step.from !== null
                                    ? step.from.fullName || step.from.name || step.from.username || "N/A"
                                    : step.from}
                                </span>
                              </div>
                            )}
                            {step.to && (
                              <div>
                                <span className="text-slate-500">Đến:</span>
                                <span className="font-medium ml-1 text-slate-800">
                                  {typeof step.to === "object" && step.to !== null
                                    ? step.to.fullName || step.to.name || step.to.username || "N/A"
                                    : step.to}
                                </span>
                              </div>
                            )}
                            {step.distributor && (
                              <div>
                                <span className="text-slate-500">Nhà phân phối:</span>
                                <span className="font-medium ml-1 text-slate-800">
                                  {typeof step.distributor === "object" && step.distributor !== null
                                    ? step.distributor.fullName || step.distributor.name || "N/A"
                                    : step.distributor}
                                </span>
                              </div>
                            )}
                            {step.pharmacy && (
                              <div>
                                <span className="text-slate-500">Nhà thuốc:</span>
                                <span className="font-medium ml-1 text-slate-800">
                                  {typeof step.pharmacy === "object" && step.pharmacy !== null
                                    ? step.pharmacy.fullName || step.pharmacy.name || "N/A"
                                    : step.pharmacy}
                                </span>
                              </div>
                            )}
                            {step.invoiceNumber && (
                              <div>
                                <span className="text-slate-500">Số hóa đơn:</span>
                                <span className="font-mono ml-1 text-slate-800">
                                  {step.invoiceNumber}
                                </span>
                              </div>
                            )}
                            {step.details?.quantity && (
                              <div>
                                <span className="text-slate-500">Số lượng:</span>
                                <span className="font-semibold ml-1 text-slate-800">
                                  {step.details.quantity}
                                </span>
                              </div>
                            )}
                            {step.details?.receivedQuantity !== undefined && (
                              <div>
                                <span className="text-slate-500">Số lượng nhận:</span>
                                <span className="font-semibold ml-1 text-slate-800">
                                  {step.details.receivedQuantity}
                                </span>
                              </div>
                            )}
                            {step.status && (
                              <div>
                                <span className="text-slate-500">Trạng thái:</span>
                                <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-600 border border-emerald-100 capitalize">
                                  {step.status}
                                </span>
                              </div>
                            )}
                            {step.supplyChainCompleted !== undefined && (
                              <div>
                                <span className="text-slate-500">Chuỗi cung ứng:</span>
                                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                                  step.supplyChainCompleted
                                    ? "bg-green-50 text-green-600 border border-green-100"
                                    : "bg-yellow-50 text-yellow-600 border border-yellow-100"
                                }`}>
                                  {step.supplyChainCompleted ? "Đã hoàn tất" : "Chưa hoàn tất"}
                                </span>
                              </div>
                            )}
                            {step.details?.invoiceId && (
                              <div className="md:col-span-2">
                                <span className="text-slate-500">Mã hóa đơn:</span>
                                <span className="font-mono ml-1 text-slate-800 text-xs break-all">
                                  {step.details.invoiceId}
                                </span>
                              </div>
                            )}
                            {step.details?.proofId && (
                              <div className="md:col-span-2">
                                <span className="text-slate-500">Mã chứng từ:</span>
                                <span className="font-mono ml-1 text-slate-800 text-xs break-all">
                                  {step.details.proofId}
                                </span>
                              </div>
                            )}
                            {step.details?.receiptId && (
                              <div className="md:col-span-2">
                                <span className="text-slate-500">Mã biên lai:</span>
                                <span className="font-mono ml-1 text-slate-800 text-xs break-all">
                                  {step.details.receiptId}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lịch sử blockchain */}
                {data?.blockchainHistory &&
                  Array.isArray(data.blockchainHistory) &&
                  data.blockchainHistory.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-slate-200">
                      <h3 className="text-sm font-semibold text-slate-700 mb-3">
                        Lịch sử giao dịch blockchain ({data.blockchainHistory.length})
                      </h3>
                      <div className="space-y-3">
                        {data.blockchainHistory.map((tx, idx) => (
                          <div
                            key={idx}
                            className="bg-slate-50 rounded-lg p-4 border border-slate-200"
                          >
                            <div className="text-xs font-semibold text-slate-700 mb-2">
                              Giao dịch #{idx + 1}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                              <div>
                                <span className="text-slate-500">Từ:</span>
                                <div className="font-mono text-slate-800 break-all mt-1">
                                  {tx.fromUserAddress || "N/A"}
                                </div>
                              </div>
                              <div>
                                <span className="text-slate-500">Đến:</span>
                                <div className="font-mono text-slate-800 break-all mt-1">
                                  {tx.toUserAddress || "N/A"}
                                </div>
                              </div>
                              {tx.fromUserType && (
                                <div>
                                  <span className="text-slate-500">From Type:</span>
                                  <div className="font-mono text-slate-800 break-all mt-1 text-xs">
                                    {tx.fromUserType}
                                  </div>
                                </div>
                              )}
                              {tx.toUserType && (
                                <div>
                                  <span className="text-slate-500">To Type:</span>
                                  <div className="font-mono text-slate-800 break-all mt-1 text-xs">
                                    {tx.toUserType}
                                  </div>
                                </div>
                              )}
                              {tx.receivedTimestamp && (
                                <div className="md:col-span-2">
                                  <span className="text-slate-500">Thời gian:</span>
                                  <span className="ml-1 text-slate-800">
                                    {typeof tx.receivedTimestamp === 'number'
                                      ? new Date(tx.receivedTimestamp * 1000).toLocaleString("vi-VN")
                                      : tx.receivedTimestamp}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}


              </div>
            </motion.div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
