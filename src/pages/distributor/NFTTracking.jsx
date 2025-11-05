import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import { trackDrugByNFTId } from '../../services/distributor/distributorService';

export default function NFTTracking() {
  const [tokenId, setTokenId] = useState('');
  const [loading, setLoading] = useState(false);
  const [trackingData, setTrackingData] = useState(null);
  const [error, setError] = useState('');

  const navigationItems = [
    { path: '/distributor', label: 'Tổng quan', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>), active: false },
    { path: '/distributor/invoices', label: 'Đơn từ nhà SX', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>), active: false },
    { path: '/distributor/transfer-pharmacy', label: 'Chuyển cho NT', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>), active: false },
    { path: '/distributor/distribution-history', label: 'Lịch sử phân phối', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>), active: false },
    { path: '/distributor/transfer-history', label: 'Lịch sử chuyển NT', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>), active: false },
    { path: '/distributor/drugs', label: 'Quản lý thuốc', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>), active: false },
    { path: '/distributor/nft-tracking', label: 'Tra cứu NFT', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>), active: true },
    { path: '/distributor/profile', label: 'Hồ sơ', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>), active: false },
  ];

  const handleTrack = async () => {
    if (!tokenId.trim()) {
      setError('Vui lòng nhập NFT ID');
      return;
    }

    setLoading(true);
    setError('');
    setTrackingData(null);

    try {
      const response = await trackDrugByNFTId(tokenId);
      if (response.data.success) {
        setTrackingData(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tra cứu NFT');
    } finally {
      setLoading(false);
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  const formatDate = (d) => {
    if (!d) return 'N/A';
    const date = new Date(d);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('vi-VN');
  };
  const short = (s) => {
    if (!s || typeof s !== 'string') return 'N/A';
    if (s.length <= 12) return s;
    return `${s.slice(0, 8)}...${s.slice(-4)}`;
  };

  return (
    <DashboardLayout navigationItems={navigationItems}>
      <div className="bg-white rounded-xl border border-cyan-200 shadow-sm p-5 mb-6">
        <h1 className="text-xl font-semibold text-[#007b91]">Tra cứu NFT</h1>
        <p className="text-slate-500 text-sm mt-1">Theo dõi hành trình thuốc qua NFT ID</p>
      </div>

      <motion.div
        className="rounded-2xl bg-white/85 backdrop-blur-xl border border-[#90e0ef55] shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-8 mb-5"
        variants={fadeUp}
        initial="hidden"
        animate="show"
      >
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
              </svg>
            </span>

            <input
              type="text"
              value={tokenId}
              onChange={e => setTokenId(e.target.value)}
              placeholder="Nhập NFT ID..."
              className="w-full h-12 pl-11 pr-40 rounded-full border border-gray-200 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#48cae4] transition"
              onKeyDown={e => e.key === 'Enter' && handleTrack()}
            />

            <button
              onClick={handleTrack}
              disabled={loading}
              className="absolute right-1 top-1 bottom-1 px-6 rounded-full bg-[#3db6d9] hover:bg-[#2fa2c5] text-white font-medium transition disabled:opacity-50"
            >
              {loading ? 'Đang tra cứu...' : 'Tìm Kiếm'}
            </button>
          </div>
          {error && (
            <div className="mt-6 bg-white rounded-2xl border border-cyan-100 shadow-sm p-10 text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-3xl">❌</div>
              <h3 className="text-lg font-semibold text-[#007b91] mb-2">Không tìm thấy kết quả</h3>
              <p className="text-slate-500 text-sm mb-1">Không có dữ liệu nào khớp với NFT ID bạn đã nhập.</p>
              <p className="text-slate-400 text-sm mb-5">Vui lòng kiểm tra lại hoặc thử với mã khác.</p>
              <button
                onClick={() => { setError(''); setTrackingData(null); setTokenId(''); }}
                className="px-6 py-2.5 rounded-full bg-[#3db6d9] hover:bg-[#2fa2c5] text-white font-medium transition"
              >
                Thử lại
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {trackingData && (
        <motion.div className="space-y-5" variants={fadeUp} initial="hidden" animate="show">
          <div className="bg-white rounded-2xl border border-cyan-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-cyan-500 text-white flex items-center justify-center">🔗</div>
              <h2 className="text-lg font-semibold text-[#007b91]">Thông tin chi tiết thuốc</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-2">
                <div className="text-slate-500">NFT ID</div>
                <div className="font-mono text-cyan-700">{short(trackingData?.nft?.tokenId)}</div>
                <div className="text-slate-500 mt-4">Nhà sản xuất</div>
                <div className="font-medium">{trackingData?.manufacturer?.name || trackingData?.drug?.manufacturer || 'N/A'}</div>
                <div className="text-slate-500 mt-4">Ngày sản xuất</div>
                <div className="font-medium">{formatDate(trackingData?.drug?.manufacturingDate)}</div>
              </div>
              <div className="space-y-2">
                <div className="text-slate-500">Tên thuốc</div>
                <div className="font-medium">{trackingData?.drug?.tradeName || 'N/A'}</div>
                <div className="text-slate-500 mt-4">Nhà phân phối</div>
                <div className="font-medium">{trackingData?.distributor?.name || 'N/A'}</div>
                <div className="text-slate-500 mt-4">Hạn sử dụng</div>
                <div className="font-medium">{formatDate(trackingData?.drug?.expiryDate)}</div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              {trackingData?.explorerUrl ? (
                <a
                  href={trackingData.explorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-2.5 rounded-full bg-[#3db6d9] hover:bg-[#2fa2c5] text-white font-medium transition"
                >
                  Xem trên Blockchain →
                </a>
              ) : null}
            </div>
          </div>
        </motion.div>
      )}
    </DashboardLayout>
  );
}
