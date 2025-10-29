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
      <motion.section
        className="relative overflow-hidden rounded-2xl mb-5 border border-[#90e0ef33] shadow-[0_10px_30px_rgba(0,0,0,0.06)] bg-gradient-to-tr from-[#00b4d8] via-[#48cae4] to-[#90e0ef]"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.25),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-white/30 blur-xl" />
          <div className="absolute top-8 right-6 w-16 h-8 rounded-full bg-white/25 blur-md rotate-6" />
        </div>
        <div className="relative px-6 py-8 md:px-10 md:py-12 text-white">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight drop-shadow-sm">Quản lý thuốc</h2>
          <p className="mt-1 text-white/90">Danh mục thuốc minh bạch – chuẩn y tế.</p>
        </div>
      </motion.section>

      {/* Thanh tác vụ: tìm kiếm + tạo mới */}
      <motion.div
        className="rounded-2xl bg-white/85 backdrop-blur-xl border border-[#90e0ef55] shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-4 mb-5"
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
              className="border border-[#90e0ef55] bg-white/60 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#48cae4] focus:border-[#48cae4] transition w-full md:w-[320px]"
            />
            <button className="px-4 py-2.5 rounded-xl text-white bg-gradient-to-r from-[#00b4d8] via-[#48cae4] to-[#90e0ef] shadow-[0_10px_24px_rgba(0,180,216,0.30)] hover:shadow-[0_14px_36px_rgba(0,180,216,0.40)] transition">Tìm</button>
          </form>
          <a href="/admin/drugs/new" className="px-4 py-2.5 rounded-xl text-white bg-gradient-to-r from-[#00b4d8] via-[#48cae4] to-[#90e0ef] shadow-[0_10px_24px_rgba(0,180,216,0.30)] hover:shadow-[0_14px_36px_rgba(0,180,216,0.40)] transition text-center">Tạo thuốc</a>
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
        <motion.div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-[#90e0ef55] shadow-[0_10px_24px_rgba(0,0,0,0.05)] p-5 mb-5" variants={fadeUp} initial="hidden" animate="show">
          <h3 className="font-semibold mb-3 text-slate-800">Drug codes</h3>
          <div className="flex flex-wrap gap-2 max-h-40 overflow-auto">
            {codes.map((c, idx) => (
              <span key={idx} className="px-2.5 py-1 rounded-full text-sm bg-[#f5fcff] text-[#003544] border border-[#90e0ef55]">
                {c}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Table */}
      <motion.div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-[#90e0ef55] shadow-[0_10px_24px_rgba(0,0,0,0.05)] overflow-x-auto" variants={fadeUp} initial="hidden" animate="show">
        {loading ? (
          <div className="p-6">Đang tải...</div>
        ) : error ? (
          <div className="p-6 text-red-600">{error}</div>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-[#003544]">
                <th className="p-3 bg-[#f5fcff]">Tên</th>
                <th className="p-3 bg-[#f5fcff]">ATC</th>
                <th className="p-3 bg-[#f5fcff]">Nhà sản xuất</th>
                <th className="p-3 bg-[#f5fcff] text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {(Array.isArray(items) ? items : []).map((d) => (
                <tr key={d._id} className="border-t border-[#90e0ef40] hover:bg-[#f5fcff] transition">
                  <td className="p-3 font-medium text-[#003544]">{d.name}</td>
                  <td className="p-3 text-[#003544]/80">{d.atcCode}</td>
                  <td className="p-3 text-[#003544]/80">{d.manufactorName || d.manufacturer?.name}</td>
                  <td className="p-3 text-right">
                    <a href={`/admin/drugs/${d._id}`} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#90e0ef55] text-[#003544] hover:bg-[#90e0ef22] transition">Chi tiết
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6"/><path d="M3 12h12"/></svg>
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


