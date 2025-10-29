import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { createProofOfPharmacy } from '../../services/pharmacy/proofOfPharmacyService';
import { useNavigate } from 'react-router-dom';

export default function PharmacyProofCreate() {
  const [form, setForm] = useState({
    proofOfDistributionId: '',
    nftInfoId: '',
    drugId: '',
    receivedQuantity: '',
    receiptAddress: '',
    receivedBy: '',
    qualityCheck: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const navigationItems = [
    { path: '/pharmacy', label: 'Trang chủ', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>) },
    { path: '/pharmacy/proof-of-pharmacy', label: 'Proof of Pharmacy', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>) },
    { path: '/pharmacy/proof-of-pharmacy/new', label: 'Tạo mới', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" /></svg>), active: true },
  ];

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      if (payload.receivedQuantity) payload.receivedQuantity = Number(payload.receivedQuantity);
      const res = await createProofOfPharmacy(payload);
      const id = res.data?.data?._id;
      if (id) navigate(`/pharmacy/proof-of-pharmacy/${id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout navigationItems={navigationItems}>
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-4">Tạo Proof of Pharmacy</h2>
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className="border rounded px-3 py-2" placeholder="Proof of Distribution ID" value={form.proofOfDistributionId} onChange={(e) => setForm({ ...form, proofOfDistributionId: e.target.value })} />
          <input className="border rounded px-3 py-2" placeholder="NFT Info ID" value={form.nftInfoId} onChange={(e) => setForm({ ...form, nftInfoId: e.target.value })} />
          <input className="border rounded px-3 py-2" placeholder="Drug ID" value={form.drugId} onChange={(e) => setForm({ ...form, drugId: e.target.value })} />
          <input className="border rounded px-3 py-2" placeholder="Số lượng nhận" value={form.receivedQuantity} onChange={(e) => setForm({ ...form, receivedQuantity: e.target.value })} />
          <input className="border rounded px-3 py-2" placeholder="Địa chỉ nhận" value={form.receiptAddress} onChange={(e) => setForm({ ...form, receiptAddress: e.target.value })} />
          <input className="border rounded px-3 py-2" placeholder="Người nhận" value={form.receivedBy} onChange={(e) => setForm({ ...form, receivedBy: e.target.value })} />
          <input className="border rounded px-3 py-2" placeholder="Chất lượng" value={form.qualityCheck} onChange={(e) => setForm({ ...form, qualityCheck: e.target.value })} />
          <input className="border rounded px-3 py-2" placeholder="Ghi chú" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="md:col-span-2">
            <button disabled={loading} className="px-4 py-2 bg-cyan-600 text-white rounded disabled:opacity-50">Tạo</button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}


