import { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useReducedMotion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import api from '../../utils/api';
import AnimatedHeadline from '../../components/public/userhome/AnimatedHeadline';
import { Scanner } from '@yudiel/react-qr-scanner';
import { BrowserQRCodeReader } from '@zxing/browser';

// Horizontal top progress bar (gradient) linked to page scroll
function ScrollTopProgress() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      className="fixed inset-x-0 top-16 z-50 h-1.5 origin-left bg-gradient-to-r from-[#06b6d4] via-[#22d3ee] to-[#67e8f9] shadow-sm"
      style={{ scaleX: scrollYProgress }}
    />
  );
}

// --

export default function UserHome() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [error, setError] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [uploading, setUploading] = useState(false);
  const imgRef = useRef(null);

  const normalizeScannedText = (text) => {
    if (!text) return null;
    try {
      const url = new URL(text);
      if (url.protocol.startsWith('http')) {
        window.location.href = url.toString();
        return null; // backend sẽ redirect về FE /verifyToken
      }
    } catch (_) {
      // không phải URL -> có thể là tokenId base64url
    }
    return text;
  };

  const handleDecoded = (result) => {
    if (!result) return;
    const text = typeof result === 'string' ? result : result?.rawValue || result?.text || '';
    const normalized = normalizeScannedText(text);
    if (!normalized) return;
    navigate(`/verifyToken?tokenId=${encodeURIComponent(normalized)}`);
  };

  const handleImageSelect = async (e) => {
    setError('');
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const imgEl = imgRef.current;
          if (!imgEl) return;
          imgEl.src = reader.result;
          await imgEl.decode();
          const codeReader = new BrowserQRCodeReader();
          const result = await codeReader.decodeFromImageElement(imgEl);
          const text = result?.getText?.() || result?.text || String(result || '');
          handleDecoded(text);
        } catch (err) {
          toast.error('Không đọc được QR từ ảnh. Hãy thử ảnh khác.', { position: 'top-right' });
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setUploading(false);
      toast.error('Đã xảy ra lỗi khi xử lý ảnh.', { position: 'top-right' });
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchValue.trim()) {
      setError('Vui lòng nhập mã tra cứu');
      toast.error('Vui lòng nhập mã tra cứu', {
        position: 'top-right',
        duration: 2000,
      });
      return;
    }

    setLoading(true);
    setError('');
    setSearchResult(null);

    try {
      const response = await api.get(`/NFTTracking/verify/${searchValue.trim()}/public`);
      if (response.data.success) {
        setSearchResult(response.data.data);
        toast.success('Tra cứu thành công!', {
          position: 'top-right',
          duration: 2000,
        });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Không tìm thấy thông tin. Vui lòng kiểm tra lại mã tra cứu.';
      setError(errorMsg);
      toast.error(errorMsg, {
        position: 'top-right',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
      },
    },
  };

  return (
    
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-cyan-100 relative overflow-hidden pt-16">
      {/* Subtle animated background */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          background: 'linear-gradient(120deg, #00b4d8, #90e0ef, #caf0f8)',
          backgroundSize: '200% 200%',
        }}
      />
      <Toaster />
      <ScrollTopProgress />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <motion.div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div className="text-center mb-12" variants={itemVariants}>
            <motion.div
              className="inline-flex items-center justify-center w-20 h-20 bg-cyan-100 rounded-full mb-6"
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
            >
              <svg className="w-12 h-12 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </motion.div>
            <motion.div variants={itemVariants} className="mb-4">
              <AnimatedHeadline text="Hệ Thống Truy Xuất Nguồn Gốc Thuốc" perCharMs={0.05} />
            </motion.div>
            <motion.p
              className="text-xl text-gray-600 max-w-2xl mx-auto mb-8"
              variants={itemVariants}
            >
              Tra cứu thông tin sản phẩm, theo dõi lộ trình phân phối an toàn với công nghệ Blockchain
            </motion.p>
          </motion.div>

          {/* Search Box */}
          <motion.div
            className="max-w-2xl mx-auto"
            variants={itemVariants}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border-t-4 border-cyan-500 relative"
              whileHover={{ 
                scale: 1.02,
                boxShadow: '0px 10px 40px rgba(0,0,0,0.15)',
              }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                      Nhập mã lô, mã serial hoặc NFT ID
                    </label>
                    <motion.input
                      id="search"
                      type="text"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      placeholder="Ví dụ: BATCH-123456 hoặc SN-ABC123"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-lg transition-all duration-300 ease-in-out"
                      whileFocus={{ scale: 1.01 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    />
                  </div>
                  <div className="flex items-end">
                    <motion.button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto px-8 py-3 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl"
                      whileHover={{ 
                        scale: loading ? 1 : 1.05,
                        boxShadow: '0px 4px 20px rgba(6, 182, 212, 0.4)',
                      }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Đang tìm kiếm...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          Tra Cứu Ngay
                        </span>
                      )}
                    </motion.button>
                  </div>
                </div>
                {error && (
                  <motion.div
                    className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {error}
                  </motion.div>
                )}
              </form>
            </motion.div>

            {/* Search Result */}
            {loading && (
              <motion.div
                className="mt-6 bg-white rounded-xl shadow-lg p-6 border border-gray-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              </motion.div>
            )}
            {searchResult && (
              <motion.div
                className="mt-6 bg-white rounded-xl shadow-lg p-6 border border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">Kết quả tra cứu</h3>
                <motion.div
                  className="space-y-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                >
                  <motion.div variants={itemVariants}>
                    <p className="text-sm text-gray-500">Mã lô (Batch Number)</p>
                    <p className="text-lg font-semibold text-gray-900">{searchResult.nftInfo?.batchNumber || 'N/A'}</p>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <p className="text-sm text-gray-500">Serial Number</p>
                    <p className="text-lg font-semibold text-gray-900">{searchResult.nftInfo?.serialNumber || 'N/A'}</p>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <p className="text-sm text-gray-500">Token ID</p>
                    <p className="text-lg font-semibold text-gray-900 font-mono">{searchResult.nftId || 'N/A'}</p>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
          {/* QR Scan Box */}
          <motion.div
            className="max-w-2xl mx-auto mt-6"
            variants={itemVariants}
          >
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border-t-4 border-cyan-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Quét mã QR</h3>
                <button
                  type="button"
                  onClick={() => setShowScanner((v) => !v)}
                  className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
                >
                  {showScanner ? 'Đóng máy quét' : 'Mở máy quét'}
                </button>
              </div>
              {showScanner && (
                <div className="overflow-hidden rounded-lg border bg-black">
                  <Scanner
                    onDecode={handleDecoded}
                    onError={() => {}}
                    constraints={{ facingMode: 'environment' }}
                    styles={{ container: { width: '100%' }, video: { width: '100%' } }}
                  />
                </div>
              )}
              <p className="mt-3 text-sm text-gray-600">Hướng camera vào mã QR. Sau khi quét xong sẽ chuyển đến trang xác minh.</p>
              <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
                <div className="mb-2 text-sm font-medium text-gray-700">Hoặc tải ảnh QR</div>
                <input type="file" accept="image/*" onChange={handleImageSelect} disabled={uploading} />
                <img ref={imgRef} alt="qr-preview" className="mt-3 hidden" />
                {uploading && (
                  <div className="mt-2 text-sm text-gray-500">Đang xử lý ảnh...</div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <motion.section
        className="py-16 bg-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            className="text-3xl font-bold text-center text-gray-900 mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            Tại Sao Chọn Hệ Thống Của Chúng Tôi?
          </motion.h2>
          <motion.div
            className="grid gap-8 md:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-50px' }}
          >
            {/* Feature 1 */}
            <motion.div
              className="group text-center p-6 rounded-xl bg-gradient-to-br from-cyan-50 to-teal-50 border border-cyan-100 transition-all duration-300 ease-in-out"
              variants={cardVariants}
              whileHover={{
                scale: 1.02,
                boxShadow: '0px 10px 40px rgba(0,0,0,0.1)',
                y: -5,
              }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <motion.div
                className="inline-flex items-center justify-center w-16 h-16 bg-cyan-500 rounded-full mb-4"
                whileHover={{ scale: 1.15, rotate: 360 }}
                transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </motion.div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Tra Cứu Dễ Dàng</h3>
              <p className="text-gray-600">
                Tìm kiếm thông tin sản phẩm nhanh chóng bằng mã lô, mã QR hoặc serial number
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              className="group text-center p-6 rounded-xl bg-gradient-to-br from-cyan-50 to-teal-50 border border-cyan-100 transition-all duration-300 ease-in-out"
              variants={cardVariants}
              whileHover={{
                scale: 1.02,
                boxShadow: '0px 10px 40px rgba(0,0,0,0.1)',
                y: -5,
              }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <motion.div
                className="inline-flex items-center justify-center w-16 h-16 bg-cyan-500 rounded-full mb-4"
                whileHover={{ scale: 1.15, rotate: 360 }}
                transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </motion.div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Minh Bạch Hoàn Toàn</h3>
              <p className="text-gray-600">
                Thông tin rõ ràng, chi tiết về toàn bộ quy trình từ sản xuất đến nhà thuốc
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              className="group text-center p-6 rounded-xl bg-gradient-to-br from-cyan-50 to-teal-50 border border-cyan-100 transition-all duration-300 ease-in-out"
              variants={cardVariants}
              whileHover={{
                scale: 1.02,
                boxShadow: '0px 10px 40px rgba(0,0,0,0.1)',
                y: -5,
              }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <motion.div
                className="inline-flex items-center justify-center w-16 h-16 bg-cyan-500 rounded-full mb-4"
                whileHover={{ scale: 1.15, rotate: 360 }}
                transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </motion.div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Bảo Mật Tuyệt Đối</h3>
              <p className="text-gray-600">
                Dữ liệu được bảo vệ bằng công nghệ blockchain, không thể thay đổi hay giả mạo
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section
        className="py-16 bg-gradient-to-br from-cyan-50 to-teal-50"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            className="text-3xl font-bold text-center text-gray-900 mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            Quy Trình Hoạt Động
          </motion.h2>
          <motion.div
            className="grid gap-8 md:grid-cols-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-50px' }}
          >
            {[
              { step: '1', title: 'Sản Xuất', desc: 'Nhà sản xuất tạo Proof of Production và mint NFT' },
              { step: '2', title: 'Phân Phối', desc: 'Chuyển quyền sở hữu NFT từ nhà sản xuất sang nhà phân phối' },
              { step: '3', title: 'Bán Lẻ', desc: 'Nhà phân phối chuyển NFT sang nhà thuốc' },
              { step: '4', title: 'Tra Cứu', desc: 'Người dùng tra cứu thông tin bằng mã QR hoặc serial' }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="relative text-center"
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <motion.div
                  className="inline-flex items-center justify-center w-16 h-16 bg-cyan-600 text-white rounded-full font-bold text-xl mb-4 shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
                >
                  {item.step}
                </motion.div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
                {index < 3 && (
                  <motion.div
                    className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-cyan-300 transform translate-x-4"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                  >
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-8 border-l-cyan-300 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Benefits Section */}
      <motion.section
        className="py-16 bg-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Lợi Ích Của Hệ Thống
              </h2>
              <motion.ul
                className="space-y-4"
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
              >
                {[
                  'Ngăn chặn thuốc giả, thuốc kém chất lượng',
                  'Tăng niềm tin của người tiêu dùng',
                  'Theo dõi chính xác chuỗi cung ứng',
                  'Tuân thủ quy định pháp luật',
                  'Hỗ trợ thu hồi sản phẩm khi cần thiết'
                ].map((benefit, index) => (
                  <motion.li
                    key={index}
                    className="flex items-start transition-all duration-300 ease-in-out"
                    variants={itemVariants}
                    whileHover={{ x: 5 }}
                  >
                    <motion.svg
                      className="w-6 h-6 text-cyan-600 mr-3 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      whileHover={{ scale: 1.2, rotate: 180 }}
                      transition={{ duration: 0.4, type: 'spring' }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </motion.svg>
                    <span className="text-gray-700 text-lg">{benefit}</span>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
            <motion.div
              className="bg-gradient-to-br from-cyan-500 to-teal-500 rounded-2xl p-8 text-white shadow-2xl"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              whileHover={{
                scale: 1.02,
                boxShadow: '0px 20px 60px rgba(6, 182, 212, 0.3)',
              }}
            >
              <h3 className="text-2xl font-bold mb-4">Công Nghệ Blockchain</h3>
              <p className="mb-6 text-cyan-50">
                Mỗi sản phẩm được gắn với một NFT duy nhất trên blockchain, đảm bảo tính xác thực và không thể thay đổi. 
                Mọi giao dịch đều được ghi lại và minh bạch.
              </p>
              <motion.div
                className="grid grid-cols-2 gap-4"
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
              >
                <motion.div
                  className="bg-white/20 backdrop-blur-sm rounded-lg p-4"
                  variants={cardVariants}
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  <div className="text-3xl font-bold mb-1">100%</div>
                  <div className="text-sm text-cyan-50">Minh bạch</div>
                </motion.div>
                <motion.div
                  className="bg-white/20 backdrop-blur-sm rounded-lg p-4"
                  variants={cardVariants}
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  <div className="text-3xl font-bold mb-1">0</div>
                  <div className="text-sm text-cyan-50">Giả mạo</div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="py-16 bg-gradient-to-r from-cyan-600 to-teal-600"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            Bạn Là Doanh Nghiệp Dược Phẩm?
          </motion.h2>
          <motion.p
            className="text-xl text-cyan-50 mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
          >
            Đăng ký ngay để tham gia hệ thống truy xuất nguồn gốc thuốc bằng blockchain
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <Link
                to="/register-business"
                className="px-8 py-3 bg-white text-cyan-600 rounded-lg font-semibold hover:bg-cyan-50 transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl inline-block"
              >
                Đăng Ký Doanh Nghiệp
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <Link
                to="/login"
                className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-all duration-300 ease-in-out inline-block"
              >
                Đăng Nhập
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
