import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import { listManufacturers, getManufacturerByName } from '../../services/admin/manufacturerService';

export default function AdminManufacturers() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigationItems = useMemo(() => ([
    { path: '/admin', label: 'Trang chủ', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>), active: false },
    { path: '/admin/manufacturers', label: 'Nhà sản xuất', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V7a2 2 0 00-2-2h-3V3H9v2H6a2 2 0 00-2 2v6" /></svg>), active: true },
  ]), []);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const { data } = await listManufacturers({});
      setItems(data?.data || data || []);
    } catch (e) { setError(e?.response?.data?.message || 'Không thể tải dữ liệu'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!name.trim()) { load(); return; }
    setLoading(true); setError('');
    try {
      const { data } = await getManufacturerByName(name.trim());
      setItems(data?.data ? [data.data] : (data || []));
    } catch (e2) { setError(e2?.response?.data?.message || 'Không thể tìm kiếm'); }
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
            <h2 className="text-lg font-semibold text-slate-800">Nhà sản xuất</h2>
            <p className="text-sm text-slate-600">Danh mục nhà sản xuất – tiêu chuẩn medical tech</p>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        className="rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-[0_10px_30px_rgba(2,132,199,0.06)] p-4 mb-5"
        variants={fadeUp}
        initial="hidden"
        animate="show"
      >
        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Tìm theo tên"
            className="border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition w-full md:w-[320px]"
          />
          <button className="px-4 py-2.5 rounded-xl text-white bg-gradient-to-r from-[#00b4d8] to-[#0077b6] shadow hover:shadow-cyan-200/60">Tìm</button>
        </form>
      </motion.div>

      {/* Table */}
      <motion.div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto" variants={fadeUp} initial="hidden" animate="show">
        {loading ? (
          <div className="p-6">Đang tải...</div>
        ) : error ? (
          <div className="p-6 text-red-600">{error}</div>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr className="bg-slate-50 text-left text-slate-700">
                <th className="p-3">Tên</th>
                <th className="p-3">Địa chỉ ví</th>
                <th className="p-3">NFT</th>
              </tr>
            </thead>
            <tbody>
              {items.map((m) => (
                <tr key={m._id || m.name} className="border-t hover:bg-slate-50/60 transition">
                  <td className="p-3 font-medium text-slate-800">{m.name}</td>
                  <td className="p-3 text-slate-700">{m.walletAddress}</td>
                  <td className="p-3 text-slate-700">{m.nftInfo ? 'Có' : '—'}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td className="p-4 text-slate-600" colSpan={3}>Không có dữ liệu</td></tr>
              )}
            </tbody>
          </table>
        )}
      </motion.div>
    </DashboardLayout>
  );
}


