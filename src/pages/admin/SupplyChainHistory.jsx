import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import { getSupplyChainHistory } from '../../services/admin/adminService';
import TruckLoader from '../../components/TruckLoader';

export default function SupplyChainHistory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [loadingProgress, setLoadingProgress] = useState(0);
  const progressIntervalRef = useRef(null);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const drugId = searchParams.get('drugId') || '';
  const tokenId = searchParams.get('tokenId') || '';
  const status = searchParams.get('status') || '';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';

  const navigationItems = useMemo(() => ([
    { path: '/admin', label: 'Tổng quan', icon: null, active: false },
    { path: '/admin/supply-chain', label: 'Lịch sử truy xuất', icon: null, active: true },
  ]), []);

  const load = async () => {
    setLoading(true); 
    setError('');
    setLoadingProgress(0);
    if (progressIntervalRef.current) { clearInterval(progressIntervalRef.current); progressIntervalRef.current = null; }
    // 0 -> 0.9
    progressIntervalRef.current = setInterval(() => {
      setLoadingProgress(prev => (prev < 0.9 ? Math.min(prev + 0.02, 0.9) : prev));
    }, 50);
    try {
      const params = { page, limit: 20 };
      if (drugId) params.drugId = drugId;
      if (tokenId) params.tokenId = tokenId;
      if (status) params.status = status;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await getSupplyChainHistory(params);
      
      // Debug: Log response để kiểm tra cấu trúc
      console.log('📥 Supply Chain History response:', response);
      console.log('📥 Response data:', response?.data);
      
      // Xử lý response - kiểm tra nhiều cấu trúc có thể có
      const responseData = response?.data;
      
      // Kiểm tra nếu có success field
      if (responseData?.success === false) {
        throw new Error(responseData?.message || 'Lỗi từ server');
      }
      
      // Lấy items từ nhiều cấu trúc có thể có
      let items = [];
      if (responseData?.success && responseData?.data) {
        // Cấu trúc: { success: true, data: { history: [...], pagination: {...} } }
        items = responseData.data.history || responseData.data || [];
      } else if (responseData?.data?.history) {
        // Cấu trúc: { data: { history: [...], pagination: {...} } }
        items = responseData.data.history;
      } else if (responseData?.history) {
        // Cấu trúc: { history: [...], pagination: {...} }
        items = responseData.history;
      } else if (Array.isArray(responseData?.data)) {
        // Cấu trúc: { data: [...] }
        items = responseData.data;
      } else if (Array.isArray(responseData)) {
        // Cấu trúc: [...]
        items = responseData;
      }
      
      // Lấy pagination
      let pagination = { page: 1, limit: 20, total: 0, pages: 0 };
      if (responseData?.success && responseData?.data?.pagination) {
        pagination = responseData.data.pagination;
      } else if (responseData?.data?.pagination) {
        pagination = responseData.data.pagination;
      } else if (responseData?.pagination) {
        pagination = responseData.pagination;
      }
      
      console.log('📋 Parsed items:', items);
      console.log('📋 Parsed pagination:', pagination);
      
      setItems(items);
      setPagination(pagination);
    } catch (e) { 
      console.error('❌ Error loading supply chain history:', e);
      console.error('❌ Error response:', e?.response);
      console.error('❌ Error status:', e?.response?.status);
      console.error('❌ Error data:', e?.response?.data);
      
      // Hiển thị lỗi chi tiết hơn
      let errorMsg = 'Không thể tải dữ liệu';
      if (e?.response?.status === 500) {
        errorMsg = 'Lỗi server (500): Vui lòng kiểm tra backend hoặc thử lại sau.';
      } else if (e?.response?.status === 401) {
        errorMsg = 'Bạn chưa đăng nhập hoặc token đã hết hạn.';
      } else if (e?.response?.status === 403) {
        errorMsg = 'Bạn không có quyền truy cập trang này.';
      } else if (e?.response?.data?.message) {
        errorMsg = e.response.data.message;
      } else if (e?.message) {
        errorMsg = e.message;
      }
      
      setError(errorMsg); 
    } finally { 
      if (progressIntervalRef.current) { clearInterval(progressIntervalRef.current); progressIntervalRef.current = null; }
      let current = 0; setLoadingProgress(p => { current = p; return p; });
      if (current < 0.9) {
        await new Promise(resolve => {
          const su = setInterval(() => {
            setLoadingProgress(prev => {
              if (prev < 1) { const np = Math.min(prev + 0.15, 1); if (np >= 1) { clearInterval(su); resolve(); } return np; }
              clearInterval(su); resolve(); return 1;
            });
          }, 30);
          setTimeout(() => { clearInterval(su); setLoadingProgress(1); resolve(); }, 500);
        });
      } else {
        setLoadingProgress(1); await new Promise(r => setTimeout(r, 200));
      }
      await new Promise(r => setTimeout(r, 100));
      setLoading(false); 
      setTimeout(() => setLoadingProgress(0), 500);
    }
  };

  useEffect(() => { 
    load(); 
    return () => { if (progressIntervalRef.current) { clearInterval(progressIntervalRef.current); progressIntervalRef.current = null; } };
  }, [page, drugId, tokenId, status, startDate, endDate]);

  const updateFilter = (next) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([k, v]) => {
      if (v === '' || v === undefined || v === null) nextParams.delete(k); 
      else nextParams.set(k, String(v));
    });
    setSearchParams(nextParams);
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  const getStageLabel = (stage) => {
    const labels = {
      manufacturing: 'Sản xuất',
      transfer_to_distributor: 'Chuyển cho NPP',
      distributor_received: 'NPP nhận hàng',
      transfer_to_pharmacy: 'Chuyển cho Nhà thuốc',
      pharmacy_received: 'Nhà thuốc nhận hàng',
    };
    return labels[stage] || stage;
  };

  const translateStatus = (status) => {
    const statusMap = {
      'pending': 'Đang chờ',
      'completed': 'Hoàn thành',
      'confirmed': 'Đã xác nhận',
    };
    return statusMap[status] || status;
  };

  const getStageColor = (stage) => {
    const colors = {
      manufacturing: 'bg-blue-100 text-blue-700 border-blue-200',
      transfer_to_distributor: 'bg-cyan-100 text-cyan-700 border-cyan-200',
      distributor_received: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      transfer_to_pharmacy: 'bg-purple-100 text-purple-700 border-purple-200',
      pharmacy_received: 'bg-green-100 text-green-700 border-green-200',
    };
    return colors[stage] || 'bg-slate-100 text-slate-700 border-slate-200';
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
        <>
      {/* Banner */}
      <div className="bg-white rounded-xl border border-cyan-200 shadow-sm p-5 mb-4">
        <h2 className="text-xl font-semibold text-[#007b91]">Lịch sử truy xuất toàn bộ</h2>
        <p className="text-slate-500 text-sm mt-1">Theo dõi hành trình thuốc từ sản xuất đến nhà thuốc</p>
      </div>

      {/* Filters */}
      <motion.div
        className="rounded-2xl bg-white border border-cyan-200 shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-4 mb-4"
        variants={fadeUp}
        initial="hidden"
        animate="show"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm text-[#003544]/70 mb-1">Mã thuốc</label>
            <input
              value={drugId}
              onChange={e => updateFilter({ drugId: e.target.value, page: 1 })}
              placeholder="Lọc theo mã thuốc"
              className="w-full h-12 rounded-full border border-gray-200 bg-white text-gray-700 px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-[#48cae4] transition"
            />
          </div>
          
          <div>
            <label className="block text-sm text-[#003544]/70 mb-1">Token ID (NFT)</label>
            <input
              value={tokenId}
              onChange={e => updateFilter({ tokenId: e.target.value, page: 1 })}
              placeholder="Lọc theo Token ID"
              className="w-full h-12 rounded-full border border-gray-200 bg-white text-gray-700 px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-[#48cae4] transition"
            />
          </div>
          
          <div>
            <label className="block text-sm text-[#003544]/70 mb-1">Trạng thái</label>
            <select
              value={status}
              onChange={e => updateFilter({ status: e.target.value, page: 1 })}
              className="w-full h-12 rounded-full border border-gray-200 bg-white text-gray-700 px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-[#48cae4] transition"
            >
              <option value="">Tất cả</option>
              <option value="pending">Đang chờ</option>
              <option value="completed">Hoàn thành</option>
              <option value="confirmed">Đã xác nhận</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-[#003544]/70 mb-1">Từ ngày</label>
            <input
              type="date"
              value={startDate}
              onChange={e => updateFilter({ startDate: e.target.value, page: 1 })}
              className="w-full h-12 rounded-full border border-gray-200 bg-white text-gray-700 px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-[#48cae4] transition"
            />
          </div>
          
          <div>
            <label className="block text-sm text-[#003544]/70 mb-1">Đến ngày</label>
            <input
              type="date"
              value={endDate}
              onChange={e => updateFilter({ endDate: e.target.value, page: 1 })}
              className="w-full h-12 rounded-full border border-gray-200 bg-white text-gray-700 px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-[#48cae4] transition"
            />
          </div>
        </div>
      </motion.div>

      {/* Timeline */}
      <motion.div 
        className="bg-white rounded-2xl border border-cyan-100 shadow-sm p-6" 
        variants={fadeUp} 
        initial="hidden" 
        animate="show"
      >
        {error ? (
          <div className="p-6 text-red-600">{error}</div>
        ) : items.length === 0 ? (
          <div className="p-6 text-slate-600">Không có dữ liệu</div>
        ) : (
          <div className="space-y-4">
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-4 group">
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${getStageColor(item.stage).split(' ')[0]} border-2 ${getStageColor(item.stage).split(' ')[2]}`} />
                  {idx < items.length - 1 && (
                    <div className="w-0.5 flex-1 bg-slate-200 my-2" />
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 pb-6">
                  <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-lg transition">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStageColor(item.stage)}`}>
                        {getStageLabel(item.stage)}
                      </span>
                      <span className="text-sm text-slate-500">
                        {new Date(item.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      {item.drug && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-600">Thuốc:</span>
                          <span className="font-medium text-[#003544]">{item.drug.tradeName} ({item.drug.atcCode})</span>
                        </div>
                      )}
                      
                      {item.manufacturer && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-600">Nhà sản xuất:</span>
                          <span className="font-medium text-[#003544]">{item.manufacturer.name}</span>
                        </div>
                      )}
                      
                      {item.fromManufacturer && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-600">Từ:</span>
                          <span className="font-medium text-[#003544]">{item.fromManufacturer.fullName || item.fromManufacturer.username}</span>
                        </div>
                      )}
                      
                      {item.toDistributor && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-600">Đến NPP:</span>
                          <span className="font-medium text-[#003544]">{item.toDistributor.fullName || item.toDistributor.username}</span>
                        </div>
                      )}
                      
                      {item.fromDistributor && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-600">Từ NPP:</span>
                          <span className="font-medium text-[#003544]">{item.fromDistributor.fullName || item.fromDistributor.username}</span>
                        </div>
                      )}
                      
                      {item.toPharmacy && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-600">Đến Nhà thuốc:</span>
                          <span className="font-medium text-[#003544]">{item.toPharmacy.fullName || item.toPharmacy.username}</span>
                        </div>
                      )}
                      
                      {item.quantity && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-600">Số lượng:</span>
                          <span className="font-medium text-[#003544]">{item.quantity}</span>
                        </div>
                      )}
                      
                      {item.distributedQuantity && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-600">Số lượng phân phối:</span>
                          <span className="font-medium text-[#003544]">{item.distributedQuantity}</span>
                        </div>
                      )}
                      
                      {item.receivedQuantity && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-600">Số lượng nhận:</span>
                          <span className="font-medium text-[#003544]">{item.receivedQuantity}</span>
                        </div>
                      )}
                      
                      {item.invoiceNumber && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-600">Số hóa đơn:</span>
                          <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">{item.invoiceNumber}</span>
                        </div>
                      )}
                      
                      {item.chainTxHash && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-600">Blockchain TX:</span>
                          <a 
                            href={`https://sepolia.etherscan.io/tx/${item.chainTxHash}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-mono text-xs text-cyan-600 hover:text-cyan-700 hover:underline"
                          >
                            {item.chainTxHash.slice(0, 10)}...{item.chainTxHash.slice(-8)}
                          </a>
                        </div>
                      )}
                      
                      {item.status && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-600">Trạng thái:</span>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            item.status === 'completed' || item.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                            item.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {translateStatus(item.status)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Pagination */}
      <div className="flex items-center justify-end gap-2 mt-4">
        <button
          disabled={page <= 1}
          onClick={() => updateFilter({ page: page - 1 })}
          className={`px-3 py-2 rounded-xl ${page <= 1 ? 'bg-slate-200 text-slate-400' : 'bg-white border border-cyan-200 hover:bg-[#f5fcff]'}`}
        >Trước</button>
        <span className="text-sm text-slate-700">Trang {page}</span>
        <button
          onClick={() => updateFilter({ page: page + 1 })}
          className="px-3 py-2 rounded-xl text-white bg-gradient-to-r from-[#00b4d8] via-[#48cae4] to-[#90e0ef] shadow-[0_10px_24px_rgba(0,180,216,0.30)] hover:shadow-[0_14px_36px_rgba(0,180,216,0.40)]"
        >Sau</button>
      </div>
        </>
      )}
    </DashboardLayout>
  );
}

