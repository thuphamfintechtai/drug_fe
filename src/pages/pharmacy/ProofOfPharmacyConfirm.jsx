import { useState } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { confirmReceipt } from '../../services/pharmacy/proofOfPharmacyService';

export default function PharmacyProofConfirm() {
  const { id } = useParams();
  const [form, setForm] = useState({ receivedBy: '', verificationCode: '', qualityCheck: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const navigationItems = [
    { path: '/pharmacy', label: 'Trang chủ', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>) },
    { path: '/pharmacy/proof-of-pharmacy', label: 'Proof of Pharmacy', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>) },
  ];

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await confirmReceipt(id, form);
      setResult(res.data?.data || res.data);
    } catch (err) {
      setResult({ error: err.response?.data?.message || 'Xác nhận thất bại' });
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight drop-shadow-sm">Xác nhận nhận hàng</h1>
          <p className="mt-2 text-white/90">Nhập thông tin xác thực và chất lượng nhận hàng.</p>
        </div>
      </section>

      {/* Form */}
      <div className="mt-5 rounded-2xl bg-white/85 backdrop-blur-xl border border-[#90e0ef55] shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-5">
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className="border border-[#90e0ef55] bg-white/60 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#48cae4] focus:border-[#48cae4]" placeholder="Người nhận" value={form.receivedBy} onChange={(e) => setForm({ ...form, receivedBy: e.target.value })} />
          <input className="border border-[#90e0ef55] bg-white/60 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#48cae4] focus:border-[#48cae4]" placeholder="Mã xác thực" value={form.verificationCode} onChange={(e) => setForm({ ...form, verificationCode: e.target.value })} />
          <input className="border border-[#90e0ef55] bg-white/60 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#48cae4] focus:border-[#48cae4]" placeholder="Chất lượng" value={form.qualityCheck} onChange={(e) => setForm({ ...form, qualityCheck: e.target.value })} />
          <input className="border border-[#90e0ef55] bg-white/60 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#48cae4] focus:border-[#48cae4]" placeholder="Ghi chú" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="md:col-span-2">
            <button disabled={loading} className="px-4 py-2.5 rounded-xl text-white bg-gradient-to-r from-[#00b4d8] via-[#48cae4] to-[#90e0ef] shadow-[0_10px_24px_rgba(0,180,216,0.30)] hover:shadow-[0_14px_36px_rgba(0,180,216,0.40)] disabled:opacity-50 transition">Xác nhận</button>
          </div>
        </form>
        {result && (
          <div className="mt-4 text-sm">
            {result.error ? (
              <div className="text-red-600">{result.error}</div>
            ) : (
              <div className="text-green-700">Xác nhận thành công.</div>
            )}
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


