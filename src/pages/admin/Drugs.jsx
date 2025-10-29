import { useEffect, useMemo, useState } from 'react';
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

  return (
    <DashboardLayout navigationItems={navigationItems}>
      <div className="bg-white p-4 rounded shadow mb-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input value={atc} onChange={e => setAtc(e.target.value)} placeholder="Tìm theo ATC code" className="border rounded px-3 py-2 flex-1" />
            <button className="px-4 py-2 bg-cyan-600 text-white rounded">Tìm</button>
          </form>
          <a href="/admin/drugs/new" className="px-4 py-2 bg-green-600 text-white rounded text-center">Tạo thuốc</a>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="p-4 bg-white rounded shadow"><div className="text-sm text-gray-600">Tổng thuốc</div><div className="text-2xl font-semibold">{stats.total || 0}</div></div>
        </div>
      )}

      {codes && codes.length > 0 && (
        <div className="bg-white p-4 rounded shadow mb-4">
          <h3 className="font-semibold mb-2">Drug codes</h3>
          <div className="flex flex-wrap gap-2 max-h-40 overflow-auto">
            {codes.map((c, idx) => (
              <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-sm">{c}</span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded shadow overflow-x-auto">
        {loading ? <div className="p-6">Đang tải...</div> : error ? <div className="p-6 text-red-600">{error}</div> : (
          <table className="min-w-full">
            <thead><tr className="bg-gray-50 text-left"><th className="p-3">Tên</th><th className="p-3">ATC</th><th className="p-3">Manufactor</th><th className="p-3 text-right">Thao tác</th></tr></thead>
            <tbody>
              {(Array.isArray(items) ? items : []).map(d => (
                <tr key={d._id} className="border-t"><td className="p-3">{d.name}</td><td className="p-3">{d.atcCode}</td><td className="p-3">{d.manufactorName || d.manufacturer?.name}</td><td className="p-3 text-right"><a href={`/admin/drugs/${d._id}`} className="px-3 py-2 bg-white border rounded hover:bg-gray-50">Chi tiết</a></td></tr>
              ))}
              {(Array.isArray(items) && items.length === 0) && <tr><td className="p-4" colSpan={4}>Không có dữ liệu</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
}


