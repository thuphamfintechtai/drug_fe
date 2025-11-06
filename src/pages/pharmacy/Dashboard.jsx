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
          {/* Header banner */}
          <div className="bg-white rounded-xl border border-cyan-200 shadow-sm p-5 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-[#007b91] flex items-center gap-2">
                Quản lý nhà thuốc
              </h1>
              <p className="text-slate-500 text-sm mt-1">Tổng quan hệ thống và các chức năng chính</p>
            </div>
            
            {/* Refresh Button */}
            <button 
              onClick={loadStats}
              disabled={loading}
              className="p-2.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 transition disabled:opacity-50"
              title="Làm mới dữ liệu"
            >
              <svg 
                className={`w-5 h-5 text-cyan-600 transition-transform ${loading ? 'animate-spin' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {stats ? (
            <div className="space-y-8">
              {/* Thống kê đơn hàng */}
              <motion.div variants={fadeUp} initial="hidden" animate="show">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Đơn hàng từ nhà phân phối</h2>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <Link
                    to="/pharmacy/invoices"
                    className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-transform hover:scale-[1.02]"
                  >
                    <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-blue-400 to-cyan-400 rounded-t-2xl" />
                    <div className="p-5 pt-7 text-center">
                      <div className="text-sm text-slate-600 mb-1">Tổng đơn nhận</div>
                      <div className="text-3xl font-bold text-blue-600">{stats?.invoices?.total || 0}</div>
                      <div className="text-xs text-slate-500 mt-2">Đơn hàng</div>
                    </div>
                  </Link>

                  <Link
                    to="/pharmacy/invoices?status=pending"
                    className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-transform hover:scale-[1.02]"
                  >
                    <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-amber-400 to-yellow-400 rounded-t-2xl" />
                    <div className="p-5 pt-7 text-center">
                      <div className="text-sm text-slate-600 mb-1">Chờ nhận</div>
                      <div className="text-3xl font-bold text-amber-600">{stats?.invoices?.pending || 0}</div>
                      <div className="text-xs text-slate-500 mt-2">Đang chờ</div>
                    </div>
                  </Link>

                  <Link
                    to="/pharmacy/invoices?status=received"
                    className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-transform hover:scale-[1.02]"
                  >
                    <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-emerald-400 to-green-400 rounded-t-2xl" />
                    <div className="p-5 pt-7 text-center">
                      <div className="text-sm text-slate-600 mb-1">Đã nhận</div>
                      <div className="text-3xl font-bold text-emerald-600">{stats?.invoices?.received || 0}</div>
                      <div className="text-xs text-slate-500 mt-2">Đã xác nhận</div>
                    </div>
                  </Link>

                  <Link
                    to="/pharmacy/invoices?status=paid"
                    className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-transform hover:scale-[1.02]"
                  >
                    <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-green-400 to-emerald-400 rounded-t-2xl" />
                    <div className="p-5 pt-7 text-center">
                      <div className="text-sm text-slate-600 mb-1">Đã thanh toán</div>
                      <div className="text-3xl font-bold text-green-600">{stats?.invoices?.paid || 0}</div>
                      <div className="text-xs text-slate-500 mt-2">Hoàn tất</div>
                    </div>
                  </Link>
                </div>
              </motion.div>

              {/* Thống kê thuốc & NFT */}
              <motion.div variants={fadeUp} initial="hidden" animate="show">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Thuốc & NFT</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Link
                    to="/pharmacy/drugs"
                    className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-transform hover:scale-[1.02]"
                  >
                    <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-blue-400 to-cyan-400 rounded-t-2xl" />
                    <div className="p-5 pt-7 text-center">
                      <div className="text-sm text-slate-600 mb-1">Tổng số thuốc</div>
                      <div className="text-3xl font-bold text-blue-600">{stats?.drugs?.total || 0}</div>
                      <div className="text-xs text-slate-500 mt-2">Loại thuốc</div>
                    </div>
                  </Link>

                  <Link
                    to="/pharmacy/drugs"
                    className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-transform hover:scale-[1.02]"
                  >
                    <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-cyan-400 to-sky-400 rounded-t-2xl" />
                    <div className="p-5 pt-7 text-center">
                      <div className="text-sm text-slate-600 mb-1">Tổng NFT</div>
                      <div className="text-3xl font-bold text-cyan-600">{stats?.nfts?.total || 0}</div>
                      <div className="text-xs text-slate-500 mt-2">Token đã nhận</div>
                    </div>
                  </Link>

                  <Link
                    to="/pharmacy/drugs"
                    className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-transform hover:scale-[1.02]"
                  >
                    <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-emerald-400 to-green-400 rounded-t-2xl" />
                    <div className="p-5 pt-7 text-center">
                      <div className="text-sm text-slate-600 mb-1">NFT Available</div>
                      <div className="text-3xl font-bold text-emerald-600">{stats?.nfts?.available || 0}</div>
                      <div className="text-xs text-slate-500 mt-2">Có sẵn</div>
                    </div>
                  </Link>
                </div>
              </motion.div>

              {/* Thống kê phân phối */}
              <motion.div variants={fadeUp} initial="hidden" animate="show">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Phân phối</h2>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <Link
                    to="/pharmacy/distribution-history"
                    className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-transform hover:scale-[1.02]"
                  >
                    <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-purple-400 to-pink-400 rounded-t-2xl" />
                    <div className="p-5 pt-7 text-center">
                      <div className="text-sm text-slate-600 mb-1">Tổng phân phối</div>
                      <div className="text-3xl font-bold text-purple-600">{stats?.distributions?.total || 0}</div>
                      <div className="text-xs text-slate-500 mt-2">Giao dịch</div>
                    </div>
                  </Link>

                  <Link
                    to="/pharmacy/distribution-history"
                    className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-transform hover:scale-[1.02]"
                  >
                    <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-green-400 to-emerald-400 rounded-t-2xl" />
                    <div className="p-5 pt-7 text-center">
                      <div className="text-sm text-slate-600 mb-1">Đã bán</div>
                      <div className="text-3xl font-bold text-green-600">{stats?.distributions?.sold || 0}</div>
                      <div className="text-xs text-slate-500 mt-2">Đã xuất</div>
                    </div>
                  </Link>

                  <Link
                    to="/pharmacy/distribution-history"
                    className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-transform hover:scale-[1.02]"
                  >
                    <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-blue-400 to-cyan-400 rounded-t-2xl" />
                    <div className="p-5 pt-7 text-center">
                      <div className="text-sm text-slate-600 mb-1">Tồn kho</div>
                      <div className="text-3xl font-bold text-blue-600">{stats?.distributions?.inStock || 0}</div>
                      <div className="text-xs text-slate-500 mt-2">Còn lại</div>
                    </div>
                  </Link>

                  <Link
                    to="/pharmacy/distribution-history"
                    className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-transform hover:scale-[1.02]"
                  >
                    <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-rose-400 to-red-400 rounded-t-2xl" />
                    <div className="p-5 pt-7 text-center">
                      <div className="text-sm text-slate-600 mb-1">Hết hạn</div>
                      <div className="text-3xl font-bold text-rose-600">{stats?.distributions?.expired || 0}</div>
                      <div className="text-xs text-slate-500 mt-2">Quá hạn</div>
                    </div>
                  </Link>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="text-center py-20 text-slate-500">
              Không có dữ liệu
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
