import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import { getAllDrugs, getDrugStatistics } from '../../services/admin/adminService';
import TruckLoader from '../../components/TruckLoader';

export default function AdminDrugs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [loadingProgress, setLoadingProgress] = useState(0);
  const progressIntervalRef = useRef(null);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';

  const navigationItems = useMemo(() => ([
    { path: '/admin', label: 'Tổng quan', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>), active: false },
    { path: '/admin/drugs', label: 'Quản lý thuốc', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>), active: true },
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
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (status) params.status = status;

      const [drugsRes, statsRes] = await Promise.all([
        getAllDrugs(params),
        getDrugStatistics(),
      ]);
      
      if (drugsRes.data.success) {
        setItems(drugsRes.data.data.drugs || []);
        setPagination(drugsRes.data.data.pagination || { page: 1, limit: 10, total: 0, pages: 0 });
      }
      
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
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
  }, [page, search, status]);

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
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight drop-shadow-sm">Quản lý thuốc</h2>
          <p className="mt-1 text-white/90">Xem tất cả thông tin thuốc và thống kê trong hệ thống</p>
        </div>
      </motion.section>

      {/* Filters */}
      <motion.div
        className="rounded-2xl bg-white/85 backdrop-blur-xl border border-[#90e0ef55] shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-4 mb-5"
        variants={fadeUp}
        initial="hidden"
        animate="show"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="block text-sm text-[#003544]/70 mb-1">Tìm kiếm</label>
            <input
              value={search}
              onChange={e => updateFilter({ search: e.target.value, page: 1 })}
              placeholder="Tìm theo tên thuốc, ATC code..."
              className="border border-[#90e0ef55] bg-white/60 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#48cae4] focus:border-[#48cae4] transition w-full"
            />
          </div>
          <div>
            <label className="block text-sm text-[#003544]/70 mb-1">Trạng thái</label>
            <select
              value={status}
              onChange={e => updateFilter({ status: e.target.value, page: 1 })}
              className="border border-[#90e0ef55] bg-white/60 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#48cae4] focus:border-[#48cae4] transition"
            >
              <option value="">Tất cả</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="recalled">Recalled</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      {stats && (
        <motion.div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5" variants={fadeUp} initial="hidden" animate="show">
          <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 shadow-sm">
            <div className="text-sm text-blue-700 mb-1">Tổng thuốc</div>
            <div className="text-3xl font-bold text-blue-600">{stats.drugs?.total || 0}</div>
            <div className="text-xs text-blue-600/70 mt-2">Trong hệ thống</div>
          </div>
          
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-sm text-slate-600 mb-1">Active</div>
            <div className="text-3xl font-bold text-emerald-600">{stats.drugs?.byStatus?.active || 0}</div>
            <div className="text-xs text-slate-500 mt-2">Đang hoạt động</div>
          </div>
          
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-sm text-slate-600 mb-1">Inactive</div>
            <div className="text-3xl font-bold text-slate-500">{stats.drugs?.byStatus?.inactive || 0}</div>
            <div className="text-xs text-slate-500 mt-2">Ngừng hoạt động</div>
          </div>
          
          <div className="p-5 bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl border border-red-200 shadow-sm">
            <div className="text-sm text-red-700 mb-1">Recalled</div>
            <div className="text-3xl font-bold text-red-600">{stats.drugs?.byStatus?.recalled || 0}</div>
            <div className="text-xs text-red-600/70 mt-2">Thu hồi</div>
          </div>
        </motion.div>
      )}

      {/* Top manufacturers */}
      {stats?.drugs?.byManufacturer?.length > 0 && (
        <motion.div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-[#90e0ef55] shadow-[0_10px_24px_rgba(0,0,0,0.05)] p-5 mb-5" variants={fadeUp} initial="hidden" animate="show">
          <h3 className="font-semibold mb-3 text-slate-800">Top nhà sản xuất</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {stats.drugs.byManufacturer.slice(0, 6).map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-[#f5fcff] rounded-lg border border-[#90e0ef55]">
                <span className="text-sm text-slate-700 truncate">{item.manufacturerName || 'N/A'}</span>
                <span className="text-lg font-bold text-[#00b4d8] ml-2">{item.count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Table */}
      <motion.div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-[#90e0ef55] shadow-[0_10px_24px_rgba(0,0,0,0.05)] overflow-x-auto" variants={fadeUp} initial="hidden" animate="show">
        {error ? (
          <div className="p-6 text-red-600">{error}</div>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-[#003544]">
                <th className="p-3 bg-[#f5fcff]">Tên thuốc</th>
                <th className="p-3 bg-[#f5fcff]">Generic Name</th>
                <th className="p-3 bg-[#f5fcff]">ATC Code</th>
                <th className="p-3 bg-[#f5fcff]">Nhà sản xuất</th>
                <th className="p-3 bg-[#f5fcff]">Trạng thái</th>
                <th className="p-3 bg-[#f5fcff] text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.map((d) => (
                <tr key={d._id} className="border-t border-[#90e0ef40] hover:bg-[#f5fcff] transition">
                  <td className="p-3 font-medium text-[#003544]">{d.tradeName}</td>
                  <td className="p-3 text-[#003544]/80 text-sm">{d.genericName || '-'}</td>
                  <td className="p-3 text-[#003544]/80 font-mono text-sm">{d.atcCode}</td>
                  <td className="p-3 text-[#003544]/80 text-sm">{d.manufacturer?.name || 'N/A'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      d.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                      d.status === 'inactive' ? 'bg-slate-100 text-slate-600' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <Link to={`/admin/drugs/${d._id}`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#90e0ef55] text-[#003544] hover:bg-[#90e0ef22] transition text-sm">
                      Chi tiết
                    </Link>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td className="p-6 text-center text-slate-600" colSpan={6}>Không có dữ liệu</td></tr>
              )}
            </tbody>
          </table>
        )}
      </motion.div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-slate-600">
          Hiển thị {items.length} / {pagination.total} thuốc
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
        </>
      )}
    </DashboardLayout>
  );
}


