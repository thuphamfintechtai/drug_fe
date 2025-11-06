import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BsFillBoxSeamFill, BsTruck, BsShop, BsPersonFill } from 'react-icons/bs';
import { BsCheckCircleFill } from 'react-icons/bs';
export default function UserHome() {
  const navigate = useNavigate();
  const [tokenId, setTokenId] = useState('');

  const handleTrackDrug = () => {
    if (tokenId.trim()) {
      navigate(`/user/nft-tracking?tokenId=${tokenId}`);
    }
  };

  const processSteps = [
    {
      step: "Bước 1: Nhà sản xuất",
      desc: "Nhà sản xuất tạo Proof of Production và mint NFT",
      icon: <BsFillBoxSeamFill />,
      color: "text-green-600",
      bgColor: "bg-green-100",
      align: "start"
    },
    {
      step: "Bước 2: Phân phối",
      desc: "Chuyển quyền sở hữu NFT từ nhà sản xuất sang nhà phân phối",
      icon: <BsTruck />,
      color: "text-red-600",
      bgColor: "bg-red-100",
      align: "mid-start" 
    },
    {
      step: "Bước 3: Bán Lẻ",
      desc: "Nhà phân phối chuyển NFT sang nhà thuốc",
      icon: <BsShop />,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      align: "mid-end"
    },
    {
      step: "Bước 4: Người dùng",
      desc: "Người dùng tra cứu thông tin bằng mã QR hoặc serial",
      icon: <BsPersonFill />,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      align: "end"
    }
  ];

  const benefits = [
    "Ngăn chặn thuốc giả, thuốc kém chất lượng.",
    "Tăng niềm tin của người tiêu dùng.",
    "Theo dõi chính xác chuỗi cung ứng.",
    "Tuân thủ quy định pháp luật.",
    "Hỗ trợ thu hồi sản phẩm khi cần thiết."
  ];

  const StepCard = ({ step, desc, icon, color, bgColor }) => (
    <motion.div 
      className="flex items-center gap-5 p-6 bg-white rounded-2xl shadow-lg border border-slate-200/50 max-w-md hover:border-[#4BADD1]/50 transition-all relative overflow-hidden group"
      whileHover={{ 
        scale: 1.03, 
        boxShadow: "0 12px 40px rgba(75, 173, 209, 0.25)",
        y: -4
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <motion.div
        className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#4BADD1] to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity"
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.3 }}
      />
      <motion.div 
        className={`flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center ${bgColor} transition-all shadow-md`}
        whileHover={{ scale: 1.1, rotate: 360 }}
        transition={{ duration: 0.5 }}
      >
        <span className={`text-3xl ${color}`}>{icon}</span>
      </motion.div>
      <div className="flex-1">
        <h3 className="font-bold text-slate-800 mb-2 text-base">{step}</h3>
        <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );

  const features = [
    {
      number: 1,
      title: "Tra cứu dễ dàng",
      description: "Tìm kiếm thông tin sản phẩm bằng mã lô, mã QR hoặc series number."
    },
    {
      number: 2,
      title: "Minh bạch hoàn toàn",
      description: "Thông tin rõ ràng, chi tiết về toàn bộ quy trình từ nhà sản xuất đến nhà thuốc."
    },
    {
      number: 3,
      title: "Bảo mật tuyệt đối",
      description: "Dữ liệu được bảo mật bằng công nghệ blockchain, không thể thay đổi hay giả mạo."
    }
  ];
  const stats = [
    { value: '10,000+', label: 'Sản phẩm' },
    { value: '500+', label: 'Doanh nghiệp' },
    { value: '50,000+', label: 'Người dùng' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Banner với nền trắng */}
      <div className="min-h-screen bg-white relative overflow-hidden"> 
        {/* Animated background elements */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-[#4BADD1]/5 rounded-full blur-3xl"
            animate={{
              x: [0, 50, 0],
              y: [0, 30, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-[#4BADD1]/5 rounded-full blur-3xl"
            animate={{
              x: [0, -50, 0],
              y: [0, -30, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>

      <section className="pt-32 pb-20 px-4 w-full flex flex-col items-center justify-center relative z-10"> 
        <div className="max-w-5xl mx-auto w-full"> 
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            
            <motion.h1 
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#2176FF] mb-6 leading-tight tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-gradient-to-r from-[#2176FF] to-[#4BADD1] bg-clip-text text-transparent"
              >
                Hệ Thống Truy Xuất Nguồn Gốc Thuốc
              </motion.span>
            </motion.h1>
            
            <motion.p 
              className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto font-medium leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Tra cứu thông tin sản phẩm, theo dõi lộ trình phân phối an toàn với công nghệ <motion.strong 
                className="text-[#4BADD1] font-bold relative"
                animate={{ 
                  textShadow: [
                    "0 0 0px rgba(75, 173, 209, 0)",
                    "0 0 10px rgba(75, 173, 209, 0.5)"
                  ]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }}
              >Blockchain</motion.strong>.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="max-w-3xl mx-auto w-full"
          >
            <motion.div 
              className="bg-white rounded-2xl shadow-2xl border border-slate-200/50 p-8 relative overflow-hidden backdrop-blur-sm"
              whileHover={{ 
                scale: 1.01,
                boxShadow: "0 25px 50px rgba(75, 173, 209, 0.2)",
                borderColor: "rgba(75, 173, 209, 0.3)"
              }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#4BADD1] via-cyan-400 to-[#4BADD1]"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
              />
              
              <motion.div
                className="absolute top-0 right-0 w-32 h-32 bg-[#4BADD1]/5 rounded-full blur-3xl -mr-16 -mt-16"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              <motion.p 
                className="text-slate-700 mb-5 text-left text-sm font-semibold flex items-center gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                <svg className="w-4 h-4 text-[#4BADD1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Nhập mã lô, mã serial hoặc NFT ID
              </motion.p>
              
              <div className="flex gap-3 items-stretch relative">
                <div className="flex-1 relative">
                  <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <motion.input
                    type="text"
                    value={tokenId}
                    onChange={(e) => setTokenId(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleTrackDrug()}
                    placeholder="Nhập mã để tra cứu..."
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4BADD1]/50 focus:border-[#4BADD1] transition-all text-base placeholder:text-slate-400"
                    whileFocus={{ 
                      scale: 1.01,
                      borderColor: "#4BADD1",
                      backgroundColor: "#fff"
                    }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 }}
                  />
                </div>
                
                <motion.button
                  onClick={handleTrackDrug}
                  className="relative px-6 py-3.5 bg-gradient-to-r from-[#4BADD1] to-cyan-500 text-white font-semibold rounded-xl transition flex items-center gap-2 text-sm overflow-hidden group shadow-lg shadow-[#4BADD1]/30"
                  whileHover={{ 
                    scale: 1.08,
                    boxShadow: "0 15px 40px rgba(75, 173, 209, 0.6)",
                    y: -3
                  }}
                  whileTap={{ scale: 0.92 }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 }}
                >
                  {/* Animated background gradient */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-white/30 to-cyan-400"
                    initial={{ x: "-200%", opacity: 0 }}
                    animate={{ 
                      x: ["-200%", "200%"],
                      opacity: [0, 0.5, 0]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatDelay: 1,
                      ease: "easeInOut"
                    }}
                  />
                  
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  />
                  
                  {/* Pulse glow effect */}
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-[#4BADD1] opacity-0"
                    animate={{
                      opacity: [0, 0.4, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  
                  <motion.svg 
                    className="w-5 h-5 relative z-10" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                    animate={{
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    whileHover={{ 
                      rotate: 360,
                      scale: 1.2
                    }}
                  >
                    <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3v-2zM14 13h2v2h-2v-2zm2 2h2v2h-2v-2zm-2 2h2v2h-2v-2zm2 2h2v2h-2v-2zm2-2h2v2h-2v-2zm0-4h2v2h-2v-2zm2 2h3v2h-3v-2z"/>
                  </motion.svg>
                  <motion.span 
                    className="relative z-10 font-semibold"
                    whileHover={{ x: 2 }}
                  >
                    Quét QR
                  </motion.span>
                  
                  {/* Scanning line effect */}
                  <motion.div
                    className="absolute inset-0 border-2 border-white/50 rounded-xl"
                    animate={{
                      opacity: [0.3, 0.8, 0.3],
                      scale: [1, 1.02, 1]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  
                  {/* Ripple effect on click */}
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-white/30"
                    initial={{ scale: 0, opacity: 0.8 }}
                    whileTap={{
                      scale: 2,
                      opacity: 0
                    }}
                    transition={{ duration: 0.6 }}
                  />
                </motion.button>
                
                <motion.button
                  onClick={handleTrackDrug}
                  className="relative px-6 py-3.5 bg-gradient-to-r from-[#4A69F0] to-blue-600 text-white font-semibold rounded-xl transition text-sm overflow-hidden group shadow-lg shadow-[#4A69F0]/30"
                  whileHover={{ 
                    scale: 1.08,
                    boxShadow: "0 15px 40px rgba(74, 105, 240, 0.6)",
                    y: -3
                  }}
                  whileTap={{ scale: 0.92 }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1 }}
                >
                  {/* Animated background gradient */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-400 via-white/30 to-blue-400"
                    initial={{ x: "-200%", opacity: 0 }}
                    animate={{ 
                      x: ["-200%", "200%"],
                      opacity: [0, 0.5, 0]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatDelay: 1,
                      ease: "easeInOut"
                    }}
                  />
                  
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  />
                  
                  {/* Pulse glow effect */}
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-[#4A69F0] opacity-0"
                    animate={{
                      opacity: [0, 0.4, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  
                  <motion.span className="relative z-10 flex items-center gap-2 font-semibold">
                    <motion.svg 
                      className="w-5 h-5" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ 
                        opacity: 1,
                        scale: [1, 1.15, 1]
                      }}
                      transition={{
                        opacity: { duration: 0.3, delay: 1.1 },
                        scale: {
                          duration: 1.5,
                          repeat: Infinity,
                          repeatType: "reverse",
                          ease: "easeInOut"
                        }
                      }}
                      whileHover={{ 
                        rotate: 360,
                        scale: 1.3
                      }}
                    >
                      <motion.path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ 
                          pathLength: 1,
                          opacity: 1
                        }}
                        transition={{
                          pathLength: {
                            duration: 0.8,
                            delay: 1.1,
                            ease: "easeInOut"
                          },
                          opacity: {
                            duration: 0.3,
                            delay: 1.1
                          }
                        }}
                      />
                    </motion.svg>
                    <motion.span
                      whileHover={{ x: 2 }}
                    >
                      Xác thực
                    </motion.span>
                  </motion.span>
                  
                  {/* Ripple effect on click */}
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-white/30"
                    initial={{ scale: 0, opacity: 0.8 }}
                    whileTap={{
                      scale: 2,
                      opacity: 0
                    }}
                    transition={{ duration: 0.6 }}
                  />
                  
                  {/* Glow border effect */}
                  <motion.div
                    className="absolute inset-0 border-2 border-white/50 rounded-xl"
                    animate={{
                      opacity: [0.3, 0.8, 0.3],
                      scale: [1, 1.02, 1]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </motion.button>
              </div>

            </motion.div>
          </motion.div>

        </div>
      </section>
      
    </div>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-slate-50/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.span
            className="inline-block px-4 py-1.5 bg-[#4BADD1]/10 text-[#4BADD1] text-sm font-semibold rounded-full mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Tính năng nổi bật
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#2176FF] mb-4">
            Tại sao chọn hệ thống của chúng tôi
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Giải pháp toàn diện cho việc quản lý và truy xuất nguồn gốc dược phẩm
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8 items-stretch">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className={`rounded-2xl p-8 text-center transition-all duration-300 bg-white shadow-lg border border-slate-200/50 hover:shadow-2xl relative overflow-hidden
                ${
                  index === 1 
                  ? 'border-2 border-[#4BADD1] lg:scale-105 bg-gradient-to-br from-white to-[#4BADD1]/5' 
                  : 'hover:border-[#4BADD1]/50'
                }
              `}
            >
              {index === 1 && (
                <motion.div
                  className="absolute top-0 right-0 w-32 h-32 bg-[#4BADD1]/10 rounded-full blur-2xl -mr-16 -mt-16"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}
              <div className={`flex items-center justify-center w-20 h-20 rounded-2xl mx-auto mb-6 relative
                ${index === 1 ? 'bg-gradient-to-br from-[#4BADD1]/20 to-cyan-100/50' : 'bg-gradient-to-br from-[#4BADD1]/10 to-blue-50/50'}
              `}>
                <motion.span 
                  className={`text-4xl font-bold
                    ${index === 1 ? 'text-[#4BADD1]' : 'text-[#2176FF]'}
                  `}
                  whileHover={{ scale: 1.2, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  {feature.number}
                </motion.span>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-600 text-base leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Quy trình hoạt động */}
    <section className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.span
            className="inline-block px-4 py-1.5 bg-[#4BADD1]/10 text-[#4BADD1] text-sm font-semibold rounded-full mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Quy trình
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#2176FF] mb-4">
            Quy trình hoạt động
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Từ nhà sản xuất đến người tiêu dùng, mọi bước đều được ghi lại minh bạch
          </p>
        </motion.div>

        {/* Container cho các bước */}
        <div className="relative max-w-4xl mx-auto flex flex-col gap-6 md:gap-5">
          {processSteps.map((item, index) => {
            // Logic căn lề:
            // - start: Luôn bên trái
            // - mid-start: Trái, nhưng lùi vào 1 chút trên desktop
            // - mid-end: Phải, lùi vào 1 chút trên desktop (trên mobile là trái)
            // - end: Luôn bên phải (trên mobile là trái)
            let alignmentClass = "justify-start"; // Mặc định trên mobile
            if (item.align === "start") alignmentClass = "justify-start";
            if (item.align === "mid-start") alignmentClass = "justify-start md:pl-20 lg:pl-32";
            if (item.align === "mid-end") alignmentClass = "justify-start md:justify-end md:pr-20 lg:pr-32";
            if (item.align === "end") alignmentClass = "justify-start md:justify-end";

            // Xác định hướng animation:
            // - Trên mobile: tất cả slide từ trái (-50)
            // - Trên desktop: bước chẵn (0,2) slide từ trái, bước lẻ (1,3) slide từ phải
            const isRightAligned = item.align === "end" || item.align === "mid-end";
            const animationX = isRightAligned ? 100 : -100; // Tăng khoảng cách để animation rõ ràng hơn

            return (
              <motion.div
                key={index}
                className={`w-full flex ${alignmentClass}`}
                initial={{ opacity: 0, x: animationX }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  delay: index * 0.2, 
                  type: "spring",
                  stiffness: 100,
                  damping: 20,
                  mass: 0.8
                }}
              >
                <StepCard {...item} />
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>

        {/* Công nghệ blockchain */}
      <section className="py-24 px-4 bg-gradient-to-b from-white via-slate-50/30 to-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Cột Trái - Công nghệ blockchain */}
          <motion.div
            className="w-full"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="border-2 border-[#4BADD1] rounded-3xl p-8 h-full flex flex-col justify-between bg-gradient-to-br from-white to-[#4BADD1]/5 relative overflow-hidden shadow-xl">
              <motion.div
                className="absolute top-0 right-0 w-40 h-40 bg-[#4BADD1]/10 rounded-full blur-3xl -mr-20 -mt-20"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">
                  Công nghệ blockchain
                </h2>
                <p className="text-slate-600 leading-relaxed text-base">
                  Mỗi sản phẩm được gắn với một NFT duy nhất trên blockchain, đảm bảo tính xác thực và không thể thay đổi. Mọi giao dịch đều được ghi lại và minh bạch.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-8">
                <motion.div 
                  className="bg-[#4BADD1]/10 rounded-2xl p-6 text-center border border-[#4BADD1]/20"
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(75, 173, 209, 0.15)" }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-4xl font-extrabold text-[#4BADD1] mb-1">
                    100%
                  </h3>
                  <p className="text-slate-600 font-medium">Minh bạch</p>
                </motion.div>
                <motion.div 
                  className="bg-[#4BADD1]/10 rounded-2xl p-6 text-center border border-[#4BADD1]/20"
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(75, 173, 209, 0.15)" }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-4xl font-extrabold text-[#4BADD1] mb-1">
                    0
                  </h3>
                  <p className="text-slate-600 font-medium">Giả mạo</p>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Cột Phải - Lợi ích */}
          <motion.div 
            className="w-full lg:pl-10"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <h2 className="text-4xl font-extrabold text-slate-900 mb-8">
              Lợi ích Của Hệ Thống
            </h2>
            
            <div className="flex flex-col gap-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-xl bg-slate-50/50 hover:bg-slate-100/50 transition-colors"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ x: 5, transition: { duration: 0.2 } }}
                  transition={{ 
                    duration: 0.5, 
                    delay: index * 0.1,
                    ease: "easeOut" 
                  }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
                  >
                    <BsCheckCircleFill className="text-2xl text-[#4BADD1] flex-shrink-0 mt-0.5" />
                  </motion.div>
                  <span className="text-base font-medium text-slate-700 leading-relaxed">
                    {benefit}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-slate-50/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-[#2176FF] via-[#4BADD1] to-cyan-500 rounded-3xl shadow-2xl p-12 text-center text-white relative overflow-hidden"
          >
            <motion.div
              className="absolute top-0 left-0 w-full h-full opacity-20"
              style={{
                backgroundImage: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.2) 0%, transparent 50%)"
              }}
              animate={{
                backgroundPosition: ["0% 0%", "100% 100%"],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Bắt đầu ngay hôm nay</h2>
              <p className="text-xl mb-10 text-white/90 max-w-2xl mx-auto">
                Tham gia hệ thống để truy xuất nguồn gốc thuốc minh bạch và an toàn
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/register"
                    className="block px-8 py-4 bg-white text-[#4BADD1] font-bold rounded-xl hover:shadow-2xl transition shadow-lg"
                  >
                    Đăng ký người dùng
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/register-business"
                    className="block px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-bold rounded-xl border-2 border-white/30 hover:bg-white/30 transition shadow-lg"
                  >
                    Đăng ký doanh nghiệp
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
  
      {/* Footer */}
      <footer className="py-16 px-4 bg-gradient-to-b from-slate-800 to-slate-900 text-white relative overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 w-full h-full opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 20% 30%, rgba(75, 173, 209, 0.3) 0%, transparent 50%)"
          }}
        />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                <span className="w-1 h-6 bg-[#4BADD1] rounded-full"></span>
                Về chúng tôi
              </h3>
              <p className="text-slate-300 leading-relaxed">
                Hệ thống truy xuất nguồn gốc thuốc sử dụng công nghệ Blockchain 
                để đảm bảo tính minh bạch và an toàn.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                <span className="w-1 h-6 bg-[#4BADD1] rounded-full"></span>
                Liên kết
              </h3>
              <ul className="space-y-3 text-slate-300">
                <li>
                  <Link to="/login" className="hover:text-[#4BADD1] transition flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full group-hover:bg-[#4BADD1] transition"></span>
                    Đăng nhập
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-[#4BADD1] transition flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full group-hover:bg-[#4BADD1] transition"></span>
                    Đăng ký
                  </Link>
                </li>
                <li>
                  <Link to="/register-business" className="hover:text-[#4BADD1] transition flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full group-hover:bg-[#4BADD1] transition"></span>
                    Doanh nghiệp
                  </Link>
                </li>
              </ul>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                <span className="w-1 h-6 bg-[#4BADD1] rounded-full"></span>
                Liên hệ
              </h3>
              <ul className="space-y-3 text-slate-300">
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#4BADD1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  info@drugchain.vn
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#4BADD1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  1900 xxxx
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#4BADD1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Hà Nội, Việt Nam
                </li>
              </ul>
            </motion.div>
          </div>
          
          <div className="border-t border-slate-700/50 pt-8 text-center">
            <p className="text-slate-400">
              &copy; 2025 Drug Traceability System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
