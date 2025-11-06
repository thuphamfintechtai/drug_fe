import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import { getTrackingByNftId } from '../../services/admin/nftTrackingService';
import TruckLoader from '../../components/TruckLoader';

export default function AdminNftTracking() {
  const [nftId, setNftId] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pageLoading, setPageLoading] = useState(true);
  const [pageProgress, setPageProgress] = useState(0);
  const pageIntervalRef = useRef(null);

  const navigationItems = useMemo(() => ([
    { path: '/admin', label: 'Trang chủ', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>), active: false },
    { path: '/admin/nft-tracking', label: 'NFT Tracking', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2z" /></svg>), active: true },
  ]), []);

  // Loading trang giống Dashboard: xe chạy khi vào trang
  useEffect(() => {
    setPageLoading(true);
    setPageProgress(0);
    if (pageIntervalRef.current) { clearInterval(pageIntervalRef.current); pageIntervalRef.current = null; }
    pageIntervalRef.current = setInterval(() => {
      setPageProgress(prev => (prev < 0.9 ? Math.min(prev + 0.02, 0.9) : prev));
    }, 50);
    const complete = async () => {
      if (pageIntervalRef.current) { clearInterval(pageIntervalRef.current); pageIntervalRef.current = null; }
      let current = 0; setPageProgress(p => { current = p; return p; });
      if (current < 0.9) {
        await new Promise(resolve => {
          const su = setInterval(() => {
            setPageProgress(prev => {
              if (prev < 1) { const np = Math.min(prev + 0.15, 1); if (np >= 1) { clearInterval(su); resolve(); } return np; }
              clearInterval(su); resolve(); return 1;
            });
          }, 30);
          setTimeout(() => { clearInterval(su); setPageProgress(1); resolve(); }, 500);
        });
      } else {
        setPageProgress(1); await new Promise(r => setTimeout(r, 200));
      }
      await new Promise(r => setTimeout(r, 100));
      setPageLoading(false);
      setTimeout(() => setPageProgress(0), 500);
    };
    complete();
    return () => { if (pageIntervalRef.current) { clearInterval(pageIntervalRef.current); pageIntervalRef.current = null; } };
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!nftId.trim()) return;
    setLoading(true); setError('');
    try {
      const { data } = await getTrackingByNftId(nftId.trim());
      setData(data?.data || data || null);
    } catch (e2) { setError(e2?.response?.data?.message || 'Không thể tải dữ liệu'); }
    finally { setLoading(false); }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <DashboardLayout navigationItems={navigationItems}>
      {pageLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="w-full max-w-2xl">
            <TruckLoader height={72} progress={pageProgress} showTrack />
          </div>
          <div className="text-lg text-slate-600 mt-6">Đang tải dữ liệu...</div>
        </div>
      ) : (
        <>
      {/* Banner */}
      <motion.section
        className="relative overflow-hidden rounded-2xl mb-5 border border-[#90e0ef33] shadow-[0_10px_30px_rgba(0,0,0,0.06)] bg-gradient-to-tr from-[#00b4d8] via-[#48cae4] to-[#90e0ef]"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.25),transparent_55%)]" />
        <div className="relative px-6 py-8 md:px-10 md:py-12 text-white">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight drop-shadow-sm">NFT Tracking</h2>
          <p className="text-white/90 mt-1">Tra cứu lịch sử truy xuất theo NFT ID – minh bạch, tin cậy.</p>
        </div>
      </motion.section>

      {/* Form tra cứu */}
      <motion.div
        className="rounded-2xl bg-white/90 backdrop-blur-xl border border-[#90e0ef55] shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-4 mb-5"
        variants={fadeUp}
        initial="hidden"
        animate="show"
      >
        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
          <input
            value={nftId}
            onChange={e => setNftId(e.target.value)}
            placeholder="Nhập NFT ID"
            className="border border-[#90e0ef55] bg-white/60 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#48cae4] focus:border-[#48cae4] transition w-full md:w-[360px]"
          />
          <button className="px-4 py-2.5 rounded-xl text-white bg-gradient-to-r from-[#00b4d8] via-[#48cae4] to-[#90e0ef] shadow-[0_10px_24px_rgba(0,180,216,0.30)] hover:shadow-[0_14px_36px_rgba(0,180,216,0.40)]">Xem</button>
        </form>
      </motion.div>

      {/* Kết quả */}
      <motion.div
        className="rounded-2xl bg-white/90 backdrop-blur-xl border border-[#90e0ef55] shadow-[0_10px_24px_rgba(0,0,0,0.05)] p-5"
        variants={fadeUp}
        initial="hidden"
        animate="show"
      >
        {loading ? (
          <div className="flex items-center justify-center py-10 text-slate-600">Đang tải...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : data ? (
          <pre className="text-sm whitespace-pre-wrap break-all text-[#003544] bg-[#f5fcff] border border-[#90e0ef55] p-3 rounded-xl">{JSON.stringify(data, null, 2)}</pre>
        ) : (
          <div className="text-slate-600">Nhập NFT ID để tra cứu</div>
        )}
      </motion.div>
        </>
      )}
      <style>{`
        @keyframes float-slow { 0%,100% { transform: translateY(0) } 50% { transform: translateY(10px) } }
      `}</style>
    </DashboardLayout>
  );
}


