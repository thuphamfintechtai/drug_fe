import { motion } from "framer-motion";
import DashboardLayout from "../../shared/components/DashboardLayout";
import TruckLoader from "../../shared/components/TruckLoader";
import useNFTTracking from "../hooks/useNFT-Tracking";
export default function AdminNftTracking() {
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
    navigationItems,
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
            className="rounded-2xl bg-white/85 backdrop-blur-xl border border-[#90e0ef55] shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-8 mb-5"
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
                <div className="mt-6 bg-white rounded-2xl border border-cyan-100 shadow-sm p-10 text-center">
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
              <div className="bg-white rounded-2xl border border-cyan-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-lg font-semibold text-[#007b91]">
                    Thông tin chi tiết thuốc
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div className="space-y-2">
                    <div className="text-slate-500">NFT ID</div>
                    <div className="font-mono text-cyan-700">
                      {data?.nft?.tokenId
                        ? short(String(data.nft.tokenId))
                        : nftId
                        ? short(String(nftId))
                        : "N/A"}
                    </div>
                    <div className="text-slate-500 mt-4">Nhà sản xuất</div>
                    <div className="font-medium">
                      {data?.manufacturerInvoice?.fromManufacturer?.fullName ||
                        data?.nft?.proofOfProduction?.manufacturer?.fullName ||
                        data?.nft?.owner?.fullName ||
                        "N/A"}
                    </div>
                    <div className="text-slate-500 mt-4">Ngày sản xuất</div>
                    <div className="font-medium">
                      {formatDate(
                        data?.nft?.mfgDate ||
                          data?.nft?.proofOfProduction?.mfgDate
                      )}
                    </div>
                    <div className="text-slate-500 mt-4">Số lô</div>
                    <div className="font-medium">
                      {data?.nft?.batchNumber ||
                        data?.nft?.proofOfProduction?.batchNumber ||
                        "N/A"}
                    </div>
                    <div className="text-slate-500 mt-4">Số serial</div>
                    <div className="font-mono">
                      {data?.nft?.serialNumber || "N/A"}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-slate-500">Tên thuốc</div>
                    <div className="font-medium">
                      {data?.nft?.drug?.tradeName ||
                        data?.nft?.drug?.genericName ||
                        "N/A"}
                    </div>
                    <div className="text-slate-500 mt-4">Mã ATC</div>
                    <div className="font-mono">
                      {data?.nft?.drug?.atcCode || "N/A"}
                    </div>
                    <div className="text-slate-500 mt-4">Nhà phân phối</div>
                    <div className="font-medium">
                      {(() => {
                        // Kiểm tra commercialInvoice trước (hóa đơn thương mại)
                        const commercialDistributor =
                          data?.commercialInvoice?.fromDistributor;
                        if (commercialDistributor) {
                          if (typeof commercialDistributor === "object") {
                            return (
                              commercialDistributor.fullName ||
                              commercialDistributor.name ||
                              "N/A"
                            );
                          }
                        }
                        // Kiểm tra manufacturerInvoice (hóa đơn từ NSX)
                        const manufacturerDistributor =
                          data?.manufacturerInvoice?.toDistributor;
                        if (manufacturerDistributor) {
                          if (typeof manufacturerDistributor === "object") {
                            return (
                              manufacturerDistributor.fullName ||
                              manufacturerDistributor.name ||
                              "N/A"
                            );
                          }
                          // Nếu là ID string, có thể hiển thị ID hoặc "N/A"
                          return "N/A";
                        }
                        return "N/A";
                      })()}
                    </div>
                    <div className="text-slate-500 mt-4">Nhà thuốc</div>
                    <div className="font-medium">
                      {data?.commercialInvoice?.toPharmacy?.fullName || "N/A"}
                    </div>
                    <div className="text-slate-500 mt-4">Hạn sử dụng</div>
                    <div className="font-medium">
                      {formatDate(
                        data?.nft?.expDate ||
                          data?.nft?.proofOfProduction?.expDate
                      )}
                    </div>
                    <div className="text-slate-500 mt-4">
                      Chủ sở hữu hiện tại
                    </div>
                    <div className="font-medium">
                      {data?.nft?.owner?.fullName ||
                        data?.nft?.owner?.username ||
                        "N/A"}
                    </div>
                  </div>
                </div>

                {/* Thông tin bổ sung */}
                {(data?.nft?.chainTxHash ||
                  data?.nft?.ipfsUrl ||
                  data?.nft?.contractAddress) && (
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">
                      Thông tin Blockchain
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {data?.nft?.contractAddress && (
                        <div>
                          <div className="text-slate-500">Contract Address</div>
                          <div className="font-mono text-slate-700 break-all">
                            {data.nft.contractAddress}
                          </div>
                        </div>
                      )}
                      {data?.nft?.chainTxHash && (
                        <div>
                          <div className="text-slate-500">Transaction Hash</div>
                          <div className="font-mono text-slate-700 break-all">
                            {short(data.nft.chainTxHash)}
                          </div>
                        </div>
                      )}
                      {data?.nft?.ipfsUrl && (
                        <div className="md:col-span-2">
                          <div className="text-slate-500">IPFS URL</div>
                          <a
                            href={data.nft.ipfsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="font-mono text-cyan-600 hover:text-cyan-700 break-all"
                          >
                            {data.nft.ipfsUrl}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Lịch sử blockchain */}
                {data?.blockchainHistory &&
                  data.blockchainHistory.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-slate-200">
                      <h3 className="text-sm font-semibold text-slate-700 mb-3">
                        Lịch sử giao dịch ({data.blockchainHistory.length})
                      </h3>
                      <div className="space-y-2">
                        {data.blockchainHistory.map((tx, idx) => (
                          <div
                            key={idx}
                            className="bg-slate-50 rounded-lg p-3 text-xs"
                          >
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="text-slate-500">Từ:</span>
                                <span className="font-mono ml-1">
                                  {short(tx.fromUserAddress)}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-500">Đến:</span>
                                <span className="font-mono ml-1">
                                  {short(tx.toUserAddress)}
                                </span>
                              </div>
                              {tx.receivedTimestamp && (
                                <div className="col-span-2">
                                  <span className="text-slate-500">
                                    Thời gian:
                                  </span>
                                  <span className="ml-1">
                                    {new Date(
                                      tx.receivedTimestamp * 1000
                                    ).toLocaleString("vi-VN")}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Thông tin hóa đơn */}
                {(data?.manufacturerInvoice || data?.commercialInvoice) && (
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">
                      Thông tin Hóa đơn
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {data?.manufacturerInvoice && (
                        <div className="bg-blue-50 rounded-lg p-3">
                          <div className="font-semibold text-blue-800 mb-2">
                            Hóa đơn từ NSX
                          </div>
                          <div>
                            <span className="text-slate-600">Số HD:</span>
                            <span className="font-mono ml-1">
                              {data.manufacturerInvoice.invoiceNumber}
                            </span>
                          </div>
                          {data.manufacturerInvoice.invoiceDate && (
                            <div className="mt-1">
                              <span className="text-slate-600">Ngày:</span>
                              <span className="ml-1">
                                {formatDate(
                                  data.manufacturerInvoice.invoiceDate
                                )}
                              </span>
                            </div>
                          )}
                          <div className="mt-1">
                            <span className="text-slate-600">Trạng thái:</span>
                            <span className="ml-1 capitalize">
                              {data.manufacturerInvoice.status}
                            </span>
                          </div>
                        </div>
                      )}
                      {data?.commercialInvoice && (
                        <div className="bg-green-50 rounded-lg p-3">
                          <div className="font-semibold text-green-800 mb-2">
                            Hóa đơn thương mại
                          </div>
                          <div>
                            <span className="text-slate-600">Số HD:</span>
                            <span className="font-mono ml-1">
                              {data.commercialInvoice.invoiceNumber}
                            </span>
                          </div>
                          {data.commercialInvoice.invoiceDate && (
                            <div className="mt-1">
                              <span className="text-slate-600">Ngày:</span>
                              <span className="ml-1">
                                {formatDate(data.commercialInvoice.invoiceDate)}
                              </span>
                            </div>
                          )}
                          <div className="mt-1">
                            <span className="text-slate-600">Trạng thái:</span>
                            <span className="ml-1 capitalize">
                              {data.commercialInvoice.status}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-6 flex justify-end gap-3">
                  {data?.nft?.chainTxHash && (
                    <a
                      href={`https://sepolia.etherscan.io/tx/${data.nft.chainTxHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-6 py-2.5 rounded-full bg-[#3db6d9] hover:bg-[#2fa2c5] !text-white font-medium transition"
                    >
                      Xem trên Etherscan →
                    </a>
                  )}
                  {data?.nft?.ipfsUrl && (
                    <a
                      href={data.nft.ipfsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-6 py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 !text-white font-medium transition"
                    >
                      Xem trên IPFS →
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
