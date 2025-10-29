import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import { createInvoice } from '../../services/admin/invoiceService';

export default function AdminInvoiceCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ distributorId: '', pharmacyId: '', items: [], totalAmount: 0 });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigationItems = useMemo(() => ([
    { path: '/admin', label: 'Trang chủ', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>), active: false },
    { path: '/admin/invoices', label: 'Invoices', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v12a2 2 0 01-2 2z" /></svg>), active: true },
  ]), []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await createInvoice(form);
      navigate('/admin/invoices');
    } catch (e2) { setError(e2?.response?.data?.message || 'Không thể tạo invoice'); }
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
            animate={{ rotate: [0, 12, 0, -12, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Tạo Commercial Invoice</h2>
            <p className="text-sm text-slate-600">Chuẩn y tế – minh bạch blockchain</p>
          </div>
        </div>
      </motion.div>

      {/* Card form */}
      <motion.div
        className="rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-[0_10px_30px_rgba(2,132,199,0.06)] p-6"
        variants={fadeUp}
        initial="hidden"
        animate="show"
      >
        {error && (
          <motion.div className="mb-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {error}
          </motion.div>
        )}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Distributor ID</label>
            <input
              name="distributorId" value={form.distributorId} onChange={handleChange}
              className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition"
              placeholder="VD: DIST-001" required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Pharmacy ID</label>
            <input
              name="pharmacyId" value={form.pharmacyId} onChange={handleChange}
              className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition"
              placeholder="VD: PHAR-009" required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Tổng tiền</label>
            <input
              name="totalAmount" type="number" value={form.totalAmount} onChange={handleChange}
              className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition"
              placeholder="VD: 12000000" required
            />
          </div>
          <div className="md:col-span-2">
            <motion.button
              disabled={loading}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}
              className="px-5 py-2.5 rounded-xl text-white bg-gradient-to-r from-[#00b4d8] to-[#0077b6] shadow hover:shadow-cyan-200/60"
            >
              Tạo
            </motion.button>
          </div>
        </form>
      </motion.div>
    </DashboardLayout>
  );
}


