import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../utils/api';
import TruckLoader from '../../components/TruckLoader';

export default function PasswordResetRequests() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [loadingProgress, setLoadingProgress] = useState(0);
  const progressIntervalRef = useRef(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const status = searchParams.get('status') || 'pending';

  const navigationItems = useMemo(() => ([
    { path: '/admin', label: 'Tổng quan', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>), active: false },
    { path: '/admin/password-reset-requests', label: 'Reset mật khẩu', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>), active: true },
  ]), []);

  const load = async () => {
    setLoading(true); 
    setError('');
    setLoadingProgress(0);
    if (progressIntervalRef.current) { clearInterval(progressIntervalRef.current); progressIntervalRef.current = null; }
    progressIntervalRef.current = setInterval(() => {
      setLoadingProgress(prev => (prev < 0.9 ? Math.min(prev + 0.02, 0.9) : prev));
    }, 50);
    try {
      const params = { page, limit: 10, status };

      const response = await api.get('/auth/password-reset-requests', { params });
      
      if (response.data.success) {
        setItems(response.data.data.requests || []);
        setPagination(response.data.data.pagination || { page: 1, limit: 10, total: 0, pages: 0 });
      }
    } catch (e) { 
      setError(e?.response?.data?.message || 'Không thể tải dữ liệu'); 
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
  }, [page, status]);

  const updateFilter = (next) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([k, v]) => {
      if (v === '' || v === undefined || v === null) nextParams.delete(k); 
      else nextParams.set(k, String(v));
    });
    setSearchParams(nextParams);
  };

  const handleApprove = async (resetRequestId) => {
    if (!confirm('Bạn có chắc chắn muốn duyệt yêu cầu này? Mật khẩu mới sẽ được gửi đến email người dùng.')) {
      return;
    }

    setActionLoading(true);
    setError('');
    try {
      const response = await api.post(`/auth/password-reset-requests/${resetRequestId}/approve`);
      if (response.data.success) {
        alert('Duyệt yêu cầu thành công! Mật khẩu mới đã được gửi đến email người dùng.');
        setShowDetailModal(false);
        load();
      }
    } catch (e) {
      alert(e?.response?.data?.message || 'Không thể duyệt yêu cầu');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (resetRequestId) => {
    if (!rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }

    if (!confirm('Bạn có chắc chắn muốn từ chối yêu cầu này?')) {
      return;
    }

    setActionLoading(true);
    setError('');
    try {
      const response = await api.post(`/auth/password-reset-requests/${resetRequestId}/reject`, {
        rejectionReason: rejectReason,
      });
      if (response.data.success) {
        alert('Từ chối yêu cầu thành công!');
        setShowDetailModal(false);
        setRejectReason('');
        load();
      }
    } catch (e) {
      alert(e?.response?.data?.message || 'Không thể từ chối yêu cầu');
    } finally {
      setActionLoading(false);
    }
  };

  const openDetailModal = (item) => {
    setSelectedItem(item);
    setShowDetailModal(true);
    setRejectReason('');
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  const getRoleName = (role) => {
    const roles = {
      pharma_company: 'Nhà sản xuất',
      distributor: 'Nhà phân phối',
      pharmacy: 'Nhà thuốc',
      user: 'Người dùng',
    };
    return roles[role] || role;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[status] || 'bg-slate-100 text-slate-600 border-slate-200';
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
      <motion.section
        className="relative overflow-hidden rounded-2xl mb-5 border border-[#90e0ef33] shadow-[0_10px_30px_rgba(0,0,0,0.06)] bg-gradient-to-tr from-[#00b4d8] via-[#48cae4] to-[#90e0ef]"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.25),transparent_55%)]" />
        <div className="relative px-6 py-8 md:px-10 md:py-12 text-white">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight drop-shadow-sm">Yêu cầu reset mật khẩu</h2>
          <p className="mt-1 text-white/90">Duyệt yêu cầu reset mật khẩu của pharma_company, distributor, pharmacy</p>
        </div>
      </motion.section>

      {/* Filters */}
      <motion.div
        className="rounded-2xl bg-white/85 backdrop-blur-xl border border-[#90e0ef55] shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-4 mb-5"
        variants={fadeUp}
        initial="hidden"
        animate="show"
      >
        <div className="flex flex-col md:flex-row gap-3 md:items-end">
          <div>
            <label className="block text-sm text-[#003544]/70 mb-1">Trạng thái</label>
            <select
              value={status}
              onChange={e => updateFilter({ status: e.target.value, page: 1 })}
              className="border border-[#90e0ef55] bg-white/60 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#48cae4] focus:border-[#48cae4] transition"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="">Tất cả</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* List */}
      <motion.div 
        className="space-y-4" 
        variants={fadeUp} 
        initial="hidden" 
        animate="show"
      >
        {error ? (
          <div className="bg-white/90 rounded-2xl border border-red-200 p-10 text-center text-red-600">
            {error}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white/90 rounded-2xl border border-[#90e0ef55] p-10 text-center text-slate-600">
            Không có dữ liệu
          </div>
        ) : (
          items.map((item, idx) => (
            <div key={idx} className="bg-white/90 backdrop-blur-xl rounded-2xl border border-[#90e0ef55] shadow-[0_10px_24px_rgba(0,0,0,0.05)] overflow-hidden hover:shadow-lg transition">
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-[#003544]">
                        {item.user?.fullName || item.user?.username || 'N/A'}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-slate-600">
                      <div>📧 Email: {item.user?.email}</div>
                      <div>👤 Vai trò: {getRoleName(item.user?.role)}</div>
                      <div>🕒 Yêu cầu lúc: {new Date(item.createdAt).toLocaleString('vi-VN')}</div>
                      {item.expiresAt && (
                        <div className={new Date() > new Date(item.expiresAt) ? 'text-red-600' : ''}>
                          ⏰ Hết hạn: {new Date(item.expiresAt).toLocaleString('vi-VN')}
                          {new Date() > new Date(item.expiresAt) && ' (Đã hết hạn)'}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => openDetailModal(item)}
                    className="px-4 py-2 rounded-lg border border-[#90e0ef55] text-[#003544] hover:bg-[#90e0ef22] transition text-sm"
                  >
                    Chi tiết
                  </button>
                </div>

                {item.verificationInfo && (
                  <div className="bg-[#f5fcff] rounded-xl p-3 border border-[#90e0ef55] text-sm">
                    <div className="font-semibold text-[#003544] mb-2">Thông tin xác thực:</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-600">License No:</span>
                        <span className="ml-2 font-mono text-[#003544]">{item.verificationInfo.licenseNo}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Tax Code:</span>
                        <span className="ml-2 font-mono text-[#003544]">{item.verificationInfo.taxCode}</span>
                      </div>
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
          Hiển thị {items.length} / {pagination.total} yêu cầu
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

      {/* Detail Modal */}
      {showDetailModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-[#00b4d8] to-[#48cae4] text-white p-6 rounded-t-2xl">
              <h3 className="text-2xl font-bold">Chi tiết yêu cầu reset mật khẩu</h3>
            </div>
            
            <div className="p-6 space-y-4">
              {/* User info */}
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="font-semibold text-slate-800 mb-3">Thông tin người dùng</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tên:</span>
                    <span className="font-medium text-slate-800">{selectedItem.user?.fullName || selectedItem.user?.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Email:</span>
                    <span className="font-medium text-slate-800">{selectedItem.user?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Vai trò:</span>
                    <span className="font-medium text-slate-800">{getRoleName(selectedItem.user?.role)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Wallet:</span>
                    <span className="font-mono text-xs text-slate-800">{selectedItem.user?.walletAddress || 'Chưa có'}</span>
                  </div>
                </div>
              </div>

              {/* Verification info */}
              {selectedItem.verificationInfo && (
                <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-200">
                  <h4 className="font-semibold text-cyan-800 mb-3">Thông tin xác thực</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-cyan-700">License No:</span>
                      <span className="font-mono text-cyan-900">{selectedItem.verificationInfo.licenseNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-cyan-700">Tax Code:</span>
                      <span className="font-mono text-cyan-900">{selectedItem.verificationInfo.taxCode}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Request info */}
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="font-semibold text-slate-800 mb-3">Thông tin yêu cầu</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Trạng thái:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedItem.status)}`}>
                      {selectedItem.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Yêu cầu lúc:</span>
                    <span className="font-medium text-slate-800">{new Date(selectedItem.createdAt).toLocaleString('vi-VN')}</span>
                  </div>
                  {selectedItem.expiresAt && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Hết hạn:</span>
                      <span className={`font-medium ${new Date() > new Date(selectedItem.expiresAt) ? 'text-red-600' : 'text-slate-800'}`}>
                        {new Date(selectedItem.expiresAt).toLocaleString('vi-VN')}
                        {new Date() > new Date(selectedItem.expiresAt) && ' (Đã hết hạn)'}
                      </span>
                    </div>
                  )}
                  {selectedItem.ipAddress && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">IP Address:</span>
                      <span className="font-mono text-xs text-slate-800">{selectedItem.ipAddress}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              {selectedItem.status === 'pending' && (
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <button
                      disabled={actionLoading || new Date() > new Date(selectedItem.expiresAt)}
                      onClick={() => handleApprove(selectedItem._id)}
                      className="flex-1 px-4 py-3 rounded-xl text-white bg-gradient-to-r from-emerald-500 to-green-600 shadow hover:shadow-emerald-200/60 disabled:opacity-60 disabled:cursor-not-allowed font-medium"
                    >
                      {actionLoading ? 'Đang xử lý...' : '✅ Duyệt & Gửi mật khẩu mới'}
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    <input
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                      placeholder="Nhập lý do từ chối (bắt buộc)"
                      className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400"
                    />
                    <button
                      disabled={actionLoading}
                      onClick={() => handleReject(selectedItem._id)}
                      className="w-full px-4 py-3 rounded-xl text-white bg-gradient-to-r from-rose-500 to-red-600 shadow hover:shadow-rose-200/60 disabled:opacity-60 font-medium"
                    >
                      {actionLoading ? 'Đang xử lý...' : '❌ Từ chối yêu cầu'}
                    </button>
                  </div>
                </div>
              )}

              {selectedItem.status === 'approved' && selectedItem.reviewedAt && (
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                  <div className="text-sm text-emerald-700">
                    ✅ Đã duyệt lúc: {new Date(selectedItem.reviewedAt).toLocaleString('vi-VN')}
                  </div>
                  <div className="text-sm text-emerald-600 mt-1">
                    Mật khẩu mới đã được gửi đến email người dùng.
                  </div>
                </div>
              )}

              {selectedItem.status === 'rejected' && (
                <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                  <div className="text-sm text-red-700">
                    ❌ Đã từ chối lúc: {new Date(selectedItem.reviewedAt).toLocaleString('vi-VN')}
                  </div>
                  {selectedItem.rejectionReason && (
                    <div className="text-sm text-red-600 mt-1">
                      Lý do: {selectedItem.rejectionReason}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => setShowDetailModal(false)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </DashboardLayout>
  );
}
