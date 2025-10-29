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
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-4">Xác nhận nhận hàng</h2>
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className="border rounded px-3 py-2" placeholder="Người nhận" value={form.receivedBy} onChange={(e) => setForm({ ...form, receivedBy: e.target.value })} />
          <input className="border rounded px-3 py-2" placeholder="Verification code" value={form.verificationCode} onChange={(e) => setForm({ ...form, verificationCode: e.target.value })} />
          <input className="border rounded px-3 py-2" placeholder="Chất lượng" value={form.qualityCheck} onChange={(e) => setForm({ ...form, qualityCheck: e.target.value })} />
          <input className="border rounded px-3 py-2" placeholder="Ghi chú" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="md:col-span-2">
            <button disabled={loading} className="px-4 py-2 bg-teal-600 text-white rounded disabled:opacity-50">Xác nhận</button>
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
    </DashboardLayout>
  );
}


