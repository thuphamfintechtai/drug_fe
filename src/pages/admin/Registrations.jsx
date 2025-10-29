import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { getPendingRegistrations, getRegistrationStats } from '../../services/admin/adminService';

export default function AdminRegistrations() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 10;
  const role = searchParams.get('role') || '';
  const status = searchParams.get('status') || 'pending';

  const navigationItems = useMemo(() => ([
    { path: '/admin', label: 'Trang chủ', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>), active: false },
    { path: '/admin/registrations', label: 'Duyệt đăng ký', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>), active: true },
  ]), []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [{ data: listRes }, { data: statsRes }] = await Promise.all([
          getPendingRegistrations({ page, limit, role: role || undefined, status }),
          getRegistrationStats(),
        ]);
        setItems(listRes?.data?.registrations || []);
        setStats(statsRes?.data);
      } catch (e) {
        setError(e?.response?.data?.message || 'Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, role, status]);

  const updateFilter = (next) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([k, v]) => {
      if (v === '' || v === undefined || v === null) nextParams.delete(k); else nextParams.set(k, String(v));
    });
    setSearchParams(nextParams);
  };

  return (
    <DashboardLayout navigationItems={navigationItems}>
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-end">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Role</label>
            <select className="border rounded px-3 py-2" value={role} onChange={e => updateFilter({ role: e.target.value, page: 1 })}>
              <option value="">Tất cả</option>
              <option value="pharma_company">Nhà sản xuất</option>
              <option value="distributor">Nhà phân phối</option>
              <option value="pharmacy">Nhà thuốc</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Trạng thái</label>
            <select className="border rounded px-3 py-2" value={status} onChange={e => updateFilter({ status: e.target.value, page: 1 })}>
              <option value="pending">pending</option>
              <option value="approved_pending_blockchain">approved_pending_blockchain</option>
              <option value="approved">approved</option>
              <option value="blockchain_failed">blockchain_failed</option>
              <option value="rejected">rejected</option>
            </select>
          </div>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="p-4 bg-white rounded shadow">
            <div className="text-sm text-gray-600">Pending</div>
            <div className="text-2xl font-semibold">{stats.summary?.totalPending || 0}</div>
          </div>
          <div className="p-4 bg-white rounded shadow">
            <div className="text-sm text-gray-600">Approved</div>
            <div className="text-2xl font-semibold">{stats.summary?.totalApproved || 0}</div>
          </div>
          <div className="p-4 bg-white rounded shadow">
            <div className="text-sm text-gray-600">Blockchain failed</div>
            <div className="text-2xl font-semibold">{stats.summary?.totalBlockchainFailed || 0}</div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        {loading ? (
          <div className="p-6">Đang tải...</div>
        ) : error ? (
          <div className="p-6 text-red-600">{error}</div>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr className="text-left bg-gray-50">
                <th className="p-3">Người dùng</th>
                <th className="p-3">Role</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3">Ngày tạo</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r._id} className="border-t">
                  <td className="p-3">
                    <div className="font-medium">{r?.user?.fullName || r?.user?.username}</div>
                    <div className="text-sm text-gray-500">{r?.user?.email}</div>
                  </td>
                  <td className="p-3">{r.role}</td>
                  <td className="p-3">{r.status}</td>
                  <td className="p-3">{new Date(r.createdAt).toLocaleString()}</td>
                  <td className="p-3 text-right">
                    <Link to={`/admin/registrations/${r._id}`} className="px-3 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700">Chi tiết</Link>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td className="p-4" colSpan={5}>Không có dữ liệu</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 mt-4">
        <button disabled={page <= 1} onClick={() => updateFilter({ page: page - 1 })} className={`px-3 py-2 rounded ${page <= 1 ? 'bg-gray-200 text-gray-400' : 'bg-white border hover:bg-gray-50'}`}>Trước</button>
        <span className="text-sm">Trang {page}</span>
        <button onClick={() => updateFilter({ page: page + 1 })} className="px-3 py-2 rounded bg-white border hover:bg-gray-50">Sau</button>
      </div>
    </DashboardLayout>
  );
}


