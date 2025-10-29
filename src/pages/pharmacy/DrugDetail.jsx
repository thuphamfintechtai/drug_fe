import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { getDrugById } from '../../services/admin/drugService';

export default function PharmacyDrugDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigationItems = [
    { path: '/pharmacy', label: 'Trang chủ', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>) },
    { path: '/pharmacy/drugs', label: 'Danh sách thuốc', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7.5h18M7.5 3v18M6 12h12M12 6v12" /></svg>) },
  ];

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getDrugById(id);
        setData(res.data?.data || res.data || null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  return (
    <DashboardLayout navigationItems={navigationItems}>
      {/* Banner hiện đại với gradient xanh y tế và hiệu ứng nhẹ */}
      <section className="relative overflow-hidden rounded-2xl border border-[#90e0ef33] shadow-[0_10px_30px_rgba(0,0,0,0.06)] bg-gradient-to-tr from-[#00b4d8] via-[#48cae4] to-[#90e0ef]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.25),transparent_55%)]" />
        {/* Pills bay chậm */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-6 -left-6 w-28 h-28 rounded-full bg-white/30 blur-xl animate-float-slow" />
          <div className="absolute top-10 right-8 w-16 h-8 rounded-full bg-white/25 blur-md rotate-6 animate-float-slower" />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-24 h-10 rounded-full bg-white/20 blur-md -rotate-6 animate-float-slower" />
        </div>
        <div className="relative px-6 py-10 md:px-10 md:py-14 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight drop-shadow-sm animate-fade-in">
                DrugTrace — Truy xuất nguồn gốc thuốc minh bạch bằng Blockchain
              </h1>
              <p className="mt-3 text-white/90 leading-relaxed animate-slide-up">
                Nâng tầm trải nghiệm y tế số: nhanh, chính xác, đáng tin cậy. Minh bạch chuỗi cung ứng cho nhà thuốc và người dùng.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button className="group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-[#003544] bg-gradient-to-r from-white to-white/90 shadow-[0_6px_20px_rgba(255,255,255,0.25)] hover:shadow-[0_8px_28px_rgba(255,255,255,0.35)] transition-all duration-300">
                <svg className="w-4 h-4 text-[#00b4d8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/></svg>
                Quét QR
              </button>
              <button className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white bg-white/15 border border-white/25 backdrop-blur hover:bg-white/20 hover:shadow-[0_8px_28px_rgba(0,0,0,0.12)] transition-all duration-300">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v14"/></svg>
                Chia sẻ
              </button>
              <a href="/pharmacy/drugs" className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white/90 border border-white/30 hover:border-white/60 hover:text-white transition-all duration-300">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/><path d="M9 12h12"/></svg>
                Quay lại danh sách
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Nội dung chi tiết thuốc */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="relative rounded-2xl border border-[#90e0ef55] bg-white/80 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-6">
            {loading && (
              <div className="animate-pulse space-y-4">
                <div className="h-6 w-1/3 rounded bg-[#90e0ef33]" />
                <div className="h-4 w-1/4 rounded bg-[#90e0ef22]" />
                <div className="h-4 w-1/5 rounded bg-[#90e0ef22]" />
                <div className="h-24 w-full rounded bg-[#90e0ef22]" />
              </div>
            )}
            {!loading && data && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h2 className="text-xl md:text-2xl font-semibold text-[#003544] tracking-tight">
                    {data.name}
                  </h2>
                  <p className="text-sm text-[#003544]/70">{data.genericName}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-[#90e0ef55] bg-white/60 p-4 hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition-all duration-300">
                    <div className="text-xs uppercase tracking-wide text-[#00b4d8]">Mã ATC</div>
                    <div className="mt-1 text-[#003544] font-medium">{data.atcCode || '—'}</div>
                  </div>
                  <div className="rounded-xl border border-[#90e0ef55] bg-white/60 p-4 hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition-all duration-300">
                    <div className="text-xs uppercase tracking-wide text-[#00b4d8]">Trạng thái truy xuất</div>
                    <div className="mt-1 text-[#003544] font-medium">Hợp lệ • Chuỗi minh bạch</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-[#003544]">Mô tả</div>
                  <p className="mt-2 text-[15px] leading-relaxed text-[#003544]/80">
                    {data.description || 'Chưa có mô tả.'}
                  </p>
                </div>

                <div className="pt-2">
                  <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00b4d8] via-[#48cae4] to-[#90e0ef] px-4 py-2 text-sm font-medium text-white shadow-[0_10px_30px_rgba(0,180,216,0.35)] hover:shadow-[0_14px_36px_rgba(0,180,216,0.45)] transition-all duration-300 hover:brightness-105">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                    Thêm vào danh mục
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="sticky top-4 space-y-4">
            <div className="rounded-2xl border border-[#90e0ef55] bg-white/70 backdrop-blur-xl p-5 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#00b4d8] to-[#90e0ef] shadow-[0_6px_18px_rgba(0,180,216,0.35)]" />
                <div>
                  <div className="text-sm font-medium text-[#003544]">Độ tin cậy</div>
                  <div className="text-xs text-[#003544]/70">Chuỗi khối xác thực</div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-[#90e0ef22] py-2 text-xs text-[#003544]">GS1</div>
                <div className="rounded-lg bg-[#90e0ef22] py-2 text-xs text-[#003544]">Batch</div>
                <div className="rounded-lg bg-[#90e0ef22] py-2 text-xs text-[#003544]">Expiry</div>
              </div>
            </div>
            <div className="rounded-2xl border border-[#90e0ef55] bg-white/70 backdrop-blur-xl p-5 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
              <div className="text-sm font-medium text-[#003544]">Hành động nhanh</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button className="px-3 py-2 text-xs rounded-lg border border-[#90e0ef55] text-[#003544] hover:bg-[#90e0ef22] transition">Tải QR</button>
                <button className="px-3 py-2 text-xs rounded-lg border border-[#90e0ef55] text-[#003544] hover:bg-[#90e0ef22] transition">In thông tin</button>
                <button className="px-3 py-2 text-xs rounded-lg border border-[#90e0ef55] text-[#003544] hover:bg-[#90e0ef22] transition">Báo cáo</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Keyframes nhỏ gọn cho hiệu ứng mượt */}
      <style>{`
        @keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes float-slow { 0%,100% { transform: translateY(0) } 50% { transform: translateY(10px) } }
        @keyframes float-slower { 0%,100% { transform: translateY(0) } 50% { transform: translateY(6px) } }
      `}</style>
    </DashboardLayout>
  );
}


