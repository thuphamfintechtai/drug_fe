import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import { listDrugs, searchDrugByAtc, getDrugStats, getDrugCodes } from '../../services/admin/drugService';

export default function AdminDrugs() {
  const normalizeList = (raw) => {
    const r = raw?.data ?? raw;
    if (Array.isArray(r)) return r;
    if (Array.isArray(r?.items)) return r.items;
    if (Array.isArray(r?.results)) return r.results;
    if (Array.isArray(r?.drugs)) return r.drugs;
    if (Array.isArray(r?.data)) return r.data; // in case BE double-nests
    return [];
  };
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [atc, setAtc] = useState('');
  const [stats, setStats] = useState(null);
  const [codes, setCodes] = useState([]);

  const navigationItems = useMemo(() => ([
    { path: '/admin', label: 'Trang chủ', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>), active: false },
    { path: '/admin/drugs', label: 'Quản lý thuốc', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-7 7-7-7" /></svg>), active: true },
  ]), []);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [{ data: listRes }, { data: statsRes }, { data: codesRes }] = await Promise.all([
        listDrugs({}),
        getDrugStats(),
        getDrugCodes(),
      ]);
      setItems(normalizeList(listRes));
      setStats(statsRes?.data || statsRes || null);
      setCodes(codesRes?.data || codesRes || []);
    } catch (e) { setError(e?.response?.data?.message || 'Không thể tải dữ liệu'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!atc.trim()) { load(); return; }
    setLoading(true); setError('');
    try {
      const { data } = await searchDrugByAtc(atc.trim());
      const list = normalizeList(data);
      setItems(list.length ? list : (data?.data ? [data.data] : []));
    } catch (e2) { setError(e2?.response?.data?.message || 'Không thể tìm kiếm'); }
    finally { setLoading(false); }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <DashboardLayout navigationItems={navigationItems}>
      {/* Banner */}
      <motion.div
        className="relative overflow-hidden rounded-2xl p-5 mb-5 bg-gradient-to-r from-[#e0f2fe] to-[#f0f9ff] border border-cyan-100"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00b4d8] to-[#90e0ef] shadow-md shadow-cyan-200/40"
            animate={{ rotate: [0, 10, 0, -10, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Quản lý thuốc</h2>
            <p className="text-sm text-slate-600">Danh mục thuốc minh bạch</p>
          </div>
        </div>
      </motion.div>

      {/* Thanh tác vụ: tìm kiếm + tạo mới */}
      <motion.div
        className="rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-[0_10px_30px_rgba(2,132,199,0.06)] p-4 mb-5"
        variants={fadeUp}
        initial="hidden"
        animate="show"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
            <input
              value={atc}
              onChange={e => setAtc(e.target.value)}
              placeholder="Tìm theo ATC code"
              className="border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition w-full md:w-[280px]"
            />
            <button className="px-4 py-2.5 rounded-xl text-white bg-gradient-to-r from-[#00b4d8] to-[#0077b6] shadow hover:shadow-cyan-200/60">Tìm</button>
          </form>
          <a href="/admin/drugs/new" className="px-4 py-2.5 rounded-xl text-white bg-gradient-to-r from-[#00b4d8] to-[#0077b6] shadow hover:shadow-cyan-200/60 text-center">Tạo thuốc</a>
        </div>
      </motion.div>

      {/* Stats */}
      {stats && (
        <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5" variants={fadeUp} initial="hidden" animate="show">
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-sm text-slate-600">Tổng thuốc</div>
            <div className="text-3xl font-bold text-slate-800 mt-1">{stats.total || 0}</div>
          </div>
        </motion.div>
      )}

      {/* Codes cloud */}
      {codes && codes.length > 0 && (
        <motion.div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-5" variants={fadeUp} initial="hidden" animate="show">
          <h3 className="font-semibold mb-3 text-slate-800">Drug codes</h3>
          <div className="flex flex-wrap gap-2 max-h-40 overflow-auto">
            {codes.map((c, idx) => (
              <span key={idx} className="px-2.5 py-1 rounded-full text-sm bg-cyan-50 text-cyan-700 border border-cyan-100">
                {c}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Table */}
      <motion.div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto" variants={fadeUp} initial="hidden" animate="show">
        {loading ? (
          <div className="p-6">Đang tải...</div>
        ) : error ? (
          <div className="p-6 text-red-600">{error}</div>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr className="bg-slate-50 text-left text-slate-700">
                <th className="p-3">Tên</th>
                <th className="p-3">ATC</th>
                <th className="p-3">Nhà sản xuất</th>
                <th className="p-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {(Array.isArray(items) ? items : []).map((d) => (
                <tr key={d._id} className="border-t hover:bg-slate-50/60 transition">
                  <td className="p-3 font-medium text-slate-800">{d.name}</td>
                  <td className="p-3 text-slate-700">{d.atcCode}</td>
                  <td className="p-3 text-slate-700">{d.manufactorName || d.manufacturer?.name}</td>
                  <td className="p-3 text-right">
                    <a
                      href={`/admin/drugs/${d._id}`}
                      className="px-3 py-2 rounded-lg border border-slate-200 hover:border-cyan-300 hover:bg-cyan-50 text-slate-700"
                    >
                      Chi tiết
                    </a>
                  </td>
                </tr>
              ))}
              {(Array.isArray(items) && items.length === 0) && (
                <tr><td className="p-4 text-slate-600" colSpan={4}>Không có dữ liệu</td></tr>
              )}
            </tbody>
          </table>
        )}
      </motion.div>
    </DashboardLayout>
  );
}


