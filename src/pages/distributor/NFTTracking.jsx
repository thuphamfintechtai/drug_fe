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

  return (
    <DashboardLayout navigationItems={navigationItems}>
      <motion.section
        className="relative overflow-hidden rounded-2xl mb-6 border border-[#90e0ef33] shadow-[0_10px_30px_rgba(0,0,0,0.06)] bg-gradient-to-tr from-purple-600 via-purple-500 to-pink-500"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.25),transparent_55%)]" />
        <div className="relative px-6 py-8 md:px-10 md:py-12 text-white">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight drop-shadow-sm">🔍 Tra cứu NFT</h1>
          <p className="text-white/90 mt-2">Theo dõi hành trình thuốc qua NFT ID</p>
        </div>
      </motion.section>

      <motion.div
        className="rounded-2xl bg-white/85 backdrop-blur-xl border border-[#90e0ef55] shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-8 mb-5"
        variants={fadeUp}
        initial="hidden"
        animate="show"
      >
        <div className="max-w-2xl mx-auto">
          <label className="block text-lg font-semibold text-slate-800 mb-3">Nhập NFT ID (Token ID)</label>
          <div className="flex gap-3">
            <input
              type="number"
              value={tokenId}
              onChange={e => setTokenId(e.target.value)}
              placeholder="Nhập NFT ID để tra cứu..."
              className="flex-1 border-2 border-purple-300 bg-white rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              onKeyDown={e => e.key === 'Enter' && handleTrack()}
            />
            <button
              onClick={handleTrack}
              disabled={loading}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 transition"
            >
              {loading ? 'Đang tra cứu...' : '🔍 Tra cứu'}
            </button>
          </div>
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>
      </motion.div>

      {trackingData && (
        <motion.div
          className="space-y-5"
          variants={fadeUp}
          initial="hidden"
          animate="show"
        >
          {/* NFT Info */}
          <div className="bg-white/90 rounded-2xl border border-purple-200 shadow-lg p-6">
            <h2 className="text-2xl font-bold text-purple-800 mb-4">📦 Thông tin NFT</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-purple-50 rounded-xl p-4">
                <div className="text-sm text-purple-700">NFT ID</div>
                <div className="text-2xl font-bold text-purple-900">{trackingData.nft?.tokenId}</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-4">
                <div className="text-sm text-purple-700">Trạng thái</div>
                <div className="text-lg font-semibold text-purple-900">{trackingData.nft?.status}</div>
              </div>
            </div>
          </div>

          {/* Drug Info */}
          {trackingData.drug && (
            <div className="bg-white/90 rounded-2xl border border-cyan-200 shadow-lg p-6">
              <h2 className="text-2xl font-bold text-cyan-800 mb-4">💊 Thông tin thuốc</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Tên thương mại:</span>
                  <span className="font-semibold">{trackingData.drug.tradeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Tên hoạt chất:</span>
                  <span className="font-semibold">{trackingData.drug.genericName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Mã ATC:</span>
                  <span className="font-mono font-semibold text-cyan-700">{trackingData.drug.atcCode}</span>
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          {trackingData.history && trackingData.history.length > 0 && (
            <div className="bg-white/90 rounded-2xl border border-emerald-200 shadow-lg p-6">
              <h2 className="text-2xl font-bold text-emerald-800 mb-4">🛤️ Lịch sử hành trình</h2>
              <div className="space-y-4">
                {trackingData.history.map((event, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
                      {idx < trackingData.history.length - 1 && (
                        <div className="w-0.5 h-full bg-emerald-300 my-1"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="font-semibold text-slate-800">{event.action}</div>
                      <div className="text-sm text-slate-600">{event.timestamp}</div>
                      {event.details && (
                        <div className="text-sm text-slate-500 mt-1">{event.details}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </DashboardLayout>
  );
}
