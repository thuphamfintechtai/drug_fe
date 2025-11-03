import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import pharmacyService from '../../services/pharmacy/pharmacyService';

export default function DistributionHistory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
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
  }, [page, search, status]);

  const loadData = async () => {
    setLoading(true);
    try {
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
      <motion.section
        className="relative overflow-hidden rounded-2xl mb-6 border border-[#90e0ef33] shadow-[0_10px_30px_rgba(0,0,0,0.06)] bg-gradient-to-tr from-purple-600 via-pink-500 to-rose-500"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.25),transparent_55%)]" />
        <div className="relative px-6 py-8 md:px-10 md:py-12 text-white">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight drop-shadow-sm">📊 Lịch sử phân phối</h1>
          <p className="text-white/90 mt-2">Theo dõi toàn bộ lịch sử nhận hàng và phân phối</p>
        </div>
      </motion.section>

      <motion.div className="rounded-2xl bg-white/85 backdrop-blur-xl border border-[#90e0ef55] shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-4 mb-5" variants={fadeUp} initial="hidden" animate="show">
        <div className="flex flex-col md:flex-row gap-3 md:items-end">
          <div className="flex-1">
            <label className="block text-sm text-[#003544]/70 mb-1">Tìm kiếm</label>
            <input
              value={search}
              onChange={e => updateFilter({ search: e.target.value, page: 1 })}
              placeholder="Tìm theo tên thuốc, mã..."
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
              <option value="received">Received</option>
              <option value="confirmed">Confirmed</option>
              <option value="sold">Sold</option>
              <option value="in_stock">In Stock</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
      </motion.div>

      <motion.div className="space-y-4" variants={fadeUp} initial="hidden" animate="show">
        {loading ? (
          <div className="bg-white/90 rounded-2xl border border-[#90e0ef55] p-10 text-center text-slate-600">Đang tải...</div>
        ) : items.length === 0 ? (
          <div className="bg-white/90 rounded-2xl border border-[#90e0ef55] p-10 text-center">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Chưa có lịch sử phân phối</h3>
            <p className="text-slate-600">Lịch sử nhận hàng sẽ hiển thị ở đây</p>
          </div>
        ) : (
          items.map((item, idx) => (
            <div key={idx} className="bg-white/90 backdrop-blur-xl rounded-2xl border border-[#90e0ef55] shadow-[0_10px_24px_rgba(0,0,0,0.05)] overflow-hidden hover:shadow-lg transition">
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-[#003544]">
                        {item.drugInfo?.commercialName || item.drugName || 'N/A'}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-slate-600">
                      <div>📦 Số lượng: <span className="font-bold text-emerald-700">{item.quantity}</span></div>
                      <div>🏢 Từ: <span className="font-medium">{item.fromDistributor?.name || 'N/A'}</span></div>
                      <div>🕒 Ngày: <span className="font-medium">{new Date(item.receivedDate || item.createdAt).toLocaleDateString('vi-VN')}</span></div>
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedItem(expandedItem === idx ? null : idx)}
                    className="ml-4 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition"
                  >
                    {expandedItem === idx ? '▲ Thu gọn' : '▼ Chi tiết'}
                  </button>
                </div>

                {expandedItem === idx && (
                  <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {item.receivedBy && (
                        <div className="bg-slate-50 rounded-lg p-3">
                          <div className="font-semibold text-slate-700">👤 Người nhận:</div>
                          <div className="text-slate-600">{item.receivedBy}</div>
                        </div>
                      )}
                      {item.deliveryAddress && (
                        <div className="bg-slate-50 rounded-lg p-3">
                          <div className="font-semibold text-slate-700">📍 Địa chỉ:</div>
                          <div className="text-slate-600">{item.deliveryAddress}</div>
                        </div>
                      )}
                      {item.shippingInfo && (
                        <div className="bg-slate-50 rounded-lg p-3">
                          <div className="font-semibold text-slate-700">🚚 Vận chuyển:</div>
                          <div className="text-slate-600">{item.shippingInfo}</div>
                        </div>
                      )}
                      {item.transactionHash && (
                        <div className="bg-slate-50 rounded-lg p-3">
                          <div className="font-semibold text-slate-700">🔗 Transaction:</div>
                          <div className="text-slate-600 font-mono text-xs truncate">{item.transactionHash}</div>
                        </div>
                      )}
                    </div>

                    {item.notes && (
                      <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                        <div className="font-semibold text-amber-800 mb-1">📝 Ghi chú:</div>
                        <div className="text-amber-700 text-sm">{item.notes}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </motion.div>

      <div className="flex items-center justify-between mt-5">
        <div className="text-sm text-slate-600">Hiển thị {items.length} / {pagination.total} bản ghi</div>
        <div className="flex items-center gap-2">
          <button disabled={page <= 1} onClick={() => updateFilter({ page: page - 1 })} className={`px-3 py-2 rounded-xl ${page <= 1 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-white/90 border border-[#90e0ef55] hover:bg-[#f5fcff]'}`}>Trước</button>
          <span className="text-sm text-slate-700">Trang {page} / {pagination.pages || 1}</span>
          <button disabled={page >= pagination.pages} onClick={() => updateFilter({ page: page + 1 })} className={`px-3 py-2 rounded-xl ${page >= pagination.pages ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'text-white bg-gradient-to-r from-[#00b4d8] via-[#48cae4] to-[#90e0ef] shadow-[0_10px_24px_rgba(0,180,216,0.30)]'}`}>Sau</button>
        </div>
      </div>
    </DashboardLayout>
  );
}

