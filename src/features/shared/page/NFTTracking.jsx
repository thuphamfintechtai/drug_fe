import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../utils/api";
import Navbar from "../components/Navbar";
import { toast } from "sonner";
import manufacturingIcon from "../../../assets/manufacturing.png";
import packageIcon from "../../../assets/get-Package.png";

// Scroll-animated timeline line
function TimelineLine({ containerRef }) {
  const lineRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const container = containerRef?.current;
    if (!container) {
      return;
    }

    const updateScrollProgress = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const totalScroll = scrollHeight - clientHeight;
      const progress = totalScroll > 0 ? scrollTop / totalScroll : 0;
      setScrollProgress(progress);
    };

    container.addEventListener("scroll", updateScrollProgress);
    updateScrollProgress(); // Initial calculation

    return () => {
      container.removeEventListener("scroll", updateScrollProgress);
    };
  }, [containerRef]);

  return (
    <div className="absolute left-6 top-8 bottom-8 w-1 overflow-hidden">
      <motion.div
        ref={lineRef}
        className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary via-secondary to-third rounded-full shadow-lg"
        style={{
          scaleY: scrollProgress,
          transformOrigin: "top",
        }}
      >
        {/* Shimmer */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-transparent"
          animate={{ y: ["-100%", "100%"] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
        />
        {/* Glow */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-third/20 via-transparent to-primary/20"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </div>
  );
}

export default function PublicNFTTracking() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tokenId, setTokenId] = useState(searchParams.get("tokenId") || "");
  const [journey, setJourney] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const timelineContainerRef = useRef(null);

  useEffect(() => {
    if (tokenId) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async () => {
    if (!tokenId.trim()) {
      toast.error("Vui lòng nhập NFT ID");
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const response = await api.get(`/public/Tracking/${tokenId.trim()}`);
      if (response.data.success) {
        console.log("NFT Tracking Response:", response.data.data);
        console.log("Current Owner:", response.data.data?.nft?.currentOwner);
        setJourney(response.data.data);
        setSearchParams({ tokenId: tokenId.trim() });
        toast.success("Tra cứu thành công!");
      } else {
        setJourney(null);
        toast.error(response.data.message || "Không tìm thấy NFT này");
      }
    } catch (error) {
      setJourney(null);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể tra cứu NFT. Vui lòng kiểm tra lại Token ID.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.96 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const getStageIcon = (stage) => {
    const stageLower = stage?.toLowerCase() || "";

    // Đã nhận hàng - dùng ảnh
    if (
      stageLower.includes("received") ||
      stageLower.includes("đã nhận") ||
      stageLower.includes("pharmacy_received") ||
      stageLower.includes("distributor_received")
    ) {
      return (
        <img
          src={packageIcon}
          alt="Đã nhận"
          className="w-7 h-7 object-contain"
        />
      );
    }

    // Nhà phân phối - dùng emoji
    if (
      stageLower.includes("distributor") ||
      stageLower.includes("distribution") ||
      stageLower.includes("distributed") ||
      stageLower === "transfer_to_distributor"
    ) {
      return <span className="text-3xl">🏭</span>;
    }

    // Nhà thuốc - dùng emoji
    if (
      stageLower.includes("pharmacy") ||
      stageLower.includes("retail") ||
      stageLower === "transfer_to_pharmacy"
    ) {
      return <span className="text-3xl">🏥</span>;
    }

    // Sản xuất - dùng ảnh
    if (
      stageLower.includes("manufactured") ||
      stageLower.includes("production") ||
      stageLower.includes("produced")
    ) {
      return (
        <img
          src={manufacturingIcon}
          alt="Sản xuất"
          className="w-7 h-7 object-contain"
        />
      );
    }

    // Mặc định - dùng ảnh đã nhận
    return (
      <img src={packageIcon} alt="Đã nhận" className="w-7 h-7 object-contain" />
    );
  };

  const getStageColor = (stage) => {
    switch (stage?.toLowerCase()) {
      case "manufactured":
      case "production":
        return "from-primary to-secondary";
      case "distributed":
      case "distribution":
        return "from-secondary to-third";
      case "pharmacy":
      case "retail":
        return "from-third to-secondary";
      default:
        return "from-primary to-third";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 mt-16">
        {/* Hero */}
        <motion.section
          className="relative overflow-hidden rounded-3xl mb-8 sm:mb-12 bg-gradient-to-r from-primary to-secondary shadow-2xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Subtle pattern */}
          <div className="absolute inset-0 opacity-30">
            <div className="w-full h-full bg-[radial-gradient(circle_at_0_0,white_0,transparent_55%),radial-gradient(circle_at_100%_100%,white_0,transparent_55%)]" />
          </div>

          {/* Floating blobs */}
          <motion.div
            className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"
            animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-10 left-10 w-40 h-40 bg-third/30 rounded-full blur-3xl"
            animate={{ y: [0, 20, 0], scale: [1, 1.15, 1] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          />

          <div className="relative px-6 sm:px-10 py-12 sm:py-16 lg:py-20 text-white">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur border border-white/30 mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              >
                <path
                  fillRule="evenodd"
                  d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </motion.svg>
              <span className="text-sm font-medium">
                Xác thực chuỗi cung ứng bằng blockchain & NFT
              </span>
            </motion.div>

            <motion.h1
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 tracking-tight"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              Tra cứu hành trình thuốc
            </motion.h1>
            <motion.p
              className="text-base sm:text-lg lg:text-xl max-w-2xl text-white/85"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              Nhập NFT Token ID để xác minh nguồn gốc, lô sản xuất và toàn bộ
              lịch sử phân phối của thuốc trong hệ thống.
            </motion.p>
          </div>
        </motion.section>

        {/* Search Box */}
        <motion.div
          className="mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="relative bg-white rounded-2xl shadow-xl border-2 border-slate-200 p-6 sm:p-8 backdrop-blur">
            {/* Soft moving gradient */}
            <motion.div />

            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <motion.svg
                      className="w-5 h-5 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 3, -3, 0],
                      }}
                      transition={{
                        duration: 2.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                      />
                    </motion.svg>
                  </div>
                  <input
                    value={tokenId}
                    onChange={(e) => setTokenId(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Nhập NFT Token ID..."
                    className="w-full pl-12 pr-4 py-4 border-2 border-slate-300 rounded-xl text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white hover:bg-slate-50 transition-all"
                  />
                </div>
                <motion.button
                  onClick={handleSearch}
                  disabled={loading}
                  whileTap={{ scale: loading ? 1 : 0.96 }}
                  className="relative px-6 sm:px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold shadow-lg hover:shadow-2xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    initial={{ x: "-120%" }}
                    animate={{ x: loading ? "-120%" : "120%" }}
                    transition={{
                      duration: 1.4,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  <span className="relative z-10 flex items-center gap-2">
                    {loading ? (
                      <span className="!text-white flex items-center">
                        <svg
                          className="animate-spin h-5 w-5"
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
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Đang tìm...
                      </span>
                    ) : (
                      <span className="!text-white flex items-center">
                        <svg
                          className="w-5 h-5 group-hover:scale-110 transition-transform"
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
                        Tra cứu
                      </span>
                    )}
                  </span>
                </motion.button>
              </div>

              <motion.div
                className="mt-4 flex items-start gap-2 text-sm text-primary bg-primary/10 rounded-lg p-3 border border-primary/30"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <svg
                  className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>
                  <strong className="text-primary font-semibold">Mẹo:</strong>{" "}
                  NFT ID thường được in trên bao bì thuốc hoặc trong hóa đơn mua
                  hàng.
                </span>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-lg"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-slate-200 rounded-full" />
                  <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary rounded-full border-t-transparent animate-spin" />
                </div>
                <div>
                  <p className="text-xl font-semibold text-slate-800 mb-1">
                    Đang tra cứu hành trình
                  </p>
                  <p className="text-sm text-slate-500">
                    Vui lòng chờ trong giây lát...
                  </p>
                </div>
              </div>
            </motion.div>
          ) : !searched ? (
            <motion.div
              key="empty"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-3xl border-2 border-slate-200 p-12 sm:p-16 text-center shadow-lg"
            >
              <motion.div
                variants={itemVariants}
                className="flex justify-center mb-6"
              >
                <div className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl shadow-md">
                  <svg
                    className="w-16 h-16 sm:w-20 sm:h-20 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.6}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </motion.div>
              <motion.h3
                variants={itemVariants}
                className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3"
              >
                Bắt đầu tra cứu
              </motion.h3>
              <motion.p
                variants={itemVariants}
                className="text-slate-600 max-w-lg mx-auto text-base sm:text-lg"
              >
                Nhập NFT Token ID để xem toàn bộ hành trình thuốc từ nhà sản
                xuất đến nhà thuốc và người dùng cuối.
              </motion.p>
            </motion.div>
          ) : !journey ? (
            <motion.div
              key="not-found"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-3xl border-2 border-red-200 p-12 sm:p-16 text-center shadow-lg"
            >
              <div className="flex justify-center mb-6">
                <div className="p-6 bg-red-50 rounded-2xl">
                  <svg
                    className="w-16 h-16 sm:w-20 sm:h-20 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.6}
                      d="M12 9v2m0 4h.01M6.938 19h10.124a1.5 1.5 0 001.341-2.185l-5.062-9.842a1.5 1.5 0 00-2.682 0L5.597 16.815A1.5 1.5 0 006.938 19z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-red-600 mb-3">
                Không tìm thấy NFT
              </h3>
              <p className="text-slate-600 max-w-md mx-auto text-base sm:text-lg">
                Vui lòng kiểm tra lại Token ID hoặc NFT này chưa được tạo trong
                hệ thống.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0 }}
              className="space-y-6 sm:space-y-8"
            >
              {/* Header summary */}
              <motion.div
                variants={itemVariants}
                className="bg-white rounded-3xl border-2 border-slate-200 shadow-xl overflow-hidden"
              >
                <div className="relative bg-gradient-to-r from-primary to-secondary px-6 sm:px-8 py-6 text-white">
                  <div className="relative z-10 space-y-3">
                    <h2 className="text-2xl sm:text-3xl font-bold">
                      Quy trình phân phối —{" "}
                      {journey.nft?.drug?.tradeName ||
                        journey.nft?.drug?.genericName ||
                        "N/A"}
                    </h2>
                    <div className="flex flex-wrap items-center gap-4 text-sm sm:text-base">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Batch:</span>
                        <span className="font-mono">
                          {journey.nft?.batchNumber || "N/A"}
                        </span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Serial:</span>
                        <span className="font-mono">
                          {journey.nft?.serialNumber || "N/A"}
                        </span>
                      </div>
                      {journey.nft?.status && (
                        <>
                          <span>•</span>
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 border border-emerald-400/60">
                            {journey.nft.status}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-6 text-sm text-white/90">
                      {journey.nft?.mfgDate && (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Sản xuất:</span>
                          <span>
                            {new Date(journey.nft.mfgDate).toLocaleString(
                              "vi-VN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              }
                            )}
                          </span>
                        </div>
                      )}
                      {journey.nft?.expDate && (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">HSD:</span>
                          <span>
                            {new Date(journey.nft.expDate).toLocaleString(
                              "vi-VN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              }
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column */}
                <div className="lg:col-span-1 space-y-6">
                  {/* NFT basic info */}
                  <motion.div
                    variants={itemVariants}
                    className="bg-white rounded-3xl border-2 border-slate-200 shadow-xl overflow-hidden"
                  >
                    <div className="bg-gradient-to-r from-primary to-secondary px-6 sm:px-8 py-4 text-white flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <svg
                          className="w-6 h-6"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold">Thông tin NFT</h3>
                    </div>
                    <div className="p-6">
                      <div className="space-y-0 divide-y divide-slate-200">
                        <div className="flex flex-col sm:flex-row sm:items-center py-4 first:pt-0">
                          <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-40 shrink-0 mb-1 sm:mb-0">
                            Token ID
                          </div>
                          <div className="text-base font-semibold text-slate-800 font-mono flex-1">
                            #{journey.nft?.tokenId || tokenId}
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center py-4">
                          <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-40 shrink-0 mb-1 sm:mb-0">
                            Số Serial
                          </div>
                          <div className="text-base font-semibold text-slate-800 flex-1">
                            {journey.nft?.serialNumber || "N/A"}
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center py-4">
                          <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-40 shrink-0 mb-1 sm:mb-0">
                            Tên thuốc
                          </div>
                          <div className="text-base font-semibold text-slate-800 flex-1">
                            {journey.nft?.drug?.tradeName ||
                              journey.nft?.drug?.genericName ||
                              "N/A"}
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center py-4">
                          <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-40 shrink-0 mb-1 sm:mb-0">
                            Số lô
                          </div>
                          <div className="text-base font-semibold text-slate-800 flex-1">
                            {journey.nft?.batchNumber || "N/A"}
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center py-4 last:pb-0">
                          <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-40 shrink-0 mb-1 sm:mb-0">
                            Chủ sở hữu hiện tại
                          </div>
                          <div className="text-base font-semibold text-slate-800 flex-1 truncate">
                            {(() => {
                              const owner = journey.nft?.currentOwner;
                              if (!owner) {
                                return "N/A";
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
                  </motion.div>

                  {/* Supply chain */}
                  {journey.supplyChain && (
                    <motion.div
                      variants={itemVariants}
                      className="bg-white rounded-3xl border-2 border-slate-200 shadow-xl overflow-hidden"
                    >
                      <div className="bg-gradient-to-r from-primary to-secondary px-6 sm:px-8 py-4 text-white flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                            />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold">
                          Chuỗi cung ứng
                        </h3>
                      </div>
                      <div className="p-6 space-y-4 text-sm">
                        {journey.supplyChain.manufacturer && (
                          <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20">
                            <div className="p-2 bg-primary text-white rounded-lg">
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
                                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                />
                              </svg>
                            </div>
                            <div>
                              <div className="font-semibold text-slate-800">
                                {journey.supplyChain.manufacturer.name}
                              </div>
                              <div className="text-slate-500">
                                {journey.supplyChain.manufacturer.email}
                              </div>
                            </div>
                          </div>
                        )}
                        {journey.supplyChain.distributor && (
                          <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20">
                            <div className="p-2 bg-secondary text-white rounded-lg">
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
                            </div>
                            <div>
                              <div className="font-semibold text-slate-800">
                                {journey.supplyChain.distributor.name}
                              </div>
                              <div className="text-slate-500">
                                {journey.supplyChain.distributor.email}
                              </div>
                            </div>
                          </div>
                        )}
                        {journey.supplyChain.pharmacy && (
                          <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200">
                            <div className="p-2 bg-emerald-500 text-white rounded-lg">
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
                                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                              </svg>
                            </div>
                            <div>
                              <div className="font-semibold text-slate-800">
                                {journey.supplyChain.pharmacy.name}
                              </div>
                              <div className="text-slate-500">
                                {journey.supplyChain.pharmacy.email}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Blockchain history */}
                  {journey.blockchainHistory &&
                    Array.isArray(journey.blockchainHistory) &&
                    journey.blockchainHistory.length > 0 && (
                      <motion.div
                        variants={itemVariants}
                        className="bg-white rounded-3xl border-2 border-slate-200 shadow-xl overflow-hidden"
                      >
                        <div className="bg-gradient-to-r from-primary to-secondary px-6 sm:px-8 py-4 text-white flex items-center gap-3">
                          <div className="p-2 bg-white/20 rounded-lg">
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                              />
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold">
                            Lịch sử blockchain
                          </h3>
                        </div>
                        <div className="p-6 space-y-4 text-sm border border-slate-200">
                          {journey.blockchainHistory.map((tx, idx) => (
                            <div
                              key={idx}
                              className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-slate-200"
                            >
                              <div className="font-semibold text-primary mb-2">
                                Giao dịch #{idx + 1}
                              </div>
                              <div className="space-y-2 text-xs">
                                <div>
                                  <span className="text-slate-500">From:</span>
                                  <div className="font-mono break-all text-slate-800">
                                    {tx.fromUserAddress}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-slate-500">To:</span>
                                  <div className="font-mono break-all text-slate-800">
                                    {tx.toUserAddress}
                                  </div>
                                </div>
                                {tx.fromUserType && (
                                  <div>
                                    <span className="text-slate-500">
                                      From Type:
                                    </span>
                                    <div className="font-mono break-all text-slate-800">
                                      {tx.fromUserType}
                                    </div>
                                  </div>
                                )}
                                {tx.toUserType && (
                                  <div>
                                    <span className="text-slate-500">
                                      To Type:
                                    </span>
                                    <div className="font-mono break-all text-slate-800">
                                      {tx.toUserType}
                                    </div>
                                  </div>
                                )}
                                {tx.receivedTimestamp && (
                                  <div className="text-slate-600 mt-1">
                                    <span className="font-semibold">
                                      Timestamp:
                                    </span>{" "}
                                    {typeof tx.receivedTimestamp === "number"
                                      ? new Date(
                                          tx.receivedTimestamp * 1000
                                        ).toLocaleString("vi-VN")
                                      : tx.receivedTimestamp}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                </div>

                {/* Right column: timeline */}
                <div className="lg:col-span-2">
                  <motion.div
                    variants={itemVariants}
                    className="bg-white rounded-3xl border-2 border-slate-200 shadow-xl overflow-hidden"
                  >
                    <div className="bg-gradient-to-r from-primary to-secondary px-6 sm:px-8 py-4 text-white flex items-center gap-3 relative overflow-hidden">
                      <motion.div
                        className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_20%_50%,white,transparent_60%),radial-gradient(circle_at_80%_50%,white,transparent_60%)]"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.2, 0.35, 0.2],
                        }}
                        transition={{
                          duration: 5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                      <div className="relative z-10 p-2 bg-white/20 rounded-lg">
                        <motion.svg
                          className="w-6 h-6"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          animate={{ rotate: [0, 360] }}
                          transition={{
                            duration: 18,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                            clipRule="evenodd"
                          />
                        </motion.svg>
                      </div>
                      <div className="relative z-10">
                        <h3 className="text-lg font-semibold">
                          Hành trình phân phối
                        </h3>
                        <p className="text-sm text-white/85">
                          Các bước chuyển giao, xác nhận và ghi nhận trên
                          blockchain.
                        </p>
                      </div>
                    </div>

                    <div
                      className="p-6 sm:p-8 max-h-[125vh] overflow-y-auto hide-scrollbar relative"
                      ref={timelineContainerRef}
                    >
                      {journey.journey &&
                      Array.isArray(journey.journey) &&
                      journey.journey.length > 0 ? (
                        <div className="relative">
                          <TimelineLine containerRef={timelineContainerRef} />
                          <div className="space-y-6">
                            {journey.journey.map((step, idx) => (
                              <motion.div
                                key={idx}
                                className="relative"
                                initial={{ opacity: 0, x: -18 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                  delay: idx * 0.12,
                                  duration: 0.45,
                                }}
                              >
                                {/* Dot */}
                                <div className="absolute left-0 w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-xl z-10 border-2 border-se">
                                  <div className="relative z-10">
                                    {getStageIcon(step.stage)}
                                  </div>
                                </div>

                                {/* Card */}
                                <motion.div className="ml-20 bg-white rounded-2xl border-2 border-slate-200 p-6 hover:shadow-2xl transition-all duration-300 group">
                                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                                    <div className="flex-1">
                                      <h4 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-primary transition-colors">
                                        {step.description ||
                                          step.stage ||
                                          "N/A"}
                                      </h4>
                                      <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <svg
                                          className="w-4 h-4"
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                        {step.date
                                          ? new Date(step.date).toLocaleString(
                                              "vi-VN"
                                            )
                                          : "N/A"}
                                      </div>
                                    </div>
                                    {step.stage && (
                                      <span
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r ${getStageColor(
                                          step.stage
                                        )} text-white shadow-md capitalize`}
                                      >
                                        {step.stage}
                                      </span>
                                    )}
                                  </div>

                                  <div className="space-y-3 text-sm">
                                    {step.from && (
                                      <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/30">
                                        <div className="p-2 bg-primary text-white rounded-lg flex-shrink-0">
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
                                              d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                                            />
                                          </svg>
                                        </div>
                                        <div>
                                          <div className="text-xs text-primary uppercase tracking-wide mb-1">
                                            Từ
                                          </div>
                                          <div className="font-semibold text-slate-800">
                                            {typeof step.from === "object" &&
                                            step.from !== null
                                              ? step.from.fullName ||
                                                step.from.username ||
                                                step.from.name ||
                                                JSON.stringify(step.from)
                                              : step.from}
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {step.to && (
                                      <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20">
                                        <div className="p-2 bg-secondary text-white rounded-lg flex-shrink-0">
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
                                              d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                          </svg>
                                        </div>
                                        <div>
                                          <div className="text-xs text-primary uppercase tracking-wide mb-1">
                                            Đến
                                          </div>
                                          <div className="font-semibold text-slate-800">
                                            {typeof step.to === "object" &&
                                            step.to !== null
                                              ? step.to.fullName ||
                                                step.to.username ||
                                                step.to.name ||
                                                JSON.stringify(step.to)
                                              : step.to}
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {(step.details?.quantity ||
                                      step.quantity) && (
                                      <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/30">
                                        <div className="p-2 bg-secondary text-white rounded-lg flex-shrink-0">
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
                                              d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25A1.125 1.125 0 0021.75 6v-1.5A1.125 1.125 0 0020.625 3H3.375A1.125 1.125 0 002.25 4.5V6c0 .621.504 1.125 1.125 1.125z"
                                            />
                                          </svg>
                                        </div>
                                        <div>
                                          <div className="text-xs text-primary uppercase tracking-wide mb-1">
                                            Số lượng
                                          </div>
                                          <div className="font-bold text-slate-800 text-lg">
                                            {step.details?.quantity ||
                                              step.quantity}
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {step.manufacturer && (
                                      <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20">
                                        <div className="p-2 bg-primary text-white rounded-lg flex-shrink-0">
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
                                              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25M8.25 15h7.5m-7.5 3H12M10.5 2.25H5.625A1.125 1.125 0 004.5 3.375v17.25c0 .621.504 1.125 1.125 1.125h12.75A1.125 1.125 0 0019.5 20.625V11.25a9 9 0 00-9-9z"
                                            />
                                          </svg>
                                        </div>
                                        <div>
                                          <div className="text-xs text-primary uppercase tracking-wide mb-1">
                                            Nhà sản xuất
                                          </div>
                                          <div className="font-semibold text-slate-800">
                                            {typeof step.manufacturer ===
                                              "object" &&
                                            step.manufacturer !== null
                                              ? step.manufacturer.fullName ||
                                                step.manufacturer.username ||
                                                step.manufacturer.name ||
                                                JSON.stringify(
                                                  step.manufacturer
                                                )
                                              : step.manufacturer}
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {step.distributor && (
                                      <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20">
                                        <div className="p-2 bg-secondary text-white rounded-lg flex-shrink-0">
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
                                        </div>
                                        <div>
                                          <div className="text-xs text-primary uppercase tracking-wide mb-1">
                                            Nhà phân phối
                                          </div>
                                          <div className="font-semibold text-slate-800">
                                            {typeof step.distributor ===
                                              "object" &&
                                            step.distributor !== null
                                              ? step.distributor.fullName ||
                                                step.distributor.username ||
                                                step.distributor.name ||
                                                JSON.stringify(step.distributor)
                                              : step.distributor}
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {step.pharmacy && (
                                      <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20">
                                        <div className="p-2 bg-third text-white rounded-lg flex-shrink-0">
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
                                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                            />
                                          </svg>
                                        </div>
                                        <div>
                                          <div className="text-xs text-primary uppercase tracking-wide mb-1">
                                            Nhà thuốc
                                          </div>
                                          <div className="font-semibold text-slate-800">
                                            {typeof step.pharmacy ===
                                              "object" && step.pharmacy !== null
                                              ? step.pharmacy.fullName ||
                                                step.pharmacy.username ||
                                                step.pharmacy.name ||
                                                JSON.stringify(step.pharmacy)
                                              : step.pharmacy}
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {step.details?.receivedQuantity !==
                                      undefined && (
                                      <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/30">
                                        <div className="p-2 bg-secondary text-white rounded-lg flex-shrink-0">
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
                                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                          </svg>
                                        </div>
                                        <div>
                                          <div className="text-xs text-primary uppercase tracking-wide mb-1">
                                            Số lượng đã nhận
                                          </div>
                                          <div className="font-bold text-slate-800 text-lg">
                                            {step.details.receivedQuantity}
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {step.transactionHash && (
                                      <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                                        <div className="p-2 bg-slate-700 text-white rounded-lg flex-shrink-0">
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
                                              d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
                                            />
                                          </svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="text-xs text-slate-500 mb-1">
                                            Transaction Hash
                                          </div>
                                          <div className="font-mono text-xs text-slate-700 truncate">
                                            {step.transactionHash}
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {step.details?.status && (
                                      <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200">
                                        <div className="p-2 bg-emerald-500 text-white rounded-lg flex-shrink-0">
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
                                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                          </svg>
                                        </div>
                                        <div>
                                          <div className="text-xs text-emerald-600 mb-1">
                                            Trạng thái chi tiết
                                          </div>
                                          <div className="font-semibold text-slate-800 capitalize">
                                            {step.details.status}
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {step.supplyChainCompleted !==
                                      undefined && (
                                      <div className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                                        <div
                                          className={`p-1.5 rounded-full ${
                                            step.supplyChainCompleted
                                              ? "bg-green-500"
                                              : "bg-yellow-500"
                                          }`}
                                        >
                                          <svg
                                            className="w-4 h-4 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            {step.supplyChainCompleted ? (
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                              />
                                            ) : (
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                              />
                                            )}
                                          </svg>
                                        </div>
                                        <div className="text-sm font-semibold text-slate-800">
                                          {step.supplyChainCompleted
                                            ? "Chuỗi cung ứng đã hoàn tất"
                                            : "Chuỗi cung ứng chưa hoàn tất"}
                                        </div>
                                      </div>
                                    )}

                                    {step.notes && (
                                      <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/30">
                                        <div className="flex items-start gap-3">
                                          <div className="p-2 bg-gradient-to-br from-primary to-secondary text-white rounded-lg">
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
                                                d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                                              />
                                            </svg>
                                          </div>
                                          <p className="text-sm text-primary leading-relaxed">
                                            {step.notes}
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-16">
                          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                            <svg
                              className="w-8 h-8 text-slate-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                              />
                            </svg>
                          </div>
                          <p className="text-lg text-slate-500">
                            Chưa có lịch sử phân phối.
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Detailed drug info */}
              {journey.nft?.drug && (
                <motion.div
                  variants={itemVariants}
                  className="bg-white rounded-3xl border-2 border-slate-200 shadow-xl overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-primary to-secondary px-6 sm:px-8 py-4 text-white flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold">
                      Thông tin chi tiết thuốc
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0 divide-y divide-slate-200">
                      {journey.nft.drug.genericName && (
                        <div className="flex flex-col sm:flex-row sm:items-center py-4 first:pt-0 md:first:pt-4 md:pr-0 gap-4">
                          <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-40 shrink-0 mb-1 sm:mb-0">
                            Tên hoạt chất
                          </div>
                          <div className="text-base font-semibold text-slate-800 flex-1">
                            {journey.nft.drug.genericName}
                          </div>
                        </div>
                      )}
                      {journey.nft.drug.atcCode && (
                        <div className="flex flex-col sm:flex-row sm:items-center py-4 md:pl-0 gap-4">
                          <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-40 shrink-0 mb-1 sm:mb-0">
                            Mã ATC
                          </div>
                          <div className="text-base font-semibold text-slate-800 font-mono flex-1">
                            {journey.nft.drug.atcCode}
                          </div>
                        </div>
                      )}
                      {journey.nft.drug.dosageForm && (
                        <div className="flex flex-col sm:flex-row sm:items-center py-4 md:pr-0 gap-4">
                          <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-40 shrink-0 mb-1 sm:mb-0">
                            Dạng bào chế
                          </div>
                          <div className="text-base font-semibold text-slate-800 flex-1">
                            {journey.nft.drug.dosageForm}
                          </div>
                        </div>
                      )}
                      {journey.nft.drug.strength && (
                        <div className="flex flex-col sm:flex-row sm:items-center py-4 md:pl-0 gap-4">
                          <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-40 shrink-0 mb-1 sm:mb-0">
                            Hàm lượng
                          </div>
                          <div className="text-base font-semibold text-slate-800 flex-1">
                            {journey.nft.drug.strength}
                          </div>
                        </div>
                      )}
                      {journey.nft.drug.packaging && (
                        <div className="flex flex-col sm:flex-row sm:items-center py-4 md:pr-0 gap-4">
                          <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-40 shrink-0 mb-1 sm:mb-0">
                            Quy cách đóng gói
                          </div>
                          <div className="text-base font-semibold text-slate-800 flex-1">
                            {journey.nft.drug.packaging}
                          </div>
                        </div>
                      )}
                      {journey.nft.mfgDate && (
                        <div className="flex flex-col sm:flex-row sm:items-center py-4 md:pl-0 gap-4">
                          <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-40 shrink-0 mb-1 sm:mb-0">
                            Ngày sản xuất
                          </div>
                          <div className="text-base font-semibold text-slate-800 flex-1">
                            {new Date(journey.nft.mfgDate).toLocaleDateString(
                              "vi-VN"
                            )}
                          </div>
                        </div>
                      )}
                      {journey.nft.expDate && (
                        <div className="flex flex-col sm:flex-row sm:items-center py-4 md:pr-0 gap-4">
                          <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-40 shrink-0 mb-1 sm:mb-0">
                            Hạn sử dụng
                          </div>
                          <div className="text-base font-semibold text-slate-800 flex-1">
                            {new Date(journey.nft.expDate).toLocaleDateString(
                              "vi-VN"
                            )}
                          </div>
                        </div>
                      )}
                      {journey.nft.drug.manufacturer && (
                        <div className="flex flex-col sm:flex-row sm:items-center py-4 last:pb-0 md:pl-0 md:col-span-2 gap-4">
                          <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-40 shrink-0 mb-1 sm:mb-0">
                            Nhà sản xuất
                          </div>
                          <div className="text-base font-semibold text-slate-800 flex-1">
                            {typeof journey.nft.drug.manufacturer ===
                              "object" && journey.nft.drug.manufacturer !== null
                              ? journey.nft.drug.manufacturer.name ||
                                journey.nft.drug.manufacturer.fullName ||
                                JSON.stringify(journey.nft.drug.manufacturer)
                              : journey.nft.drug.manufacturer}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back home */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 text-slate-600 hover:text-slate-900 font-medium rounded-xl hover:bg-slate-100 transition-all"
          >
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Về trang chủ
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
