import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import { getPharmacyById } from '../../services/admin/proofOfPharmacyService';

export default function AdminProofOfPharmacyDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigationItems = useMemo(() => ([
    { path: '/admin', label: 'Trang chủ', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>), active: false },
    { path: '/admin/proof-of-pharmacy', label: 'Proof of Pharmacy', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v12a2 2 0 01-2 2z" /></svg>), active: true },
  ]), []);

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError('');
      try { const { data } = await getPharmacyById(id); setItem(data?.data || data); }
      catch (e) { setError(e?.response?.data?.message || 'Không tải được dữ liệu'); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const fadeUp = {
    hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <DashboardLayout navigationItems={navigationItems}>
      {/* Banner */}
      <motion.section
        className="relative overflow-hidden rounded-2xl mb-4 border border-[#90e0ef33] shadow-[0_10px_30px_rgba(0,0,0,0.06)] bg-gradient-to-tr from-[#00b4d8] via-[#48cae4] to-[#90e0ef]"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.25),transparent_55%)]" />
        <div className="relative px-6 py-8 md:px-10 md:py-12 text-white">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight drop-shadow-sm">Chi tiết Proof of Pharmacy</h1>
          <p className="text-white/90 mt-1">Thông tin minh chứng nhà thuốc – minh bạch, tin cậy.</p>
        </div>
      </motion.section>

      {/* Back link */}
      <div className="mb-3">
        <Link to="/admin/proof-of-pharmacy" className="inline-flex items-center gap-2 text-cyan-700 hover:text-cyan-800">
          <span>←</span>
          <span>Quay lại danh sách</span>
        </Link>
      </div>

      {/* Detail card */}
      <motion.div
        className="rounded-2xl bg-white/90 backdrop-blur-xl border border-[#90e0ef55] shadow-[0_10px_24px_rgba(0,0,0,0.05)] p-5"
        variants={fadeUp}
        initial="hidden"
        animate="show"
      >
        {loading ? (
          <div>Đang tải...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : item ? (
          <div className="space-y-3">
            <div className="text-sm text-[#003544]/70">ID: <span className="text-[#003544]">{item._id}</span></div>
            <div className="text-[#003544]"><span className="text-[#003544]/70">Thuốc:</span> {item.drug?.name || item.drugName}</div>
            <div className="text-[#003544]"><span className="text-[#003544]/70">Nhà thuốc:</span> {item.pharmacy?.name || item.pharmacyName}</div>
            <div className="text-[#003544]"><span className="text-[#003544]/70">Trạng thái:</span> {item.status}</div>
            <pre className="bg-[#f5fcff] border border-[#90e0ef55] p-3 rounded-lg text-sm overflow-x-auto text-[#003544]">{JSON.stringify(item, null, 2)}</pre>
          </div>
        ) : (
          <div className="text-slate-600">Không có dữ liệu</div>
        )}
      </motion.div>
      <style>{`
        @keyframes float-slow { 0%,100% { transform: translateY(0) } 50% { transform: translateY(10px) } }
      `}</style>
    </DashboardLayout>
  );
}


