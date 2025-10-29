import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { getProofById } from '../../services/admin/proofOfProductionService';

export default function AdminProofOfProductionDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigationItems = useMemo(() => ([
    { path: '/admin', label: 'Trang chủ', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>), active: false },
    { path: '/admin/proof-of-production', label: 'Proof of Production', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v12a2 2 0 01-2 2z" /></svg>), active: true },
  ]), []);

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError('');
      try { const { data } = await getProofById(id); setItem(data?.data || data); }
      catch (e) { setError(e?.response?.data?.message || 'Không tải được dữ liệu'); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  return (
    <DashboardLayout navigationItems={navigationItems}>
      <div className="mb-4"><Link to="/admin/proof-of-production" className="text-cyan-700 hover:underline">← Quay lại danh sách</Link></div>
      <div className="bg-white p-4 rounded shadow">
        {loading ? 'Đang tải...' : error ? <div className="text-red-600">{error}</div> : item ? (
          <div className="space-y-2">
            <div className="text-sm text-gray-600">ID: {item._id}</div>
            <div>Drug: {item.drug?.name || item.drugName}</div>
            <div>Batch: {item.batchNumber}</div>
            <div>Số lượng: {item.quantity}</div>
            <div>Ngày sản xuất: {item.productionDate ? new Date(item.productionDate).toLocaleString() : ''}</div>
            <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">{JSON.stringify(item, null, 2)}</pre>
          </div>
        ) : 'Không có dữ liệu'}
      </div>
    </DashboardLayout>
  );
}


