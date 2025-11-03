import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import pharmacyService from '../../services/pharmacy/pharmacyService';

export default function PharmacyNFTTracking() {
  const [tokenId, setTokenId] = useState('');
  const [journey, setJourney] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const navigationItems = [
    { path: '/pharmacy', label: 'Tổng quan', active: false },
    { path: '/pharmacy/invoices', label: 'Đơn từ NPP', active: false },
    { path: '/pharmacy/distribution-history', label: 'Lịch sử phân phối', active: false },
    { path: '/pharmacy/drugs', label: 'Quản lý thuốc', active: false },
    { path: '/pharmacy/nft-tracking', label: 'Tra cứu NFT', active: true },
    { path: '/pharmacy/profile', label: 'Hồ sơ', active: false },
  ];

  const handleSearch = async () => {
    if (!tokenId.trim()) {
      alert('Vui lòng nhập NFT ID');
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const response = await pharmacyService.trackDrugByNFTId(tokenId.trim());
      if (response.data.success) {
        setJourney(response.data.data);
      } else {
        setJourney(null);
      }
    } catch (error) {
      console.error('Lỗi:', error);
      setJourney(null);
      alert('Không tìm thấy NFT này hoặc không có quyền truy cập');
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
        className="relative overflow-hidden rounded-2xl mb-6 border border-[#90e0ef33] shadow-[0_10px_30px_rgba(0,0,0,0.06)] bg-gradient-to-tr from-indigo-600 via-purple-500 to-pink-500"
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

      <motion.div className="rounded-2xl bg-white/85 backdrop-blur-xl border border-[#90e0ef55] shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-6 mb-6" variants={fadeUp} initial="hidden" animate="show">
        <div className="flex gap-3">
          <input
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Nhập NFT Token ID (ví dụ: 12345)..."
            className="flex-1 border-2 border-[#90e0ef55] bg-white/60 rounded-xl px-5 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#48cae4] focus:border-[#48cae4] transition"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 transition"
          >
            {loading ? '⏳ Đang tìm...' : '🔍 Tra cứu'}
          </button>
        </div>
      </motion.div>

      {loading ? (
        <div className="bg-white/90 rounded-2xl border border-[#90e0ef55] p-10 text-center">
          <div className="text-xl text-slate-600">Đang tra cứu hành trình...</div>
        </div>
      ) : !searched ? (
        <motion.div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 p-10 text-center" variants={fadeUp} initial="hidden" animate="show">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-slate-800 mb-2">Nhập NFT ID để bắt đầu</h3>
          <p className="text-slate-600 max-w-md mx-auto">Nhập NFT Token ID vào ô tìm kiếm phía trên để theo dõi hành trình thuốc từ sản xuất đến phân phối</p>
        </motion.div>
      ) : !journey ? (
        <motion.div className="bg-white/90 rounded-2xl border border-red-300 p-10 text-center" variants={fadeUp} initial="hidden" animate="show">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-2xl font-bold text-red-600 mb-2">Không tìm thấy NFT</h3>
          <p className="text-slate-600">Vui lòng kiểm tra lại Token ID hoặc bạn không có quyền truy cập NFT này</p>
        </motion.div>
      ) : (
        <motion.div className="space-y-6" variants={fadeUp} initial="hidden" animate="show">
          {/* Thông tin cơ bản */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200 p-6">
            <h2 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
              <span>💊</span> Thông tin NFT
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 border border-purple-200">
                <div className="text-sm text-purple-700 mb-1">Token ID</div>
                <div className="text-lg font-bold text-purple-900">{journey.nft?.tokenId || tokenId}</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-purple-200">
                <div className="text-sm text-purple-700 mb-1">Tên thuốc</div>
                <div className="text-lg font-bold text-purple-900">{journey.drug?.commercialName || journey.nft?.drugName || 'N/A'}</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-purple-200">
                <div className="text-sm text-purple-700 mb-1">Chủ sở hữu hiện tại</div>
                <div className="text-sm font-mono text-purple-900">{journey.nft?.currentOwner || 'N/A'}</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-purple-200">
                <div className="text-sm text-purple-700 mb-1">Trạng thái</div>
                <div className="text-lg font-bold text-emerald-600">{journey.nft?.status || 'active'}</div>
              </div>
            </div>
          </div>

          {/* Hành trình (Timeline) */}
          <div className="bg-white/90 rounded-2xl border border-[#90e0ef55] p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span>🛤️</span> Hành trình phân phối
            </h2>
            
            {journey.history && journey.history.length > 0 ? (
              <div className="relative pl-8 space-y-6">
                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500 to-purple-500"></div>
                
                {journey.history.map((step, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-6 w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 border-4 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">
                      {idx + 1}
                    </div>
                    <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-slate-800">{step.action || step.stage || 'N/A'}</h3>
                          <div className="text-sm text-slate-600 mt-1">
                            {step.timestamp ? new Date(step.timestamp).toLocaleString('vi-VN') : 'N/A'}
                          </div>
                        </div>
                        {step.status && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                            {step.status}
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 text-sm">
                        {step.from && (
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500">📤 Từ:</span>
                            <span className="font-medium text-slate-800">{step.from}</span>
                          </div>
                        )}
                        {step.to && (
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500">📥 Đến:</span>
                            <span className="font-medium text-slate-800">{step.to}</span>
                          </div>
                        )}
                        {step.quantity && (
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500">📦 Số lượng:</span>
                            <span className="font-bold text-emerald-600">{step.quantity}</span>
                          </div>
                        )}
                        {step.transactionHash && (
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500">🔗 TX:</span>
                            <span className="font-mono text-xs text-blue-600 truncate">{step.transactionHash}</span>
                          </div>
                        )}
                        {step.notes && (
                          <div className="mt-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                            <span className="text-amber-800 text-xs">📝 {step.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500">
                <div className="text-4xl mb-3">📭</div>
                <div>Chưa có lịch sử phân phối</div>
              </div>
            )}
          </div>

          {/* Thông tin thuốc chi tiết */}
          {journey.drug && (
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 p-6">
              <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                <span>ℹ️</span> Thông tin thuốc
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-3 border border-blue-200">
                  <div className="text-sm text-blue-700">Tên hoạt chất</div>
                  <div className="font-semibold text-blue-900">{journey.drug.activePharmaIngredient || 'N/A'}</div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-blue-200">
                  <div className="text-sm text-blue-700">Mã ATC</div>
                  <div className="font-mono font-semibold text-blue-900">{journey.drug.atcCode || 'N/A'}</div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-blue-200">
                  <div className="text-sm text-blue-700">Nhà sản xuất</div>
                  <div className="font-semibold text-blue-900">{journey.drug.manufacturer || 'N/A'}</div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-blue-200">
                  <div className="text-sm text-blue-700">Nước sản xuất</div>
                  <div className="font-semibold text-blue-900">{journey.drug.countryOfOrigin || 'N/A'}</div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </DashboardLayout>
  );
}
