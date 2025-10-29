import { useEffect, useMemo, useState } from 'react';
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

  return (
    <DashboardLayout navigationItems={navigationItems}>
      <div className="bg-white p-4 rounded shadow mb-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Proof of Production</h2>
            <p className="text-sm text-gray-500">Danh sách và tra cứu theo batch number</p>
          </div>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input value={batch} onChange={e => setBatch(e.target.value)} placeholder="Tìm theo batch number" className="border rounded px-3 py-2 flex-1" />
            <button className="px-4 py-2 bg-cyan-600 text-white rounded">Tìm</button>
          </form>
          <button onClick={handleFixBroken} className="px-4 py-2 bg-orange-600 text-white rounded">Fix broken data</button>
        </div>
      </div>

      {statsError && (
        <div className="mb-4 text-sm text-orange-700 bg-orange-50 border border-orange-200 rounded p-3">{statsError}</div>
      )}

      <div className="bg-white rounded shadow overflow-x-auto">
        {loading ? <div className="p-6">Đang tải...</div> : error ? <div className="p-6 text-red-600">{error}</div> : (
          <table className="min-w-full">
            <thead><tr className="bg-gray-50 text-left"><th className="p-3">Drug</th><th className="p-3">Batch</th><th className="p-3">Qty</th><th className="p-3">Date</th><th className="p-3 text-right">Thao tác</th></tr></thead>
            <tbody>
              {(Array.isArray(items) ? items : []).map(p => (
                <tr key={p._id} className="border-t"><td className="p-3">{p.drugName || p.drug?.name}</td><td className="p-3">{p.batchNumber}</td><td className="p-3">{p.quantity}</td><td className="p-3">{p.productionDate ? new Date(p.productionDate).toLocaleDateString() : ''}</td><td className="p-3 text-right"><a href={`/admin/proof-of-production/${p._id}`} className="px-3 py-2 bg-white border rounded hover:bg-gray-50">Chi tiết</a></td></tr>
              ))}
              {(Array.isArray(items) && items.length === 0) && <tr><td className="p-4" colSpan={5}>Không có dữ liệu</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
}


