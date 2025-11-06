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
          const pharmacy = row.toPharmacy || row.pharmacy || row.commercialInvoice?.toPharmacy || null;
          const transactionHash = row.chainTxHash || row.receiptTxHash || row.commercialInvoice?.chainTxHash || null;
          const quantity = row.quantity ?? row.receivedQuantity ?? row.commercialInvoice?.quantity ?? 0;
          const createdAt = row.createdAt || row.commercialInvoice?.createdAt;
          const invoiceNumber = row.invoiceNumber || row.commercialInvoice?.invoiceNumber;
          const invoiceDate = row.invoiceDate || row.commercialInvoice?.invoiceDate;
          const statusRow = row.status || row.commercialInvoice?.status;
          
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
            chainTxHash: transactionHash 
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
      pending: '⏳ Pending',
      sent: '📦 Sent',
      received: '✅ Received',
      paid: '💰 Paid',
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
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
                    </svg>
                  </span>
                  <input
                    value={search}
                    onChange={e => updateFilter({ search: e.target.value, page: 1 })}
                    onKeyDown={e => e.key === 'Enter' && updateFilter({ search, page: 1 })}
                    placeholder="Tìm theo tên nhà thuốc..."
                    className="w-full h-12 pl-11 pr-40 rounded-full border border-gray-200 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
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
                <label className="block text-sm text-slate-600 mb-1">Trạng thái</label>
                <select
                  value={status}
                  onChange={e => updateFilter({ status: e.target.value, page: 1 })}
                  className="h-12 rounded-full border border-gray-200 bg-white text-gray-700 px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                >
                  <option value="">Tất cả</option>
                  <option value="pending">Pending</option>
                  <option value="sent">Sent</option>
                  <option value="received">Received</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>
          </div>

          {/* List */}
          <div className="space-y-4">
            {items.length === 0 ? (
              <div className="bg-white rounded-2xl border border-cyan-200 p-10 text-center">
                <div className="text-5xl mb-4">🏥</div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Chưa có lịch sử chuyển giao</h3>
                <p className="text-slate-600">Các đơn chuyển cho nhà thuốc sẽ hiển thị ở đây</p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item._id} className="bg-white rounded-2xl border border-cyan-100 shadow-sm overflow-hidden hover:shadow-lg transition">
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-slate-800">
                            → {item.pharmacy?.name || 'N/A'}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                            {getStatusLabel(item.status)}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-slate-600">
                          <div>📦 Số lượng: <span className="font-bold text-orange-700">{item.quantity} NFT</span></div>
                          <div>🕒 Ngày tạo: <span className="font-medium">{new Date(item.createdAt).toLocaleString('vi-VN')}</span></div>
                        </div>
                      </div>
                    </div>

                    {item.pharmacy && (
                      <div className="bg-cyan-50 rounded-xl p-3 border border-cyan-200 text-sm mb-3">
                        <div className="text-xs text-cyan-700 mb-1">🏥 Nhà thuốc</div>
                        <div className="font-semibold text-cyan-800">{item.pharmacy?.name || 'N/A'}</div>
                        {item.pharmacy?.address && <div className="text-xs text-cyan-600 mt-1">{item.pharmacy.address}</div>}
                      </div>
                    )}

                    {item.pharmacy?.walletAddress && (
                      <div className="bg-purple-50 rounded-xl p-3 border border-purple-200 text-sm mb-3">
                        <div className="text-xs text-purple-700 mb-1">👛 Wallet Address</div>
                        <div className="font-mono text-xs text-purple-800 break-all">{item.pharmacy.walletAddress}</div>
                      </div>
                    )}

                    {item.notes && (
                      <div className="bg-slate-50 rounded-xl p-3 text-sm mb-3">
                        <div className="font-semibold text-slate-700 mb-1">📝 Ghi chú:</div>
                        <div className="text-slate-600">{item.notes}</div>
                      </div>
                    )}

                    {item.transactionHash && (
                      <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200 text-sm mb-3">
                        <div className="font-semibold text-emerald-800 mb-1">⛓️ Transaction Hash:</div>
                        <div className="font-mono text-xs text-emerald-700 break-all">{item.transactionHash}</div>
                      </div>
                    )}

                    {/* Progress Timeline */}
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <div className="flex items-center gap-2 text-xs">
                        <div className={`flex items-center gap-1 ${['pending', 'sent', 'received', 'paid'].includes(item.status) ? 'text-amber-600' : 'text-slate-400'}`}>
                          <div className={`w-2 h-2 rounded-full ${['pending', 'sent', 'received', 'paid'].includes(item.status) ? 'bg-amber-500' : 'bg-slate-300'}`}></div>
                          <span>Pending</span>
                        </div>
                        <div className="flex-1 h-px bg-slate-200"></div>
                        <div className={`flex items-center gap-1 ${['sent', 'received', 'paid'].includes(item.status) ? 'text-cyan-600' : 'text-slate-400'}`}>
                          <div className={`w-2 h-2 rounded-full ${['sent', 'received', 'paid'].includes(item.status) ? 'bg-cyan-500' : 'bg-slate-300'}`}></div>
                          <span>Sent</span>
                        </div>
                        <div className="flex-1 h-px bg-slate-200"></div>
                        <div className={`flex items-center gap-1 ${['received', 'paid'].includes(item.status) ? 'text-blue-600' : 'text-slate-400'}`}>
                          <div className={`w-2 h-2 rounded-full ${['received', 'paid'].includes(item.status) ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                          <span>Received</span>
                        </div>
                        <div className="flex-1 h-px bg-slate-200"></div>
                        <div className={`flex items-center gap-1 ${item.status === 'paid' ? 'text-emerald-600' : 'text-slate-400'}`}>
                          <div className={`w-2 h-2 rounded-full ${item.status === 'paid' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                          <span>Paid</span>
                        </div>
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