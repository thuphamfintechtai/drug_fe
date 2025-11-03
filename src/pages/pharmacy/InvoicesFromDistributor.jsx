import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import pharmacyService from '../../services/pharmacy/pharmacyService';

export default function InvoicesFromDistributor() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [confirmForm, setConfirmForm] = useState({
    receivedBy: '',
    deliveryAddress: '',
    shippingInfo: '',
    notes: '',
    receivedDate: new Date().toISOString().split('T')[0],
    receivedQuantity: '',
  });

  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';

  const navigationItems = [
    { path: '/pharmacy', label: 'Tổng quan', active: false },
    { path: '/pharmacy/invoices', label: 'Đơn từ NPP', active: true },
    { path: '/pharmacy/distribution-history', label: 'Lịch sử phân phối', active: false },
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

      const response = await pharmacyService.getInvoicesFromDistributor(params);
      if (response.data.success) {
        setItems(response.data.data.invoices || []);
        setPagination(response.data.data.pagination || { page: 1, limit: 10, total: 0, pages: 0 });
      }
    } catch (error) {
      console.error('Lỗi khi tải đơn hàng:', error);
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

  const handleOpenConfirm = (invoice) => {
    setSelectedInvoice(invoice);
    setConfirmForm({
      receivedBy: '',
      deliveryAddress: '',
      shippingInfo: '',
      notes: '',
      receivedDate: new Date().toISOString().split('T')[0],
      receivedQuantity: invoice.quantity?.toString() || '',
    });
    setShowConfirmDialog(true);
  };

  const handleConfirmReceipt = async () => {
    if (!selectedInvoice) return;
    if (!confirmForm.receivedBy || !confirmForm.deliveryAddress) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    setLoading(true);
    try {
      const response = await pharmacyService.confirmReceipt({
        invoiceId: selectedInvoice._id,
        ...confirmForm,
        receivedQuantity: parseInt(confirmForm.receivedQuantity),
      });

      if (response.data.success) {
        alert('✅ Xác nhận nhận hàng thành công!\n\nTrạng thái: Đang chờ Distributor xác nhận chuyển quyền sở hữu NFT.');
        setShowConfirmDialog(false);
        loadData();
      }
    } catch (error) {
      console.error('Lỗi:', error);
      alert('❌ Không thể xác nhận: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      sent: 'bg-cyan-100 text-cyan-700 border-cyan-200',
      received: 'bg-blue-100 text-blue-700 border-blue-200',
      confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      paid: 'bg-green-100 text-green-700 border-green-200',
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
        className="relative overflow-hidden rounded-2xl mb-6 border border-[#90e0ef33] shadow-[0_10px_30px_rgba(0,0,0,0.06)] bg-gradient-to-tr from-emerald-600 via-green-500 to-teal-500"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.25),transparent_55%)]" />
        <div className="relative px-6 py-8 md:px-10 md:py-12 text-white">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight drop-shadow-sm">📦 Đơn hàng từ nhà phân phối</h1>
          <p className="text-white/90 mt-2">Xem và xác nhận nhận hàng từ distributor</p>
        </div>
      </motion.section>

      <motion.div className="rounded-2xl bg-white/85 backdrop-blur-xl border border-[#90e0ef55] shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-4 mb-5" variants={fadeUp} initial="hidden" animate="show">
        <div className="flex flex-col md:flex-row gap-3 md:items-end">
          <div className="flex-1">
            <label className="block text-sm text-[#003544]/70 mb-1">Tìm kiếm</label>
            <input
              value={search}
              onChange={e => updateFilter({ search: e.target.value, page: 1 })}
              placeholder="Tìm theo số đơn..."
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
              <option value="sent">Sent</option>
              <option value="received">Received</option>
              <option value="confirmed">Confirmed</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>
      </motion.div>

      <motion.div className="space-y-4" variants={fadeUp} initial="hidden" animate="show">
        {loading ? (
          <div className="bg-white/90 rounded-2xl border border-[#90e0ef55] p-10 text-center text-slate-600">Đang tải...</div>
        ) : items.length === 0 ? (
          <div className="bg-white/90 rounded-2xl border border-[#90e0ef55] p-10 text-center">
            <div className="text-5xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Chưa có đơn hàng nào</h3>
            <p className="text-slate-600">Đơn hàng từ nhà phân phối sẽ hiển thị ở đây</p>
          </div>
        ) : (
          items.map((item, idx) => (
            <div key={idx} className="bg-white/90 backdrop-blur-xl rounded-2xl border border-[#90e0ef55] shadow-[0_10px_24px_rgba(0,0,0,0.05)] overflow-hidden hover:shadow-lg transition">
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-[#003544]">Từ: {item.fromDistributor?.name || 'N/A'}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-slate-600">
                      <div>📦 Số lượng: <span className="font-bold text-emerald-700">{item.quantity} NFT</span></div>
                      <div>🕒 Ngày tạo: <span className="font-medium">{new Date(item.createdAt).toLocaleString('vi-VN')}</span></div>
                    </div>
                  </div>

                  {item.status === 'sent' && (
                    <button
                      onClick={() => handleOpenConfirm(item)}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700 text-sm font-medium transition shadow"
                    >
                      ✅ Xác nhận nhận hàng
                    </button>
                  )}
                </div>

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
        <div className="text-sm text-slate-600">Hiển thị {items.length} / {pagination.total} đơn hàng</div>
        <div className="flex items-center gap-2">
          <button disabled={page <= 1} onClick={() => updateFilter({ page: page - 1 })} className={`px-3 py-2 rounded-xl ${page <= 1 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-white/90 border border-[#90e0ef55] hover:bg-[#f5fcff]'}`}>Trước</button>
          <span className="text-sm text-slate-700">Trang {page} / {pagination.pages || 1}</span>
          <button disabled={page >= pagination.pages} onClick={() => updateFilter({ page: page + 1 })} className={`px-3 py-2 rounded-xl ${page >= pagination.pages ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'text-white bg-gradient-to-r from-[#00b4d8] via-[#48cae4] to-[#90e0ef] shadow-[0_10px_24px_rgba(0,180,216,0.30)]'}`}>Sau</button>
        </div>
      </div>

      {showConfirmDialog && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-8 py-6 rounded-t-3xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">✅</span>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Xác nhận nhận hàng</h2>
                    <p className="text-emerald-100 text-sm">Nhập thông tin nhận hàng</p>
                  </div>
                </div>
                <button onClick={() => setShowConfirmDialog(false)} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white text-xl transition">✕</button>
              </div>
            </div>

            <div className="p-8 space-y-4">
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                <div className="font-bold text-emerald-800 mb-2">📦 Thông tin đơn hàng:</div>
                <div className="space-y-1 text-sm">
                  <div>Từ: {selectedInvoice.fromDistributor?.name}</div>
                  <div>Số lượng: <span className="font-bold text-emerald-700">{selectedInvoice.quantity} NFT</span></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Người nhận *</label>
                  <input type="text" value={confirmForm.receivedBy} onChange={(e) => setConfirmForm({...confirmForm, receivedBy: e.target.value})} className="w-full border-2 border-emerald-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 focus:outline-none" placeholder="Tên người nhận" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Số lượng</label>
                  <input type="number" value={confirmForm.receivedQuantity} onChange={(e) => setConfirmForm({...confirmForm, receivedQuantity: e.target.value})} className="w-full border-2 border-emerald-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Địa chỉ nhận *</label>
                <input type="text" value={confirmForm.deliveryAddress} onChange={(e) => setConfirmForm({...confirmForm, deliveryAddress: e.target.value})} className="w-full border-2 border-emerald-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 focus:outline-none" placeholder="Địa chỉ" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Thông tin vận chuyển</label>
                <input type="text" value={confirmForm.shippingInfo} onChange={(e) => setConfirmForm({...confirmForm, shippingInfo: e.target.value})} className="w-full border-2 border-emerald-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày nhận</label>
                <input type="date" value={confirmForm.receivedDate} onChange={(e) => setConfirmForm({...confirmForm, receivedDate: e.target.value})} className="w-full border-2 border-emerald-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ghi chú</label>
                <textarea value={confirmForm.notes} onChange={(e) => setConfirmForm({...confirmForm, notes: e.target.value})} className="w-full border-2 border-emerald-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 focus:outline-none" rows="3" />
              </div>

              <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                <div className="text-sm text-yellow-800">⚠️ Sau khi xác nhận, trạng thái sẽ thành <strong>"Đang chờ Distributor xác nhận"</strong>. Distributor cần xác nhận để chuyển NFT.</div>
              </div>
            </div>

            <div className="px-8 py-6 border-t border-gray-200 bg-gray-50 rounded-b-3xl flex justify-end space-x-3">
              <button onClick={() => setShowConfirmDialog(false)} className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-100 font-medium transition">Hủy</button>
              <button onClick={handleConfirmReceipt} disabled={loading} className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-medium shadow-lg hover:shadow-xl disabled:opacity-50 transition">{loading ? 'Đang xử lý...' : '✓ Xác nhận'}</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

