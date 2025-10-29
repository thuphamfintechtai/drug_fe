import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { listDrugs } from '../../services/admin/drugService';

export default function PharmacyDrugs() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page') || 1);
  const q = searchParams.get('q') || '';

  const navigationItems = [
    { path: '/pharmacy', label: 'Trang chủ', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>) },
    { path: '/pharmacy/drugs', label: 'Danh sách thuốc', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7.5h18M7.5 3v18M6 12h12M12 6v12" /></svg>), active: true },
  ];

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await listDrugs({ page, q });
        setItems(res.data?.data || res.data || []);
        setPagination(res.data?.pagination || null);
      } finally { setLoading(false); }
    };
    load();
  }, [page, q]);

  return (
    <DashboardLayout navigationItems={navigationItems}>
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between gap-3 mb-4">
          <input
            value={q}
            onChange={(e) => setSearchParams({ page: '1', q: e.target.value })}
            placeholder="Tìm theo tên"
            className="border rounded px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {items.map((d) => (
            <Link to={`/pharmacy/drugs/${d._id}`} key={d._id} className="border rounded p-3 hover:shadow">
              <div className="font-semibold">{d.name}</div>
              <div className="text-sm text-gray-600">{d.genericName}</div>
            </Link>
          ))}
        </div>

        {pagination && (
          <div className="flex items-center justify-between mt-4">
            <button
              disabled={page <= 1}
              onClick={() => setSearchParams({ page: String(page - 1), q })}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >Trước</button>
            <div>Trang {pagination.currentPage} / {pagination.totalPages}</div>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setSearchParams({ page: String(page + 1), q })}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >Sau</button>
          </div>
        )}

        {loading && <div className="mt-4 text-gray-500">Đang tải...</div>}
      </div>
    </DashboardLayout>
  );
}


