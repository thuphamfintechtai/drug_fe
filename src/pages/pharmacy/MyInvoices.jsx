import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { getMyInvoices } from '../../services/pharmacy/invoiceService';

export default function PharmacyMyInvoices() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page') || 1);
  const status = searchParams.get('status') || '';

  const navigationItems = [
    { path: '/pharmacy', label: 'Trang chủ', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>) },
    { path: '/pharmacy/invoices/my', label: 'Hóa đơn của tôi', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>), active: true },
  ];

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getMyInvoices({ page, status });
        setItems(res.data?.data || []);
        setPagination(res.data?.pagination || null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, status]);

  return (
    <DashboardLayout navigationItems={navigationItems}>
      {/* Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-[#90e0ef33] shadow-[0_10px_30px_rgba(0,0,0,0.06)] bg-gradient-to-tr from-[#00b4d8] via-[#48cae4] to-[#90e0ef]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.25),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-white/30 blur-xl animate-float-slow" />
          <div className="absolute top-8 right-6 w-16 h-8 rounded-full bg-white/25 blur-md rotate-6 animate-float-slower" />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-28 h-10 rounded-full bg-white/20 blur-md -rotate-6 animate-float-slower" />
        </div>
        <div className="relative px-6 py-8 md:px-10 md:py-12 text-white">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight drop-shadow-sm">Hóa đơn của tôi</h1>
          <p className="mt-2 text-white/90">Tổng hợp hóa đơn đã tạo và nhận – minh bạch, nhanh chóng.</p>
        </div>
      </section>

      {/* Actions */}
      <div className="mt-5 rounded-2xl bg-white/85 backdrop-blur-xl border border-[#90e0ef55] shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-4">
        <div className="flex items-center justify-between gap-3">
          <select
            value={status}
            onChange={(e) => setSearchParams({ page: '1', status: e.target.value })}
            className="border border-[#90e0ef55] bg-white/60 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#48cae4] focus:border-[#48cae4]"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="draft">Bản nháp</option>
            <option value="issued">Đã phát hành</option>
            <option value="sent">Đã gửi</option>
            <option value="paid">Đã thanh toán</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="mt-5 bg-white/90 backdrop-blur-xl rounded-2xl border border-[#90e0ef55] shadow-[0_10px_24px_rgba(0,0,0,0.05)] overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-[#003544]">
              <th className="p-3 bg-[#f5fcff]">Mã</th>
              <th className="p-3 bg-[#f5fcff]">Thuốc</th>
              <th className="p-3 bg-[#f5fcff]">Nhà phân phối</th>
              <th className="p-3 bg-[#f5fcff]">Trạng thái</th>
              <th className="p-3 bg-[#f5fcff]"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it._id} className="border-t border-[#90e0ef40] hover:bg-[#f5fcff] transition">
                <td className="p-3 font-medium text-[#003544]">{it.verificationCode || it._id}</td>
                <td className="p-3 text-[#003544]/80">{it.drug?.name}</td>
                <td className="p-3 text-[#003544]/80">{it.fromDistributor?.fullName || it.fromDistributor?.username}</td>
                <td className="p-3 capitalize text-[#003544]/80">{it.status}</td>
                <td className="p-3 text-right">
                  <Link to={`/pharmacy/invoices/${it._id}`} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#90e0ef55] text-[#003544] hover:bg-[#90e0ef22] transition">
                    Chi tiết
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6"/><path d="M3 12h12"/></svg>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="mt-5 flex items-center justify-between">
          <button
            disabled={page <= 1}
            onClick={() => setSearchParams({ page: String(page - 1), status })}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium border border-[#90e0ef55] text-[#003544] hover:bg-[#90e0ef22] disabled:opacity-50 disabled:hover:bg-transparent transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/><path d="M9 12h12"/></svg>
            Trước
          </button>
          <div className="text-sm text-[#003544]/80">Trang {pagination.currentPage} / {pagination.totalPages}</div>
          <button
            disabled={page >= pagination.totalPages}
            onClick={() => setSearchParams({ page: String(page + 1), status })}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#00b4d8] via-[#48cae4] to-[#90e0ef] shadow-[0_10px_24px_rgba(0,180,216,0.30)] hover:shadow-[0_14px_36px_rgba(0,180,216,0.40)] disabled:opacity-60 transition-all"
          >
            Sau
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6"/><path d="M3 12h12"/></svg>
          </button>
        </div>
      )}

      {loading && <div className="mt-4 text-[#003544]/70">Đang tải...</div>}

      <style>{`
        @keyframes float-slow { 0%,100% { transform: translateY(0) } 50% { transform: translateY(10px) } }
        @keyframes float-slower { 0%,100% { transform: translateY(0) } 50% { transform: translateY(6px) } }
      `}</style>
    </DashboardLayout>
  );
}


