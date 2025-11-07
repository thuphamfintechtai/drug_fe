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
  const [expandedItems, setExpandedItems] = useState(new Set());
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

  // === Toggle mở rộng item ===
  const toggleExpand = (id) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const load = async () => {
    setLoading(true); 
    setError('');
    setLoadingProgress(0);
    if (progressIntervalRef.current) { clearInterval(progressIntervalRef.current); progressIntervalRef.current = null; }
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
      
      console.log('📥 Supply Chain History response:', response);
      console.log('📥 Response data:', response?.data);
      
      const responseData = response?.data;
      
      if (responseData?.success === false) {
        throw new Error(responseData?.message || 'Lỗi từ server');
      }
      
      let items = [];
      if (responseData?.success && responseData?.data) {
        items = responseData.data.history || responseData.data || [];
      } else if (responseData?.data?.history) {
        items = responseData.data.history;
      } else if (responseData?.history) {
        items = responseData.history;
      } else if (Array.isArray(responseData?.data)) {
        items = responseData.data;
      } else if (Array.isArray(responseData)) {
        items = responseData;
      }
      
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
      'sent': 'Đã gửi',
      'draft': 'Bản nháp',
    };
    return statusMap[status] || status;
  };

  const getStageColor = (stage) => {
    const colors = {
      manufacturing: 'bg-[#E6F6FC] text-[#077CA3] border-[#4BADD1]',
      transfer_to_distributor: 'bg-[#F0FBFF] text-[#2F9AC4] border-[#7AC3DE]',
      distributor_received: 'bg-[#E8FDF2] text-[#0F5132] border-[#34D399]',
      transfer_to_pharmacy: 'bg-[#F3F0FF] text-[#4338CA] border-[#7C3AED]',
      pharmacy_received: 'bg-[#E6FCF2] text-[#166534] border-[#22C55E]',
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
            <h2 className="text-xl font-semibold text-[#077CA3]">Lịch sử truy xuất chuỗi cung ứng</h2>
            <p className="text-slate-500 text-sm mt-1">
              Theo dõi hành trình thuốc từ sản xuất đến nhà thuốc
            </p>
          </div>

          {/* Bộ lọc */}
          <motion.div
            className="rounded-2xl bg-white border border-cyan-200 shadow-[0_8px_24px_rgba(0,180,216,0.1)] p-4 mb-4"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm text-[#003544]/70 mb-1">Mã thuốc</label>
                <input
                  value={drugId}
                  onChange={(e) => updateFilter({ drugId: e.target.value, page: 1 })}
                  placeholder="Nhập mã thuốc"
                  className="w-full h-12 rounded-full border border-gray-200 bg-white px-4 focus:ring-2 focus:ring-[#48cae4] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-[#003544]/70 mb-1">Token ID (NFT)</label>
                <input
                  value={tokenId}
                  onChange={(e) => updateFilter({ tokenId: e.target.value, page: 1 })}
                  placeholder="Lọc theo Token ID"
                  className="w-full h-12 rounded-full border border-gray-200 bg-white px-4 focus:ring-2 focus:ring-[#48cae4] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-[#003544]/70 mb-1">Trạng thái</label>
                <select
                  value={status}
                  onChange={(e) => updateFilter({ status: e.target.value, page: 1 })}
                  className="w-full h-12 rounded-full border border-gray-200 bg-white px-4 focus:ring-2 focus:ring-[#48cae4] focus:outline-none"
                >
                  <option value="">Tất cả</option>
                  <option value="pending">Đang chờ</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="sent">Đã gửi</option>
                  <option value="draft">Bản nháp</option>
                </select>
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
              <div className="p-6 text-slate-600 text-center">Không có dữ liệu</div>
            ) : (
              <div className="space-y-4">
                {items.map((item, idx) => {
                  const id = item.id || idx;
                  const expanded = expandedItems.has(id);
                  return (
                    <div
                      key={id}
                      className="flex gap-4 group cursor-pointer"
                      onClick={() => toggleExpand(id)}
                    >
                      {/* Timeline line */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-3 h-3 rounded-full border-2 ${getStageColor(item.stage)}`}
                        />
                        {idx < items.length - 1 && (
                          <div className="w-0.5 flex-1 bg-slate-200 my-2" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-4">
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25 }}
                          className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-[0_8px_24px_rgba(75,173,209,0.15)] transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium border ${getStageColor(
                                item.stage
                              )}`}
                            >
                              {getStageLabel(item.stage)}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-slate-500">
                                {new Date(item.createdAt).toLocaleString('vi-VN')}
                              </span>
                              <motion.span
                                animate={{ rotate: expanded ? 90 : 0 }}
                                transition={{ duration: 0.25 }}
                                className="text-slate-400 text-sm"
                              >
                                ▶
                              </motion.span>
                            </div>
                          </div>

                          {!expanded && (
                            <div className="text-sm text-slate-600 mt-2">
                              {item.stageName || getStageLabel(item.stage)} –{' '}
                              {translateStatus(item.status)}
                            </div>
                          )}

                          <motion.div
                            initial={false}
                            animate={{
                              height: expanded ? 'auto' : 0,
                              opacity: expanded ? 1 : 0,
                            }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 space-y-2 text-sm">
                              {item.drug && (
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-600">Thuốc:</span>
                                  <span className="font-medium text-[#003544]">
                                    {item.drug.tradeName} ({item.drug.atcCode})
                                  </span>
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
                                  <span className="font-medium text-[#003544]">
                                    {item.fromDistributor.fullName}
                                  </span>
                                </div>
                              )}

                              {item.toPharmacy && (
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-600">Đến Nhà thuốc:</span>
                                  <span className="font-medium text-[#003544]">
                                    {item.toPharmacy.fullName}
                                  </span>
                                </div>
                              )}

                              {item.quantity && (
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-600">Số lượng:</span>
                                  <span className="font-medium text-[#003544]">
                                    {item.quantity}
                                  </span>
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
                                    className="font-mono text-xs text-[#2F9AC4] hover:underline"
                                  >
                                    {item.chainTxHash.slice(0, 10)}...
                                    {item.chainTxHash.slice(-8)}
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
                          </motion.div>
                        </motion.div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Pagination */}
          <div className="flex items-center justify-end gap-2 mt-4">
            <button
              disabled={page <= 1}
              onClick={() => updateFilter({ page: page - 1 })}
              className={`px-3 py-2 rounded-xl ${
                page <= 1
                  ? 'bg-slate-200 text-slate-400'
                  : 'bg-white border border-cyan-200 hover:bg-[#f5fcff]'
              }`}
            >
              Trước
            </button>
            <span className="text-sm text-slate-700">Trang {page}</span>
            <button
              onClick={() => updateFilter({ page: page + 1 })}
              className="px-3 py-2 rounded-xl text-white bg-gradient-to-r from-[#4BADD1] via-[#7AC3DE] to-[#2F9AC4] shadow-[0_8px_24px_rgba(75,173,209,0.3)] hover:shadow-[0_12px_32px_rgba(75,173,209,0.4)] transition"
            >
              Sau
            </button>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}