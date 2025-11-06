import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import TruckLoader from '../../components/TruckLoader';
import pharmacyService from '../../services/pharmacy/pharmacyService';

export default function InvoicesFromDistributor() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const progressIntervalRef = useRef(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [expandedInvoice, setExpandedInvoice] = useState(null);
  const [localSearch, setLocalSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [confirmForm, setConfirmForm] = useState({
    receivedByName: '',
    receiptAddressStreet: '',
    receiptAddressCity: '',
    receiptAddressState: '',
    receiptAddressPostalCode: '',
    receiptAddressCountry: 'Vietnam',
    shippingInfo: '',
    notes: '',
    receivedDate: new Date().toISOString().split('T')[0],
    receivedQuantity: '',
  });

  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';

  // Đồng bộ localSearch với search params từ URL (khi component mount hoặc search thay đổi từ bên ngoài)
  useEffect(() => {
    if (search !== localSearch) {
      setLocalSearch(search);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Debounce search: đợi 1.5 giây sau khi người dùng dừng nhập
  useEffect(() => {
    // Bỏ qua nếu localSearch trống và search cũng trống
    if (localSearch === search) {
      setIsSearching(false);
      return;
    }

    // Nếu có giá trị localSearch khác search, bắt đầu debounce
    setIsSearching(true);

    const debounceTimer = setTimeout(() => {
      updateFilter({ search: localSearch, page: 1 });
      setIsSearching(false);
    }, 1500);

    return () => {
      clearTimeout(debounceTimer);
      setIsSearching(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSearch]);

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
      progressIntervalRef.current = setInterval(() => {
        setLoadingProgress(prev => (prev < 0.9 ? Math.min(prev + 0.02, 0.9) : prev));
      }, 50);
      const params = { page, limit: 10 };
      // Tìm kiếm theo mã đơn - backend sẽ tìm trong trường invoiceNumber
      if (search) params.search = search;
      if (status) params.status = status;

      const response = await pharmacyService.getInvoicesFromDistributor(params);
      if (response.data && response.data.success) {
        const invoices = response.data.data?.invoices || response.data.data || [];
        // Nếu có search, filter lại theo mã đơn để đảm bảo chỉ hiển thị kết quả khớp
        let filteredInvoices = invoices;
        if (search) {
          filteredInvoices = invoices.filter(invoice => {
            const invoiceNumber = invoice.invoiceNumber || '';
            return invoiceNumber.toLowerCase().includes(search.toLowerCase());
          });
        }
        setItems(filteredInvoices);
        // Sử dụng pagination từ server, chỉ dùng filtered length nếu không có pagination
        const serverPagination = response.data.data?.pagination;
        if (serverPagination) {
          setPagination(serverPagination);
        } else {
          setPagination({ 
            page, 
            limit: 10, 
            total: filteredInvoices.length, 
            pages: Math.ceil(filteredInvoices.length / 10) 
          });
        }
      } else {
        setItems([]);
        setPagination({ page: 1, limit: 10, total: 0, pages: 0 });
      }
      // tăng tốc tới 100%
      if (progressIntervalRef.current) { clearInterval(progressIntervalRef.current); progressIntervalRef.current = null; }
      let current = 0; setLoadingProgress(p => { current = p; return p; });
      if (current < 0.9) {
        await new Promise(resolve => {
          const speedUp = setInterval(() => {
            setLoadingProgress(prev => {
              if (prev < 1) {
                const np = Math.min(prev + 0.15, 1);
                if (np >= 1) { clearInterval(speedUp); resolve(); }
                return np;
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
    } catch (error) {
      console.error('Lỗi khi tải đơn hàng:', error);
      setItems([]);
      setPagination({ page: 1, limit: 10, total: 0, pages: 0 });
      const errorMessage = error.response?.data?.message || error.message || 'Không thể tải danh sách đơn hàng';
      console.error('Chi tiết lỗi:', errorMessage);
    } finally {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
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

  const toggleExpand = (idx) => {
    setExpandedInvoice(expandedInvoice === idx ? null : idx);
  };


  const handleConfirmReceipt = async () => {
    if (!selectedInvoice) return;
    if (!confirmForm.receivedByName || !confirmForm.receiptAddressStreet) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc (Tên người nhận và Địa chỉ)');
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        invoiceId: selectedInvoice._id,
        receivedBy: confirmForm.receivedBy,
        deliveryAddress: confirmForm.deliveryAddress,
        shippingInfo: confirmForm.shippingInfo || '',
        notes: confirmForm.notes || '',
        receivedDate: confirmForm.receivedDate || new Date().toISOString().split('T')[0],
        receivedQuantity: parseInt(confirmForm.receivedQuantity) || selectedInvoice.quantity || 0,
      };

      console.log('Gửi request xác nhận nhận hàng:', {
        endpoint: '/pharmacy/invoices/confirm-receipt',
        data: requestData
      });

      const response = await pharmacyService.confirmReceipt(requestData);

      console.log('Response từ server:', response);

      if (response.data && response.data.success) {
        alert('✅ Xác nhận nhận hàng thành công!\n\nTrạng thái: Đang chờ Distributor xác nhận chuyển quyền sở hữu NFT.');
        setShowConfirmDialog(false);
        loadData();
      } else {
        const errorMessage = response.data?.message || 'Không thể xác nhận nhận hàng';
        console.error('Response không thành công:', response.data);
        alert('❌ ' + errorMessage);
      }
    } catch (error) {
      console.error('Lỗi khi xác nhận nhận hàng:', error);
      console.error('Chi tiết lỗi:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
      });
      
      let errorMessage = 'Không thể xác nhận nhận hàng';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert('❌ Lỗi server khi xác nhận nhận hàng: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Chờ xác nhận',
      sent: 'Đã gửi',
      received: 'Đã nhận',
      confirmed: 'Đã xác nhận',
      paid: 'Đã thanh toán',
    };
    return labels[status] || status;
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
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="w-full max-w-2xl">
            <TruckLoader height={72} progress={loadingProgress} showTrack />
          </div>
          <div className="text-lg text-slate-600 mt-6">Đang tải dữ liệu...</div>
        </div>
      ) : (
        <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-xl border border-cyan-200 shadow-sm p-5 mb-6">
        <h1 className="text-xl font-semibold text-[#007b91]">Đơn hàng từ nhà phân phối</h1>
        <p className="text-slate-500 text-sm mt-1">Xem và xác nhận nhận hàng từ distributor</p>
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
                value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && updateFilter({ search: localSearch, page: 1 })}
                placeholder="Tìm theo số đơn, ghi chú..."
                className="w-full h-12 pl-11 pr-40 rounded-full border border-gray-200 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#48cae4] transition"
              />
              <button
                onClick={() => updateFilter({ search: localSearch, page: 1 })}
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
              <option value="pending">Đang chờ</option>
              <option value="sent">Đã gửi</option>
              <option value="received">Đã nhận</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="paid">Đã thanh toán</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* List */}
      <motion.div className="space-y-4" variants={fadeUp} initial="hidden" animate="show">
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-cyan-200 p-10 text-center">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Chưa có đơn hàng nào</h3>
            <p className="text-slate-600">Đơn hàng từ nhà phân phối sẽ hiển thị ở đây</p>
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
                      <div>Từ: <span className="font-medium text-slate-800">{item.fromDistributor?.fullName || item.fromDistributor?.username || 'N/A'}</span></div>
                      <div>Số lượng: <span className="font-bold text-blue-700">{item.quantity} NFT</span></div>
                      <div>Ngày tạo: <span className="font-medium">{new Date(item.createdAt).toLocaleString('vi-VN')}</span></div>
                    </div>
                  </div>

                  {item.status === 'sent' && (
                    <button
                      style={{ color: 'white' }}
                      onClick={() => {
                        setSelectedInvoice(item);
                        setConfirmForm({
                          receivedByName: '',
                          receiptAddressStreet: '',
                          receiptAddressCity: '',
                          receiptAddressState: '',
                          receiptAddressPostalCode: '',
                          receiptAddressCountry: 'Vietnam',
                          shippingInfo: '',
                          notes: '',
                          receivedDate: new Date().toISOString().split('T')[0],
                          receivedQuantity: item.quantity?.toString() || '',
                        });
                        setShowConfirmDialog(true);
                      }}
                      className="px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700 text-base font-semibold transition shadow-md"
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

            <div className="p-8 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Người nhận hàng *</label>
                  <input
                    value={confirmForm.receivedByName}
                    onChange={(e) => setConfirmForm({...confirmForm, receivedByName: e.target.value})}
                    placeholder="Họ và tên"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Số lượng nhận</label>
                  <input
                    type="number"
                    value={confirmForm.receivedQuantity}
                    onChange={(e) => setConfirmForm({...confirmForm, receivedQuantity: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Địa chỉ nhận (đường) *</label>
                  <input
                    value={confirmForm.receiptAddressStreet}
                    onChange={(e) => setConfirmForm({...confirmForm, receiptAddressStreet: e.target.value})}
                    placeholder="Số nhà, đường..."
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Thành phố *</label>
                  <input
                    value={confirmForm.receiptAddressCity}
                    onChange={(e) => setConfirmForm({...confirmForm, receiptAddressCity: e.target.value})}
                    placeholder="TP/Huyện"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ngày nhận</label>
                  <input
                    type="date"
                    value={confirmForm.receivedDate}
                    onChange={(e) => setConfirmForm({...confirmForm, receivedDate: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tỉnh/Thành</label>
                  <input
                    value={confirmForm.receiptAddressState}
                    onChange={(e) => setConfirmForm({...confirmForm, receiptAddressState: e.target.value})}
                    placeholder="Tỉnh/Thành"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mã bưu điện</label>
                  <input
                    value={confirmForm.receiptAddressPostalCode}
                    onChange={(e) => setConfirmForm({...confirmForm, receiptAddressPostalCode: e.target.value})}
                    placeholder="Mã bưu điện"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ghi chú</label>
                <textarea
                  rows="3"
                  value={confirmForm.notes}
                  onChange={(e) => setConfirmForm({...confirmForm, notes: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Ghi chú thêm..."
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="px-5 py-2 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
                >
                  Hủy
                </button>
                <button
                  style={{ color: 'white' }}
                  onClick={handleConfirmReceipt}
                  disabled={loading}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold shadow-md hover:from-emerald-600 hover:to-green-700 transition disabled:opacity-50"
                >
                  {loading ? 'Đang xử lý...' : 'Xác nhận nhận hàng'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
      )}
    </DashboardLayout>
  );
}

