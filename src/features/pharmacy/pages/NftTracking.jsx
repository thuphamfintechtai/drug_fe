import { motion } from "framer-motion";
import DashboardLayout from "../../shared/components/DashboardLayout";
import TruckLoader from "../../shared/components/TruckLoader";
import { useNFTTracking } from "../hooks/useNFTTracking";
import { navigationItems } from "../constants/constant";
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
          {/* Banner */}
          <motion.section
            className="relative overflow-hidden rounded-2xl mb-6 border border-[#90e0ef33] shadow-[0_10px_30px_rgba(0,0,0,0.06)] bg-gradient-to-r from-primary to-secondary"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Decorative background elements */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full -ml-24 -mb-24"></div>
            </div>

            <div className="relative px-6 py-8 md:px-10 md:py-10 lg:py-12 flex flex-col items-center text-center">
              <div className="mb-3 flex items-center justify-center">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-8 h-8 md:w-10 md:h-10 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
                    />
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight drop-shadow-sm mb-3 !text-white">
                Tra cứu NFT
              </h1>
              <p className="text-base md:text-lg !text-white/90 max-w-2xl leading-relaxed">
                Theo dõi hành trình thuốc qua NFT ID
              </p>
            </div>
          </motion.section>

          {/* Search */}
          <motion.div variants={fadeUp} initial="hidden" animate="show">
            <div className="w-full">
              <div className="relative flex items-stretch gap-0">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10">
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
                    placeholder="Nhập NFT ID để tra cứu..."
                    className="w-full h-14 pl-12 pr-4 rounded-l-xl border-2 border-r-0 border-slate-300 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition text-base"
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>

                <button
                  onClick={handleSearch}
                  disabled={loading || !nftId.trim()}
                  className="h-14 px-6 rounded-r-xl border-2 border-l-0 border-slate-300 !text-white bg-gradient-to-r from-primary to-secondary shadow-lg hover:shadow-xl transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {loading ? "Đang tra cứu..." : "Tìm kiếm"}
                </button>
              </div>
              {error && (
                <motion.div
                  className="mt-6 bg-white rounded-2xl border border-red-200 shadow-sm p-10 text-center"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">
                    Không tìm thấy kết quả
                  </h3>
                  <p className="text-slate-600 mb-1">
                    Không có dữ liệu nào khớp với NFT ID bạn đã nhập.
                  </p>
                  <p className="text-slate-500 text-sm mb-6">
                    Vui lòng kiểm tra lại hoặc thử với mã khác.
                  </p>
                  <button
                    onClick={() => {
                      setError("");
                      setData(null);
                      setNftId("");
                    }}
                    className="px-6 py-3 rounded-xl !text-white bg-gradient-to-r from-primary to-secondary shadow-lg hover:shadow-xl transition font-semibold"
                  >
                    Thử lại
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>

          {data && (
            <motion.div
              className="space-y-6"
              variants={fadeUp}
              initial="hidden"
              animate="show"
            >
              {/* Thông tin chi tiết thuốc */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-secondary border-b border-primary/20 px-6 py-4">
                  <h2 className="text-lg font-semibold !text-white">
                    Thông tin chi tiết thuốc
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-0 divide-y divide-slate-200">
                      <div className="flex flex-col sm:flex-row sm:items-center py-4 first:pt-0">
                        <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-40 shrink-0 mb-1 sm:mb-0">
                          NFT ID
                        </div>
                        <div className="text-base font-semibold text-slate-800 font-mono flex-1">
                          {data?.nft?.tokenId
                            ? String(data.nft.tokenId)
                            : nftId
                            ? String(nftId)
                            : "N/A"}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center py-4">
                        <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-40 shrink-0 mb-1 sm:mb-0">
                          Nhà sản xuất
                        </div>
                        <div className="text-base font-semibold text-slate-800 flex-1">
                          {data?.supplyChain?.manufacturer?.name ||
                            data?.manufacturerInvoice?.fromManufacturer
                              ?.fullName ||
                            data?.nft?.proofOfProduction?.manufacturer
                              ?.fullName ||
                            data?.nft?.owner?.fullName ||
                            "N/A"}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center py-4">
                        <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-40 shrink-0 mb-1 sm:mb-0">
                          Ngày sản xuất
                        </div>
                        <div className="text-base font-semibold text-slate-800 flex-1">
                          {formatDate(
                            data?.nft?.mfgDate ||
                              data?.nft?.proofOfProduction?.mfgDate
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center py-4">
                        <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-40 shrink-0 mb-1 sm:mb-0">
                          Số lô
                        </div>
                        <div className="text-base font-semibold text-slate-800 flex-1">
                          {data?.nft?.batchNumber ||
                            data?.nft?.proofOfProduction?.batchNumber ||
                            "N/A"}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center py-4 last:pb-0">
                        <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-40 shrink-0 mb-1 sm:mb-0">
                          Số serial
                        </div>
                        <div className="text-base font-semibold text-slate-800 font-mono flex-1">
                          {data?.nft?.serialNumber || "N/A"}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-0 divide-y divide-slate-200">
                      <div className="flex flex-col sm:flex-row sm:items-center py-4 first:pt-0">
                        <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-40 shrink-0 mb-1 sm:mb-0">
                          Tên thuốc
                        </div>
                        <div className="text-base font-semibold text-slate-800 flex-1">
                          {data?.nft?.drug?.tradeName ||
                            data?.nft?.drug?.genericName ||
                            "N/A"}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center py-4">
                        <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-40 shrink-0 mb-1 sm:mb-0">
                          Mã ATC
                        </div>
                        <div className="text-base font-semibold text-slate-800 font-mono flex-1">
                          {data?.nft?.drug?.atcCode || "N/A"}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center py-4">
                        <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-40 shrink-0 mb-1 sm:mb-0">
                          Nhà phân phối
                        </div>
                        <div className="text-base font-semibold text-slate-800 flex-1">
                          {data?.supplyChain?.distributor?.name ||
                            (() => {
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
                              const manufacturerDistributor =
                                data?.manufacturerInvoice?.toDistributor;
                              if (manufacturerDistributor) {
                                if (
                                  typeof manufacturerDistributor === "object"
                                ) {
                                  return (
                                    manufacturerDistributor.fullName ||
                                    manufacturerDistributor.name ||
                                    "N/A"
                                  );
                                }
                                return "N/A";
                              }
                              return "N/A";
                            })()}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center py-4">
                        <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-40 shrink-0 mb-1 sm:mb-0">
                          Nhà thuốc
                        </div>
                        <div className="text-base font-semibold text-slate-800 flex-1">
                          {(() => {
                            // Lấy từ supplyChain.pharmacies (mảng, lấy phần tử cuối cùng vì đó là nhà thuốc hiện tại)
                            if (
                              data?.supplyChain?.pharmacies &&
                              Array.isArray(data.supplyChain.pharmacies) &&
                              data.supplyChain.pharmacies.length > 0
                            ) {
                              const lastPharmacy =
                                data.supplyChain.pharmacies[
                                  data.supplyChain.pharmacies.length - 1
                                ];
                              return lastPharmacy.name || "N/A";
                            }
                            // Fallback về các đường dẫn cũ
                            return (
                              data?.commercialInvoice?.toPharmacy?.fullName ||
                              data?.nft?.currentOwner?.fullName ||
                              data?.nft?.currentOwner?.name ||
                              "N/A"
                            );
                          })()}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center py-4">
                        <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-40 shrink-0 mb-1 sm:mb-0">
                          Hạn sử dụng
                        </div>
                        <div className="text-base font-semibold text-slate-800 flex-1">
                          {formatDate(
                            data?.nft?.expDate ||
                              data?.nft?.proofOfProduction?.expDate
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center py-4 last:pb-0">
                        <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-40 shrink-0 mb-1 sm:mb-0">
                          Chủ sở hữu hiện tại
                        </div>
                        <div className="text-base font-semibold text-slate-800 flex-1">
                          {(() => {
                            const owner = data?.nft?.currentOwner;
                            if (!owner) {
                              return (
                                data?.nft?.owner?.fullName ||
                                data?.nft?.owner?.username ||
                                "N/A"
                              );
                            }
                            if (typeof owner === "object" && owner !== null) {
                              return (
                                owner.fullName ||
                                owner.name ||
                                owner.username ||
                                owner.email ||
                                "N/A"
                              );
                            }
                            return owner || "N/A";
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thông tin Blockchain */}
              {(data?.nft?.chainTxHash ||
                data?.nft?.ipfsUrl ||
                data?.nft?.contractAddress) && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-primary to-secondary border-b border-primary/20 px-6 py-4">
                    <h3 className="text-base font-semibold !text-white">
                      Thông tin Blockchain
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-0 divide-y divide-slate-200">
                      {data?.nft?.contractAddress && (
                        <div className="flex flex-col sm:flex-row sm:items-start py-4 first:pt-0">
                          <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0 sm:pt-1">
                            Contract Address
                          </div>
                          <div className="text-sm font-semibold text-slate-800 font-mono break-all flex-1">
                            {data.nft.contractAddress}
                          </div>
                        </div>
                      )}
                      {data?.nft?.chainTxHash && (
                        <div className="flex flex-col sm:flex-row sm:items-start py-4">
                          <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0 sm:pt-1">
                            Transaction Hash
                          </div>
                          <div className="text-sm font-semibold text-slate-800 font-mono break-all flex-1">
                            <a
                              href={`https://sepolia.etherscan.io/tx/${data.nft.chainTxHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-secondary hover:underline"
                            >
                              {data.nft.chainTxHash}
                            </a>
                          </div>
                        </div>
                      )}
                      {data?.nft?.ipfsUrl && (
                        <div className="flex flex-col sm:flex-row sm:items-start py-4 last:pb-0">
                          <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0 sm:pt-1">
                            IPFS URL
                          </div>
                          <div className="text-base font-semibold text-slate-800 flex-1">
                            <a
                              href={data.nft.ipfsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-xs text-primary hover:text-secondary hover:underline break-all"
                            >
                              {data.nft.ipfsUrl}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Lịch sử blockchain */}
              {data?.blockchainHistory && data.blockchainHistory.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-primary to-secondary border-b border-primary/20 px-6 py-4">
                    <h3 className="text-base font-semibold !text-white">
                      Lịch sử giao dịch ({data.blockchainHistory.length})
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3">
                      {data.blockchainHistory.map((tx, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-50 rounded-xl p-4 border border-slate-200"
                        >
                          <div className="space-y-0 divide-y divide-slate-200">
                            <div className="flex flex-col sm:flex-row sm:items-center py-3 first:pt-0">
                              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-32 shrink-0 mb-1 sm:mb-0">
                                Từ
                              </div>
                              <div className="text-sm font-semibold text-slate-800 font-mono flex-1">
                                {short(tx.fromUserAddress)}
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center py-3">
                              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-32 shrink-0 mb-1 sm:mb-0">
                                Đến
                              </div>
                              <div className="text-sm font-semibold text-slate-800 font-mono flex-1">
                                {short(tx.toUserAddress)}
                              </div>
                            </div>
                            {tx.receivedTimestamp && (
                              <div className="flex flex-col sm:flex-row sm:items-center py-3 last:pb-0">
                                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-32 shrink-0 mb-1 sm:mb-0">
                                  Thời gian
                                </div>
                                <div className="text-sm font-semibold text-slate-800 flex-1">
                                  {new Date(
                                    tx.receivedTimestamp * 1000
                                  ).toLocaleString("vi-VN")}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Thông tin hóa đơn */}
              {(data?.manufacturerInvoice || data?.commercialInvoice) && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-primary to-secondary border-b border-primary/20 px-6 py-4">
                    <h3 className="text-base font-semibold !text-white">
                      Thông tin Hóa đơn
                    </h3>
                  </div>
                  <div className="p-6">
                    <div
                      className={`grid gap-6 ${
                        data?.manufacturerInvoice && data?.commercialInvoice
                          ? "grid-cols-1 md:grid-cols-2"
                          : "grid-cols-1"
                      }`}
                    >
                      {data?.manufacturerInvoice && (
                        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                          <h4 className="font-semibold text-slate-800 mb-4 text-base">
                            Hóa đơn từ NSX
                          </h4>
                          <div className="space-y-0 divide-y divide-slate-200">
                            <div className="flex flex-col sm:flex-row sm:items-center py-3 first:pt-0">
                              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-32 shrink-0 mb-1 sm:mb-0">
                                Số HD
                              </div>
                              <div className="text-sm font-semibold text-slate-800 font-mono flex-1">
                                {data.manufacturerInvoice.invoiceNumber}
                              </div>
                            </div>
                            {data.manufacturerInvoice.invoiceDate && (
                              <div className="flex flex-col sm:flex-row sm:items-center py-3">
                                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-32 shrink-0 mb-1 sm:mb-0">
                                  Ngày
                                </div>
                                <div className="text-sm font-semibold text-slate-800 flex-1">
                                  {formatDate(
                                    data.manufacturerInvoice.invoiceDate
                                  )}
                                </div>
                              </div>
                            )}
                            <div className="flex flex-col sm:flex-row sm:items-center py-3 last:pb-0">
                              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-32 shrink-0 mb-1 sm:mb-0">
                                Trạng thái
                              </div>
                              <div className="flex-1">
                                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 capitalize">
                                  {data.manufacturerInvoice.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {data?.commercialInvoice && (
                        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                          <h4 className="font-semibold text-slate-800 mb-4 text-base">
                            Hóa đơn thương mại
                          </h4>
                          <div className="space-y-0 divide-y divide-slate-200">
                            <div className="flex flex-col sm:flex-row sm:items-center py-3 first:pt-0">
                              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-32 shrink-0 mb-1 sm:mb-0">
                                Số HD
                              </div>
                              <div className="text-sm font-semibold text-slate-800 font-mono flex-1">
                                {data.commercialInvoice.invoiceNumber}
                              </div>
                            </div>
                            {data.commercialInvoice.invoiceDate && (
                              <div className="flex flex-col sm:flex-row sm:items-center py-3">
                                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-32 shrink-0 mb-1 sm:mb-0">
                                  Ngày
                                </div>
                                <div className="text-sm font-semibold text-slate-800 flex-1">
                                  {formatDate(
                                    data.commercialInvoice.invoiceDate
                                  )}
                                </div>
                              </div>
                            )}
                            <div className="flex flex-col sm:flex-row sm:items-center py-3 last:pb-0">
                              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-32 shrink-0 mb-1 sm:mb-0">
                                Trạng thái
                              </div>
                              <div className="flex-1">
                                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
                                  {data.commercialInvoice.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              {(data?.nft?.chainTxHash || data?.nft?.ipfsUrl) && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6">
                  <div className="flex flex-col sm:flex-row gap-3 justify-end">
                    {data?.nft?.chainTxHash && (
                      <a
                        href={`https://sepolia.etherscan.io/tx/${data.nft.chainTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 rounded-xl !text-white bg-gradient-to-r from-primary to-secondary shadow-lg hover:shadow-xl transition font-semibold flex items-center justify-center gap-2"
                      >
                        <span>🔗</span>
                        <span>Xem trên Etherscan</span>
                      </a>
                    )}
                    {data?.nft?.ipfsUrl && (
                      <a
                        href={data.nft.ipfsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 rounded-xl !text-white bg-gradient-to-r from-purple-600 to-purple-700 shadow-lg hover:shadow-xl transition font-semibold flex items-center justify-center gap-2"
                      >
                        <span>📄</span>
                        <span>Xem trên IPFS</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
