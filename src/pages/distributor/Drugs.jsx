import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { listDrugs } from '../../services/admin/drugService';
import { getDistributorNavigationItems } from '../../utils/distributorNavigation';

export default function DistributorDrugs() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page') || 1);
  const q = searchParams.get('q') || '';

  const normalizeList = (raw) => {
    const r = raw?.data ?? raw;
    if (Array.isArray(r)) return r;
    if (Array.isArray(r?.items)) return r.items;
    if (Array.isArray(r?.results)) return r.results;
    if (Array.isArray(r?.drugs)) return r.drugs;
    if (Array.isArray(r?.data)) return r.data;
    return [];
  };

  const navigationItems = getDistributorNavigationItems();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await listDrugs({ page, q });
        setItems(normalizeList(res.data));
        setPagination(res.data?.pagination || null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, q]);

  return (
    <DashboardLayout navigationItems={navigationItems}>
      {/* Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-[#90e0ef33] shadow-[0_10px_30px_rgba(0,0,0,0.06)] bg-gradient-to-tr from-[#00b4d8] via-[#48cae4] to-[#90e0ef]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.25),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-white/30 blur-xl animate-float-slow" />
          <div className="absolute top-8 right-6 w-16 h-8 rounded-full bg-white/25 blur-md rotate-6 animate-float-slower" />
        </div>
        <div className="relative px-6 py-8 md:px-10 md:py-12 text-white">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight drop-shadow-sm">
                Danh sách thuốc • Truy xuất minh bạch
              </h1>
              <p className="mt-3 text-white/90 leading-relaxed">
                Khám phá và tra cứu thuốc nhanh chóng. Dữ liệu xác thực bởi Blockchain.
              </p>
            </div>
            <div className="w-full md:max-w-md">
              <div className="group relative">
                <div className="relative flex items-center gap-2 rounded-2xl border border-white/30 bg-white/15 backdrop-blur px-4 py-2.5 text-white/95 shadow-[0_6px_18px_rgba(0,0,0,0.08)] focus-within:bg-white/20">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M21 21l-4.3-4.3" />
                  </svg>
                  <input
                    value={q}
                    onChange={(e) => setSearchParams({ page: '1', q: e.target.value })}
                    placeholder="Tìm theo tên thuốc..."
                    className="w-full bg-transparent placeholder:text-white/70 text-white outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lưới danh sách */}
      <div className="mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {(Array.isArray(items) ? items : []).map((d) => (
            <Link
              to={`/distributor/drugs/${d._id}`}
              key={d._id}
              className="group relative rounded-2xl border border-[#90e0ef55] bg-white/80 backdrop-blur-xl p-4 shadow-[0_10px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_14px_36px_rgba(0,0,0,0.08)] transition-all duration-300"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#90e0ef0f] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold text-[#003544] tracking-tight line-clamp-2">
                      {d.name || d.tradeName || 'N/A'}
                    </div>
                    <div className="mt-1 text-sm text-[#003544]/70 line-clamp-1">
                      {d.genericName || 'N/A'}
                    </div>
                  </div>
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-[#00b4d8] to-[#90e0ef] shadow-[0_6px_18px_rgba(0,180,216,0.35)]" />
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-[#003544]/70">
                  {d.atcCode && (
                    <span className="rounded-md bg-[#90e0ef22] px-2 py-1">
                      ATC: {d.atcCode}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {loading && <div className="mt-4 text-[#003544]/70 text-center">Đang tải...</div>}

      {/* Phân trang */}
      {pagination && (
        <div className="mt-6 flex items-center justify-between">
          <button
            disabled={page <= 1}
            onClick={() => setSearchParams({ page: String(page - 1), q })}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium border border-[#90e0ef55] text-[#003544] hover:bg-[#90e0ef22] disabled:opacity-50 disabled:hover:bg-transparent transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Trước
          </button>
          <div className="text-sm text-[#003544]/80">
            Trang {pagination.currentPage} / {pagination.totalPages}
          </div>
          <button
            disabled={page >= pagination.totalPages}
            onClick={() => setSearchParams({ page: String(page + 1), q })}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#00b4d8] via-[#48cae4] to-[#90e0ef] shadow-[0_10px_24px_rgba(0,180,216,0.30)] hover:shadow-[0_14px_36px_rgba(0,180,216,0.40)] disabled:opacity-60 transition-all"
          >
            Sau
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      )}

      <style>{`
        @keyframes float-slow { 0%,100% { transform: translateY(0) } 50% { transform: translateY(10px) } }
        @keyframes float-slower { 0%,100% { transform: translateY(0) } 50% { transform: translateY(6px) } }
      `}</style>
    </DashboardLayout>
  );
}
