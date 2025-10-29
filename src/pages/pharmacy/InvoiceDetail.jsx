import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { getInvoiceById, updateInvoiceStatus, updatePaymentInfo } from '../../services/pharmacy/invoiceService';

export default function PharmacyInvoiceDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [payment, setPayment] = useState({ method: '', reference: '', paidAmount: '' });

  const navigationItems = [
    { path: '/pharmacy', label: 'Trang chủ', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>) },
    { path: '/pharmacy/invoices', label: 'Commercial Invoices', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 3.75h7.5L19.5 7.5v12a.75.75 0 01-.75.75H5.25A.75.75 0 014.5 19.5v-15a.75.75 0 01.75-.75zM8.25 9h7.5M8.25 12.75h7.5M8.25 16.5h4.5" /></svg>) },
  ];

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getInvoiceById(id);
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
      const res = await updateInvoiceStatus(id, { status, notes });
      setData(res.data?.data || data);
    } catch (_) {}
  };

  const submitPayment = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...payment };
      if (payload.paidAmount) payload.paidAmount = Number(payload.paidAmount);
      const res = await updatePaymentInfo(id, payload);
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
              <h2 className="text-xl font-semibold mb-2">Thông tin hóa đơn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-500">Mã: </span>{data.verificationCode || data._id}</div>
                <div><span className="text-gray-500">Trạng thái: </span><span className="capitalize">{data.status}</span></div>
                <div><span className="text-gray-500">Drug: </span>{data.drug?.name}</div>
                <div><span className="text-gray-500">Distributor: </span>{data.fromDistributor?.fullName || data.fromDistributor?.username}</div>
                <div><span className="text-gray-500">Pharmacy: </span>{data.toPharmacy?.fullName || data.toPharmacy?.username}</div>
                <div><span className="text-gray-500">Số tiền: </span>{data.finalAmount}</div>
              </div>
            </div>

            <form onSubmit={submitStatus} className="p-4 border rounded">
              <h3 className="font-semibold mb-2">Cập nhật trạng thái</h3>
              <div className="flex flex-col md:flex-row gap-2 items-center">
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded px-3 py-2">
                  <option value="draft">Draft</option>
                  <option value="issued">Issued</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ghi chú" className="border rounded px-3 py-2 flex-1" />
                <button className="px-4 py-2 bg-cyan-600 text-white rounded">Lưu</button>
              </div>
            </form>

            <form onSubmit={submitPayment} className="p-4 border rounded">
              <h3 className="font-semibold mb-2">Cập nhật thông tin thanh toán</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input value={payment.method} onChange={(e) => setPayment({ ...payment, method: e.target.value })} placeholder="Phương thức" className="border rounded px-3 py-2" />
                <input value={payment.reference} onChange={(e) => setPayment({ ...payment, reference: e.target.value })} placeholder="Mã tham chiếu" className="border rounded px-3 py-2" />
                <input value={payment.paidAmount} onChange={(e) => setPayment({ ...payment, paidAmount: e.target.value })} placeholder="Số tiền đã thanh toán" className="border rounded px-3 py-2" />
              </div>
              <div className="mt-2">
                <button className="px-4 py-2 bg-teal-600 text-white rounded">Cập nhật</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}


