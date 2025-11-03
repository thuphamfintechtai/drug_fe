import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import { getDistributionHistory } from '../../services/distributor/distributorService';

export default function DistributionHistory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });

  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';

  const navigationItems = [
    { path: '/distributor', label: 'Tổng quan', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>), active: false },
    { path: '/distributor/invoices', label: 'Đơn từ nhà SX', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>), active: false },
    { path: '/distributor/transfer-pharmacy', label: 'Chuyển cho NT', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>), active: false },
    { path: '/distributor/distribution-history', label: 'Lịch sử phân phối', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>), active: true },
    { path: '/distributor/transfer-history', label: 'Lịch sử chuyển NT', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>), active: false },
    { path: '/distributor/drugs', label: 'Quản lý thuốc', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>), active: false },
    { path: '/distributor/nft-tracking', label: 'Tra cứu NFT', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>), active: false },
    { path: '/distributor/profile', label: 'Hồ sơ', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>), active: false },
  ];

  useEffect(() => {
    loadData();
  }, [page, search, status]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (status) params.status = status;

      const response = await getDistributionHistory(params);
      if (response.data.success) {
        setItems(response.data.data.distributions || []);
        setPagination(response.data.data.pagination || { page: 1, limit: 10, total: 0, pages: 0 });
      }
    } catch (error) {
      console.error('Lỗi khi tải lịch sử:', error);
    } finally {
      setLoading(false);
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
      confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      transferred: 'bg-purple-100 text-purple-700 border-purple-200',
    };
    return colors[status] || 'bg-slate-100 text-slate-600 border-slate-200';
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <DashboardLayout navigationItems={navigationItems}>
      <motion.section
        className="relative overflow-hidden rounded-2xl mb-6 border border-[#90e0ef33] shadow-[0_10px_30px_rgba(0,0,0,0.06)] bg-gradient-to-tr from-purple-600 via-purple-500 to-pink-500"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.25),transparent_55%)]" />
        <div className="relative px-6 py-8 md:px-10 md:py-12 text-white">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight drop-shadow-sm">📊 Lịch sử phân phối</h1>
          <p className="text-white/90 mt-2">Theo dõi tất cả các lô hàng đã nhận từ nhà sản xuất</p>
        </div>
      </motion.section>

      <motion.div
        className="rounded-2xl bg-white/85 backdrop-blur-xl border border-[#90e0ef55] shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-4 mb-5"
        variants={fadeUp}
        initial="hidden"
        animate="show"
      >
        <div className="flex flex-col md:flex-row gap-3 md:items-end">
          <div className="flex-1">
            <label className="block text-sm text-[#003544]/70 mb-1">Tìm kiếm</label>
            <input
              value={search}
              onChange={e => updateFilter({ search: e.target.value, page: 1 })}
              placeholder="Tìm theo đơn hàng, người gửi..."
              className="w-full border border-[#90e0ef55] bg-white/60 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#48cae4] focus:border-[#48cae4] transition"
            />
          </div>
          <div>
            <label className="block text-sm text-[#003544]/70 mb-1">Trạng thái</label>
            <select
              value={status}
              onChange={e => updateFilter({ status: e.target.value, page: 1 })}
              className="border border-[#90e0ef55] bg-white/60 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#48cae4] focus:border-[#48cae4] transition"
            >
              <option value="">Tất cả</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="transferred">Transferred</option>
            </select>
          </div>
        </div>
      </motion.div>

      <motion.div className="space-y-4" variants={fadeUp} initial="hidden" animate="show">
        {loading ? (
          <div className="bg-white/90 rounded-2xl border border-[#90e0ef55] p-10 text-center text-slate-600">
            Đang tải...
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white/90 rounded-2xl border border-[#90e0ef55] p-10 text-center">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Chưa có lịch sử phân phối</h3>
            <p className="text-slate-600">Lịch sử nhận hàng từ nhà sản xuất sẽ hiển thị ở đây</p>
          </div>
        ) : (
          items.map((item, idx) => (
            <div key={idx} className="bg-white/90 backdrop-blur-xl rounded-2xl border border-[#90e0ef55] shadow-[0_10px_24px_rgba(0,0,0,0.05)] overflow-hidden hover:shadow-lg transition">
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-[#003544]">
                        Từ: {item.invoice?.fromManufacturer?.fullName || 'N/A'}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-slate-600">
                      <div>📦 Đơn hàng: <span className="font-mono font-medium text-slate-800">{item.invoice?.invoiceNumber}</span></div>
                      <div>💊 Số lượng: <span className="font-bold text-purple-700">{item.distributedQuantity} NFT</span></div>
                      <div>📍 Địa chỉ: <span className="font-medium">{item.deliveryAddress}</span></div>
                      <div>🕒 Ngày nhận: <span className="font-medium">{new Date(item.distributionDate).toLocaleString('vi-VN')}</span></div>
                    </div>
                  </div>
                </div>

                {item.receivedBy && (
                  <div className="bg-cyan-50 rounded-xl p-3 border border-cyan-200 text-sm mb-3">
                    <div className="font-semibold text-cyan-800 mb-1">👤 Người nhận:</div>
                    <div className="text-cyan-700">{item.receivedBy}</div>
                  </div>
                )}

                {item.shippingInfo && (
                  <div className="bg-blue-50 rounded-xl p-3 border border-blue-200 text-sm mb-3">
                    <div className="font-semibold text-blue-800 mb-1">🚚 Thông tin vận chuyển:</div>
                    <div className="text-blue-700">{item.shippingInfo}</div>
                  </div>
                )}

                {item.notes && (
                  <div className="bg-slate-50 rounded-xl p-3 text-sm">
                    <div className="font-semibold text-slate-700 mb-1">📝 Ghi chú:</div>
                    <div className="text-slate-600">{item.notes}</div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </motion.div>

      <div className="flex items-center justify-between mt-5">
        <div className="text-sm text-slate-600">
          Hiển thị {items.length} / {pagination.total} lô phân phối
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => updateFilter({ page: page - 1 })}
            className={`px-3 py-2 rounded-xl ${page <= 1 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-white/90 border border-[#90e0ef55] hover:bg-[#f5fcff]'}`}
          >
            Trước
          </button>
          <span className="text-sm text-slate-700">
            Trang {page} / {pagination.pages || 1}
          </span>
          <button
            disabled={page >= pagination.pages}
            onClick={() => updateFilter({ page: page + 1 })}
            className={`px-3 py-2 rounded-xl ${page >= pagination.pages ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'text-white bg-gradient-to-r from-[#00b4d8] via-[#48cae4] to-[#90e0ef] shadow-[0_10px_24px_rgba(0,180,216,0.30)] hover:shadow-[0_14px_36px_rgba(0,180,216,0.40)]'}`}
          >
            Sau
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

