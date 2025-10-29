import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import { getTrackingByNftId } from '../../services/admin/nftTrackingService';

export default function AdminNftTracking() {
  const [nftId, setNftId] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigationItems = useMemo(() => ([
    { path: '/admin', label: 'Trang chủ', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>), active: false },
    { path: '/admin/nft-tracking', label: 'NFT Tracking', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2z" /></svg>), active: true },
  ]), []);

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
      {/* Banner */}
      <motion.div
        className="relative overflow-hidden rounded-2xl p-5 mb-5 bg-gradient-to-r from-[#e0f2fe] to-[#f0f9ff] border border-cyan-100"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00b4d8] to-[#90e0ef] shadow-md shadow-cyan-200/40"
            animate={{ rotate: [0, 10, 0, -10, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div>
            <h2 className="text-lg font-semibold text-slate-800">NFT Tracking</h2>
            <p className="text-sm text-slate-600">Tra cứu lịch sử truy xuất theo NFT ID – minh bạch, tin cậy</p>
          </div>
        </div>
      </motion.div>

      {/* Form tra cứu */}
      <motion.div
        className="rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-[0_10px_30px_rgba(2,132,199,0.06)] p-4 mb-5"
        variants={fadeUp}
        initial="hidden"
        animate="show"
      >
        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
          <input
            value={nftId}
            onChange={e => setNftId(e.target.value)}
            placeholder="Nhập NFT ID"
            className="border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition w-full md:w-[360px]"
          />
          <button className="px-4 py-2.5 rounded-xl text-white bg-gradient-to-r from-[#00b4d8] to-[#0077b6] shadow hover:shadow-cyan-200/60">Xem</button>
        </form>
      </motion.div>

      {/* Kết quả */}
      <motion.div
        className="rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm p-5"
        variants={fadeUp}
        initial="hidden"
        animate="show"
      >
        {loading ? (
          <div>Đang tải...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : data ? (
          <pre className="text-sm whitespace-pre-wrap break-all text-slate-800">{JSON.stringify(data, null, 2)}</pre>
        ) : (
          <div className="text-slate-600">Nhập NFT ID để tra cứu</div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}


