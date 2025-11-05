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
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
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
  }, [page, search, status]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      // Tìm kiếm theo mã đơn - backend sẽ tìm trong trường invoiceNumber
      if (search) params.search = search;
      if (status) params.status = status;

      const response = await pharmacyService.getInvoicesFromDistributor(params);
      if (response.data.success) {
        const invoices = response.data.data.invoices || [];
        // Nếu có search, filter lại theo mã đơn để đảm bảo chỉ hiển thị kết quả khớp
        let filteredInvoices = invoices;
        if (search) {
          filteredInvoices = invoices.filter(invoice => {
            const invoiceNumber = invoice.invoiceNumber || '';
            return invoiceNumber.toLowerCase().includes(search.toLowerCase());
          });
        }
        setItems(filteredInvoices);
        setPagination(response.data.data.pagination || { page: 1, limit: 10, total: filteredInvoices.length, pages: 1 });
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error('Lỗi khi tải đơn hàng:', error);
      setItems([]);
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

  const handleOpenDetail = (invoice) => {
    setSelectedInvoice(invoice);
    setShowDetailDialog(true);
  };

  const handleOpenConfirm = (invoice) => {
    setSelectedInvoice(invoice);
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
      receivedQuantity: invoice.quantity?.toString() || '',
    });
    setShowConfirmDialog(true);
  };

  const handleConfirmReceipt = async () => {
    if (!selectedInvoice) return;
    if (!confirmForm.receivedByName || !confirmForm.receiptAddressStreet) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc (Tên người nhận và Địa chỉ)');
      return;
    }

    setLoading(true);
    try {
      // Chuyển đổi receivedByName thành object receivedBy theo schema
      const receivedBy = {
        name: confirmForm.receivedByName,
        // Có thể thêm signature, idNumber, position nếu cần
      };

      // Chuyển đổi receiptAddress thành object theo schema
      const receiptAddress = {
        street: confirmForm.receiptAddressStreet,
        city: confirmForm.receiptAddressCity || '',
        state: confirmForm.receiptAddressState || '',
        postalCode: confirmForm.receiptAddressPostalCode || '',
        country: confirmForm.receiptAddressCountry || 'Vietnam',
      };

      const response = await pharmacyService.confirmReceipt({
        invoiceId: selectedInvoice._id,
        receivedBy,
        receiptAddress,
        receiptDate: confirmForm.receivedDate,
        receivedQuantity: parseInt(confirmForm.receivedQuantity) || selectedInvoice.quantity,
        notes: confirmForm.notes || undefined,
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
      pending: 'bg-white text-[#FF9800] border-[#FF9800]',
      sent: 'bg-white text-[#4BADD1] border-[#4BADD1]',
      received: 'bg-white text-[#7AC3DE] border-[#7AC3DE]',
      confirmed: 'bg-white text-[#10B981] border-[#10B981]',
      paid: 'bg-white text-[#10B981] border-[#10B981]',
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
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-8 h-8 text-[#4BADD1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#4BADD1]">Đơn hàng từ nhà phân phối</h1>
          </div>
          <p className="text-[#7AC3DE] mt-2 text-lg flex items-center gap-2">
            <svg className="w-5 h-5 text-[#7AC3DE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Xem và xác nhận nhận hàng từ distributor
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
                value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
                placeholder="Nhập mã đơn (VD: INV-2024-001)..."
                className="w-full border-2 border-slate-200 bg-white rounded-xl pl-10 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#4BADD1] focus:border-[#4BADD1] transition"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#4BADD1] border-t-transparent"></div>
                </div>
              )}
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
              <option value="pending">Chờ xác nhận</option>
              <option value="sent">Đã gửi</option>
              <option value="received">Đã nhận</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="paid">Đã thanh toán</option>
            </select>
          </div>
        </div>
      </motion.div>

      <motion.div className="bg-white rounded-2xl border-2 border-[#7AC3DE] shadow-[0_4px_12px_rgba(122,195,222,0.12)] overflow-hidden" variants={fadeUp} initial="hidden" animate="show">
        {loading ? (
          <div className="bg-white p-10 text-center text-slate-600">Đang tải...</div>
        ) : items.length === 0 ? (
          <div className="bg-white p-10 text-center">
            <div className="text-5xl mb-4 text-slate-800">■</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Chưa có đơn hàng nào</h3>
            <p className="text-slate-600">Đơn hàng từ nhà phân phối sẽ hiển thị ở đây</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#4BADD1] text-white">
                  <th className="px-4 py-3 text-left text-sm font-semibold border-r border-white/30">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <span>Mã đơn</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold border-r border-white/30">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                      <span>Tên thuốc</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold border-r border-white/30">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>Nhà sản xuất</span>
                  </div>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold border-r border-white/30">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                      <span>Số lượng</span>
                </div>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold border-r border-white/30">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Ngày nhận</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold border-r border-white/30">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Trạng thái</span>
                  </div>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                      <span>Thao tác</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 bg-white">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#4BADD1] rounded flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                        <span className="font-mono font-semibold text-slate-800">{item.invoiceNumber || 'N/A'}</span>
                  </div>
                    </td>
                    <td className="px-4 py-4 bg-white">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        <span className="text-slate-800">{item.drug?.tradeName || item.drug?.name || 'N/A'}</span>
                  </div>
                    </td>
                    <td className="px-4 py-4 bg-white">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="text-slate-800">{item.fromDistributor?.fullName || item.fromDistributor?.username || 'N/A'}</span>
                </div>
                    </td>
                    <td className="px-4 py-4 bg-white">
                      <div className="flex items-center gap-2">
                        <span className="text-[#4BADD1] font-bold">#</span>
                        <span className="font-bold text-[#4BADD1]">{item.quantity?.toLocaleString('vi-VN') || '0'}</span>
                  </div>
                    </td>
                    <td className="px-4 py-4 bg-white">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-slate-800">
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : item.invoiceDate ? new Date(item.invoiceDate).toLocaleDateString('vi-VN') : 'N/A'}
                        </span>
                  </div>
                    </td>
                    <td className="px-4 py-4 bg-white">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 ${getStatusColor(item.status)}`}>
                        {getStatusLabel(item.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4 bg-white">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenDetail(item)}
                          className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 text-sm font-medium transition flex items-center gap-1"
                        >
                          <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>Chi tiết</span>
                        </button>
                        {item.status === 'sent' ? (
                          <button
                            onClick={() => handleOpenConfirm(item)}
                            className="px-3 py-1.5 rounded-lg bg-[#4BADD1] text-white hover:bg-[#7AC3DE] text-sm font-medium transition flex items-center gap-1"
                          >
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Xác nhận</span>
                          </button>
                        ) : item.status === 'draft' ? (
                          <button
                            disabled
                            title="Đang chờ Distributor chuyển NFT. Invoice sẽ chuyển sang trạng thái 'sent' sau khi Distributor hoàn thành chuyển NFT."
                            className="px-3 py-1.5 rounded-lg bg-slate-300 text-slate-500 cursor-not-allowed text-sm font-medium flex items-center gap-1"
                          >
                            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Chờ chuyển NFT</span>
                          </button>
                        ) : null}
              </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
        )}
      </motion.div>

      <div className="flex items-center justify-between mt-5 bg-white p-4 rounded-2xl border-2 border-[#7AC3DE]">
        <div className="text-sm text-slate-600">Tổng {pagination.total} đơn hàng</div>
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
          <select 
            value={pagination.limit || 10} 
            onChange={(e) => updateFilter({ page: 1, limit: parseInt(e.target.value) })}
            className="ml-4 px-3 py-2 rounded-lg border-2 border-slate-300 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#4BADD1] focus:border-[#4BADD1]"
          >
            <option value="10">10 / page</option>
            <option value="20">20 / page</option>
            <option value="50">50 / page</option>
          </select>
        </div>
      </div>

      {showConfirmDialog && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-[#4BADD1] px-8 py-6 rounded-t-3xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Xác nhận nhận hàng</h2>
                    <p className="text-white/90 text-sm">Nhập thông tin nhận hàng</p>
                  </div>
                </div>
                <button onClick={() => setShowConfirmDialog(false)} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
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
                  <input type="text" value={confirmForm.receivedByName} onChange={(e) => setConfirmForm({...confirmForm, receivedByName: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-[#4BADD1] focus:border-[#4BADD1] focus:outline-none" placeholder="Tên người nhận" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Số lượng</label>
                  <input type="number" value={confirmForm.receivedQuantity} onChange={(e) => setConfirmForm({...confirmForm, receivedQuantity: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-[#4BADD1] focus:border-[#4BADD1] focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Địa chỉ nhận * (Số nhà, tên đường)</label>
                <input type="text" value={confirmForm.receiptAddressStreet} onChange={(e) => setConfirmForm({...confirmForm, receiptAddressStreet: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-[#4BADD1] focus:border-[#4BADD1] focus:outline-none" placeholder="Số nhà, tên đường" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Thành phố</label>
                  <input type="text" value={confirmForm.receiptAddressCity} onChange={(e) => setConfirmForm({...confirmForm, receiptAddressCity: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-[#4BADD1] focus:border-[#4BADD1] focus:outline-none" placeholder="Thành phố" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tỉnh/Thành</label>
                  <input type="text" value={confirmForm.receiptAddressState} onChange={(e) => setConfirmForm({...confirmForm, receiptAddressState: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-[#4BADD1] focus:border-[#4BADD1] focus:outline-none" placeholder="Tỉnh/Thành" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Mã bưu điện</label>
                  <input type="text" value={confirmForm.receiptAddressPostalCode} onChange={(e) => setConfirmForm({...confirmForm, receiptAddressPostalCode: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-[#4BADD1] focus:border-[#4BADD1] focus:outline-none" placeholder="Mã bưu điện" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Quốc gia</label>
                  <input type="text" value={confirmForm.receiptAddressCountry} onChange={(e) => setConfirmForm({...confirmForm, receiptAddressCountry: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-[#4BADD1] focus:border-[#4BADD1] focus:outline-none" placeholder="Quốc gia" />
                </div>
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
              <button onClick={() => setShowConfirmDialog(false)} className="px-6 py-3 rounded-xl border-2 border-slate-300 text-slate-700 hover:bg-slate-100 font-medium transition flex items-center gap-2">
                <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Hủy</span>
              </button>
              <button onClick={handleConfirmReceipt} disabled={loading} className="px-6 py-3 rounded-xl bg-[#4BADD1] text-white font-medium shadow-[0_4px_12px_rgba(75,173,209,0.3)] hover:bg-[#7AC3DE] hover:shadow-[0_6px_16px_rgba(75,173,209,0.4)] disabled:opacity-50 transition flex items-center gap-2">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{loading ? 'Đang xử lý...' : 'Xác nhận'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetailDialog && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-[#4BADD1] px-8 py-6 rounded-t-3xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Chi tiết đơn hàng</h2>
                    <p className="text-white/90 text-sm">Mã đơn: {selectedInvoice.invoiceNumber || 'N/A'}</p>
                  </div>
                </div>
                <button onClick={() => setShowDetailDialog(false)} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-8 space-y-6">
              {/* Thông tin cơ bản */}
              <div className="bg-white rounded-xl p-5 border-2 border-[#4BADD1]">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-[#4BADD1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-bold text-[#4BADD1]">Thông tin đơn hàng</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Mã đơn:</span>
                    <span className="ml-2 font-mono font-semibold text-slate-800">{selectedInvoice.invoiceNumber || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Trạng thái:</span>
                    <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium border-2 ${getStatusColor(selectedInvoice.status)}`}>
                      {getStatusLabel(selectedInvoice.status)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600">Ngày tạo:</span>
                    <span className="ml-2 font-medium text-slate-800">
                      {selectedInvoice.createdAt ? new Date(selectedInvoice.createdAt).toLocaleString('vi-VN') : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600">Ngày đơn:</span>
                    <span className="ml-2 font-medium text-slate-800">
                      {selectedInvoice.invoiceDate ? new Date(selectedInvoice.invoiceDate).toLocaleDateString('vi-VN') : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600">Số lượng:</span>
                    <span className="ml-2 font-bold text-[#4BADD1]">{selectedInvoice.quantity || '0'} NFT</span>
                  </div>
                </div>
              </div>

              {/* Thông tin nhà phân phối */}
              {selectedInvoice.fromDistributor && (
                <div className="bg-white rounded-xl p-5 border-2 border-slate-200">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <h3 className="text-lg font-bold text-slate-800">Thông tin nhà phân phối</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700">
                    <div>
                      <span className="text-slate-600">Tên:</span>
                      <span className="ml-2 font-medium">{selectedInvoice.fromDistributor.fullName || selectedInvoice.fromDistributor.username || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Email:</span>
                      <span className="ml-2 font-medium">{selectedInvoice.fromDistributor.email || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Username:</span>
                      <span className="ml-2 font-mono text-xs">{selectedInvoice.fromDistributor.username || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Thông tin thuốc */}
              {selectedInvoice.drug && (
                <div className="bg-white rounded-xl p-5 border-2 border-slate-200">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    <h3 className="text-lg font-bold text-slate-800">Thông tin thuốc</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700">
                    <div>
                      <span className="text-slate-600">Tên thương mại:</span>
                      <span className="ml-2 font-medium">{selectedInvoice.drug.tradeName || selectedInvoice.drug.name || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Tên hoạt chất:</span>
                      <span className="ml-2 font-medium">{selectedInvoice.drug.genericName || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Mã ATC:</span>
                      <span className="ml-2 font-mono font-medium">{selectedInvoice.drug.atcCode || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Thông tin tài chính */}
              <div className="bg-white rounded-xl p-5 border-2 border-[#4BADD1]">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-[#4BADD1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-bold text-[#4BADD1]">Thông tin tài chính</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700">
                  <div>
                    <span className="text-slate-600">Đơn giá:</span>
                    <span className="ml-2 font-medium">{selectedInvoice.unitPrice?.toLocaleString('vi-VN') || 'N/A'} VNĐ</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Tổng tiền:</span>
                    <span className="ml-2 font-bold text-[#4BADD1]">{selectedInvoice.totalAmount?.toLocaleString('vi-VN') || 'N/A'} VNĐ</span>
                  </div>
                  <div>
                    <span className="text-slate-600">VAT ({selectedInvoice.vatRate || 0}%):</span>
                    <span className="ml-2 font-medium">{selectedInvoice.vatAmount?.toLocaleString('vi-VN') || 'N/A'} VNĐ</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Thành tiền:</span>
                    <span className="ml-2 font-bold text-[#4BADD1]">{selectedInvoice.finalAmount?.toLocaleString('vi-VN') || 'N/A'} VNĐ</span>
                  </div>
                </div>
              </div>

              {/* Chain Transaction Hash */}
              {selectedInvoice.chainTxHash && (
                <div className="bg-white rounded-xl p-5 border-2 border-slate-200">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <h3 className="text-lg font-bold text-slate-800">Chain Transaction Hash</h3>
                  </div>
                  <div className="text-slate-700 font-mono text-xs break-all bg-slate-50 p-3 rounded-lg">
                    {selectedInvoice.chainTxHash}
                  </div>
                </div>
              )}

              {/* Ghi chú */}
              {selectedInvoice.notes && (
                <div className="bg-white rounded-xl p-5 border-2 border-slate-200">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <h3 className="text-lg font-bold text-slate-800">Ghi chú</h3>
                  </div>
                  <div className="text-slate-600">{selectedInvoice.notes}</div>
                </div>
              )}
            </div>

            <div className="px-8 py-6 border-t border-gray-200 bg-white rounded-b-3xl flex justify-end">
              <button onClick={() => setShowDetailDialog(false)} className="px-6 py-3 rounded-xl bg-[#4BADD1] text-white font-medium shadow-[0_4px_12px_rgba(75,173,209,0.3)] hover:bg-[#7AC3DE] hover:shadow-[0_6px_16px_rgba(75,173,209,0.4)] transition flex items-center gap-2">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Đóng</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

