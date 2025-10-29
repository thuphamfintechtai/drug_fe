import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { getProofById, updateProofStatus } from '../../services/pharmacy/proofOfPharmacyService';

export default function PharmacyProofDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');

  const navigationItems = [
    { path: '/pharmacy', label: 'Trang chủ', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>) },
    { path: '/pharmacy/proof-of-pharmacy', label: 'Proof of Pharmacy', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>) },
  ];

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getProofById(id);
        setData(res.data?.data || null);
        setStatus(res.data?.data?.status || '');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const submitStatus = async (e) => {
    e.preventDefault();
    try {
      const res = await updateProofStatus(id, { status, notes });
      setData(res.data?.data || data);
    } catch (_) {}
  };

  return (
    <DashboardLayout navigationItems={navigationItems}>
      <div className="bg-white rounded-lg shadow p-4">
        {loading && <div>Đang tải...</div>}
        {data && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Thông tin Proof of Pharmacy</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-500">Mã: </span>{data.verificationCode || data._id}</div>
                <div><span className="text-gray-500">Trạng thái: </span><span className="capitalize">{data.status}</span></div>
                <div><span className="text-gray-500">Drug: </span>{data.drug?.name}</div>
                <div><span className="text-gray-500">Distributor: </span>{data.fromDistributor?.fullName || data.fromDistributor?.username}</div>
                <div><span className="text-gray-500">Pharmacy: </span>{data.toPharmacy?.fullName || data.toPharmacy?.username}</div>
                <div><span className="text-gray-500">Số lượng nhận: </span>{data.receivedQuantity}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link to={`/pharmacy/proof-of-pharmacy/${id}/confirm`} className="px-4 py-2 bg-teal-600 text-white rounded">Xác nhận nhận hàng</Link>
            </div>

            <form onSubmit={submitStatus} className="p-4 border rounded">
              <h3 className="font-semibold mb-2">Cập nhật trạng thái</h3>
              <div className="flex flex-col md:flex-row gap-2 items-center">
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded px-3 py-2">
                  <option value="pending">Pending</option>
                  <option value="received">Received</option>
                  <option value="verified">Verified</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
                <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ghi chú" className="border rounded px-3 py-2 flex-1" />
                <button className="px-4 py-2 bg-cyan-600 text-white rounded">Lưu</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}


