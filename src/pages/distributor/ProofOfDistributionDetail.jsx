import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { getDistributionById, confirmReceipt } from '../../services/distributor/proofOfDistributionService';

export default function DistributorProofOfDistributionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [receivedBy, setReceivedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [copied, setCopied] = useState(false);
  const [success, setSuccess] = useState(false);

  const navigationItems = useMemo(() => ([
    { path: '/distributor', label: 'Trang chủ', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>), active: false },
    { path: '/distributor/proof-of-distribution', label: 'Proof of Distribution', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v12a2 2 0 01-2 2z" /></svg>), active: true },
  ]), []);

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError('');
      try {
        const { data } = await getDistributionById(id);
        const record = data?.data || data;
        setItem(record);
        if (record?.verificationCode && !verificationCode) setVerificationCode(record.verificationCode);
      } catch (e) { setError(e?.response?.data?.message || 'Không tải được dữ liệu'); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const onConfirm = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await confirmReceipt(id, { receivedBy, verificationCode, notes });
      // reload chi tiết sau khi xác nhận
      const { data } = await getDistributionById(id);
      setItem(data?.data || data);
      setSuccess(true);
    } catch (e2) { setError(e2?.response?.data?.message || 'Xác nhận thất bại'); }
    finally { setLoading(false); }
  };

  return (
    <DashboardLayout navigationItems={navigationItems}>
      {loading && !item ? <div className="p-6">Đang tải...</div> : error && !item ? (
        <div className="p-6 text-red-600">{error}</div>
      ) : item ? (
        <div className="bg-white rounded shadow p-6">
          <div className="mb-4"><Link className="text-cyan-700" to="/distributor/proof-of-distribution">← Quay lại danh sách</Link></div>
          {success && (
            <div className="mb-4 p-3 rounded border border-green-200 bg-green-50 text-green-800 flex items-center justify-between">
              <span>Đã xác nhận nhận hàng thành công. NFT đã chuyển sang nhà phân phối.</span>
              <div className="flex gap-2">
                <button onClick={() => navigate('/distributor/shipping')} className="px-3 py-1 border rounded">Theo dõi vận chuyển</button>
                <button onClick={() => navigate('/distributor/proof-of-distribution')} className="px-3 py-1 border rounded">Về danh sách</button>
              </div>
            </div>
          )}
          <h2 className="text-xl font-semibold mb-2">{item?.nftInfo?.drug?.name || item?.proofOfProduction?.drug?.name}</h2>
          <div className="text-sm text-gray-600 mb-4">Trạng thái: {item.status}</div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 border rounded">
              <div className="font-semibold mb-2">Thông tin lô</div>
              <div className="flex items-center gap-2">Mã xác thực: <span className="font-mono">{item.verificationCode}</span>
                <button type="button" onClick={() => { navigator.clipboard?.writeText(item.verificationCode); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="px-2 py-0.5 text-xs border rounded">Sao chép</button>
                {copied && <span className="text-xs text-green-600">Đã sao chép</span>}
              </div>
              <div>Số lượng: {item.distributedQuantity}</div>
            </div>
            <div className="p-4 border rounded">
              <div className="font-semibold mb-2">Nhà sản xuất</div>
              <div>{item?.fromManufacturer?.fullName || item?.proofOfProduction?.manufacturer?.name || item?.nftInfo?.drug?.manufacturer?.name || '—'}</div>
              {(item?.fromManufacturer?.email || item?.proofOfProduction?.manufacturer?.email) && <div className="text-sm text-gray-600">Email: {item?.fromManufacturer?.email || item?.proofOfProduction?.manufacturer?.email}</div>}
            </div>
          </div>

          {item.status !== 'confirmed' && (
            <form onSubmit={onConfirm} className="p-4 border rounded bg-gray-50">
              <div className="font-semibold mb-3">Xác nhận nhận hàng để chuyển giao đến nhà thuốc</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input className="border rounded px-3 py-2" placeholder="Người nhận (tại kho)" value={receivedBy} onChange={e => setReceivedBy(e.target.value)} required />
                <input className="border rounded px-3 py-2" placeholder="Mã xác thực" value={verificationCode} onChange={e => setVerificationCode(e.target.value)} required />
                <input className="border rounded px-3 py-2" placeholder="Ghi chú" value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
              <div className="mt-3">
                <button disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded">{loading ? 'Đang xác nhận...' : 'Xác nhận'}</button>
              </div>
              <div className="text-xs text-gray-600 mt-2">Sau khi xác nhận, quyền sở hữu NFT sẽ chuyển sang nhà phân phối. Tiếp theo, phía nhà thuốc sẽ dùng mã trên lệnh nhận hàng của họ để xác nhận khi nhận.</div>
            </form>
          )}
          {item.status === 'confirmed' && (
            <div className="mt-6 p-4 border rounded bg-white">
              <div className="font-semibold mb-2">Bước tiếp theo: chuyển giao cho nhà thuốc</div>
              <div className="text-sm text-gray-700">Chia sẻ mã xác thực ở trên cho nhà thuốc. Nhà thuốc sẽ tạo Proof of Pharmacy và xác nhận bằng mã này khi nhận hàng. Bạn có thể theo dõi tiến trình ở mục "Theo dõi vận chuyển".</div>
              <div className="mt-3"><a className="px-3 py-2 border rounded" href="/distributor/shipping">Mở Theo dõi vận chuyển</a></div>
            </div>
          )}
        </div>
      ) : null}
    </DashboardLayout>
  );
}


