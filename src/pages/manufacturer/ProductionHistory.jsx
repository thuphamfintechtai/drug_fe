import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import TruckLoader from '../../components/TruckLoader';
import { getProductionHistory } from '../../services/manufacturer/manufacturerService';

export default function ProductionHistory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const progressIntervalRef = useRef(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });

  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';

  const navigationItems = [
    { path: '/manufacturer', label: 'Tổng quan', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>), active: false },
    { path: '/manufacturer/drugs', label: 'Quản lý thuốc', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>), active: false },
    { path: '/manufacturer/production', label: 'Sản xuất thuốc', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>), active: false },
    { path: '/manufacturer/transfer', label: 'Chuyển giao', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>), active: false },
    { path: '/manufacturer/production-history', label: 'Lịch sử sản xuất', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>), active: false },
    { path: '/manufacturer/transfer-history', label: 'Lịch sử chuyển giao', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>), active: false },
    { path: '/manufacturer/profile', label: 'Hồ sơ', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>), active: false },
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

      const response = await getProductionHistory(params);
      
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      
      if (response.data.success) {
        setItems(response.data.data.productions || []);
        setPagination(response.data.data.pagination || { page: 1, limit: 10, total: 0, pages: 0 });
      }
      
      setLoadingProgress(1);
      await new Promise(resolve => setTimeout(resolve, 300));
      
    } catch (error) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      console.error('Lỗi khi tải lịch sử sản xuất:', error);
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
      minted: 'bg-cyan-100 text-cyan-700 border-cyan-200',
      transferred: 'bg-purple-100 text-purple-700 border-purple-200',
      sold: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      expired: 'bg-red-100 text-red-700 border-red-200',
      recalled: 'bg-orange-100 text-orange-700 border-orange-200',
      none: 'bg-slate-100 text-slate-600 border-slate-200',
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
    };
    return colors[status] || 'bg-slate-100 text-slate-600 border-slate-200';
  };

  const getStatusLabel = (status) => {
    const labels = {
      minted: 'Đã Mint',
      transferred: 'Đã chuyển',
      sold: 'Đã bán',
      expired: 'Hết hạn',
      recalled: 'Thu hồi',
      none: 'Chưa chuyển',
      pending: 'Đang chờ',
    };
    return labels[status] || status;
  };

  const getTransferStatusColor = (transferStatus) => {
    const colors = {
      none: 'bg-slate-100 text-slate-700 border-slate-200',
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      transferred: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    };
    return colors[transferStatus] || 'bg-slate-100 text-slate-600 border-slate-200';
  };

  const getTransferStatusLabel = (transferStatus) => {
    const labels = {
      none: 'Chưa chuyển',
      pending: 'Đang chờ chuyển',
      transferred: 'Đã chuyển',
    };
    return labels[transferStatus] || transferStatus;
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
            <h1 className="text-xl font-semibold text-[#007b91] flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M5 10h14M4 14h16M6 18h12" />
              </svg>
              Lịch sử sản xuất
            </h1>
            <p className="text-slate-500 text-sm mt-1">Xem tất cả các lô sản xuất và trạng thái chuyển giao NFT</p>
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
                    placeholder="Tìm theo tên thuốc, số lô..."
                    className="w-full h-12 pl-11 pr-32 rounded-full border border-gray-200 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
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
                    <option value="minted">Minted (chưa chuyển)</option>
                    <option value="transferred">Transferred</option>
                    <option value="sold">Sold</option>
                    <option value="expired">Expired</option>
                    <option value="recalled">Recalled</option>
                  </select>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                    viewBox="0 0 20 20" fill="currentColor"
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
                <h3 className="text-xl font-bold text-slate-800 mb-2">Chưa có lịch sử sản xuất</h3>
                <p className="text-slate-600">Các lô sản xuất của bạn sẽ hiển thị ở đây</p>
              </div>
            ) : (
              items.map((item, idx) => (
                <div key={item._id || idx} className="bg-white rounded-2xl border border-cyan-100 shadow-sm overflow-hidden hover:shadow-lg transition">
                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-slate-800">
                        {item.drug?.tradeName || 'N/A'}
                      </h3>
                      {item.transferStatus && (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTransferStatusColor(item.transferStatus)}`}>
                          {getTransferStatusLabel(item.transferStatus)}
                        </span>
                      )}
                    </div>

                    {/* Top facts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-sm">
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                        <div className="text-slate-600">Số lô: <span className="font-mono font-medium text-slate-800">{item.batchNumber || 'N/A'}</span></div>
                        {item.nftCount !== undefined && (
                          <div className="mt-1">Số lượng NFT đã mint: <span className="font-bold text-cyan-700">{item.nftCount}</span></div>
                        )}
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                        <div className="text-slate-600">Số lượng sản xuất: <span className="font-bold text-purple-700">{item.quantity || 0}</span></div>
                        <div className="mt-1">ATC Code: <span className="font-mono text-cyan-700">{item.drug?.atcCode || 'N/A'}</span></div>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                        <div className="text-xs text-slate-500 mb-1">Ngày sản xuất</div>
                        <div className="font-semibold text-slate-800">
                          {item.mfgDate ? new Date(item.mfgDate).toLocaleDateString('vi-VN') : 'N/A'}
                        </div>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                        <div className="text-xs text-slate-500 mb-1">Hạn sử dụng</div>
                        <div className="font-semibold text-slate-800">
                          {item.expDate ? new Date(item.expDate).toLocaleDateString('vi-VN') : 'N/A'}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                        <div className="text-xs text-slate-500 mb-1">Ngày tạo</div>
                        <div className="font-medium text-slate-700 text-sm">
                          {item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : 'N/A'}
                        </div>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                        <div className="text-xs text-slate-500 mb-1">Cập nhật lần cuối</div>
                        <div className="font-medium text-slate-700 text-sm">
                          {item.updatedAt ? new Date(item.updatedAt).toLocaleString('vi-VN') : 'N/A'}
                        </div>
                      </div>
                    </div>

                    {item.chainTxHash && (
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-sm mb-3">
                        <div className="font-semibold text-slate-800 mb-1">Transaction Hash (Blockchain)</div>
                        <div className="font-mono text-xs text-slate-700 break-all">{item.chainTxHash}</div>
                        <a
                          href={`https://zeroscan.org/tx/${item.chainTxHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-slate-600 hover:text-slate-800 underline mt-1 inline-block"
                        >
                          Xem trên ZeroScan →
                        </a>
                      </div>
                    )}

                    {item.notes && (
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-sm mb-3">
                        <div className="font-semibold text-slate-800 mb-1">Ghi chú:</div>
                        <div className="text-slate-700">{item.notes}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-5">
            <div className="text-sm text-slate-600">
              Hiển thị {items.length} / {pagination.total} lô sản xuất
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