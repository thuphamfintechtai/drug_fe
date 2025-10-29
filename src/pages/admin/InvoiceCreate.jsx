import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

  return (
    <DashboardLayout navigationItems={navigationItems}>
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Tạo Commercial Invoice</h2>
        {error && <div className="mb-3 text-red-600">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Distributor ID</label>
            <input name="distributorId" value={form.distributorId} onChange={handleChange} className="border rounded px-3 py-2 w-full" required />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Pharmacy ID</label>
            <input name="pharmacyId" value={form.pharmacyId} onChange={handleChange} className="border rounded px-3 py-2 w-full" required />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Tổng tiền</label>
            <input name="totalAmount" type="number" value={form.totalAmount} onChange={handleChange} className="border rounded px-3 py-2 w-full" required />
          </div>
          <button disabled={loading} className="px-4 py-2 bg-cyan-600 text-white rounded">Tạo</button>
        </form>
      </div>
    </DashboardLayout>
  );
}


