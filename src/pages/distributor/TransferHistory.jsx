import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import TruckLoader from '../../components/TruckLoader';
import { getTransferToPharmacyHistory } from '../../services/distributor/distributorService';

export default function TransferHistory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [loadingProgress, setLoadingProgress] = useState(0);
  const progressIntervalRef = useRef(null);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';

  const navigationItems = [
    { path: '/distributor', label: 'Tổng quan', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>), active: false },
    { path: '/distributor/invoices', label: 'Đơn từ nhà SX', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>), active: false },
    { path: '/distributor/transfer-pharmacy', label: 'Chuyển cho NT', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>), active: false },
    { path: '/distributor/distribution-history', label: 'Lịch sử phân phối', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>), active: false },
    { path: '/distributor/transfer-history', label: 'Lịch sử chuyển NT', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>), active: true },
    { path: '/distributor/drugs', label: 'Quản lý thuốc', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>), active: false },
    { path: '/distributor/nft-tracking', label: 'Tra cứu NFT', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>), active: false },
    { path: '/distributor/profile', label: 'Hồ sơ', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>), active: false },
  ];

  useEffect(() => {
    loadData();
    
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [page, search, status]);

  // FIX: Simplified loading logic
  const loadData = async () => {
    try {
      setLoading(true);
      setLoadingProgress(0);
      
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      
      progressIntervalRef.current = setInterval(() => {
        setLoadingProgress(prev => Math.min(prev + 0.02, 0.9));
      }, 50);

      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (status) params.status = status;

      const response = await getTransferToPharmacyHistory(params);

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      if (response.data.success) {
        const data = response.data.data || {};
        const invoices = Array.isArray(data.invoices) ? data.invoices : [];
        const distributions = Array.isArray(data.distributions) ? data.distributions : [];
        const source = invoices.length ? invoices : distributions;
        
        const mapped = source.map((row) => {
          // Xử lý pharmacy - có thể là object hoặc string ID
          let pharmacy = null;
          if (row.toPharmacy) {
            if (typeof row.toPharmacy === 'object' && row.toPharmacy !== null) {
              pharmacy = row.toPharmacy;
            } else if (typeof row.toPharmacy === 'string') {
              // Nếu là string ID, có thể lấy từ commercialInvoice hoặc để null
              pharmacy = row.commercialInvoice?.toPharmacy || null;
            }
          }
          pharmacy = pharmacy || row.pharmacy || row.commercialInvoice?.toPharmacy || null;
          
          // Lấy thông tin từ commercialInvoice nếu có
          const commercialInvoice = row.commercialInvoice || {};
          
          // Lấy transaction hash
          const transactionHash = row.chainTxHash || row.receiptTxHash || commercialInvoice.chainTxHash || null;
          
          // Lấy quantity - ưu tiên receivedQuantity từ distribution, sau đó từ commercialInvoice
          const quantity = row.receivedQuantity ?? row.quantity ?? commercialInvoice.quantity ?? 0;
          
          // Lấy dates
          const createdAt = row.createdAt || commercialInvoice.createdAt;
          const invoiceDate = row.invoiceDate || commercialInvoice.invoiceDate;
          
          // Lấy invoice number
          const invoiceNumber = row.invoiceNumber || commercialInvoice.invoiceNumber;
          
          // Lấy status - ưu tiên status từ distribution
          const statusRow = row.status || commercialInvoice.status;
          
          return { 
            _id: row._id, 
            pharmacy, 
            drug: row.drug, 
            invoiceNumber, 
            invoiceDate, 
            quantity, 
            status: statusRow, 
            createdAt, 
            transactionHash, 
            chainTxHash: transactionHash,
            fromDistributor: row.fromDistributor || null
          };
        });
        
        setItems(mapped);
        setPagination(data.pagination || { page: 1, limit: 10, total: mapped.length, pages: 1 });
      } else {
        setItems([]);
      }

      setLoadingProgress(1);
      await new Promise(resolve => setTimeout(resolve, 300));
      
    } catch (error) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      console.error('Lỗi khi tải lịch sử:', error);
      setItems([]);
    } finally {
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
      paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    };
    return colors[status] || 'bg-slate-100 text-slate-600 border-slate-200';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Đang chờ',
      sent: 'Đã gửi',
      received: 'Đã nhận',
      paid: 'Đã thanh toán',
    };
    return labels[status] || status;
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
          <div className="bg-white rounded-xl border border-cyan-200 shadow-sm p-5">
            <h1 className="text-xl font-semibold text-[#007b91]">Lịch sử chuyển cho nhà thuốc</h1>
            <p className="text-slate-500 text-sm mt-1">Theo dõi tất cả đơn chuyển giao NFT cho pharmacy</p>
          </div>

          {/* Filters */}
          <div className="rounded-2xl bg-white border border-cyan-200 shadow-sm p-4">
            <div className="flex flex-col md:flex-row gap-3 md:items-end">
              <div className="flex-1">
                <label className="block text-sm text-slate-600 mb-1">Tìm kiếm</label>
                <div className="relative">
                  <input
                    value={search}
                    onChange={e => updateFilter({ search: e.target.value, page: 1 })}
                    onKeyDown={e => e.key === 'Enter' && updateFilter({ search, page: 1 })}
                    placeholder="Tìm theo tên nhà thuốc..."
                    className="w-full h-12 px-4 pr-32 rounded-full border border-gray-200 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                  />
                  <button
                    onClick={() => updateFilter({ search, page: 1 })}
                    className="absolute right-1 top-1 bottom-1 px-6 rounded-full bg-[#3db6d9] hover:bg-[#2fa2c5] text-white font-medium transition"
                  >
                    Tìm kiếm
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Trạng thái</label>
                <div className="relative">
                  <select
                    value={status}
                    onChange={e => updateFilter({ status: e.target.value, page: 1 })}
                    className="h-12 w-full rounded-full appearance-none border border-gray-200 bg-white text-gray-700 px-4 pr-12 shadow-sm hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400 transition"
                  >
                    <option value="">Tất cả</option>
                    <option value="pending">Pending</option>
                    <option value="sent">Sent</option>
                    <option value="received">Received</option>
                    <option value="paid">Paid</option>
                  </select>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.17l3.71-2.94a.75.75 0 111.04 1.08l-4.24 3.36a.75.75 0 01-.94 0L5.21 8.31a.75.75 0 01.02-1.1z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* List */}
          <div className="space-y-4">
            {items.length === 0 ? (
              <div className="bg-white rounded-2xl border border-cyan-200 p-10 text-center">
                <h3 className="text-xl font-bold text-slate-800 mb-2">Chưa có lịch sử chuyển giao</h3>
                <p className="text-slate-600">Các đơn chuyển cho nhà thuốc sẽ hiển thị ở đây</p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item._id} className="bg-white rounded-2xl border border-cyan-100 shadow-sm overflow-hidden hover:shadow-lg transition">
                  {/* Header */}
                  <div className="p-5 flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-[#003544]">
                      {item.pharmacy?.name || item.pharmacy?.fullName || (typeof item.pharmacy === 'string' ? item.pharmacy : 'N/A')}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                      {getStatusLabel(item.status)}
                    </span>
                  </div>

                  {/* Summary Boxes */}
                  <div className="px-5 pb-3 space-y-3">
                    {/* Box 1: Invoice & Quantity */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="font-semibold text-slate-800">Số hóa đơn:</span>
                          <span className="ml-2 font-mono text-slate-800">{item.invoiceNumber || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-800">Số lượng:</span>
                          <span className="ml-2 font-semibold text-slate-800">{item.quantity || 0} NFT</span>
                        </div>
                      </div>
                    </div>

                    {/* Box 2: Dates */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="font-semibold text-slate-800">Ngày tạo:</span>
                          <span className="ml-2 text-slate-800">
                            {item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-800">Ngày hóa đơn:</span>
                          <span className="ml-2 text-slate-800">
                            {item.invoiceDate ? new Date(item.invoiceDate).toLocaleString('vi-VN') : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Box 3: Pharmacy */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                      <div className="font-semibold text-slate-800 mb-1">Nhà thuốc:</div>
                      <div className="text-slate-800">
                        {item.pharmacy?.name || item.pharmacy?.fullName || (typeof item.pharmacy === 'string' ? item.pharmacy : 'N/A')}
                      </div>
                    </div>
                  </div>

                  {/* Progress Tracker */}
                  <div className="px-5 pb-5 pt-3 border-t border-slate-200">
                    <div className="flex items-center gap-2 text-xs">
                      <div className={`flex items-center gap-1 ${item.status === 'pending' ? 'text-cyan-600' : ['sent', 'received', 'paid'].includes(item.status) ? 'text-slate-700' : 'text-slate-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${item.status === 'pending' ? 'bg-cyan-500' : ['sent', 'received', 'paid'].includes(item.status) ? 'bg-slate-700' : 'bg-slate-300'}`}></div>
                        <span>Pending</span>
                      </div>
                      <div className={`flex-1 h-px ${['sent', 'received', 'paid'].includes(item.status) ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
                      <div className={`flex items-center gap-1 ${item.status === 'sent' ? 'text-cyan-600' : ['received', 'paid'].includes(item.status) ? 'text-slate-700' : 'text-slate-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${item.status === 'sent' ? 'bg-cyan-500' : ['received', 'paid'].includes(item.status) ? 'bg-slate-700' : 'bg-slate-300'}`}></div>
                        <span>Sent</span>
                      </div>
                      <div className={`flex-1 h-px ${['received', 'paid'].includes(item.status) ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
                      <div className={`flex items-center gap-1 ${item.status === 'received' ? 'text-cyan-600' : item.status === 'paid' ? 'text-slate-700' : 'text-slate-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${item.status === 'received' ? 'bg-cyan-500' : item.status === 'paid' ? 'bg-slate-700' : 'bg-slate-300'}`}></div>
                        <span>Received</span>
                      </div>
                      <div className={`flex-1 h-px ${item.status === 'paid' ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
                      <div className={`flex items-center gap-1 ${item.status === 'paid' ? 'text-cyan-600' : 'text-slate-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${item.status === 'paid' ? 'bg-cyan-500' : 'bg-slate-300'}`}></div>
                        <span>Paid</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-5">
            <div className="text-sm text-slate-600">
              Hiển thị {items.length} / {pagination.total} đơn chuyển giao
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => updateFilter({ page: page - 1 })}
                className={`px-3 py-2 rounded-xl ${
                  page <= 1 
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                    : 'bg-white border border-cyan-300 hover:bg-cyan-50'
                }`}
              >
                Trước
              </button>
              <span className="text-sm text-slate-700">
                Trang {page} / {pagination.pages || 1}
              </span>
              <button
                disabled={page >= pagination.pages}
                onClick={() => updateFilter({ page: page + 1 })}
                className={`px-3 py-2 rounded-xl ${
                  page >= pagination.pages 
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-[#00b4d8] to-[#48cae4] text-white hover:shadow-lg'
                }`}
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}