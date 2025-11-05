import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  getDistributions, 
  getDistributionDetail, 
  approveDistribution 
} from '../../services/manufacturer/manufacturerService';

export default function DistributionConfirmation() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [distributions, setDistributions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [approvingId, setApprovingId] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedDistribution, setSelectedDistribution] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [error, setError] = useState(null); // ✅ Thêm error state

  const page = parseInt(searchParams.get('page') || '1', 10);
  const status = searchParams.get('status') || 'confirmed';

  const navigationItems = [
    { path: '/manufacturer', label: 'Tổng quan', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>), active: false },
    { path: '/manufacturer/drugs', label: 'Quản lý thuốc', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>), active: false },
    { path: '/manufacturer/production', label: 'Sản xuất thuốc', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>), active: false },
    { path: '/manufacturer/transfer', label: 'Chuyển giao', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>), active: false },
    { path: '/manufacturer/distribution-confirmation', label: 'Xác nhận quyền NFT', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>), active: true },
    { path: '/manufacturer/production-history', label: 'Lịch sử sản xuất', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>), active: false },
    { path: '/manufacturer/transfer-history', label: 'Lịch sử chuyển giao', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>), active: false },
    { path: '/manufacturer/profile', label: 'Hồ sơ', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>), active: false },
  ];

  // ✅ Wrap loadData trong useCallback để tránh re-render không cần thiết
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null); // ✅ Reset error
    try {
      const params = { page, limit: 10 };
      if (status) params.status = status;

      const response = await getDistributions(params);
      
      if (response?.data?.success) {
        setDistributions(response.data.data?.distributions || []);
        setPagination(response.data.data?.pagination || { page: 1, limit: 10, total: 0, pages: 0 });
      } else {
        setDistributions([]);
        setError('Không thể tải danh sách distributions'); // ✅ Set error
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách distributions:', error);
      setDistributions([]);
      setError(error?.response?.data?.message || 'Không thể tải danh sách distributions. Vui lòng thử lại.'); // ✅ Set error
    } finally {
      setLoading(false);
    }
  }, [page, status]); // ✅ Thêm dependencies

  useEffect(() => {
    loadData();
  }, [loadData]); // ✅ Sử dụng loadData trong dependency

  const handleViewDetail = async (distributionId) => {
    try {
      setLoading(true);
      setError(null); // ✅ Reset error
      const response = await getDistributionDetail(distributionId);
      if (response?.data?.success) {
        setSelectedDistribution(response.data.data);
        setShowDetailDialog(true);
      } else {
        setError('Không thể tải chi tiết distribution'); // ✅ Set error thay vì alert
      }
    } catch (error) {
      console.error('Lỗi khi tải chi tiết:', error);
      setError(error?.response?.data?.message || 'Không thể tải chi tiết distribution'); // ✅ Set error
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (distributionId) => {
    if (!window.confirm(
      'Bạn có chắc chắn muốn xác nhận quyền NFT cho distributor này không?\n\n' +
      'Sau khi xác nhận, distributor sẽ có quyền sở hữu NFT trong hệ thống.'
    )) {
      return;
    }

    setApprovingId(distributionId);
    setError(null); // ✅ Reset error
    try {
      const response = await approveDistribution(distributionId);
      if (response?.data?.success) {
        alert('✅ ' + response.data.message);
        await loadData(); // ✅ Đợi reload xong
        // ✅ Đóng dialog và reset selected distribution
        if (showDetailDialog) {
          setShowDetailDialog(false);
          setSelectedDistribution(null);
        }
      } else {
        setError(response?.data?.message || 'Không thể xác nhận quyền NFT'); // ✅ Set error
      }
    } catch (error) {
      console.error('Lỗi khi xác nhận quyền NFT:', error);
      setError(error?.response?.data?.message || error.message || 'Lỗi khi xác nhận quyền NFT'); // ✅ Set error
    } finally {
      setApprovingId(null);
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

  const fadeUp = {
    hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return 'Chưa có';
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return 'Không hợp lệ';
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <DashboardLayout navigationItems={navigationItems}>
      {/* Banner */}
      <div className="bg-white rounded-xl border border-cyan-200 shadow-sm p-5 flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[#007b91] flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#007b91]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Xác nhận quyền NFT cho Distributor
          </h1>
          <p className="text-slate-500 text-sm mt-1">Xác nhận quyền sở hữu NFT sau khi distributor đã xác nhận nhận hàng</p>
        </div>
      </div>

      {/* ✅ Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <p className="text-red-800 font-medium">Lỗi</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Instructions */}
      <motion.div
        className="rounded-2xl bg-white border border-cyan-200 shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-6 mb-5"
        variants={fadeUp}
        initial="hidden"
        animate="show"
      >
        <h2 className="text-xl font-bold text-[#007b91] mb-4">Quy trình xác nhận</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 font-bold flex items-center justify-center flex-shrink-0">1</div>
            <div>
              <div className="font-semibold text-slate-800">Distributor xác nhận nhận hàng</div>
              <div className="text-sm text-slate-600">Distributor đã xác nhận đã nhận hàng và tạo Proof of Distribution với status "confirmed"</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 font-bold flex items-center justify-center flex-shrink-0">2</div>
            <div>
              <div className="font-semibold text-slate-800">Manufacturer xác nhận quyền NFT</div>
              <div className="text-sm text-slate-600">Manufacturer xác nhận quyền sở hữu NFT cho distributor trong hệ thống</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filter */}
      <div className="bg-white rounded-xl border border-cyan-200 shadow-sm p-4 mb-5">
        <div className="flex items-center gap-4">
          <label className="text-sm font-semibold text-gray-700">Trạng thái:</label>
          <select
            value={status}
            onChange={(e) => updateFilter({ status: e.target.value, page: 1 })}
            className="border-2 border-cyan-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          >
            <option value="confirmed">Chờ xác nhận (Confirmed)</option>
            <option value="pending">Pending</option>
            <option value="in_transit">Đang vận chuyển</option>
            <option value="delivered">Đã giao</option>
            <option value="rejected">Đã từ chối</option>
          </select>
        </div>
      </div>

      {/* Distributions List */}
      <motion.div
        className="bg-white rounded-2xl border border-cyan-100 shadow-sm overflow-hidden"
        variants={fadeUp}
        initial="hidden"
        animate="show"
      >
        {loading ? (
          <div className="p-12 text-center text-gray-500">Đang tải...</div>
        ) : distributions.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-12 h-12 mb-3 opacity-60"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-gray-500 text-sm">Không có distribution nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Distributor</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Invoice</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Số lượng</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Ngày phân phối</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Trạng thái</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {distributions.map((dist) => (
                  <tr
                    key={dist._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {dist.toDistributor?.fullName || dist.toDistributor?.username || 'N/A'}
                      <div className="text-xs text-slate-500">{dist.toDistributor?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-cyan-50 text-cyan-700 border border-cyan-100">
                        {dist.manufacturerInvoice?.invoiceNumber || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <span className="font-semibold text-gray-800">{dist.distributedQuantity || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{formatDate(dist.distributionDate)}</td>
                    <td className="px-6 py-4">
                      {(() => {
                        const status = dist.status;
                        if (status === 'confirmed') {
                          return (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">
                              Chờ xác nhận
                            </span>
                          );
                        }
                        if (status === 'pending') {
                          return (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                              Pending
                            </span>
                          );
                        }
                        return (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                            {status}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewDetail(dist._id)}
                          className="px-3 py-1.5 border border-cyan-300 rounded-lg text-cyan-700 hover:bg-cyan-50 font-medium transition text-sm"
                        >
                          Chi tiết
                        </button>
                        {dist.status === 'confirmed' && (
                          <button
                            onClick={() => handleApprove(dist._id)}
                            disabled={approvingId === dist._id}
                            className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          >
                            {approvingId === dist._id ? 'Đang xử lý...' : 'Xác nhận'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Trang {pagination.page} / {pagination.pages} ({pagination.total} kết quả)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => updateFilter({ page: pagination.page - 1 })}
                disabled={pagination.page <= 1}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Trước
              </button>
              <button
                onClick={() => updateFilter({ page: pagination.page + 1 })}
                disabled={pagination.page >= pagination.pages}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Detail Dialog */}
      {showDetailDialog && selectedDistribution && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-[#00b4d8] to-[#48cae4] px-8 py-6 rounded-t-3xl">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Chi tiết Distribution</h2>
                <button
                  onClick={() => setShowDetailDialog(false)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white text-xl transition"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-8 space-y-4">
              {/* Distribution Info */}
              <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-200">
                <div className="font-bold text-cyan-800 mb-3">Thông tin Distribution:</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div><span className="text-slate-600">ID:</span> <span className="font-mono text-xs">{selectedDistribution._id}</span></div>
                  <div><span className="text-slate-600">Trạng thái:</span> <span className="font-medium">{selectedDistribution.status}</span></div>
                  <div><span className="text-slate-600">Số lượng:</span> <span className="font-medium">{selectedDistribution.distributedQuantity || 'N/A'}</span></div>
                  <div><span className="text-slate-600">Ngày phân phối:</span> <span className="font-medium">{formatDate(selectedDistribution.distributionDate)}</span></div>
                  {selectedDistribution.verifiedAt && (
                    <div><span className="text-slate-600">Đã xác nhận lúc:</span> <span className="font-medium">{formatDate(selectedDistribution.verifiedAt)}</span></div>
                  )}
                </div>
              </div>

              {/* Distributor Info */}
              {selectedDistribution.toDistributor && (
                <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-200">
                  <div className="font-bold text-cyan-800 mb-3">Thông tin Distributor:</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div><span className="text-slate-600">Tên:</span> <span className="font-medium">{selectedDistribution.toDistributor.fullName || selectedDistribution.toDistributor.username || 'N/A'}</span></div>
                    <div><span className="text-slate-600">Email:</span> <span className="font-medium">{selectedDistribution.toDistributor.email || 'N/A'}</span></div>
                    <div className="md:col-span-2"><span className="text-slate-600">Wallet:</span> <span className="font-mono text-xs break-all">{selectedDistribution.toDistributor.walletAddress || 'N/A'}</span></div>
                  </div>
                </div>
              )}

              {/* Invoice Info */}
              {selectedDistribution.manufacturerInvoice && (
                <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-200">
                  <div className="font-bold text-cyan-800 mb-3">Thông tin Invoice:</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div><span className="text-slate-600">Số invoice:</span> <span className="font-mono font-medium">{selectedDistribution.manufacturerInvoice.invoiceNumber || 'N/A'}</span></div>
                    <div><span className="text-slate-600">Ngày:</span> <span className="font-medium">{formatDate(selectedDistribution.manufacturerInvoice.invoiceDate)}</span></div>
                    <div><span className="text-slate-600">Trạng thái:</span> <span className="font-medium">{selectedDistribution.manufacturerInvoice.status || 'N/A'}</span></div>
                    <div className="md:col-span-2"><span className="text-slate-600">Transaction Hash:</span> <span className="font-mono text-xs break-all">{selectedDistribution.manufacturerInvoice.chainTxHash || 'N/A'}</span></div>
                  </div>
                </div>
              )}

              {/* Token IDs */}
              {selectedDistribution.tokenIds && selectedDistribution.tokenIds.length > 0 && (
                <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-200">
                  <div className="font-bold text-cyan-800 mb-3">Token IDs ({selectedDistribution.tokenIds.length}):</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedDistribution.tokenIds.slice(0, 10).map((tokenId, idx) => (
                      <span key={idx} className="px-2 py-1 bg-white rounded text-xs font-mono border border-cyan-200">
                        {tokenId}
                      </span>
                    ))}
                    {selectedDistribution.tokenIds.length > 10 && (
                      <span className="px-2 py-1 bg-white rounded text-xs border border-cyan-200">
                        +{selectedDistribution.tokenIds.length - 10} nữa
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedDistribution.notes && (
                <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                  <div className="font-bold text-yellow-800 mb-2">Ghi chú:</div>
                  <div className="text-sm text-yellow-700">{selectedDistribution.notes}</div>
                </div>
              )}
            </div>

            <div className="px-8 py-6 border-t border-gray-200 bg-gray-50 rounded-b-3xl flex justify-end space-x-3">
              <button
                onClick={() => setShowDetailDialog(false)}
                className="px-6 py-2.5 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium transition"
              >
                Đóng
              </button>
              {selectedDistribution.status === 'confirmed' && (
                <button
                  onClick={() => handleApprove(selectedDistribution._id)}
                  disabled={approvingId === selectedDistribution._id}
                  className="px-6 py-2.5 rounded-full bg-green-600 text-white font-medium shadow-md hover:shadow-lg disabled:opacity-50 transition"
                >
                  {approvingId === selectedDistribution._id ? 'Đang xử lý...' : '✓ Xác nhận quyền NFT'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}