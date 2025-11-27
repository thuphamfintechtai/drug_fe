import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import api from "../../utils/api";
import Navbar from "../components/Navbar";
import { toast } from "sonner";

// Timeline Line Component with Scroll Animation
function TimelineLine({ containerRef }) {
  const lineRef = useRef(null);
  
  // Use scroll progress to animate the line
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.8", "end 0.2"]
  });

  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div className="absolute left-6 top-8 bottom-8 w-1 overflow-hidden">
      <motion.div
        ref={lineRef}
        className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#054f67] via-[#077ca3] to-[#00c0e8] rounded-full shadow-lg"
        style={{ 
          scaleY,
          transformOrigin: "top"
        }}
      >
        {/* Animated shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-transparent"
          animate={{
            y: ["-100%", "100%"],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-[#00c0e8]/20 via-transparent to-[#054f67]/20"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
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
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const getStageIcon = (stage) => {
    switch (stage?.toLowerCase()) {
      case "manufactured":
      case "production":
        return (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
          </svg>
        );
      case "distributed":
      case "distribution":
        return (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6.75m-9.75 0H3.375c-.621 0-1.125-.504-1.125-1.125V8.25c0-.621.504-1.125 1.125-1.125h4.5A1.5 1.5 0 019.5 6h6a1.5 1.5 0 011.5 1.5v9.75c0 .621-.504 1.125-1.125 1.125H15.75m-7.5 0a1.5 1.5 0 003 0m-3 0a1.5 1.5 0 013 0m0 0h.008v.008H8.25V18.75zm6-3h.008v.008H14.25V15.75z" />
          </svg>
        );
      case "pharmacy":
      case "retail":
        return (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        );
      default:
        return (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getStageColor = (stage) => {
    switch (stage?.toLowerCase()) {
      case "manufactured":
      case "production":
        return "from-[#054f67] to-[#077ca3]";
      case "distributed":
      case "distribution":
        return "from-[#077ca3] to-[#00c0e8]";
      case "pharmacy":
      case "retail":
        return "from-[#00c0e8] to-[#077ca3]";
      default:
        return "from-[#054f67] to-[#00c0e8]";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#f0fdfa]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 mt-16">
        {/* Hero Header */}
        <motion.section
          className="relative overflow-hidden rounded-3xl mb-8 sm:mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Background with gradient mesh and animated elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#054f67] via-[#077ca3] to-[#00c0e8]">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzMuMzE0IDAgNi0yLjY4NiA2LTZzLTIuNjg2LTYtNi02LTYgMi42ODYtNiA2IDIuNjg2IDYgNiA2ek0yNCA0NGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNi02IDIuNjg2LTYgNiAyLjY4NiA2IDYgNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
            
            {/* Floating circles animation */}
            <motion.div
              className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"
              animate={{
                y: [0, -20, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute bottom-10 left-10 w-40 h-40 bg-[#00c0e8]/20 rounded-full blur-3xl"
              animate={{
                y: [0, 20, 0],
                scale: [1, 1.15, 1],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
            />
            <motion.div
              className="absolute top-1/2 right-1/4 w-24 h-24 bg-white/5 rounded-full blur-xl"
              animate={{
                x: [0, 30, 0],
                y: [0, -30, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
            />
            
            {/* Animated lines */}
            <motion.div
              className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </div>

          <div className="relative px-6 sm:px-10 py-12 sm:py-16 lg:py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <motion.div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-6"
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <motion.svg 
                  className="w-5 h-5 text-white" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </motion.svg>
                <span className="text-white/90 text-sm font-medium">Hệ thống xác thực blockchain</span>
              </motion.div>
              
              <motion.h1 
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                Tra cứu hành trình thuốc
              </motion.h1>
              <motion.p 
                className="text-white/90 text-base sm:text-lg lg:text-xl max-w-2xl"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                Xác minh nguồn gốc và theo dõi toàn bộ chuỗi cung ứng của thuốc thông qua công nghệ NFT
              </motion.p>
            </motion.div>
          </div>
        </motion.section>

        {/* Search Box */}
        <motion.div
          className="mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <motion.div 
            className="bg-white rounded-2xl shadow-xl border border-cyan-200/60 p-6 sm:p-8 backdrop-blur-sm relative overflow-hidden"
            transition={{ duration: 0.3 }}
          >
            {/* Animated gradient background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-cyan-50/50 via-transparent to-teal-50/50"
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.div 
                  className="relative flex-1"
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <motion.svg 
                      className="w-5 h-5 text-[#077ca3]" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </motion.svg>
                  </div>
                  <input
                    value={tokenId}
                    onChange={(e) => setTokenId(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Nhập NFT Token ID..."
                    className="w-full pl-12 pr-4 py-4 border-2 border-[#077ca3]/30 rounded-xl text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-[#077ca3] focus:border-transparent transition-all duration-200 bg-[#077ca3]/5 hover:bg-white focus:bg-white"
                  />
                </motion.div>
                <motion.button
                  onClick={handleSearch}
                  disabled={loading}
                  whileTap={{ scale: loading ? 1 : 0.95 }}
                  className="relative px-6 sm:px-8 py-4 rounded-xl bg-gradient-to-r from-[#054f67] via-[#077ca3] to-[#00c0e8] text-white font-semibold shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap overflow-hidden group"
                >
                  {/* Shine effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    initial={{ x: "-100%" }}
                    animate={{ x: loading ? "-100%" : "100%" }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  
                  <span className="relative z-10 flex items-center gap-2">
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Đang tìm...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Tra cứu
                      </>
                    )}
                  </span>
                </motion.button>
              </div>
              
              <motion.div 
                className="mt-4 flex items-start gap-2 text-sm text-[#054f67] bg-[#077ca3]/10 rounded-lg p-3 border border-[#077ca3]/20"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <svg className="w-5 h-5 text-[#077ca3] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>
                  <strong className="text-[#054f67]">Mẹo:</strong> NFT ID thường được in trên bao bì thuốc hoặc trong hóa đơn mua hàng
                </span>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-lg"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-slate-200 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-16 h-16 border-4 border-[#0891b2] rounded-full border-t-transparent animate-spin"></div>
                </div>
                <div>
                  <p className="text-xl font-semibold text-slate-800 mb-1">Đang tra cứu hành trình</p>
                  <p className="text-sm text-slate-500">Vui lòng chờ trong giây lát...</p>
                </div>
              </div>
            </motion.div>
          ) : !searched ? (
            <motion.div
              key="empty"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-3xl border border-cyan-200/60 p-12 sm:p-16 text-center shadow-lg"
            >
              <motion.div variants={itemVariants} className="flex justify-center mb-6">
                <div className="p-6 bg-white rounded-2xl shadow-md">
                  <svg className="w-16 h-16 sm:w-20 sm:h-20 text-[#0891b2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </motion.div>
              <motion.h3 variants={itemVariants} className="text-2xl sm:text-3xl font-bold text-cyan-900 mb-3">
                Bắt đầu tra cứu
              </motion.h3>
              <motion.p variants={itemVariants} className="text-cyan-700 max-w-lg mx-auto text-base sm:text-lg">
                Nhập NFT Token ID để xem toàn bộ hành trình thuốc từ nhà sản xuất đến người tiêu dùng
              </motion.p>
            </motion.div>
          ) : !journey ? (
            <motion.div
              key="not-found"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border-2 border-red-200 p-12 sm:p-16 text-center shadow-lg"
            >
              <div className="flex justify-center mb-6">
                <div className="p-6 bg-red-50 rounded-2xl">
                  <svg className="w-16 h-16 sm:w-20 sm:h-20 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-red-600 mb-3">
                Không tìm thấy NFT
              </h3>
              <p className="text-slate-600 max-w-md mx-auto text-base sm:text-lg">
                Vui lòng kiểm tra lại Token ID hoặc NFT này chưa được tạo trong hệ thống
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
              {/* Drug Information Card */}
              <motion.div variants={itemVariants} className="bg-white rounded-3xl border border-cyan-200 shadow-xl overflow-hidden">
                <div className="relative bg-gradient-to-r from-[#054f67] via-[#077ca3] to-[#00c0e8] px-6 sm:px-8 py-6 overflow-hidden">
                  {/* Animated wave pattern */}
                  <motion.div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)',
                    }}
                    animate={{
                      x: [0, 40],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  
                  <div className="relative z-10 flex items-center gap-3">
                    <motion.div 
                      className="p-2 bg-white/20 rounded-lg backdrop-blur-sm"
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                    <motion.h2 
                      className="text-2xl font-bold text-white"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      Thông tin thuốc
                    </motion.h2>
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <motion.div 
                      className="bg-gradient-to-br from-[#077ca3]/10 to-[#00c0e8]/10 rounded-xl p-5 border border-[#077ca3]/30 hover:shadow-lg transition-all cursor-pointer group"
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <div className="text-xs font-semibold text-[#054f67] uppercase tracking-wide mb-2 group-hover:text-[#077ca3] transition-colors">Token ID</div>
                      <div className="text-xl font-bold text-[#054f67] font-mono group-hover:text-[#077ca3] transition-colors">
                        #{journey.nft?.tokenId || tokenId}
                      </div>
                      <motion.div
                        className="mt-2 h-1 bg-gradient-to-r from-[#077ca3] to-[#00c0e8] rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                      />
                    </motion.div>

                    <motion.div 
                      className="bg-gradient-to-br from-[#077ca3]/10 to-[#00c0e8]/10 rounded-xl p-5 border border-[#077ca3]/30 hover:shadow-lg transition-all cursor-pointer group"
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <div className="text-xs font-semibold text-[#054f67] uppercase tracking-wide mb-2 group-hover:text-[#077ca3] transition-colors">Số Serial</div>
                      <div className="text-xl font-bold text-[#054f67] group-hover:text-[#077ca3] transition-colors">
                        {journey.nft?.serialNumber || "N/A"}
                      </div>
                      <motion.div
                        className="mt-2 h-1 bg-gradient-to-r from-[#077ca3] to-[#00c0e8] rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                      />
                    </motion.div>

                    <motion.div 
                      className="bg-gradient-to-br from-[#077ca3]/10 to-[#00c0e8]/10 rounded-xl p-5 border border-[#077ca3]/30 hover:shadow-lg transition-all cursor-pointer group sm:col-span-2 lg:col-span-1"
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <div className="text-xs font-semibold text-[#054f67] uppercase tracking-wide mb-2 group-hover:text-[#077ca3] transition-colors">Tên thuốc</div>
                      <div className="text-xl font-bold text-[#054f67] group-hover:text-[#077ca3] transition-colors">
                        {journey.nft?.drug?.tradeName || journey.nft?.drug?.genericName || "N/A"}
                      </div>
                      <motion.div
                        className="mt-2 h-1 bg-gradient-to-r from-[#077ca3] to-[#00c0e8] rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                      />
                    </motion.div>

                    <motion.div 
                      className="bg-gradient-to-br from-[#077ca3]/10 to-[#00c0e8]/10 rounded-xl p-5 border border-[#077ca3]/30 hover:shadow-lg transition-all cursor-pointer group"
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <div className="text-xs font-semibold text-[#054f67] uppercase tracking-wide mb-2 group-hover:text-[#077ca3] transition-colors">Số lô</div>
                      <div className="text-xl font-bold text-[#054f67] group-hover:text-[#077ca3] transition-colors">
                        {journey.nft?.batchNumber || "N/A"}
                      </div>
                      <motion.div
                        className="mt-2 h-1 bg-gradient-to-r from-[#077ca3] to-[#00c0e8] rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                      />
                    </motion.div>

                    <motion.div 
                      className="bg-gradient-to-br from-[#077ca3]/10 to-[#00c0e8]/10 rounded-xl p-5 border border-[#077ca3]/30 hover:shadow-lg transition-all cursor-pointer group sm:col-span-2"
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <div className="text-xs font-semibold text-[#054f67] uppercase tracking-wide mb-2 group-hover:text-[#077ca3] transition-colors">Chủ sở hữu hiện tại</div>
                      <div className="text-lg font-semibold text-[#054f67] truncate group-hover:text-[#077ca3] transition-colors">
                        {typeof journey.nft?.currentOwner === "object"
                          ? journey.nft.currentOwner.fullName ||
                            journey.nft.currentOwner.username ||
                            journey.nft.currentOwner.name ||
                            "N/A"
                          : journey.nft?.currentOwner || "N/A"}
                      </div>
                      <motion.div
                        className="mt-2 h-1 bg-gradient-to-r from-[#077ca3] to-[#00c0e8] rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                      />
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Journey Timeline */}
              <motion.div variants={itemVariants} className="bg-white rounded-3xl border border-cyan-200 shadow-xl overflow-hidden">
                <div className="relative bg-gradient-to-r from-[#054f67] via-[#077ca3] to-[#00c0e8] px-6 sm:px-8 py-6 overflow-hidden">
                  {/* Animated background patterns */}
                  <motion.div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)',
                    }}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.2, 0.3, 0.2],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  
                  {/* Floating particles */}
                  <motion.div
                    className="absolute top-4 right-20 w-2 h-2 bg-white/40 rounded-full"
                    animate={{
                      y: [0, -20, 0],
                      opacity: [0.4, 0.8, 0.4],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <motion.div
                    className="absolute bottom-6 right-40 w-3 h-3 bg-white/30 rounded-full"
                    animate={{
                      y: [0, 15, 0],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5,
                    }}
                  />
                  
                  <div className="relative z-10 flex items-center gap-3">
                    <motion.div 
                      className="p-2 bg-white/20 rounded-lg backdrop-blur-sm"
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <motion.svg 
                        className="w-6 h-6 text-white" 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                        animate={{ 
                          rotate: [0, 360],
                        }}
                        transition={{
                          duration: 20,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      >
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </motion.svg>
                    </motion.div>
                    <motion.h2 
                      className="text-2xl font-bold text-white"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      Hành trình phân phối
                    </motion.h2>
                  </div>
                  
                  {/* Wave effect at bottom */}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </div>

                <div className="p-6 sm:p-8">
                  {journey.journey && Array.isArray(journey.journey) && journey.journey.length > 0 ? (
                    <div className="relative" ref={timelineContainerRef}>
                      {/* Scroll-animated Timeline line */}
                      <TimelineLine containerRef={timelineContainerRef} />

                      <div className="space-y-6">
                        {journey.journey.map((step, idx) => (
                          <motion.div
                            key={idx}
                            variants={itemVariants}
                            className="relative"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.15, duration: 0.5 }}
                          >
                            {/* Animated Timeline dot with pulse */}
                            <motion.div 
                              className={`absolute left-0 w-14 h-14 rounded-full bg-gradient-to-br ${getStageColor(step.stage)} flex items-center justify-center text-white shadow-xl z-10 border-2 border-white/50`}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ 
                                delay: idx * 0.15 + 0.2, 
                                type: "spring", 
                                stiffness: 300, 
                                damping: 20 
                              }}
                            >
                              {/* Outer pulse ring */}
                              <motion.div
                                className="absolute inset-0 rounded-full border-2 border-white/40"
                                initial={{ opacity: 0.6, scale: 1 }}
                                animate={{ 
                                  opacity: [0.6, 0],
                                  scale: [1, 1.8]
                                }}
                                transition={{
                                  duration: 2.5,
                                  repeat: Infinity,
                                  ease: "easeOut",
                                }}
                              />
                              {/* Inner pulse ring */}
                              <motion.div
                                className="absolute inset-0 rounded-full bg-white/30"
                                initial={{ opacity: 0.4, scale: 1 }}
                                animate={{ 
                                  opacity: [0.4, 0],
                                  scale: [1, 1.4]
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "easeOut",
                                  delay: 0.3,
                                }}
                              />
                              {/* Icon with subtle rotation */}
                              <motion.div
                                className="relative z-10"
                                animate={{ rotate: [0, 5, -5, 0] }}
                                transition={{ 
                                  duration: 4, 
                                  repeat: Infinity, 
                                  ease: "easeInOut" 
                                }}
                              >
                                {getStageIcon(step.stage)}
                              </motion.div>
                              {/* Glow effect */}
                              <motion.div
                                className="absolute inset-0 rounded-full bg-white/20 blur-sm"
                                animate={{
                                  opacity: [0.3, 0.6, 0.3],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                }}
                              />
                            </motion.div>

                            {/* Content card with enhanced animations */}
                            <motion.div 
                              className="ml-20 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-cyan-200 p-6 hover:shadow-2xl transition-all duration-300 group cursor-pointer"
                              transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                                <div className="flex-1">
                                  <motion.h3 
                                    className="text-xl font-bold text-slate-800 mb-1 group-hover:text-[#0891b2] transition-colors"
                                  >
                                    {step.description || step.stage || "N/A"}
                                  </motion.h3>
                                  <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <motion.svg 
                                      className="w-4 h-4" 
                                      fill="currentColor" 
                                      viewBox="0 0 20 20"
                                      transition={{ duration: 0.5 }}
                                    >
                                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                    </motion.svg>
                                    {step.date ? new Date(step.date).toLocaleString("vi-VN") : "N/A"}
                                  </div>
                                </div>
                                {step.stage && (
                                  <motion.span 
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r ${getStageColor(step.stage)} text-white shadow-md capitalize whitespace-nowrap`}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.15 + 0.4, type: "spring" }}
                                  >
                                    {step.stage}
                                  </motion.span>
                                )}
                              </div>

                              <div className="space-y-3">
                                {step.manufacturer && (
                                  <motion.div 
                                    className="flex items-start gap-3 p-3 bg-gradient-to-br from-[#077ca3]/5 to-[#00c0e8]/5 rounded-lg border border-[#077ca3]/20 hover:border-[#077ca3]/40 hover:shadow-md transition-all"
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                  >
                                    <div className="p-2 bg-gradient-to-br from-[#054f67] to-[#077ca3] rounded-lg flex-shrink-0 mt-0.5 shadow-sm">
                                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                      </svg>
                                    </div>
                                    <div className="flex-1">
                                      <div className="text-xs text-cyan-600 mb-1">Nhà sản xuất</div>
                                      <div className="font-semibold text-slate-800">
                                        {typeof step.manufacturer === "object"
                                          ? step.manufacturer.fullName || step.manufacturer.username || step.manufacturer.name || JSON.stringify(step.manufacturer)
                                          : step.manufacturer}
                                      </div>
                                    </div>
                                  </motion.div>
                                )}

                                {(step.details?.quantity || step.quantity) && (
                                  <motion.div 
                                    className="flex items-start gap-3 p-3 bg-gradient-to-br from-[#00c0e8]/5 to-[#077ca3]/5 rounded-lg border border-[#00c0e8]/20 hover:border-[#00c0e8]/40 hover:shadow-md transition-all"
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                  >
                                    <div className="p-2 bg-gradient-to-br from-[#00c0e8] to-[#077ca3] rounded-lg flex-shrink-0 mt-0.5 shadow-sm">
                                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                                      </svg>
                                    </div>
                                    <div className="flex-1">
                                      <div className="text-xs text-teal-600 mb-1">Số lượng</div>
                                      <motion.div 
                                        className="font-bold text-slate-800 text-lg"
                                        initial={{ scale: 1 }}
                                      >
                                        {step.details?.quantity || step.quantity}
                                      </motion.div>
                                    </div>
                                  </motion.div>
                                )}

                                {step.details?.mfgDate && (
                                  <motion.div 
                                    className="flex items-start gap-3 p-3 bg-gradient-to-br from-[#077ca3]/5 to-[#054f67]/5 rounded-lg border border-[#077ca3]/20 hover:border-[#077ca3]/40 hover:shadow-md transition-all"
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                  >
                                    <div className="p-2 bg-gradient-to-br from-[#077ca3] to-[#054f67] rounded-lg flex-shrink-0 mt-0.5 shadow-sm">
                                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                      </svg>
                                    </div>
                                    <div className="flex-1">
                                      <div className="text-xs text-cyan-600 mb-1">Ngày sản xuất</div>
                                      <div className="font-semibold text-slate-800">
                                        {new Date(step.details.mfgDate).toLocaleDateString("vi-VN")}
                                      </div>
                                    </div>
                                  </motion.div>
                                )}

                                {step.from && (
                                  <motion.div 
                                    className="flex items-start gap-3 p-3 bg-gradient-to-br from-[#00c0e8]/5 to-[#077ca3]/5 rounded-lg border border-[#00c0e8]/20 hover:border-[#00c0e8]/40 hover:shadow-md transition-all"
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                  >
                                    <div className="p-2 bg-gradient-to-br from-[#00c0e8] to-[#077ca3] rounded-lg flex-shrink-0 mt-0.5 shadow-sm">
                                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                                      </svg>
                                    </div>
                                    <div className="flex-1">
                                      <div className="text-xs text-teal-600 mb-1">Từ</div>
                                      <div className="font-semibold text-slate-800">
                                        {typeof step.from === "object"
                                          ? step.from.fullName || step.from.username || step.from.name || JSON.stringify(step.from)
                                          : step.from}
                                      </div>
                                    </div>
                                  </motion.div>
                                )}

                                {step.to && (
                                  <motion.div 
                                    className="flex items-start gap-3 p-3 bg-gradient-to-br from-[#077ca3]/5 to-[#054f67]/5 rounded-lg border border-[#077ca3]/20 hover:border-[#077ca3]/40 hover:shadow-md transition-all"
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                  >
                                    <div className="p-2 bg-gradient-to-br from-[#077ca3] to-[#054f67] rounded-lg flex-shrink-0 mt-0.5 shadow-sm">
                                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                                      </svg>
                                    </div>
                                    <div className="flex-1">
                                      <div className="text-xs text-cyan-600 mb-1">Đến</div>
                                      <div className="font-semibold text-slate-800">
                                        {typeof step.to === "object"
                                          ? step.to.fullName || step.to.username || step.to.name || JSON.stringify(step.to)
                                          : step.to}
                                      </div>
                                    </div>
                                  </motion.div>
                                )}

                                {step.transactionHash && (
                                  <div className="flex items-start gap-3 p-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all">
                                    <div className="p-2 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex-shrink-0 mt-0.5 shadow-sm">
                                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                                      </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-xs text-slate-500 mb-1">Transaction Hash</div>
                                      <div className="font-mono text-xs text-slate-700 truncate">
                                        {step.transactionHash}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {step.notes && (
                                  <div className="p-4 bg-gradient-to-br from-[#077ca3]/10 to-[#00c0e8]/10 rounded-lg border border-[#077ca3]/30 hover:shadow-md transition-all">
                                    <div className="flex items-start gap-3">
                                      <div className="p-2 bg-gradient-to-br from-[#077ca3] to-[#00c0e8] rounded-lg flex-shrink-0 mt-0.5 shadow-sm">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                                        </svg>
                                      </div>
                                      <p className="text-sm text-[#054f67] leading-relaxed">{step.notes}</p>
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
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                      </div>
                      <p className="text-lg text-slate-500">Chưa có lịch sử phân phối</p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Detailed Drug Information */}
              {journey.nft?.drug && (
                <motion.div variants={itemVariants} className="bg-white rounded-3xl border border-cyan-200 shadow-xl overflow-hidden">
                  <div className="relative bg-gradient-to-r from-[#054f67] via-[#077ca3] to-[#00c0e8] px-6 sm:px-8 py-6 overflow-hidden">
                    {/* Pulse animation background */}
                    <motion.div
                      className="absolute inset-0"
                      style={{
                        background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 70%)',
                      }}
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 0.1, 0.3],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                    
                    <div className="relative z-10 flex items-center gap-3">
                      <motion.div 
                        className="p-2 bg-white/20 rounded-lg backdrop-blur-sm"
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </motion.div>
                      <motion.h2 
                        className="text-2xl font-bold text-white"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                      >
                        Thông tin chi tiết
                      </motion.h2>
                    </div>
                  </div>

                  <div className="p-6 sm:p-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {journey.nft.drug.genericName && (
                        <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-xl p-5 border border-cyan-200 hover:shadow-md transition-shadow">
                          <div className="text-xs font-semibold text-cyan-600 uppercase tracking-wide mb-2">Tên hoạt chất</div>
                          <div className="text-lg font-bold text-cyan-900">{journey.nft.drug.genericName}</div>
                        </div>
                      )}
                      {journey.nft.drug.atcCode && (
                        <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-xl p-5 border border-cyan-200 hover:shadow-md transition-shadow">
                          <div className="text-xs font-semibold text-cyan-600 uppercase tracking-wide mb-2">Mã ATC</div>
                          <div className="text-lg font-mono font-bold text-cyan-900">{journey.nft.drug.atcCode}</div>
                        </div>
                      )}
                      {journey.nft.drug.dosageForm && (
                        <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-xl p-5 border border-cyan-200 hover:shadow-md transition-shadow">
                          <div className="text-xs font-semibold text-cyan-600 uppercase tracking-wide mb-2">Dạng bào chế</div>
                          <div className="text-lg font-bold text-cyan-900">{journey.nft.drug.dosageForm}</div>
                        </div>
                      )}
                      {journey.nft.drug.strength && (
                        <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-xl p-5 border border-cyan-200 hover:shadow-md transition-shadow">
                          <div className="text-xs font-semibold text-cyan-600 uppercase tracking-wide mb-2">Hàm lượng</div>
                          <div className="text-lg font-bold text-cyan-900">{journey.nft.drug.strength}</div>
                        </div>
                      )}
                      {journey.nft.drug.packaging && (
                        <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-xl p-5 border border-cyan-200 hover:shadow-md transition-shadow">
                          <div className="text-xs font-semibold text-cyan-600 uppercase tracking-wide mb-2">Quy cách đóng gói</div>
                          <div className="text-lg font-bold text-cyan-900">{journey.nft.drug.packaging}</div>
                        </div>
                      )}
                      {journey.nft.mfgDate && (
                        <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-xl p-5 border border-cyan-200 hover:shadow-md transition-shadow">
                          <div className="text-xs font-semibold text-cyan-600 uppercase tracking-wide mb-2">Ngày sản xuất</div>
                          <div className="text-lg font-bold text-cyan-900">
                            {new Date(journey.nft.mfgDate).toLocaleDateString("vi-VN")}
                          </div>
                        </div>
                      )}
                      {journey.nft.expDate && (
                        <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-xl p-5 border border-cyan-200 hover:shadow-md transition-shadow">
                          <div className="text-xs font-semibold text-cyan-600 uppercase tracking-wide mb-2">Hạn sử dụng</div>
                          <div className="text-lg font-bold text-cyan-900">
                            {new Date(journey.nft.expDate).toLocaleDateString("vi-VN")}
                          </div>
                        </div>
                      )}
                      {journey.nft.drug.manufacturer && (
                        <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-xl p-5 border border-cyan-200 hover:shadow-md transition-shadow sm:col-span-2">
                          <div className="text-xs font-semibold text-cyan-600 uppercase tracking-wide mb-2">Nhà sản xuất</div>
                          <div className="text-lg font-bold text-cyan-900">
                            {typeof journey.nft.drug.manufacturer === "object"
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

        {/* Back to Home */}
        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 text-slate-600 hover:text-slate-900 font-medium rounded-xl hover:bg-slate-100 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Về trang chủ
          </Link>
        </motion.div>
      </div>
    </div>
  );
}