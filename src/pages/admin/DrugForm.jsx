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
      {/* Banner nhỏ với slogan + pills icon */}
      <motion.div
        className="relative overflow-hidden rounded-2xl p-5 mb-6 bg-gradient-to-r from-[#e0f2fe] to-[#f0f9ff] border border-cyan-100"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-4">
          <motion.svg
            width="42" height="42" viewBox="0 0 24 24"
            className="text-cyan-600 drop-shadow"
            initial={{ rotate: -10 }}
            animate={{ rotate: [ -10, 10, -10 ] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <defs>
              <linearGradient id="capsule" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#00b4d8" />
                <stop offset="60%" stopColor="#48cae4" />
                <stop offset="100%" stopColor="#90e0ef" />
              </linearGradient>
            </defs>
            <rect x="2" y="8" rx="6" ry="6" width="20" height="8" fill="url(#capsule)" stroke="#cfe8f6" />
          </motion.svg>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">{isEdit ? 'Cập nhật thuốc' : 'Tạo thuốc mới'}</h2>
            <p className="text-sm text-slate-600">Dữ liệu chuẩn, minh bạch</p>
          </div>
        </div>
      </motion.div>

      {/* Card form kiểu glass + animation reveal */}
      <motion.div
        className="rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-[0_10px_30px_rgba(2,132,199,0.08)] p-6"
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
              className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition"
              placeholder="VD: Paracetamol" required
            />
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">ATC code</label>
            <input
              name="atcCode" value={form.atcCode} onChange={handleChange}
              className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition"
              placeholder="VD: N02BE01" required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Mô tả</label>
            <textarea
              name="description" value={form.description} onChange={handleChange}
              className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition"
              rows={4} placeholder="Công dụng, dạng bào chế, chỉ định, v.v."
            />
          </div>

          <div className="md:col-span-2 flex items-center gap-3">
            <motion.button
              type="submit" disabled={loading}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}
              className="px-5 py-2.5 rounded-xl text-white bg-gradient-to-r from-[#00b4d8] to-[#0077b6] shadow hover:shadow-cyan-200/60 disabled:opacity-60"
            >
              {isEdit ? 'Cập nhật' : 'Tạo mới'}
            </motion.button>

            {isEdit && (
              <motion.button
                type="button" onClick={handleDelete} disabled={loading}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}
                className="px-5 py-2.5 rounded-xl text-white bg-red-600 hover:bg-red-700 shadow disabled:opacity-60"
              >
                Xóa
              </motion.button>
            )}
          </div>
        </form>
      </motion.div>
    </DashboardLayout>
  );
}


