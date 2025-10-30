import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { listMyDistributions, searchByVerificationCode, getStats } from '../../services/distributor/proofOfDistributionService';

export default function DistributorProofOfDistribution() {
  const [items, setItems] = useState([]);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);

  const navigationItems = useMemo(() => ([
    { path: '/distributor', label: 'Trang chủ', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>), active: false },
    { path: '/distributor/proof-of-distribution', label: 'Proof of Distribution', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-7 7-7-7" /></svg>), active: true },
  ]), []);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [{ data: listRes }, { data: statsRes }] = await Promise.all([
        listMyDistributions({}),
        getStats(),
      ]);
      setItems(listRes?.data || listRes || []);
      setStats(statsRes?.data || statsRes || null);
    } catch (e) { setError(e?.response?.data?.message || 'Không thể tải dữ liệu'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = async (e) => {
    e?.preventDefault?.();
    if (!code.trim()) { load(); return; }
    setLoading(true); setError('');
    try {
      const { data } = await searchByVerificationCode(code.trim());
      // API tìm theo code trả về một bản ghi; nếu không có, trả về rỗng
      setItems(data?.data ? [data.data] : (data || []));
    } catch (e2) { setError(e2?.response?.data?.message || 'Không thể tìm kiếm'); }
    finally { setLoading(false); }
  };

  return (
    <DashboardLayout navigationItems={navigationItems} metrics={stats ? [
      { title: 'PoD của tôi', value: String(stats.total || stats?.totalDistributions || 0), subtitle: 'Tổng', detail: '', color: 'cyan' },
    ] : undefined}>
      <div className="bg-white p-4 rounded shadow mb-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input value={code} onChange={e => setCode(e.target.value)} placeholder="Tìm theo verification code" className="border rounded px-3 py-2 flex-1" />
          <button className="px-4 py-2 bg-cyan-600 text-white rounded">Tìm</button>
        </form>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        {loading ? <div className="p-6">Đang tải...</div> : error ? <div className="p-6 text-red-600">{error}</div> : (
          <table className="min-w-full">
            <thead><tr className="bg-gray-50 text-left"><th className="p-3">Drug</th><th className="p-3">Nhà sản xuất</th><th className="p-3">Mã xác thực</th><th className="p-3">Trạng thái</th><th className="p-3 text-right">Thao tác</th></tr></thead>
            <tbody>
              {items.map(p => {
                const manufacturer = p.manufacturerName || p?.fromManufacturer?.fullName || p?.proofOfProduction?.manufacturer?.name || p?.nftInfo?.drug?.manufacturer?.name;
                const drugName = p.drugName || p?.nftInfo?.drug?.name || p?.proofOfProduction?.drug?.name;
                return (
                <tr key={p._id} className="border-t">
                  <td className="p-3">{drugName || '—'}</td>
                  <td className="p-3">{manufacturer || '—'}</td>
                  <td className="p-3 font-mono">{p.verificationCode}</td>
                  <td className="p-3">{p.status}</td>
                  <td className="p-3 text-right"><a href={`/distributor/proof-of-distribution/${p._id}`} className="px-3 py-2 bg-white border rounded hover:bg-gray-50">Chi tiết</a></td>
                </tr>
              );})}
              {items.length === 0 && <tr><td className="p-4" colSpan={5}>Không có dữ liệu</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
}


