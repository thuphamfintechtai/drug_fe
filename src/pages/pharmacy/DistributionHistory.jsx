import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import pharmacyService from '../../services/pharmacy/pharmacyService';
import TruckLoader from '../../components/TruckLoader';

export default function DistributionHistory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const progressIntervalRef = useRef(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [expandedItem, setExpandedItem] = useState(null);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';

  const navigationItems = [
    { path: '/pharmacy', label: 'Tổng quan', active: false },
    { path: '/pharmacy/invoices', label: 'Đơn từ NPP', active: false },
    { path: '/pharmacy/distribution-history', label: 'Lịch sử phân phối', active: true },
    { path: '/pharmacy/drugs', label: 'Quản lý thuốc', active: false },
    { path: '/pharmacy/nft-tracking', label: 'Tra cứu NFT', active: false },
    { path: '/pharmacy/profile', label: 'Hồ sơ', active: false },
  ];

  useEffect(() => {
    loadData();
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [page, search, status]);

  const loadData = async () => {
    try {
      setLoading(true);
      setLoadingProgress(0);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      // Tăng dần tiến trình đến 90% trong lúc chờ API
      progressIntervalRef.current = setInterval(() => {
        setLoadingProgress(prev => (prev < 0.9 ? Math.min(prev + 0.02, 0.9) : prev));
      }, 50);

      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (status) params.status = status;

      const response = await pharmacyService.getDistributionHistory(params);
      if (response.data.success) {
        setItems(response.data.data.history || []);
        setPagination(response.data.data.pagination || { page: 1, limit: 10, total: 0, pages: 0 });
      }
    } catch (error) {
      console.error('Lỗi khi tải lịch sử:', error);
    } finally {
      // Đưa tiến trình tới 100% và dừng interval trước khi hiển thị
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      let current = 0;
      setLoadingProgress(p => { current = p; return p; });
      if (current < 0.9) {
        await new Promise(resolve => {
          const speedUp = setInterval(() => {
            setLoadingProgress(prev => {
              if (prev < 1) {
                const next = Math.min(prev + 0.15, 1);
                if (next >= 1) { clearInterval(speedUp); resolve(); }
                return next;
              }
              clearInterval(speedUp); resolve(); return 1;
            });
          }, 30);
          setTimeout(() => { clearInterval(speedUp); setLoadingProgress(1); resolve(); }, 500);
        });
      } else {
        setLoadingProgress(1);
        await new Promise(r => setTimeout(r, 200));
      }
      await new Promise(r => setTimeout(r, 100));
      setLoading(false);
      setTimeout(() => setLoadingProgress(0), 500);
    }
  };

  const updateFilter = (next) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([k, v]) => {
      if (v === '' || v === undefined || v === null) nextParams.delete(k);
      else nextParams.set(k, String(v));
    });
    setSearchParams(nextParams);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      sent: 'bg-cyan-100 text-cyan-700 border-cyan-200',
      received: 'bg-blue-100 text-blue-700 border-blue-200',
      confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      paid: 'bg-green-100 text-green-700 border-green-200',
      sold: 'bg-purple-100 text-purple-700 border-purple-200',
      in_stock: 'bg-blue-100 text-blue-700 border-blue-200',
      expired: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[status] || 'bg-slate-100 text-slate-600 border-slate-200';
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <DashboardLayout navigationItems={navigationItems}>
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="w-full max-w-2xl">
            <TruckLoader height={72} progress={loadingProgress} showTrack />
          </div>
          <div className="text-lg text-slate-600 mt-6">Đang tải dữ liệu...</div>
        </div>
      ) : (
        <>
          <motion.section
            className="relative overflow-hidden rounded-2xl mb-6 border border-[#7AC3DE] shadow-[0_10px_30px_rgba(75,173,209,0.15)] bg-white"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative px-6 py-8 md:px-10 md:py-12">
              <div className="flex items-center gap-3 mb-2">
                <svg className="w-8 h-8 text-[#4BADD1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#4BADD1]">Lịch sử phân phối</h1>
              </div>
              <p className="text-[#7AC3DE] mt-2 text-lg flex items-center gap-2">
                <svg className="w-5 h-5 text-[#7AC3DE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Theo dõi toàn bộ lịch sử nhận hàng và phân phối
              </p>
            </div>
          </motion.section>

      <motion.div className="rounded-2xl bg-white border-2 border-[#4BADD1] shadow-[0_4px_12px_rgba(75,173,209,0.12)] p-4 mb-5" variants={fadeUp} initial="hidden" animate="show">
        <div className="flex flex-col md:flex-row gap-3 md:items-end">
          <div className="flex-1">
            <label className="block text-sm text-slate-700 mb-1 font-medium flex items-center gap-2">
              <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Tìm kiếm
            </label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={search}
                onChange={e => updateFilter({ search: e.target.value, page: 1 })}
                placeholder="Tìm theo tên thuốc, mã..."
                className="w-full border-2 border-slate-200 bg-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#4BADD1] focus:border-[#4BADD1] transition"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-700 mb-1 font-medium flex items-center gap-2">
              <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Trạng thái
            </label>
            <select
              value={status}
              onChange={e => updateFilter({ status: e.target.value, page: 1 })}
              className="border-2 border-slate-200 bg-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#4BADD1] focus:border-[#4BADD1] transition"
            >
              <option value="">Tất cả</option>
              <option value="pending">Pending</option>
              <option value="received">Received</option>
              <option value="confirmed">Confirmed</option>
              <option value="sold">Sold</option>
              <option value="in_stock">In Stock</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
      </motion.div>

      <motion.div className="bg-white rounded-2xl border-2 border-[#7AC3DE] shadow-[0_4px_12px_rgba(122,195,222,0.12)] overflow-hidden" variants={fadeUp} initial="hidden" animate="show">
        {items.length === 0 ? (
          <div className="bg-white p-10 text-center">
            <div className="text-5xl mb-4 text-slate-800">■</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Chưa có lịch sử phân phối</h3>
            <p className="text-slate-600">Lịch sử nhận hàng sẽ hiển thị ở đây</p>
          </div>
        ) : (
          <div className="space-y-4 p-4">
            {items.map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl border-2 border-slate-200 shadow-sm overflow-hidden hover:shadow-md hover:border-[#4BADD1] transition">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-800">
                          {item.drugInfo?.commercialName || item.drugName || 'N/A'}
                        </h3>
                        <span className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-[#4BADD1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                          </svg>
                          Số lượng: <span className="font-bold text-[#4BADD1]">{item.quantity}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-[#4BADD1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          Từ: <span className="font-medium">{item.fromDistributor?.name || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-[#4BADD1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Ngày: <span className="font-medium">{new Date(item.receivedDate || item.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setExpandedItem(expandedItem === idx ? null : idx)}
                      className="ml-4 px-4 py-2 rounded-lg bg-[#4BADD1] hover:bg-[#7AC3DE] text-white text-sm font-medium transition flex items-center gap-2"
                    >
                      {expandedItem === idx ? (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                          Thu gọn
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                          Chi tiết
                        </>
                      )}
                    </button>
                  </div>

                  {expandedItem === idx && (
                    <div className="mt-4 pt-4 border-t-2 border-slate-200 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {item.receivedBy && (
                          <div className="bg-slate-100 rounded-lg p-4 border border-slate-200">
                            <div className="font-semibold text-slate-700 mb-1 flex items-center gap-2">
                              <svg className="w-4 h-4 text-[#4BADD1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              Người nhận:
                            </div>
                            <div className="text-slate-800 font-medium">{item.receivedBy}</div>
                          </div>
                        )}
                        {item.deliveryAddress && (
                          <div className="bg-slate-100 rounded-lg p-4 border border-slate-200">
                            <div className="font-semibold text-slate-700 mb-1 flex items-center gap-2">
                              <svg className="w-4 h-4 text-[#4BADD1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              Địa chỉ:
                            </div>
                            <div className="text-slate-800 font-medium">{item.deliveryAddress}</div>
                          </div>
                        )}
                        {item.shippingInfo && (
                          <div className="bg-slate-100 rounded-lg p-4 border border-slate-200">
                            <div className="font-semibold text-slate-700 mb-1 flex items-center gap-2">
                              <svg className="w-4 h-4 text-[#4BADD1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                              </svg>
                              Vận chuyển:
                            </div>
                            <div className="text-slate-800 font-medium">{item.shippingInfo}</div>
                          </div>
                        )}
                        {item.transactionHash && (
                          <div className="bg-slate-100 rounded-lg p-4 border border-slate-200">
                            <div className="font-semibold text-slate-700 mb-1 flex items-center gap-2">
                              <svg className="w-4 h-4 text-[#4BADD1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              Transaction Hash:
                            </div>
                            <div className="text-slate-800 font-mono text-xs break-all">{item.transactionHash}</div>
                          </div>
                        )}
                      </div>

                      {item.notes && (
                        <div className="bg-amber-50 rounded-lg p-4 border-2 border-amber-200">
                          <div className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Ghi chú:
                          </div>
                          <div className="text-amber-700 text-sm">{item.notes}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <div className="flex items-center justify-between mt-5 bg-white p-4 rounded-2xl border-2 border-[#7AC3DE]">
        <div className="text-sm text-slate-600">Tổng {pagination.total} bản ghi</div>
        <div className="flex items-center gap-2">
          <button 
            disabled={page <= 1} 
            onClick={() => updateFilter({ page: page - 1 })} 
            className={`px-3 py-2 rounded-lg ${page <= 1 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-white border-2 border-slate-300 hover:border-[#4BADD1] hover:text-[#4BADD1] transition'}`}
          >
            <svg className="w-5 h-5 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="px-4 py-2 rounded-lg bg-[#4BADD1] text-white text-sm font-medium">
            {page}
          </span>
          <button 
            disabled={page >= pagination.pages} 
            onClick={() => updateFilter({ page: page + 1 })} 
            className={`px-3 py-2 rounded-lg ${page >= pagination.pages ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-white border-2 border-slate-300 hover:border-[#4BADD1] hover:text-[#4BADD1] transition'}`}
          >
            <svg className="w-5 h-5 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
        </>
      )}
    </DashboardLayout>
  );
}

