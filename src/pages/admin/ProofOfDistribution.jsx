import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { listDistributions, searchByVerificationCode, getStats } from '../../services/admin/proofOfDistributionService';

export default function AdminProofOfDistribution() {
  const [items, setItems] = useState([]);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);

  const navigationItems = useMemo(() => ([
    { path: '/admin', label: 'Trang chủ', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>), active: false },
    { path: '/admin/proof-of-distribution', label: 'Proof of Distribution', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-7 7-7-7" /></svg>), active: true },
  ]), []);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [{ data: listRes }, { data: statsRes }] = await Promise.all([
        listDistributions({}),
        getStats(),
      ]);
      setItems(listRes?.data || listRes || []);
      setStats(statsRes?.data || statsRes || null);
    } catch (e) { setError(e?.response?.data?.message || 'Không thể tải dữ liệu'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!code.trim()) { load(); return; }
    setLoading(true); setError('');
    try {
      const { data } = await searchByVerificationCode(code.trim());
      setItems(data?.data ? [data.data] : (data || []));
    } catch (e2) { setError(e2?.response?.data?.message || 'Không thể tìm kiếm'); }
    finally { setLoading(false); }
  };

  return (
    <DashboardLayout navigationItems={navigationItems}>
      <div className="bg-white p-4 rounded shadow mb-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input value={code} onChange={e => setCode(e.target.value)} placeholder="Tìm theo verification code" className="border rounded px-3 py-2 flex-1" />
          <button className="px-4 py-2 bg-cyan-600 text-white rounded">Tìm</button>
        </form>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        {loading ? <div className="p-6">Đang tải...</div> : error ? <div className="p-6 text-red-600">{error}</div> : (
          <table className="min-w-full">
            <thead><tr className="bg-gray-50 text-left"><th className="p-3">Drug</th><th className="p-3">Distributor</th><th className="p-3">Status</th><th className="p-3 text-right">Thao tác</th></tr></thead>
            <tbody>
              {items.map(p => (
                <tr key={p._id} className="border-t"><td className="p-3">{p.drugName || p.drug?.name}</td><td className="p-3">{p.distributorName || p.distributor?.name}</td><td className="p-3">{p.status}</td><td className="p-3 text-right"><a href={`/admin/proof-of-distribution/${p._id}`} className="px-3 py-2 bg-white border rounded hover:bg-gray-50">Chi tiết</a></td></tr>
              ))}
              {items.length === 0 && <tr><td className="p-4" colSpan={3}>Không có dữ liệu</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
}


