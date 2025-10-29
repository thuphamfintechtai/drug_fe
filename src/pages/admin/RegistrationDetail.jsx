import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { getRegistrationById, approveRegistration, rejectRegistration, retryRegistrationBlockchain } from '../../services/admin/adminService';

export default function AdminRegistrationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const navigationItems = useMemo(() => ([
    { path: '/admin', label: 'Trang chủ', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>), active: false },
    { path: '/admin/registrations', label: 'Duyệt đăng ký', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>), active: true },
  ]), []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await getRegistrationById(id);
        setItem(data?.data);
      } catch (e) {
        setError(e?.response?.data?.message || 'Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleApprove = async () => {
    setActionLoading(true);
    setError('');
    try {
      await approveRegistration(id);
      navigate('/admin/registrations');
    } catch (e) {
      setError(e?.response?.data?.message || 'Không thể duyệt đơn');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setError('Vui lòng nhập lý do từ chối');
      return;
    }
    setActionLoading(true);
    setError('');
    try {
      await rejectRegistration(id, rejectReason);
      navigate('/admin/registrations');
    } catch (e) {
      setError(e?.response?.data?.message || 'Không thể từ chối đơn');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRetry = async () => {
    setActionLoading(true);
    setError('');
    try {
      await retryRegistrationBlockchain(id);
      const { data } = await getRegistrationById(id);
      setItem(data?.data);
    } catch (e) {
      setError(e?.response?.data?.message || 'Retry blockchain thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <DashboardLayout navigationItems={navigationItems}>
      <div className="mb-4">
        <Link to="/admin/registrations" className="text-cyan-700 hover:underline">← Quay lại danh sách</Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {loading ? (
          <div>Đang tải...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : item ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Đơn đăng ký</h2>
                <p className="text-sm text-gray-500">ID: {item._id}</p>
              </div>
              <span className="px-3 py-1 rounded bg-gray-100 text-gray-700">{item.status}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded">
                <h3 className="font-medium mb-2">Người dùng</h3>
                <div className="text-sm">{item.user?.fullName || item.user?.username}</div>
                <div className="text-sm text-gray-500">{item.user?.email}</div>
                <div className="text-sm text-gray-500">{item.user?.walletAddress}</div>
              </div>
              <div className="p-4 border rounded">
                <h3 className="font-medium mb-2">Thông tin doanh nghiệp</h3>
                <div className="text-sm">Tên: {item.companyInfo?.name}</div>
                <div className="text-sm">Role: {item.role}</div>
                <div className="text-sm">License: {item.companyInfo?.licenseNo}</div>
                <div className="text-sm">Tax code: {item.companyInfo?.taxCode}</div>
                {item.role === 'pharma_company' && (
                  <div className="text-sm">GMP: {item.companyInfo?.gmpCertNo}</div>
                )}
                <div className="text-sm">Wallet: {item.companyInfo?.walletAddress}</div>
              </div>
            </div>

            {(item.transactionHash || item.contractAddress) && (
              <div className="p-4 border rounded">
                <h3 className="font-medium mb-2">Blockchain</h3>
                {item.transactionHash && <div className="text-sm">TX: {item.transactionHash}</div>}
                {item.contractAddress && <div className="text-sm">Contract: {item.contractAddress}</div>}
              </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center gap-3">
              {item.status === 'pending' && (
                <>
                  <button disabled={actionLoading} onClick={handleApprove} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Duyệt</button>
                  <div className="flex items-center gap-2">
                    <input value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Lý do từ chối" className="border rounded px-3 py-2" />
                    <button disabled={actionLoading} onClick={handleReject} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Từ chối</button>
                  </div>
                </>
              )}
              {item.status === 'blockchain_failed' && (
                <button disabled={actionLoading} onClick={handleRetry} className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700">Retry blockchain</button>
              )}
            </div>
          </div>
        ) : (
          <div>Không tìm thấy dữ liệu</div>
        )}
      </div>
    </DashboardLayout>
  );
}


