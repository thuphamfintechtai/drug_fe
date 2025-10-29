import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { getTrackingByNftId } from '../../services/admin/nftTrackingService';

export default function PharmacyNftTracking() {
  const [nftId, setNftId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigationItems = [
    { path: '/pharmacy', label: 'Trang chủ', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>) },
    { path: '/pharmacy/nft-tracking', label: 'NFT Tracking', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3.75l7.5 4.5v7.5L12 20.25l-7.5-4.5v-7.5L12 3.75zM12 8.25v7.5" /></svg>), active: true },
  ];

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!nftId) return;
    setLoading(true);
    try {
      const res = await getTrackingByNftId(nftId);
      setResult(res.data?.data || res.data || null);
    } finally { setLoading(false); }
  };

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
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight drop-shadow-sm">Theo dõi theo NFT ID</h1>
          <p className="mt-2 text-white/90">Tra cứu hành trình chuỗi cung ứng được ghi trên Blockchain.</p>
        </div>
      </section>

      {/* Form tra cứu */}
      <div className="mt-5 rounded-2xl bg-white/85 backdrop-blur-xl border border-[#90e0ef55] shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-5">
        <form onSubmit={onSubmit} className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="group relative flex-1">
            <div className="absolute inset-0 rounded-2xl bg-[#90e0ef33] blur-lg opacity-0 group-hover:opacity-100 transition" />
            <div className="relative flex items-center gap-2 rounded-2xl border border-[#90e0ef55] bg-white/60 backdrop-blur px-4 py-2.5 shadow-[0_6px_18px_rgba(0,0,0,0.06)] focus-within:bg-white/80">
              <svg className="w-5 h-5 text-[#00b4d8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18"/><path d="M12 3v18"/></svg>
              <input value={nftId} onChange={(e) => setNftId(e.target.value)} placeholder="Nhập NFT ID..." className="w-full bg-transparent placeholder:text-slate-500 text-slate-800 outline-none" />
            </div>
          </div>
          <button className="shrink-0 px-5 py-2.5 rounded-xl text-white bg-gradient-to-r from-[#00b4d8] via-[#48cae4] to-[#90e0ef] shadow-[0_10px_24px_rgba(0,180,216,0.30)] hover:shadow-[0_14px_36px_rgba(0,180,216,0.40)] transition">Tra cứu</button>
        </form>
        {loading && <div className="mt-4 text-[#003544]/70">Đang tải...</div>}
        {result && (
          <div className="mt-4">
            <pre className="text-xs bg-[#f5fcff] border border-[#90e0ef55] p-3 rounded-2xl overflow-auto">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>

      <style>{`
        @keyframes float-slow { 0%,100% { transform: translateY(0) } 50% { transform: translateY(10px) } }
        @keyframes float-slower { 0%,100% { transform: translateY(0) } 50% { transform: translateY(6px) } }
      `}</style>
    </DashboardLayout>
  );
}


