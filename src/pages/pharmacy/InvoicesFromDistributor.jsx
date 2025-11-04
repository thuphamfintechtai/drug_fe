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
      pending: 'bg-white text-slate-700 border-slate-300',
      sent: 'bg-white text-[#4BADD1] border-[#4BADD1]',
      received: 'bg-white text-[#7AC3DE] border-[#7AC3DE]',
      confirmed: 'bg-white text-[#4BADD1] border-[#4BADD1]',
      paid: 'bg-white text-[#7AC3DE] border-[#7AC3DE]',
    };
    return colors[status] || 'bg-white text-slate-600 border-slate-300';
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <DashboardLayout navigationItems={navigationItems}>
      <motion.section
        className="relative overflow-hidden rounded-2xl mb-6 border border-[#7AC3DE] shadow-[0_10px_30px_rgba(75,173,209,0.15)] bg-white"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative px-6 py-8 md:px-10 md:py-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#4BADD1]">Đơn hàng từ nhà phân phối</h1>
          <p className="text-[#7AC3DE] mt-2 text-lg">Xem và xác nhận nhận hàng từ distributor</p>
        </div>
      </motion.section>

      <motion.div className="rounded-2xl bg-white border-2 border-[#4BADD1] shadow-[0_4px_12px_rgba(75,173,209,0.12)] p-4 mb-5" variants={fadeUp} initial="hidden" animate="show">
        <div className="flex flex-col md:flex-row gap-3 md:items-end">
          <div className="flex-1">
            <label className="block text-sm text-slate-700 mb-1 font-medium">Tìm kiếm</label>
            <input
              value={search}
              onChange={e => updateFilter({ search: e.target.value, page: 1 })}
              placeholder="Tìm theo số đơn..."
              className="w-full border-2 border-slate-200 bg-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#4BADD1] focus:border-[#4BADD1] transition"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-700 mb-1 font-medium">Trạng thái</label>
            <select
              value={status}
              onChange={e => updateFilter({ status: e.target.value, page: 1 })}
              className="border-2 border-slate-200 bg-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#4BADD1] focus:border-[#4BADD1] transition"
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
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-10 text-center text-slate-600">Đang tải...</div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-10 text-center">
            <div className="text-5xl mb-4 text-slate-800">■</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Chưa có đơn hàng nào</h3>
            <p className="text-slate-600">Đơn hàng từ nhà phân phối sẽ hiển thị ở đây</p>
          </div>
        ) : (
          items.map((item, idx) => (
            <div key={idx} className="bg-white rounded-2xl border-2 border-slate-200 shadow-[0_4px_12px_rgba(0,0,0,0.08)] overflow-hidden hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:border-[#4BADD1] transition-all">
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-800">
                        Từ: {item.fromDistributor?.fullName || item.fromDistributor?.username || 'N/A'}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border-2 ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-600 mb-4">
                      <div>Số đơn: <span className="font-mono font-medium text-slate-800">{item.invoiceNumber || 'N/A'}</span></div>
                      <div>Số lượng: <span className="font-bold text-[#4BADD1]">{item.quantity} NFT</span></div>
                      <div>Ngày đơn: <span className="font-medium">{item.invoiceDate ? new Date(item.invoiceDate).toLocaleDateString('vi-VN') : 'N/A'}</span></div>
                      <div>Ngày tạo: <span className="font-medium">{item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : 'N/A'}</span></div>
                    </div>
                  </div>

                  {item.status === 'sent' && (
                    <button
                      onClick={() => handleOpenConfirm(item)}
                      className="px-4 py-2 rounded-lg bg-[#4BADD1] text-white hover:bg-[#7AC3DE] text-sm font-medium transition shadow-[0_4px_12px_rgba(75,173,209,0.3)] hover:shadow-[0_6px_16px_rgba(75,173,209,0.4)]"
                    >
                      Xác nhận nhận hàng
                    </button>
                  )}
                </div>

                {/* Thông tin nhà phân phối */}
                {item.fromDistributor && (
                  <div className="bg-white rounded-xl p-3 border-2 border-slate-200 text-sm mb-3">
                    <div className="font-semibold text-slate-800 mb-2">Thông tin nhà phân phối:</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-700">
                      <div>Tên: <span className="font-medium">{item.fromDistributor.fullName || item.fromDistributor.username || 'N/A'}</span></div>
                      <div>Email: <span className="font-medium">{item.fromDistributor.email || 'N/A'}</span></div>
                      <div>Username: <span className="font-mono text-xs">{item.fromDistributor.username || 'N/A'}</span></div>
                    </div>
                  </div>
                )}

                {/* Thông tin thuốc */}
                {item.drug && (
                  <div className="bg-white rounded-xl p-3 border-2 border-slate-200 text-sm mb-3">
                    <div className="font-semibold text-slate-800 mb-2">Thông tin thuốc:</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-700">
                      <div>Tên thương mại: <span className="font-medium">{item.drug.tradeName || 'N/A'}</span></div>
                      <div>Tên hoạt chất: <span className="font-medium">{item.drug.genericName || 'N/A'}</span></div>
                      <div>Mã ATC: <span className="font-mono font-medium">{item.drug.atcCode || 'N/A'}</span></div>
                    </div>
                  </div>
                )}

                {/* Thông tin tài chính */}
                <div className="bg-white rounded-xl p-3 border-2 border-[#4BADD1] text-sm mb-3">
                  <div className="font-semibold text-[#4BADD1] mb-2">Thông tin tài chính:</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-700">
                    <div>Đơn giá: <span className="font-medium">{item.unitPrice?.toLocaleString('vi-VN') || 'N/A'} VNĐ</span></div>
                    <div>Tổng tiền: <span className="font-bold text-[#4BADD1]">{item.totalAmount?.toLocaleString('vi-VN') || 'N/A'} VNĐ</span></div>
                    <div>VAT ({item.vatRate || 0}%): <span className="font-medium">{item.vatAmount?.toLocaleString('vi-VN') || 'N/A'} VNĐ</span></div>
                    <div>Thành tiền: <span className="font-bold text-[#4BADD1]">{item.finalAmount?.toLocaleString('vi-VN') || 'N/A'} VNĐ</span></div>
                  </div>
                </div>

                {/* Chain Transaction Hash */}
                {item.chainTxHash && (
                  <div className="bg-white rounded-xl p-3 border-2 border-slate-200 text-sm mb-3">
                    <div className="font-semibold text-slate-800 mb-1">Chain TX Hash:</div>
                    <div className="text-slate-700 font-mono text-xs break-all">{item.chainTxHash}</div>
                  </div>
                )}

                {/* Ghi chú */}
                {item.notes && (
                  <div className="bg-white rounded-xl p-3 border-2 border-slate-200 text-sm">
                    <div className="font-semibold text-slate-800 mb-1">Ghi chú:</div>
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
          <button disabled={page <= 1} onClick={() => updateFilter({ page: page - 1 })} className={`px-3 py-2 rounded-xl ${page <= 1 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-white border-2 border-slate-200 hover:border-[#4BADD1] hover:text-[#4BADD1] transition'}`}>Trước</button>
          <span className="text-sm text-slate-700">Trang {page} / {pagination.pages || 1}</span>
          <button disabled={page >= pagination.pages} onClick={() => updateFilter({ page: page + 1 })} className={`px-3 py-2 rounded-xl ${page >= pagination.pages ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-[#4BADD1] text-white hover:bg-[#7AC3DE] shadow-[0_4px_12px_rgba(75,173,209,0.3)] hover:shadow-[0_6px_16px_rgba(75,173,209,0.4)] transition'}`}>Sau</button>
        </div>
      </div>

      {showConfirmDialog && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-[#4BADD1] px-8 py-6 rounded-t-3xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-3xl text-white">■</span>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Xác nhận nhận hàng</h2>
                    <p className="text-white/90 text-sm">Nhập thông tin nhận hàng</p>
                  </div>
                </div>
                <button onClick={() => setShowConfirmDialog(false)} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white text-xl transition">✕</button>
              </div>
            </div>

            <div className="p-8 space-y-4">
              <div className="bg-white rounded-xl p-4 border-2 border-[#4BADD1]">
                <div className="font-bold text-[#4BADD1] mb-2">Thông tin đơn hàng:</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-700">
                  <div>Số đơn: <span className="font-mono font-medium">{selectedInvoice.invoiceNumber || 'N/A'}</span></div>
                  <div>Từ: <span className="font-medium">{selectedInvoice.fromDistributor?.fullName || selectedInvoice.fromDistributor?.username || 'N/A'}</span></div>
                  <div>Số lượng: <span className="font-bold text-[#4BADD1]">{selectedInvoice.quantity} NFT</span></div>
                  <div>Ngày đơn: <span className="font-medium">{selectedInvoice.invoiceDate ? new Date(selectedInvoice.invoiceDate).toLocaleDateString('vi-VN') : 'N/A'}</span></div>
                  {selectedInvoice.drug && (
                    <>
                      <div>Thuốc: <span className="font-medium">{selectedInvoice.drug.tradeName || 'N/A'}</span></div>
                      <div>Mã ATC: <span className="font-mono text-xs">{selectedInvoice.drug.atcCode || 'N/A'}</span></div>
                    </>
                  )}
                  <div className="md:col-span-2">Thành tiền: <span className="font-bold text-[#4BADD1]">{selectedInvoice.finalAmount?.toLocaleString('vi-VN') || 'N/A'} VNĐ</span></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Người nhận *</label>
                  <input type="text" value={confirmForm.receivedBy} onChange={(e) => setConfirmForm({...confirmForm, receivedBy: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-[#4BADD1] focus:border-[#4BADD1] focus:outline-none" placeholder="Tên người nhận" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Số lượng</label>
                  <input type="number" value={confirmForm.receivedQuantity} onChange={(e) => setConfirmForm({...confirmForm, receivedQuantity: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-[#4BADD1] focus:border-[#4BADD1] focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Địa chỉ nhận *</label>
                <input type="text" value={confirmForm.deliveryAddress} onChange={(e) => setConfirmForm({...confirmForm, deliveryAddress: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-[#4BADD1] focus:border-[#4BADD1] focus:outline-none" placeholder="Địa chỉ" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Thông tin vận chuyển</label>
                <input type="text" value={confirmForm.shippingInfo} onChange={(e) => setConfirmForm({...confirmForm, shippingInfo: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-[#4BADD1] focus:border-[#4BADD1] focus:outline-none" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày nhận</label>
                <input type="date" value={confirmForm.receivedDate} onChange={(e) => setConfirmForm({...confirmForm, receivedDate: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-[#4BADD1] focus:border-[#4BADD1] focus:outline-none" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ghi chú</label>
                <textarea value={confirmForm.notes} onChange={(e) => setConfirmForm({...confirmForm, notes: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-[#4BADD1] focus:border-[#4BADD1] focus:outline-none" rows="3" />
              </div>

              <div className="bg-white rounded-xl p-4 border-2 border-slate-300">
                <div className="text-sm text-slate-700">Sau khi xác nhận, trạng thái sẽ thành <strong>"Đang chờ Distributor xác nhận"</strong>. Distributor cần xác nhận để chuyển NFT.</div>
              </div>
            </div>

            <div className="px-8 py-6 border-t border-gray-200 bg-white rounded-b-3xl flex justify-end space-x-3">
              <button onClick={() => setShowConfirmDialog(false)} className="px-6 py-3 rounded-xl border-2 border-slate-300 text-slate-700 hover:bg-slate-100 font-medium transition">Hủy</button>
              <button onClick={handleConfirmReceipt} disabled={loading} className="px-6 py-3 rounded-xl bg-[#4BADD1] text-white font-medium shadow-[0_4px_12px_rgba(75,173,209,0.3)] hover:bg-[#7AC3DE] hover:shadow-[0_6px_16px_rgba(75,173,209,0.4)] disabled:opacity-50 transition">{loading ? 'Đang xử lý...' : 'Xác nhận'}</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

