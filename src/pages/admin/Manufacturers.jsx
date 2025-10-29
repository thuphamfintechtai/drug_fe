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
      <motion.section
        className="relative overflow-hidden rounded-2xl mb-5 border border-[#90e0ef33] shadow-[0_10px_30px_rgba(0,0,0,0.06)] bg-gradient-to-tr from-[#00b4d8] via-[#48cae4] to-[#90e0ef]"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.25),transparent_55%)]" />
        <div className="relative px-6 py-8 md:px-10 md:py-12 text-white">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight drop-shadow-sm">Nhà sản xuất</h2>
          <p className="text-white/90 mt-1">Danh mục nhà sản xuất – tiêu chuẩn medical tech.</p>
        </div>
      </motion.section>

      {/* Actions */}
      <motion.div
        className="rounded-2xl bg-white/90 backdrop-blur-xl border border-[#90e0ef55] shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-4 mb-5"
        variants={fadeUp}
        initial="hidden"
        animate="show"
      >
        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Tìm theo tên"
            className="border border-[#90e0ef55] bg-white/60 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#48cae4] focus:border-[#48cae4] transition w-full md:w-[320px]"
          />
          <button className="px-4 py-2.5 rounded-xl text-white bg-gradient-to-r from-[#00b4d8] via-[#48cae4] to-[#90e0ef] shadow-[0_10px_24px_rgba(0,180,216,0.30)] hover:shadow-[0_14px_36px_rgba(0,180,216,0.40)]">Tìm</button>
        </form>
      </motion.div>

      {/* Table */}
      <motion.div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-[#90e0ef55] shadow-[0_10px_24px_rgba(0,0,0,0.05)] overflow-x-auto" variants={fadeUp} initial="hidden" animate="show">
        {loading ? (
          <div className="p-6">Đang tải...</div>
        ) : error ? (
          <div className="p-6 text-red-600">{error}</div>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-[#003544]">
                <th className="p-3 bg-[#f5fcff]">Tên</th>
                <th className="p-3 bg-[#f5fcff]">Địa chỉ ví</th>
                <th className="p-3 bg-[#f5fcff]">NFT</th>
              </tr>
            </thead>
            <tbody>
              {items.map((m) => (
                <tr key={m._id || m.name} className="border-t border-[#90e0ef40] hover:bg-[#f5fcff] transition">
                  <td className="p-3 font-medium text-[#003544]">{m.name}</td>
                  <td className="p-3 text-[#003544]/80">{m.walletAddress}</td>
                  <td className="p-3 text-[#003544]/80">{m.nftInfo ? 'Có' : '—'}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td className="p-4 text-slate-600" colSpan={3}>Không có dữ liệu</td></tr>
              )}
            </tbody>
          </table>
        )}
      </motion.div>
      <style>{`
        @keyframes float-slow { 0%,100% { transform: translateY(0) } 50% { transform: translateY(10px) } }
      `}</style>
    </DashboardLayout>
  );
}


