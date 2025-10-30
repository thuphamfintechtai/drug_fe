import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { listMyDistributions, updateStatus } from '../../services/distributor/proofOfDistributionService';

export default function DistributorShipping() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigationItems = useMemo(() => ([
    { path: '/distributor', label: 'Trang chủ', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>), active: false },
    { path: '/distributor/shipping', label: 'Theo dõi vận chuyển', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>), active: true },
  ]), []);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const { data } = await listMyDistributions({});
      setItems(data?.data || data || []);
    } catch (e) { setError(e?.response?.data?.message || 'Không thể tải dữ liệu'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const onUpdate = async (id, status) => {
    setLoading(true); setError('');
    try {
      await updateStatus(id, { status });
      await load();
    } catch (e2) { setError(e2?.response?.data?.message || 'Cập nhật thất bại'); setLoading(false); }
  };

  return (
    <DashboardLayout navigationItems={navigationItems}>
      <div className="bg-white rounded shadow overflow-x-auto">
        {loading ? <div className="p-6">Đang tải...</div> : error ? <div className="p-6 text-red-600">{error}</div> : (
          <table className="min-w-full">
            <thead><tr className="bg-gray-50 text-left"><th className="p-3">Drug</th><th className="p-3">Manufacturer</th><th className="p-3">Trạng thái</th><th className="p-3 text-right">Thao tác</th></tr></thead>
            <tbody>
              {items.map(p => (
                <tr key={p._id} className="border-t">
                  <td className="p-3">{p?.nftInfo?.drug?.name || p?.proofOfProduction?.drug?.name}</td>
                  <td className="p-3">{p?.fromManufacturer?.fullName}</td>
                  <td className="p-3">{p.status}</td>
                  <td className="p-3 text-right">
                    <div className="inline-flex gap-2">
                      <button onClick={() => onUpdate(p._id, 'in_transit')} className="px-3 py-1 border rounded">Đang vận chuyển</button>
                      <button onClick={() => onUpdate(p._id, 'delivered')} className="px-3 py-1 border rounded">Đã giao</button>
                      <a href={`/distributor/proof-of-distribution/${p._id}`} className="px-3 py-1 border rounded">Chi tiết</a>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td className="p-4" colSpan={4}>Không có dữ liệu</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
}


