import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import { createDrug, getDrugById, updateDrug, deleteDrug } from '../../services/admin/drugService';

export default function AdminDrugForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', atcCode: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigationItems = useMemo(() => ([
    { path: '/admin', label: 'Trang chủ', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>), active: false },
    { path: '/admin/drugs', label: 'Quản lý thuốc', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-7 7-7-7" /></svg>), active: true },
  ]), []);

  useEffect(() => {
    const load = async () => {
      if (!isEdit) return;
      setLoading(true); setError('');
      try {
        const { data } = await getDrugById(id);
        const d = data?.data || data;
        setForm({ name: d?.name || '', atcCode: d?.atcCode || '', description: d?.description || '' });
      } catch (e) { setError(e?.response?.data?.message || 'Không tải được chi tiết thuốc'); }
      finally { setLoading(false); }
    };
    load();
  }, [id, isEdit]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      if (isEdit) {
        await updateDrug(id, form);
      } else {
        await createDrug(form);
      }
      navigate('/admin/drugs');
    } catch (e2) { setError(e2?.response?.data?.message || 'Không thể lưu thuốc'); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!isEdit) return;
    if (!confirm('Xóa thuốc này?')) return;
    setLoading(true); setError('');
    try { await deleteDrug(id); navigate('/admin/drugs'); }
    catch (e2) { setError(e2?.response?.data?.message || 'Không thể xóa thuốc'); }
    finally { setLoading(false); }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <DashboardLayout navigationItems={navigationItems}>
      {/* Banner nhỏ với gradient xanh y tế */}
      <motion.section
        className="relative overflow-hidden rounded-2xl mb-6 border border-[#90e0ef33] shadow-[0_10px_30px_rgba(0,0,0,0.06)] bg-gradient-to-tr from-[#00b4d8] via-[#48cae4] to-[#90e0ef]"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.25),transparent_55%)]" />
        <div className="relative px-6 py-8 md:px-10 md:py-12 text-white">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight drop-shadow-sm">{isEdit ? 'Cập nhật thuốc' : 'Tạo thuốc mới'}</h2>
          <p className="mt-1 text-white/90">Dữ liệu chuẩn, minh bạch.</p>
        </div>
      </motion.section>

      {/* Card form kiểu glass + animation reveal */}
      <motion.div
        className="rounded-2xl bg-white/90 backdrop-blur-xl border border-[#90e0ef55] shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-6"
        variants={fadeUp}
        initial="hidden"
        animate="show"
      >
        {error && (
          <motion.div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">Tên thuốc</label>
            <input
              name="name" value={form.name} onChange={handleChange}
              className="w-full rounded-xl border border-[#90e0ef55] bg-white/60 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#48cae4] focus:border-[#48cae4] transition"
              placeholder="VD: Paracetamol" required
            />
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">ATC code</label>
            <input
              name="atcCode" value={form.atcCode} onChange={handleChange}
              className="w-full rounded-xl border border-[#90e0ef55] bg-white/60 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#48cae4] focus:border-[#48cae4] transition"
              placeholder="VD: N02BE01" required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Mô tả</label>
            <textarea
              name="description" value={form.description} onChange={handleChange}
              className="w-full rounded-xl border border-[#90e0ef55] bg-white/60 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#48cae4] focus:border-[#48cae4] transition"
              rows={4} placeholder="Công dụng, dạng bào chế, chỉ định, v.v."
            />
          </div>

          <div className="md:col-span-2 flex items-center gap-3">
            <motion.button
              type="submit" disabled={loading}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}
              className="px-5 py-2.5 rounded-xl text-white bg-gradient-to-r from-[#00b4d8] via-[#48cae4] to-[#90e0ef] shadow-[0_10px_24px_rgba(0,180,216,0.30)] hover:shadow-[0_14px_36px_rgba(0,180,216,0.40)] disabled:opacity-60"
            >
              {isEdit ? 'Cập nhật' : 'Tạo mới'}
            </motion.button>

            {isEdit && (
              <motion.button
                type="button" onClick={handleDelete} disabled={loading}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}
                className="px-5 py-2.5 rounded-xl text-white bg-red-600/90 hover:bg-red-600 shadow disabled:opacity-60"
              >
                Xóa
              </motion.button>
            )}
          </div>
        </form>
      </motion.div>

      <style>{`
        @keyframes float-slow { 0%,100% { transform: translateY(0) } 50% { transform: translateY(10px) } }
      `}</style>
    </DashboardLayout>
  );
}


