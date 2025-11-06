import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import TruckLoader from '../../components/TruckLoader';
import pharmacyService from '../../services/pharmacy/pharmacyService';

export default function PharmacyDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const progressIntervalRef = useRef(null);

  useEffect(() => {
    loadStats();
    
    return () => {
      // Cleanup progress interval nếu có
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setLoadingProgress(0);
      
      // Clear interval cũ nếu có
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      
      // Simulate progress từ 0 đến 90% trong khi đang load
      progressIntervalRef.current = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev < 0.9) {
            return Math.min(prev + 0.02, 0.9);
          }
          return prev;
        });
      }, 50);
      
      const response = await pharmacyService.getStatistics();
      
      // Clear interval khi có response
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      
      // Xử lý data trước
      if (response.data.success) {
        setStats(response.data.data);
      }
      
      // Nếu xe chưa chạy hết (progress < 0.9), tăng tốc cùng một chiếc xe để chạy đến 100%
      let currentProgress = 0;
      setLoadingProgress(prev => {
        currentProgress = prev;
        return prev;
      });
      
      // Đảm bảo xe chạy đến 100% trước khi hiển thị page
      if (currentProgress < 0.9) {
        // Tăng tốc độ nhanh để cùng một chiếc xe chạy đến 100%
        await new Promise(resolve => {
          const speedUpInterval = setInterval(() => {
            setLoadingProgress(prev => {
              if (prev < 1) {
                const newProgress = Math.min(prev + 0.15, 1);
                if (newProgress >= 1) {
                  clearInterval(speedUpInterval);
                  resolve();
                }
                return newProgress;
              }
              clearInterval(speedUpInterval);
              resolve();
              return 1;
            });
          }, 30);
          
          // Safety timeout
          setTimeout(() => {
            clearInterval(speedUpInterval);
            setLoadingProgress(1);
            resolve();
          }, 500);
        });
      } else {
        setLoadingProgress(1);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Đảm bảo progress đã đạt 100% trước khi tiếp tục
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      // Clear interval khi có lỗi
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      
      console.error('Lỗi khi tải thống kê:', error);
      setLoadingProgress(0);
    } finally {
      setLoading(false);
      // Reset progress sau 0.5s
      setTimeout(() => {
        setLoadingProgress(0);
      }, 500);
    }
  };

  const navigationItems = [
    { path: '/pharmacy', label: 'Tổng quan', active: true },
    { path: '/pharmacy/invoices', label: 'Đơn từ NPP', active: false },
    { path: '/pharmacy/distribution-history', label: 'Lịch sử phân phối', active: false },
    { path: '/pharmacy/drugs', label: 'Quản lý thuốc', active: false },
    { path: '/pharmacy/nft-tracking', label: 'Tra cứu NFT', active: false },
    { path: '/pharmacy/profile', label: 'Hồ sơ', active: false },
  ];

  const fadeUp = {
    hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <DashboardLayout navigationItems={navigationItems}>
      {/* Loading State - chỉ hiển thị khi đang tải, không hiển thị content cho đến khi loading = false */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="w-full max-w-2xl">
            <TruckLoader height={72} progress={loadingProgress} showTrack />
          </div>
          <div className="text-lg text-slate-600 mt-6">Đang tải dữ liệu...</div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Banner */}
          <motion.section
            className="relative overflow-hidden rounded-3xl mb-8 border-2 border-[#4BADD1] shadow-[0_8px_24px_rgba(75,173,209,0.2)] bg-[#4BADD1]"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative px-8 py-10 md:px-12 md:py-14">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-3">Tổng quan nhà thuốc</h1>
              <p className="text-white text-xl font-medium">Quản lý nhận hàng và phân phối thuốc</p>
            </div>
          </motion.section>
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <div className="bg-white rounded-xl border border-slate-300 shadow-md overflow-hidden">
            {/* Header màu xanh nhạt */}
            <div className="bg-[#4BADD1] px-4 py-3">
              <h2 className="text-lg font-bold text-white">Tổng quan thống kê</h2>
            </div>

            {/* Nội dung thống kê */}
            <div className="p-4 grid grid-cols-3 gap-4">
              {/* Đơn hàng từ nhà phân phối */}
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col h-full hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-pointer">
                <div className="bg-gradient-to-r from-[#4BADD1] to-[#7AC3DE] px-3 py-2 flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-sm font-semibold text-white text-center leading-none">Đơn hàng từ nhà phân phối</h3>
                </div>
                <div className="p-3 space-y-2 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-800 font-medium">Tổng đơn nhận</div>
                    <div className="text-xl font-bold text-blue-600">{stats?.invoices?.total || 0}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-800 font-medium">Chờ nhận</div>
                    <div className="text-xl font-bold text-orange-600">{stats?.invoices?.pending || 0}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-800 font-medium">Đã nhận</div>
                    <div className="text-xl font-bold text-green-600">{stats?.invoices?.received || 0}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-800 font-medium">Đã thanh toán</div>
                    <div className="text-xl font-bold text-green-600">{stats?.invoices?.paid || 0}</div>
                  </div>
                </div>
                <div className="px-3 pb-3 mt-auto">
                  <Link
                    to="/pharmacy/invoices"
                    className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-[#4BADD1] to-[#7AC3DE] text-white text-xs font-semibold text-center hover:from-[#7AC3DE] hover:to-[#4BADD1] shadow-sm hover:shadow-md transition-all block"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>

              {/* Thuốc & NFT */}
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col h-full hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-pointer">
                <div className="bg-gradient-to-r from-[#4BADD1] to-[#7AC3DE] px-3 py-2 flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  <h3 className="text-sm font-semibold text-white text-center leading-none">Thuốc & NFT</h3>
                </div>
                <div className="p-3 space-y-2 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-800 font-medium">Tổng số thuốc</div>
                    <div className="text-xl font-bold text-blue-600">{stats?.drugs?.total || 0}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-800 font-medium">Tổng NFT</div>
                    <div className="text-xl font-bold text-blue-600">{stats?.nfts?.total || 0}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-800 font-medium">NFT Available</div>
                    <div className="text-xl font-bold text-green-600">{stats?.nfts?.available || 0}</div>
                  </div>
                </div>
                <div className="px-3 pb-3 mt-auto">
                  <Link
                    to="/pharmacy/drugs"
                    className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-[#4BADD1] to-[#7AC3DE] text-white text-xs font-semibold text-center hover:from-[#7AC3DE] hover:to-[#4BADD1] shadow-sm hover:shadow-md transition-all block"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>

              {/* Phân phối */}
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col h-full hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-pointer">
                <div className="bg-gradient-to-r from-[#4BADD1] to-[#7AC3DE] px-3 py-2 flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <h3 className="text-sm font-semibold text-white text-center leading-none">Phân phối</h3>
                </div>
                <div className="p-3 space-y-2 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-800 font-medium">Tổng phân phối</div>
                    <div className="text-xl font-bold text-blue-600">{stats?.distributions?.total || 0}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-800 font-medium">Đã bán</div>
                    <div className="text-xl font-bold text-green-600">{stats?.distributions?.sold || 0}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-800 font-medium">Tồn kho</div>
                    <div className="text-xl font-bold text-blue-600">{stats?.distributions?.inStock || 0}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-800 font-medium">Hết hạn</div>
                    <div className="text-xl font-bold text-red-600">{stats?.distributions?.expired || 0}</div>
                  </div>
                </div>
                <div className="px-3 pb-3 mt-auto">
                  <Link
                    to="/pharmacy/distribution-history"
                    className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-[#4BADD1] to-[#7AC3DE] text-white text-xs font-semibold text-center hover:from-[#7AC3DE] hover:to-[#4BADD1] shadow-sm hover:shadow-md transition-all block"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
