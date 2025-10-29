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
    { path: '/pharmacy/invoices', label: 'Hóa đơn thương mại', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 3.75h7.5L19.5 7.5v12a.75.75 0 01-.75.75H5.25A.75.75 0 014.5 19.5v-15a.75.75 0 01.75-.75zM8.25 9h7.5M8.25 12.75h7.5M8.25 16.5h4.5" /></svg>) },
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
      {/* Banner hiện đại */}
      <section className="relative overflow-hidden rounded-2xl border border-[#90e0ef33] shadow-[0_10px_30px_rgba(0,0,0,0.06)] bg-gradient-to-tr from-[#00b4d8] via-[#48cae4] to-[#90e0ef]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.25),transparent_55%)]" />
        {/* Pills bay chậm */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-white/30 blur-xl animate-float-slow" />
          <div className="absolute top-8 right-6 w-16 h-8 rounded-full bg-white/25 blur-md rotate-6 animate-float-slower" />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-28 h-10 rounded-full bg-white/20 blur-md -rotate-6 animate-float-slower" />
        </div>
        <div className="relative px-6 py-8 md:px-10 md:py-12 text-white">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight drop-shadow-sm">DrugTrace — Chi tiết hóa đơn</h1>
          <p className="mt-2 text-white/90">Theo dõi, cập nhật trạng thái và thanh toán một cách minh bạch.</p>
        </div>
      </section>

      {/* Thông tin hóa đơn */}
      <div className="mt-6 space-y-6">
        <div className="relative rounded-2xl border border-[#90e0ef55] bg-white/85 backdrop-blur-xl p-6 shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
          {loading && <div className="text-[#003544]/70">Đang tải...</div>}
          {!loading && data && (
            <div className="space-y-4">
              <h2 className="text-xl md:text-2xl font-semibold text-[#003544] tracking-tight">Thông tin hóa đơn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[15px]">
                <div><span className="text-[#003544]/60">Mã: </span>{data.verificationCode || data._id}</div>
                <div><span className="text-[#003544]/60">Trạng thái: </span><span className="capitalize">{data.status}</span></div>
                <div><span className="text-[#003544]/60">Thuốc: </span>{data.drug?.name}</div>
                <div><span className="text-[#003544]/60">Nhà phân phối: </span>{data.fromDistributor?.fullName || data.fromDistributor?.username}</div>
                <div><span className="text-[#003544]/60">Nhà thuốc: </span>{data.toPharmacy?.fullName || data.toPharmacy?.username}</div>
                <div><span className="text-[#003544]/60">Số tiền: </span>{data.finalAmount}</div>
              </div>
            </div>
          )}
        </div>

        {/* Form cập nhật trạng thái */}
        <form onSubmit={submitStatus} className="rounded-2xl border border-[#90e0ef55] bg-white/85 backdrop-blur-xl p-6 shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
          <h3 className="text-lg font-semibold text-[#003544] mb-3">Cập nhật trạng thái</h3>
          <div className="flex flex-col md:flex-row gap-3 items-center">
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full md:w-auto border border-[#90e0ef55] bg-white/60 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#48cae4] focus:border-[#48cae4]">
              <option value="draft">Bản nháp</option>
              <option value="issued">Đã phát hành</option>
              <option value="sent">Đã gửi</option>
              <option value="paid">Đã thanh toán</option>
              <option value="cancelled">Đã hủy</option>
            </select>
            <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ghi chú" className="w-full md:flex-1 border border-[#90e0ef55] bg-white/60 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#48cae4] focus:border-[#48cae4]" />
            <button className="shrink-0 px-4 py-2.5 rounded-xl text-white bg-gradient-to-r from-[#00b4d8] via-[#48cae4] to-[#90e0ef] shadow-[0_10px_24px_rgba(0,180,216,0.30)] hover:shadow-[0_14px_36px_rgba(0,180,216,0.40)] transition">Lưu</button>
          </div>
        </form>

        {/* Form cập nhật thanh toán */}
        <form onSubmit={submitPayment} className="rounded-2xl border border-[#90e0ef55] bg-white/85 backdrop-blur-xl p-6 shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
          <h3 className="text-lg font-semibold text-[#003544] mb-3">Cập nhật thông tin thanh toán</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input value={payment.method} onChange={(e) => setPayment({ ...payment, method: e.target.value })} placeholder="Phương thức" className="border border-[#90e0ef55] bg-white/60 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#48cae4] focus:border-[#48cae4]" />
            <input value={payment.reference} onChange={(e) => setPayment({ ...payment, reference: e.target.value })} placeholder="Mã tham chiếu" className="border border-[#90e0ef55] bg-white/60 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#48cae4] focus:border-[#48cae4]" />
            <input value={payment.paidAmount} onChange={(e) => setPayment({ ...payment, paidAmount: e.target.value })} placeholder="Số tiền đã thanh toán" className="border border-[#90e0ef55] bg-white/60 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#48cae4] focus:border-[#48cae4]" />
          </div>
          <div className="mt-3">
            <button className="px-4 py-2.5 rounded-xl text-white bg-gradient-to-r from-[#00b4d8] via-[#48cae4] to-[#90e0ef] shadow-[0_10px_24px_rgba(0,180,216,0.30)] hover:shadow-[0_14px_36px_rgba(0,180,216,0.40)] transition">Cập nhật</button>
          </div>
        </form>
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes float-slow { 0%,100% { transform: translateY(0) } 50% { transform: translateY(10px) } }
        @keyframes float-slower { 0%,100% { transform: translateY(0) } 50% { transform: translateY(6px) } }
      `}</style>
    </DashboardLayout>
  );
}


