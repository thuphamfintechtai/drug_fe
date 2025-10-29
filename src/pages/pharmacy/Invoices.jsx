import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { listInvoices, getInvoiceStats, searchInvoiceByCode } from '../../services/pharmacy/invoiceService';

export default function PharmacyInvoices() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  const page = Number(searchParams.get('page') || 1);
  const status = searchParams.get('status') || '';

  const navigationItems = [
    { path: '/pharmacy', label: 'Trang chủ', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>) },
    { path: '/pharmacy/invoices', label: 'Commercial Invoices', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 3.75h7.5L19.5 7.5v12a.75.75 0 01-.75.75H5.25A.75.75 0 014.5 19.5v-15a.75.75 0 01.75-.75zM8.25 9h7.5M8.25 12.75h7.5M8.25 16.5h4.5" /></svg>), active: true },
    { path: '/pharmacy/invoices/my', label: 'Hóa đơn của tôi', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>) },
  ];

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [listRes, statsRes] = await Promise.all([
          listInvoices({ page, status }),
          getInvoiceStats(),
        ]);
        setItems(listRes.data?.data || []);
        setPagination(listRes.data?.pagination || null);
        setStats(statsRes.data?.data || null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, status]);

  const onSearchByCode = async (e) => {
    e.preventDefault();
    if (!code) return;
    try {
      const res = await searchInvoiceByCode(code);
      const id = res.data?.data?._id;
      if (id) navigate(`/pharmacy/invoices/${id}`);
    } catch (_) {}
  };

  const metrics = stats ? [
    { title: 'Tổng hóa đơn', value: stats.total || 0, subtitle: 'Tất cả trạng thái', detail: '', color: 'cyan' },
    { title: 'Đã thanh toán', value: stats.paid || 0, subtitle: '', detail: '', color: 'green' },
    { title: 'Đang chờ', value: stats.pending || 0, subtitle: '', detail: '', color: 'orange' },
    { title: 'Đã hủy', value: stats.cancelled || 0, subtitle: '', detail: '', color: 'red' },
  ] : [];

  return (
    <DashboardLayout navigationItems={navigationItems} metrics={metrics}>
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <select
              value={status}
              onChange={(e) => setSearchParams({ page: '1', status: e.target.value })}
              className="border rounded px-3 py-2"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="draft">Draft</option>
              <option value="issued">Issued</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <form onSubmit={onSearchByCode} className="flex items-center gap-2">
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Verification code" className="border rounded px-3 py-2" />
            <button className="px-4 py-2 bg-cyan-600 text-white rounded">Tìm</button>
          </form>
        </div>

        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="p-2">Mã</th>
                <th className="p-2">Drug</th>
                <th className="p-2">Distributor</th>
                <th className="p-2">Pharmacy</th>
                <th className="p-2">Trạng thái</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it._id} className="border-b">
                  <td className="p-2">{it.verificationCode || it._id}</td>
                  <td className="p-2">{it.drug?.name}</td>
                  <td className="p-2">{it.fromDistributor?.fullName || it.fromDistributor?.username}</td>
                  <td className="p-2">{it.toPharmacy?.fullName || it.toPharmacy?.username}</td>
                  <td className="p-2 capitalize">{it.status}</td>
                  <td className="p-2 text-right">
                    <Link to={`/pharmacy/invoices/${it._id}`} className="text-cyan-700 hover:underline">Chi tiết</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination && (
          <div className="flex items-center justify-between mt-4">
            <button
              disabled={page <= 1}
              onClick={() => setSearchParams({ page: String(page - 1), status })}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >Trước</button>
            <div>Trang {pagination.currentPage} / {pagination.totalPages}</div>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setSearchParams({ page: String(page + 1), status })}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >Sau</button>
          </div>
        )}

        {loading && <div className="mt-4 text-gray-500">Đang tải...</div>}
      </div>
    </DashboardLayout>
  );
}


