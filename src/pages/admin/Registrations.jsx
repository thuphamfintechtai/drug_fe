import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import { getPendingRegistrations } from '../../services/admin/adminService';
import { getRegistrationStats } from '../../services/admin/statsService';

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

  const fadeUp = {
    hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <DashboardLayout navigationItems={navigationItems}>
      {/* Banner */}
      <div className="bg-white rounded-xl border border-cyan-200 shadow-sm p-5 mb-4">
        <h2 className="text-xl font-semibold text-[#007b91]">Duyệt đăng ký</h2>
        <p className="text-slate-500 text-sm mt-1">Lọc theo vai trò và trạng thái – xử lý nhanh, chính xác.</p>
      </div>

      {/* Filters */}
      <motion.div
        className="rounded-2xl bg-white border border-cyan-200 shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-4 mb-4"
        variants={fadeUp}
        initial="hidden"
        animate="show"
      >
        <div className="flex flex-col md:flex-row gap-3 md:items-end">
          <div className="flex-1 max-w-xs">
            <label className="block text-sm text-[#003544]/70 mb-1">Role</label>
            <select
              className="w-full h-12 rounded-full border border-gray-200 bg-white text-gray-700 px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-[#48cae4] transition"
              value={role}
              onChange={e => updateFilter({ role: e.target.value, page: 1 })}
            >
              <option value="">Tất cả</option>
              <option value="pharma_company">Nhà sản xuất</option>
              <option value="distributor">Nhà phân phối</option>
              <option value="pharmacy">Nhà thuốc</option>
            </select>
          </div>
          <div className="flex-1 max-w-xs">
            <label className="block text-sm text-[#003544]/70 mb-1">Trạng thái</label>
            <select
              className="w-full h-12 rounded-full border border-gray-200 bg-white text-gray-700 px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-[#48cae4] transition"
              value={status}
              onChange={e => updateFilter({ status: e.target.value, page: 1 })}
            >
              <option value="pending">pending</option>
              <option value="approved_pending_blockchain">approved_pending_blockchain</option>
              <option value="approved">approved</option>
              <option value="blockchain_failed">blockchain_failed</option>
              <option value="rejected">rejected</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      {stats && (
        <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4" variants={fadeUp} initial="hidden" animate="show">
          <div className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-amber-400 to-yellow-400 rounded-t-2xl" />
            <div className="p-5 pt-7">
              <div className="text-sm text-slate-600">Pending</div>
              <div className="text-2xl font-bold text-amber-600">{stats.summary?.totalPending || 0}</div>
            </div>
          </div>
          <div className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-emerald-400 to-green-400 rounded-t-2xl" />
            <div className="p-5 pt-7">
              <div className="text-sm text-slate-600">Approved</div>
              <div className="text-2xl font-bold text-emerald-600">{stats.summary?.totalApproved || 0}</div>
            </div>
          </div>
          <div className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-rose-400 to-red-400 rounded-t-2xl" />
            <div className="p-5 pt-7">
              <div className="text-sm text-slate-600">Blockchain failed</div>
              <div className="text-2xl font-bold text-rose-600">{stats.summary?.totalBlockchainFailed || 0}</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Table */}
      <motion.div className="bg-white rounded-2xl border border-cyan-100 shadow-sm overflow-x-auto" variants={fadeUp} initial="hidden" animate="show">
        {loading ? (
          <div className="p-6">Đang tải...</div>
        ) : error ? (
          <div className="p-6 text-red-600">{error}</div>
        ) : (
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-left text-gray-700">
                <th className="px-4 py-3">Người dùng</th>
                <th className="px-4 py-3">Vai trò</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Ngày tạo</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-[#003544]">{r?.user?.fullName || r?.user?.username}</div>
                    <div className="text-sm text-[#003544]/70">{r?.user?.email}</div>
                  </td>
                  <td className="px-4 py-3 text-[#003544]/80">{r.role}</td>
                  <td className="px-4 py-3 text-[#003544]/80">{r.status}</td>
                  <td className="px-4 py-3 text-[#003544]/80">{new Date(r.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/admin/registrations/${r._id}`} className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-cyan-200 text-[#003544] hover:bg-[#90e0ef22] transition">Chi tiết
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6"/><path d="M3 12h12"/></svg>
                    </Link>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td className="px-4 py-4 text-slate-600" colSpan={5}>Không có dữ liệu</td></tr>
              )}
            </tbody>
          </table>
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
    </DashboardLayout>
  );
}


