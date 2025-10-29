import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { getTrackingByNftId } from '../../services/admin/nftTrackingService';

export default function PharmacyNftTracking() {
  const [nftId, setNftId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigationItems = [
    { path: '/pharmacy', label: 'Trang chủ', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>) },
    { path: '/pharmacy/nft-tracking', label: 'NFT Tracking', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3.75l7.5 4.5v7.5L12 20.25l-7.5-4.5v-7.5L12 3.75zM12 8.25v7.5" /></svg>), active: true },
  ];

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!nftId) return;
    setLoading(true);
    try {
      const res = await getTrackingByNftId(nftId);
      setResult(res.data?.data || res.data || null);
    } finally { setLoading(false); }
  };

  return (
    <DashboardLayout navigationItems={navigationItems}>
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-4">Tracking theo NFT ID</h2>
        <form onSubmit={onSubmit} className="flex items-center gap-2 mb-4">
          <input value={nftId} onChange={(e) => setNftId(e.target.value)} placeholder="NFT ID" className="border rounded px-3 py-2 flex-1" />
          <button className="px-4 py-2 bg-cyan-600 text-white rounded">Tra cứu</button>
        </form>
        {loading && <div>Đang tải...</div>}
        {result && (
          <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto">{JSON.stringify(result, null, 2)}</pre>
        )}
      </div>
    </DashboardLayout>
  );
}


