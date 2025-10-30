import { useMemo, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { getTrackingByNftId } from '../../services/distributor/nftTrackingService';

export default function DistributorNFT() {
  const [nftId, setNftId] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigationItems = useMemo(() => ([
    { path: '/distributor', label: 'Trang chủ', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>), active: false },
    { path: '/distributor/nft', label: 'Quản lý NFT', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>), active: true },
  ]), []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!nftId.trim()) return;
    setLoading(true); setError('');
    try {
      const { data } = await getTrackingByNftId(nftId.trim());
      setData(data?.data || data || null);
    } catch (e2) { setError(e2?.response?.data?.message || 'Không thể tải dữ liệu'); }
    finally { setLoading(false); }
  };

  return (
    <DashboardLayout navigationItems={navigationItems}>
      <div className="bg-white p-4 rounded shadow mb-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input value={nftId} onChange={e => setNftId(e.target.value)} placeholder="NFT ID" className="border rounded px-3 py-2 flex-1" />
          <button className="px-4 py-2 bg-cyan-600 text-white rounded">Xem</button>
        </form>
      </div>

      <div className="bg-white rounded shadow p-4">
        {loading ? <div>Đang tải...</div> : error ? <div className="text-red-600">{error}</div> : data ? (
          <div className="space-y-4">
            <div className="font-semibold">Thuốc: {data?.nftInfo?.drug?.tradeName || data?.nftInfo?.drug?.name}</div>
            <div className="text-sm text-gray-600">Manufacturer: {data?.nftInfo?.drug?.manufacturer?.name}</div>
            <div>
              <div className="font-semibold mb-2">Các giai đoạn</div>
              <ul className="list-disc pl-5 text-sm">
                <li>Proof of Production: {data?.proofOfProduction?.length || 0}</li>
                <li>Proof of Distribution: {data?.proofOfDistribution?.length || 0}</li>
                <li>Proof of Pharmacy: {data?.proofOfPharmacy?.length || 0}</li>
              </ul>
            </div>
          </div>
        ) : <div>Nhập NFT ID để tra cứu.</div>}
      </div>
    </DashboardLayout>
  );
}


