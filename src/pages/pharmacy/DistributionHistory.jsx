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
            className="relative overflow-hidden rounded-2xl mb-6 border border-slate-200 shadow-sm bg-white"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative px-6 py-8 md:px-10 md:py-12">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 mb-2">Lịch sử phân phối</h1>
              <p className="text-slate-600 mt-2 text-lg">Theo dõi toàn bộ lịch sử nhận hàng và phân phối</p>
            </div>
          </motion.section>

      <motion.div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 mb-5" variants={fadeUp} initial="hidden" animate="show">
        <div className="flex flex-col md:flex-row gap-3 md:items-end">
          <div className="flex-1">
            <label className="block text-sm text-slate-700 mb-1 font-medium">Tìm kiếm</label>
            <div className="relative">
              <input
                value={search}
                onChange={e => updateFilter({ search: e.target.value, page: 1 })}
                placeholder="Tìm theo tên thuốc, mã..."
                className="w-full border border-slate-300 bg-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-700 mb-1 font-medium">Trạng thái</label>
            <select
              value={status}
              onChange={e => updateFilter({ status: e.target.value, page: 1 })}
              className="border border-slate-300 bg-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition"
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

      <motion.div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" variants={fadeUp} initial="hidden" animate="show">
        {items.length === 0 ? (
          <div className="bg-white p-10 text-center">
            <div className="text-5xl mb-4 text-slate-800">■</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Chưa có lịch sử phân phối</h3>
            <p className="text-slate-600">Lịch sử nhận hàng sẽ hiển thị ở đây</p>
          </div>
        ) : (
          <div className="space-y-4 p-4">
            {items.map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-800">
                          {item.drugInfo?.commercialName || item.drugName || 'N/A'}
                        </h3>
                        <span className={`px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-slate-600">
                        <div>
                          Số lượng: <span className="font-semibold text-slate-800">{item.quantity}</span>
                        </div>
                        <div>
                          Từ: <span className="font-medium text-slate-800">{item.fromDistributor?.name || 'N/A'}</span>
                        </div>
                        <div>
                          Ngày: <span className="font-medium text-slate-800">{new Date(item.receivedDate || item.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setExpandedItem(expandedItem === idx ? null : idx)}
                      className="ml-4 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition flex items-center gap-2 border border-slate-300"
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
                          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                            <div className="font-semibold text-slate-700 mb-1">Người nhận:</div>
                            <div className="text-slate-800 font-medium">{item.receivedBy}</div>
                          </div>
                        )}
                        {item.deliveryAddress && (
                          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                            <div className="font-semibold text-slate-700 mb-1">Địa chỉ:</div>
                            <div className="text-slate-800 font-medium">{item.deliveryAddress}</div>
                          </div>
                        )}
                        {item.shippingInfo && (
                          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                            <div className="font-semibold text-slate-700 mb-1">Vận chuyển:</div>
                            <div className="text-slate-800 font-medium">{item.shippingInfo}</div>
                          </div>
                        )}
                        {item.transactionHash && (
                          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                            <div className="font-semibold text-slate-700 mb-1">Transaction Hash:</div>
                            <div className="text-slate-800 font-mono text-xs break-all">{item.transactionHash}</div>
                          </div>
                        )}
                      </div>

                      {item.notes && (
                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                          <div className="font-semibold text-slate-800 mb-2">Ghi chú:</div>
                          <div className="text-slate-700 text-sm">{item.notes}</div>
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

      <div className="flex items-center justify-between mt-5 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="text-sm text-slate-600">Tổng {pagination.total} bản ghi</div>
        <div className="flex items-center gap-2">
          <button 
            disabled={page <= 1} 
            onClick={() => updateFilter({ page: page - 1 })} 
            className={`px-3 py-2 rounded-lg ${page <= 1 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-white border border-slate-300 hover:border-slate-400 hover:text-slate-700 transition'}`}
          >
            <svg className="w-5 h-5 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium border border-slate-300">
            {page}
          </span>
          <button 
            disabled={page >= pagination.pages} 
            onClick={() => updateFilter({ page: page + 1 })} 
            className={`px-3 py-2 rounded-lg ${page >= pagination.pages ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-white border border-slate-300 hover:border-slate-400 hover:text-slate-700 transition'}`}
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

