import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import { getDistributionById } from '../../services/admin/proofOfDistributionService';

export default function AdminProofOfDistributionDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigationItems = useMemo(() => ([
    { path: '/admin', label: 'Trang chủ', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>), active: false },
    { path: '/admin/proof-of-distribution', label: 'Proof of Distribution', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v12a2 2 0 01-2 2z" /></svg>), active: true },
  ]), []);

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError('');
      try { const { data } = await getDistributionById(id); setItem(data?.data || data); }
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
      <motion.div
        className="relative overflow-hidden rounded-2xl p-5 mb-4 bg-gradient-to-r from-[#e0f2fe] to-[#f0f9ff] border border-cyan-100"
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
            <h1 className="text-lg font-semibold text-slate-800">Chi tiết Proof of Distribution</h1>
            <p className="text-sm text-slate-600">Thông tin minh chứng phân phối – minh bạch, tin cậy</p>
          </div>
        </div>
      </motion.div>

      {/* Back link */}
      <div className="mb-3">
        <Link to="/admin/proof-of-distribution" className="inline-flex items-center gap-2 text-cyan-700 hover:text-cyan-800">
          <span>←</span>
          <span>Quay lại danh sách</span>
        </Link>
      </div>

      {/* Detail card */}
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
        ) : item ? (
          <div className="space-y-3">
            <div className="text-sm text-slate-600">ID: <span className="text-slate-800">{item._id}</span></div>
            <div className="text-slate-800"><span className="text-slate-600">Thuốc:</span> {item.drug?.name || item.drugName}</div>
            <div className="text-slate-800"><span className="text-slate-600">Nhà phân phối:</span> {item.distributor?.name || item.distributorName}</div>
            <div className="text-slate-800"><span className="text-slate-600">Trạng thái:</span> {item.status}</div>
            <pre className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-sm overflow-x-auto text-slate-800">{JSON.stringify(item, null, 2)}</pre>
          </div>
        ) : (
          <div className="text-slate-600">Không có dữ liệu</div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}


