import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "../../components/DashboardLayout";
import TruckLoader from "../../components/TruckLoader";
import { trackDrugByNFTId } from "../../services/distributor/distributorService";

export default function NFTTracking() {
  const [tokenId, setTokenId] = useState("");
  const [trackingData, setTrackingData] = useState(null);
  const [error, setError] = useState("");
  // Loading cho PAGE (khởi động trang)
  const [pageLoading, setPageLoading] = useState(true);
  const [pageProgress, setPageProgress] = useState(0);
  const pageIntervalRef = useRef(null);
  // Trạng thái tra cứu (không hiển thị TruckLoader)
  const [isSearching, setIsSearching] = useState(false);

  const navigationItems = [
    {
      path: "/distributor",
      label: "Tổng quan",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      active: false,
    },
    {
      path: "/distributor/invoices",
      label: "Đơn từ nhà SX",
      icon: (
        <svg
          className="w-5 h-5"
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
      ),
      active: false,
    },
    {
      path: "/distributor/transfer-pharmacy",
      label: "Chuyển cho NT",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
      ),
      active: false,
    },
    {
      path: "/distributor/distribution-history",
      label: "Lịch sử phân phối",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
      active: false,
    },
    {
      path: "/distributor/transfer-history",
      label: "Lịch sử chuyển NT",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      active: false,
    },
    {
      path: "/distributor/drugs",
      label: "Quản lý thuốc",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
          />
        </svg>
      ),
      active: false,
    },
    {
      path: "/distributor/nft-tracking",
      label: "Tra cứu NFT",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      ),
      active: true,
    },
    {
      path: "/distributor/profile",
      label: "Hồ sơ",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      active: false,
    },
  ];

  useEffect(() => {
    // Mô phỏng loading khi vào trang để xe chạy
    setPageLoading(true);
    setPageProgress(0);
    if (pageIntervalRef.current) {
      clearInterval(pageIntervalRef.current);
      pageIntervalRef.current = null;
    }
    pageIntervalRef.current = setInterval(() => {
      setPageProgress((prev) =>
        prev < 0.9 ? Math.min(prev + 0.02, 0.9) : prev
      );
    }, 50);
    const complete = async () => {
      if (pageIntervalRef.current) {
        clearInterval(pageIntervalRef.current);
        pageIntervalRef.current = null;
      }
      let current = 0;
      setPageProgress((p) => {
        current = p;
        return p;
      });
      if (current < 0.9) {
        await new Promise((resolve) => {
          const su = setInterval(() => {
            setPageProgress((prev) => {
              if (prev < 1) {
                const np = Math.min(prev + 0.15, 1);
                if (np >= 1) {
                  clearInterval(su);
                  resolve();
                }
                return np;
              }
              clearInterval(su);
              resolve();
              return 1;
            });
          }, 30);
          setTimeout(() => {
            clearInterval(su);
            setPageProgress(1);
            resolve();
          }, 500);
        });
      } else {
        setPageProgress(1);
        await new Promise((r) => setTimeout(r, 200));
      }
      await new Promise((r) => setTimeout(r, 100));
      setPageLoading(false);
      setTimeout(() => setPageProgress(0), 500);
    };
    complete();
    return () => {
      if (pageIntervalRef.current) {
        clearInterval(pageIntervalRef.current);
        pageIntervalRef.current = null;
      }
    };
  }, []);

  const handleTrack = async () => {
    if (!tokenId.trim()) {
      setError("Vui lòng nhập NFT ID");
      return;
    }

    setIsSearching(true);
    setError("");
    setTrackingData(null);

    try {
      const response = await trackDrugByNFTId(tokenId);
      if (response.data.success) {
        setTrackingData(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tra cứu NFT");
    } finally {
      setIsSearching(false);
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const formatDate = (d) => {
    if (!d) return "N/A";
    const date = new Date(d);
    return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString("vi-VN");
  };
  const short = (s) => {
    if (!s || typeof s !== "string") return "N/A";
    if (s.length <= 12) return s;
    return `${s.slice(0, 8)}...${s.slice(-4)}`;
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
                  value={tokenId}
                  onChange={(e) => setTokenId(e.target.value)}
                  placeholder="Nhập NFT ID..."
                  className="w-full h-12 pl-11 pr-40 rounded-full border border-gray-200 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#48cae4] transition"
                  onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                />

                <button
                  onClick={handleTrack}
                  disabled={isSearching}
                  className="absolute right-1 top-1 bottom-1 px-6 rounded-full bg-secondary hover:bg-primary !text-white font-medium transition disabled:opacity-50"
                >
                  {isSearching ? (
                    "Đang tra cứu..."
                  ) : (
                    <span className="!text-white">Tìm Kiếm</span>
                  )}
                </button>
              </div>
              {error && (
                <div className="mt-6 bg-white rounded-2xl border border-card-primary shadow-sm p-10 text-center">
                  <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-3xl">
                    ❌
                  </div>
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
                      setTrackingData(null);
                      setTokenId("");
                    }}
                    className="px-6 py-2.5 rounded-full bg-secondary hover:bg-primary !text-white font-medium transition"
                  >
                    <span className="!text-white">Thử lại</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {trackingData && (
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
                      {trackingData?.nft?.tokenId
                        ? short(String(trackingData.nft.tokenId))
                        : tokenId
                        ? short(String(tokenId))
                        : "N/A"}
                    </div>
                    <div className="text-slate-500 mt-4">Nhà sản xuất</div>
                    <div className="font-medium">
                      {trackingData?.manufacturerInvoice?.fromManufacturer
                        ?.fullName ||
                        trackingData?.nft?.proofOfProduction?.manufacturer
                          ?.fullName ||
                        trackingData?.nft?.owner?.fullName ||
                        "N/A"}
                    </div>
                    <div className="text-slate-500 mt-4">Ngày sản xuất</div>
                    <div className="font-medium">
                      {formatDate(
                        trackingData?.nft?.mfgDate ||
                          trackingData?.nft?.proofOfProduction?.mfgDate
                      )}
                    </div>
                    <div className="text-slate-500 mt-4">Số lô</div>
                    <div className="font-medium">
                      {trackingData?.nft?.batchNumber ||
                        trackingData?.nft?.proofOfProduction?.batchNumber ||
                        "N/A"}
                    </div>
                    <div className="text-slate-500 mt-4">Số serial</div>
                    <div className="font-mono">
                      {trackingData?.nft?.serialNumber || "N/A"}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-slate-500">Tên thuốc</div>
                    <div className="font-medium">
                      {trackingData?.nft?.drug?.tradeName ||
                        trackingData?.nft?.drug?.genericName ||
                        "N/A"}
                    </div>
                    <div className="text-slate-500 mt-4">Mã ATC</div>
                    <div className="font-mono">
                      {trackingData?.nft?.drug?.atcCode || "N/A"}
                    </div>
                    <div className="text-slate-500 mt-4">Nhà phân phối</div>
                    <div className="font-medium">
                      {(() => {
                        // Kiểm tra commercialInvoice trước (hóa đơn thương mại)
                        const commercialDistributor =
                          trackingData?.commercialInvoice?.fromDistributor;
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
                          trackingData?.manufacturerInvoice?.toDistributor;
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
                      {trackingData?.commercialInvoice?.toPharmacy?.fullName ||
                        "N/A"}
                    </div>
                    <div className="text-slate-500 mt-4">Hạn sử dụng</div>
                    <div className="font-medium">
                      {formatDate(
                        trackingData?.nft?.expDate ||
                          trackingData?.nft?.proofOfProduction?.expDate
                      )}
                    </div>
                    <div className="text-slate-500 mt-4">
                      Chủ sở hữu hiện tại
                    </div>
                    <div className="font-medium">
                      {trackingData?.nft?.owner?.fullName ||
                        trackingData?.nft?.owner?.username ||
                        "N/A"}
                    </div>
                  </div>
                </div>

                {/* Thông tin bổ sung */}
                {(trackingData?.nft?.chainTxHash ||
                  trackingData?.nft?.ipfsUrl ||
                  trackingData?.nft?.contractAddress) && (
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">
                      Thông tin Blockchain
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {trackingData?.nft?.contractAddress && (
                        <div>
                          <div className="text-slate-500">Contract Address</div>
                          <div className="font-mono text-slate-700 break-all">
                            {trackingData.nft.contractAddress}
                          </div>
                        </div>
                      )}
                      {trackingData?.nft?.chainTxHash && (
                        <div>
                          <div className="text-slate-500">Transaction Hash</div>
                          <div className="font-mono text-slate-700 break-all">
                            {short(trackingData.nft.chainTxHash)}
                          </div>
                        </div>
                      )}
                      {trackingData?.nft?.ipfsUrl && (
                        <div className="md:col-span-2">
                          <div className="text-slate-500">IPFS URL</div>
                          <a
                            href={trackingData.nft.ipfsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="font-mono text-cyan-600 hover:text-cyan-700 break-all"
                          >
                            {trackingData.nft.ipfsUrl}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Lịch sử blockchain */}
                {trackingData?.blockchainHistory &&
                  trackingData.blockchainHistory.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-slate-200">
                      <h3 className="text-sm font-semibold text-slate-700 mb-3">
                        Lịch sử giao dịch (
                        {trackingData.blockchainHistory.length})
                      </h3>
                      <div className="space-y-2">
                        {trackingData.blockchainHistory.map((tx, idx) => (
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
                {(trackingData?.manufacturerInvoice ||
                  trackingData?.commercialInvoice) && (
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">
                      Thông tin Hóa đơn
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {trackingData?.manufacturerInvoice && (
                        <div className="bg-blue-50 rounded-lg p-3">
                          <div className="font-semibold text-blue-800 mb-2">
                            Hóa đơn từ NSX
                          </div>
                          <div>
                            <span className="text-slate-600">Số HD:</span>
                            <span className="font-mono ml-1">
                              {trackingData.manufacturerInvoice.invoiceNumber}
                            </span>
                          </div>
                          {trackingData.manufacturerInvoice.invoiceDate && (
                            <div className="mt-1">
                              <span className="text-slate-600">Ngày:</span>
                              <span className="ml-1">
                                {formatDate(
                                  trackingData.manufacturerInvoice.invoiceDate
                                )}
                              </span>
                            </div>
                          )}
                          <div className="mt-1">
                            <span className="text-slate-600">Trạng thái:</span>
                            <span className="ml-1 capitalize">
                              {trackingData.manufacturerInvoice.status}
                            </span>
                          </div>
                        </div>
                      )}
                      {trackingData?.commercialInvoice && (
                        <div className="bg-green-50 rounded-lg p-3">
                          <div className="font-semibold text-green-800 mb-2">
                            Hóa đơn thương mại
                          </div>
                          <div>
                            <span className="text-slate-600">Số HD:</span>
                            <span className="font-mono ml-1">
                              {trackingData.commercialInvoice.invoiceNumber}
                            </span>
                          </div>
                          {trackingData.commercialInvoice.invoiceDate && (
                            <div className="mt-1">
                              <span className="text-slate-600">Ngày:</span>
                              <span className="ml-1">
                                {formatDate(
                                  trackingData.commercialInvoice.invoiceDate
                                )}
                              </span>
                            </div>
                          )}
                          <div className="mt-1">
                            <span className="text-slate-600">Trạng thái:</span>
                            <span className="ml-1 capitalize">
                              {trackingData.commercialInvoice.status}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-6 flex justify-end gap-3">
                  {trackingData?.nft?.chainTxHash && (
                    <a
                      href={`https://zeroscan.org/tx/${trackingData.nft.chainTxHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-6 py-2.5 rounded-full bg-[#3db6d9] hover:bg-[#2fa2c5] !text-white font-medium transition"
                    >
                      Xem trên ZeroScan
                    </a>
                  )}
                  {trackingData?.nft?.ipfsUrl && (
                    <a
                      href={trackingData.nft.ipfsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-6 py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 !text-white font-medium transition"
                    >
                      Xem trên IPFS
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
