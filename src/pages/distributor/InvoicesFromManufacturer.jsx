import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  getInvoicesFromManufacturer,
  confirmReceipt 
} from '../../services/distributor/distributorService';

export default function InvoicesFromManufacturer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [confirmForm, setConfirmForm] = useState({
    receivedBy: {
      fullName: '',
      position: '',
      signature: '',
    },
    deliveryAddress: {
      street: '',
      district: '',
      city: '',
    },
    shippingInfo: {
      carrier: '',
      trackingNumber: '',
      shippedDate: '',
    },
    notes: '',
    distributionDate: new Date().toISOString().split('T')[0],
    distributedQuantity: '',
  });

  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';

  const navigationItems = [
    { path: '/distributor', label: 'Tổng quan', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>), active: false },
    { path: '/distributor/invoices', label: 'Đơn từ nhà SX', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>), active: true },
    { path: '/distributor/transfer-pharmacy', label: 'Chuyển cho NT', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>), active: false },
    { path: '/distributor/distribution-history', label: 'Lịch sử phân phối', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>), active: false },
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

      const response = await getInvoicesFromManufacturer(params);
      if (response.data.success) {
        setItems(response.data.data.invoices || []);
        setPagination(response.data.data.pagination || { page: 1, limit: 10, total: 0, pages: 0 });
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách đơn hàng:', error);
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
      receivedBy: {
        fullName: '',
        position: '',
        signature: '',
      },
      deliveryAddress: {
        street: '',
        district: '',
        city: '',
      },
      shippingInfo: {
        carrier: '',
        trackingNumber: '',
        shippedDate: '',
      },
      notes: '',
      distributionDate: new Date().toISOString().split('T')[0],
      distributedQuantity: invoice.totalQuantity?.toString() || '',
    });
    setShowConfirmDialog(true);
  };

  const handleConfirmReceipt = async () => {
    if (!selectedInvoice) return;

    if (!confirmForm.receivedBy?.fullName || !confirmForm.deliveryAddress?.street || !confirmForm.deliveryAddress?.city) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    setLoading(true);
    try {
      // Chỉ gửi các field có giá trị để tránh gửi empty objects
      const payload = {
        invoiceId: selectedInvoice._id,
        distributionDate: confirmForm.distributionDate,
        distributedQuantity: parseInt(confirmForm.distributedQuantity) || selectedInvoice.totalQuantity,
        notes: confirmForm.notes || undefined,
      };

      // Chỉ thêm receivedBy nếu có fullName
      if (confirmForm.receivedBy?.fullName) {
        payload.receivedBy = {
          fullName: confirmForm.receivedBy.fullName,
          ...(confirmForm.receivedBy.position && { position: confirmForm.receivedBy.position }),
          ...(confirmForm.receivedBy.signature && { signature: confirmForm.receivedBy.signature }),
        };
      }

      // Chỉ thêm deliveryAddress nếu có ít nhất street và city
      if (confirmForm.deliveryAddress?.street && confirmForm.deliveryAddress?.city) {
        payload.deliveryAddress = {
          street: confirmForm.deliveryAddress.street,
          ...(confirmForm.deliveryAddress.district && { district: confirmForm.deliveryAddress.district }),
          city: confirmForm.deliveryAddress.city,
        };
      }

      // Chỉ thêm shippingInfo nếu có ít nhất carrier hoặc trackingNumber
      if (confirmForm.shippingInfo?.carrier || confirmForm.shippingInfo?.trackingNumber) {
        payload.shippingInfo = {
          ...(confirmForm.shippingInfo.carrier && { carrier: confirmForm.shippingInfo.carrier }),
          ...(confirmForm.shippingInfo.trackingNumber && { trackingNumber: confirmForm.shippingInfo.trackingNumber }),
          ...(confirmForm.shippingInfo.shippedDate && { shippedDate: confirmForm.shippingInfo.shippedDate }),
        };
      }

      const response = await confirmReceipt(payload);

      if (response.data.success) {
        alert('Xác nhận nhận hàng thành công!\n\nTrạng thái: Đang chờ Manufacturer xác nhận chuyển quyền sở hữu NFT.');
        setShowConfirmDialog(false);
        loadData();
      }
    } catch (error) {
      console.error('Lỗi khi xác nhận:', error);
      alert('Không thể xác nhận nhận hàng: ' + (error.response?.data?.message || error.message));
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

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pending',
      sent: 'Sent',
      received: 'Received',
      confirmed: 'Confirmed (Chờ Manufacturer)',
      paid: 'Paid',
    };
    return labels[status] || status;
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <DashboardLayout navigationItems={navigationItems}>
      {/* Banner kiểu Manufacturer */}
      <div className="bg-white rounded-xl border border-cyan-200 shadow-sm p-5 mb-6">
        <h1 className="text-xl font-semibold text-[#007b91]">Đơn hàng từ nhà sản xuất</h1>
        <p className="text-slate-500 text-sm mt-1">Xem và xác nhận nhận hàng từ pharma company</p>
      </div>

      {/* Filters */}
      <motion.div
        className="rounded-2xl bg-white border border-cyan-200 shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-4 mb-5"
        variants={fadeUp}
        initial="hidden"
        animate="show"
      >
        <div className="flex flex-col md:flex-row gap-3 md:items-end">
          <div className="flex-1">
            <label className="block text-sm text-[#003544]/70 mb-1">Tìm kiếm</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
                </svg>
              </span>
              <input
                value={search}
                onChange={e => updateFilter({ search: e.target.value, page: 1 })}
                onKeyDown={e => e.key === 'Enter' && updateFilter({ search, page: 1 })}
                placeholder="Tìm theo số đơn, ghi chú..."
                className="w-full h-12 pl-11 pr-40 rounded-full border border-gray-200 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#48cae4] transition"
              />
              <button
                onClick={() => updateFilter({ search, page: 1 })}
                className="absolute right-1 top-1 bottom-1 px-6 rounded-full bg-[#3db6d9] hover:bg-[#2fa2c5] text-white font-medium transition"
              >
                Tìm Kiếm
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm text-[#003544]/70 mb-1">Trạng thái</label>
            <select
              value={status}
              onChange={e => updateFilter({ status: e.target.value, page: 1 })}
              className="h-12 rounded-full border border-gray-200 bg-white text-gray-700 px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-[#48cae4] transition"
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


      {/* List */}
      <motion.div className="space-y-4" variants={fadeUp} initial="hidden" animate="show">
        {loading ? (
          <div className="bg-white rounded-2xl border border-cyan-200 p-10 text-center text-slate-600">
            Đang tải...
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-cyan-200 p-10 text-center">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Chưa có đơn hàng nào</h3>
            <p className="text-slate-600">Đơn hàng từ nhà sản xuất sẽ hiển thị ở đây</p>
          </div>
        ) : (
          items.map((item, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-cyan-100 shadow-sm overflow-hidden hover:shadow-lg transition">
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-[#003544]">
                        Đơn: {item.invoiceNumber || 'N/A'}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                        {getStatusLabel(item.status)}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-slate-600">
                      <div>Từ: <span className="font-medium text-slate-800">{item.fromManufacturer?.fullName || item.fromManufacturer?.username || 'N/A'}</span></div>
                      <div>Số lượng: <span className="font-bold text-blue-700">{item.totalQuantity} NFT</span></div>
                      <div>Ngày tạo: <span className="font-medium">{new Date(item.createdAt).toLocaleString('vi-VN')}</span></div>
                    </div>
                  </div>

                  {item.status === 'sent' && (
                    <button
                      onClick={() => handleOpenConfirm(item)}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700 text-sm font-medium transition shadow"
                    >
                      Xác nhận nhận hàng
                    </button>
                  )}
                </div>

                {item.notes && (
                  <div className="bg-slate-50 rounded-xl p-3 text-sm mb-3">
                    <div className="font-semibold text-slate-700 mb-1">Ghi chú:</div>
                    <div className="text-slate-600">{item.notes}</div>
                  </div>
                )}

                {item.proofOfProduction && (
                  <div className="bg-purple-50 rounded-xl p-3 border border-purple-200 text-sm">
                    <div className="font-semibold text-purple-800 mb-2">Thông tin sản xuất:</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>Số lô: <span className="font-mono">{item.proofOfProduction.batchNumber}</span></div>
                      <div>NSX: {new Date(item.proofOfProduction.manufacturingDate).toLocaleDateString('vi-VN')}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </motion.div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-5">
        <div className="text-sm text-slate-600">
          Hiển thị {items.length} / {pagination.total} đơn hàng
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

      {/* Confirm Receipt Dialog */}
      {showConfirmDialog && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowConfirmDialog(false)}>
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto custom-scroll" onClick={(e) => e.stopPropagation()}>
            <style>{`
              .custom-scroll { scrollbar-width: none; -ms-overflow-style: none; }
              .custom-scroll::-webkit-scrollbar { width: 0; height: 0; }
              .custom-scroll::-webkit-scrollbar-track { background: transparent; }
              .custom-scroll::-webkit-scrollbar-thumb { background: transparent; }
            `}</style>
            <div className="bg-gradient-to-r from-[#00b4d8] to-[#48cae4] px-8 py-6 rounded-t-3xl flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-white">Xác nhận nhận hàng</h2>
                  <p className="text-cyan-100 text-sm">Đơn: {selectedInvoice.invoiceNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-8 space-y-4">
              <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-200">
                <div className="font-bold text-cyan-800 mb-2">Thông tin đơn hàng:</div>
                <div className="space-y-1 text-sm">
                  <div>Số đơn: <span className="font-mono">{selectedInvoice.invoiceNumber}</span></div>
                  <div>Số lượng: <span className="font-bold text-cyan-700">{selectedInvoice.totalQuantity} NFT</span></div>
                  <div>Từ: {selectedInvoice.fromManufacturer?.fullName}</div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="font-bold text-blue-800 mb-3">Thông tin người nhận:</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Họ và tên *</label>
                    <input
                      type="text"
                      value={confirmForm.receivedBy.fullName}
                      onChange={(e) => setConfirmForm({...confirmForm, receivedBy: {...confirmForm.receivedBy, fullName: e.target.value}})}
                      className="w-full border-2 border-cyan-300 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Chức vụ</label>
                    <input
                      type="text"
                      value={confirmForm.receivedBy.position}
                      onChange={(e) => setConfirmForm({...confirmForm, receivedBy: {...confirmForm.receivedBy, position: e.target.value}})}
                      className="w-full border-2 border-cyan-300 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                      placeholder="Quản lý kho"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Chữ ký (tên file)</label>
                    <input
                      type="text"
                      value={confirmForm.receivedBy.signature}
                      onChange={(e) => setConfirmForm({...confirmForm, receivedBy: {...confirmForm.receivedBy, signature: e.target.value}})}
                      className="w-full border-2 border-cyan-300 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                      placeholder="NguyenVanA.png"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <div className="font-bold text-green-800 mb-3">Địa chỉ giao hàng:</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Đường/Phố *</label>
                    <input
                      type="text"
                      value={confirmForm.deliveryAddress.street}
                      onChange={(e) => setConfirmForm({...confirmForm, deliveryAddress: {...confirmForm.deliveryAddress, street: e.target.value}})}
                      className="w-full border-2 border-cyan-300 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                      placeholder="123 Đường ABC"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Quận/Huyện</label>
                    <input
                      type="text"
                      value={confirmForm.deliveryAddress.district}
                      onChange={(e) => setConfirmForm({...confirmForm, deliveryAddress: {...confirmForm.deliveryAddress, district: e.target.value}})}
                      className="w-full border-2 border-cyan-300 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                      placeholder="Quận XYZ"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Thành phố *</label>
                    <input
                      type="text"
                      value={confirmForm.deliveryAddress.city}
                      onChange={(e) => setConfirmForm({...confirmForm, deliveryAddress: {...confirmForm.deliveryAddress, city: e.target.value}})}
                      className="w-full border-2 border-cyan-300 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                      placeholder="TP. Hồ Chí Minh"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <div className="font-bold text-purple-800 mb-3">Thông tin vận chuyển:</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Đơn vị vận chuyển</label>
                    <input
                      type="text"
                      value={confirmForm.shippingInfo.carrier}
                      onChange={(e) => setConfirmForm({...confirmForm, shippingInfo: {...confirmForm.shippingInfo, carrier: e.target.value}})}
                      className="w-full border-2 border-cyan-300 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                      placeholder="Viettel Post"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Mã vận đơn</label>
                    <input
                      type="text"
                      value={confirmForm.shippingInfo.trackingNumber}
                      onChange={(e) => setConfirmForm({...confirmForm, shippingInfo: {...confirmForm.shippingInfo, trackingNumber: e.target.value}})}
                      className="w-full border-2 border-cyan-300 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                      placeholder="VT123456789"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày gửi hàng</label>
                    <input
                      type="date"
                      value={confirmForm.shippingInfo.shippedDate}
                      onChange={(e) => setConfirmForm({...confirmForm, shippingInfo: {...confirmForm.shippingInfo, shippedDate: e.target.value}})}
                      className="w-full border-2 border-cyan-300 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Số lượng nhận</label>
                  <input
                    type="number"
                    value={confirmForm.distributedQuantity}
                    onChange={(e) => setConfirmForm({...confirmForm, distributedQuantity: e.target.value})}
                    className="w-full border-2 border-cyan-300 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    placeholder="Số lượng"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày phân phối</label>
                  <input
                    type="date"
                    value={confirmForm.distributionDate}
                    onChange={(e) => setConfirmForm({...confirmForm, distributionDate: e.target.value})}
                    className="w-full border-2 border-cyan-300 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ghi chú</label>
                <textarea
                  value={confirmForm.notes}
                  onChange={(e) => setConfirmForm({...confirmForm, notes: e.target.value})}
                  className="w-full border-2 border-cyan-300 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  rows="3"
                  placeholder="Ghi chú thêm..."
                />
              </div>

              <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                <div className="text-sm text-yellow-800">
                  Sau khi xác nhận, trạng thái sẽ chuyển thành <strong>"Đang chờ Manufacturer xác nhận"</strong>. 
                  Manufacturer cần xác nhận để chuyển quyền sở hữu NFT cho bạn.
                </div>
              </div>
            </div>

            <div className="px-8 py-6 border-t border-gray-200 bg-gray-50 rounded-b-3xl flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                disabled={loading}
                className="px-6 py-2.5 rounded-full border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-100 disabled:opacity-50 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmReceipt}
                disabled={loading}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#00b4d8] to-[#48cae4] text-white font-medium shadow-md hover:shadow-lg disabled:opacity-50 transition"
              >
                {loading ? 'Đang xử lý...' : 'Xác nhận nhận hàng'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

