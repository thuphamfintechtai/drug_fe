import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import { listProofs, searchByBatch, getStats, fixBrokenData } from '../../services/admin/proofOfProductionService';

export default function AdminProofOfProduction() {
  const normalizeList = (raw) => {
    const r = raw?.data ?? raw;
    if (Array.isArray(r)) return r;
    if (Array.isArray(r?.items)) return r.items;
    if (Array.isArray(r?.results)) return r.results;
    if (Array.isArray(r?.proofs)) return r.proofs;
    return [];
  };

  const [items, setItems] = useState([]);
  const [batch, setBatch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState('');

  const navigationItems = useMemo(() => ([
    { path: '/admin', label: 'Trang chủ', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>), active: false },
    { path: '/admin/proof-of-production', label: 'Proof of Production', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2z" /></svg>), active: true },
  ]), []);

  const load = async () => {
    setLoading(true); setError(''); setStatsError('');
    try {
      const { data: listRes } = await listProofs({});
      setItems(normalizeList(listRes));
    } catch (e) {
      setError(e?.response?.data?.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
    // Tải stats riêng, không chặn bảng nếu lỗi quyền
    try {
      const { data: statsRes } = await getStats();
      setStats(statsRes?.data || statsRes || null);
    } catch (e) {
      setStatsError(e?.response?.data?.message || 'Không thể tải thống kê');
    }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!batch.trim()) { load(); return; }
    setLoading(true); setError('');
    try {
      const { data } = await searchByBatch(batch.trim());
      const normalized = normalizeList(data);
      setItems(normalized);
    } catch (e2) { setError(e2?.response?.data?.message || 'Không thể tìm kiếm'); }
    finally { setLoading(false); }
  };

  const handleFixBroken = async () => {
    if (!confirm('Chạy fix-broken-data?')) return;
    setLoading(true);
    try { await fixBrokenData({}); await load(); }
    catch (e) { setError(e?.response?.data?.message || 'Không thể sửa dữ liệu'); }
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
        <div className="relative px-6 py-8 md:px-10 md:py-12 text-white">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight drop-shadow-sm">Proof of Production</h2>
          <p className="text-white/90 mt-1">Danh sách và tra cứu theo số lô (batch).</p>
        </div>
      </motion.section>

      {/* Actions */}
      <motion.div
        className="rounded-2xl bg-white/90 backdrop-blur-xl border border-[#90e0ef55] shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-4 mb-4"
        variants={fadeUp}
        initial="hidden"
        animate="show"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
            <input
              value={batch}
              onChange={e => setBatch(e.target.value)}
              placeholder="Tìm theo batch number"
              className="border border-[#90e0ef55] bg-white/60 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#48cae4] focus:border-[#48cae4] transition w-full md:w-[320px]"
            />
            <button className="px-4 py-2.5 rounded-xl text-white bg-gradient-to-r from-[#00b4d8] via-[#48cae4] to-[#90e0ef] shadow-[0_10px_24px_rgba(0,180,216,0.30)] hover:shadow-[0_14px_36px_rgba(0,180,216,0.40)]">Tìm</button>
          </form>
          <button onClick={handleFixBroken} className="px-4 py-2.5 rounded-xl text-white bg-gradient-to-r from-orange-500 to-amber-600 shadow hover:shadow-amber-200/60">Sửa dữ liệu lỗi</button>
        </div>
      </motion.div>

      {statsError && (
        <div className="mb-4 text-sm text-orange-700 bg-orange-50 border border-orange-200 rounded-xl p-3">{statsError}</div>
      )}

      {/* Table */}
      <motion.div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-[#90e0ef55] shadow-[0_10px_24px_rgba(0,0,0,0.05)] overflow-x-auto" variants={fadeUp} initial="hidden" animate="show">
        {loading ? <div className="p-6">Đang tải...</div> : error ? <div className="p-6 text-red-600">{error}</div> : (
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-[#003544]">
                <th className="p-3 bg-[#f5fcff]">Thuốc</th>
                <th className="p-3 bg-[#f5fcff]">Lô (Batch)</th>
                <th className="p-3 bg-[#f5fcff]">Số lượng</th>
                <th className="p-3 bg-[#f5fcff]">Ngày sản xuất</th>
                <th className="p-3 bg-[#f5fcff] text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {(Array.isArray(items) ? items : []).map(p => (
                <tr key={p._id} className="border-t border-[#90e0ef40] hover:bg-[#f5fcff] transition">
                  <td className="p-3 font-medium text-[#003544]">{p.drugName || p.drug?.name}</td>
                  <td className="p-3 text-[#003544]/80">{p.batchNumber}</td>
                  <td className="p-3 text-[#003544]/80">{p.quantity}</td>
                  <td className="p-3 text-[#003544]/80">{p.productionDate ? new Date(p.productionDate).toLocaleDateString() : ''}</td>
                  <td className="p-3 text-right">
                    <a href={`/admin/proof-of-production/${p._id}`} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#90e0ef55] text-[#003544] hover:bg-[#90e0ef22] transition">Chi tiết
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6"/><path d="M3 12h12"/></svg>
                    </a>
                  </td>
                </tr>
              ))}
              {(Array.isArray(items) && items.length === 0) && (
                <tr><td className="p-4 text-slate-600" colSpan={5}>Không có dữ liệu</td></tr>
              )}
            </tbody>
          </table>
        )}
      </motion.div>
    </DashboardLayout>
  );
}


