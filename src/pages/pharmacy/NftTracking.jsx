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

  const getStatusColor = (status) => {
    if (!status) return { backgroundColor: 'rgba(75, 173, 209, 0.15)', color: '#4BADD1', borderColor: '#7AC3DE' };
    
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'active':
      case 'hoạt động':
      case 'đang hoạt động':
        return { backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', borderColor: '#16a34a' };
      case 'sold':
      case 'đã bán':
      case 'đã xuất':
        return { backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', borderColor: '#2563eb' };
      case 'pending':
      case 'chờ xử lý':
      case 'đang chờ':
        return { backgroundColor: 'rgba(234, 179, 8, 0.15)', color: '#eab308', borderColor: '#ca8a04' };
      case 'completed':
      case 'hoàn thành':
      case 'đã hoàn thành':
        return { backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', borderColor: '#16a34a' };
      case 'cancelled':
      case 'đã hủy':
      case 'hủy':
        return { backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', borderColor: '#dc2626' };
      case 'inactive':
      case 'ngừng hoạt động':
      case 'không hoạt động':
        return { backgroundColor: 'rgba(107, 114, 128, 0.15)', color: '#6b7280', borderColor: '#4b5563' };
      default:
        return { backgroundColor: 'rgba(75, 173, 209, 0.15)', color: '#4BADD1', borderColor: '#7AC3DE' };
    }
  };

  return (
    <DashboardLayout navigationItems={navigationItems}>
      <motion.section
        className="relative overflow-hidden rounded-2xl mb-6 border border-[#90e0ef33] shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
        style={{ background: 'linear-gradient(to top right, #4BADD1, #7AC3DE, #4BADD1)' }}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.25),transparent_55%)]" />
        <div className="relative px-6 py-8 md:px-10 md:py-12 text-white">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight drop-shadow-sm flex items-center gap-2">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            Tra cứu NFT
          </h1>
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
            className="px-8 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 transition"
            style={{ background: 'linear-gradient(to right, #4BADD1, #7AC3DE)' }}
          >
            {loading ? (
              <>
                <svg className="w-5 h-5 inline mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.903-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                Đang tìm...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                Tra cứu
              </>
            )}
          </button>
        </div>
      </motion.div>

      {loading ? (
        <motion.div className="bg-white/90 rounded-2xl border border-[#90e0ef55] p-10 text-center" variants={fadeUp} initial="hidden" animate="show">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#90e0ef55] border-t-[#4BADD1] mb-4"></div>
          <div className="text-xl text-slate-600">Đang tra cứu hành trình...</div>
        </motion.div>
      ) : !searched ? (
        <motion.div className="rounded-2xl border p-10 text-center" 
          style={{ 
            background: 'linear-gradient(to bottom right, rgba(75, 173, 209, 0.1), rgba(122, 195, 222, 0.1))',
            borderColor: '#7AC3DE'
          }}
          variants={fadeUp} initial="hidden" animate="show">
          <svg className="w-16 h-16 text-black mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <h3 className="text-2xl font-bold text-slate-800 mb-2">Nhập NFT ID để bắt đầu</h3>
          <p className="text-slate-600 max-w-md mx-auto">Nhập NFT Token ID vào ô tìm kiếm phía trên để theo dõi hành trình thuốc từ sản xuất đến phân phối</p>
        </motion.div>
      ) : !journey ? (
        <motion.div className="bg-white/90 rounded-2xl border border-red-300 p-10 text-center" variants={fadeUp} initial="hidden" animate="show">
          <svg className="w-16 h-16 text-red-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <h3 className="text-2xl font-bold text-red-600 mb-2">Không tìm thấy NFT</h3>
          <p className="text-slate-600">Vui lòng kiểm tra lại Token ID hoặc bạn không có quyền truy cập NFT này</p>
        </motion.div>
      ) : (
        <motion.div className="space-y-6" variants={fadeUp} initial="hidden" animate="show">
          {/* Thông tin cơ bản */}
          <div className="rounded-2xl border p-6"
            style={{ 
              background: 'linear-gradient(to bottom right, rgba(75, 173, 209, 0.1), rgba(122, 195, 222, 0.1))',
              borderColor: '#7AC3DE'
            }}>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-black">
              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              Thông tin NFT
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 border" style={{ borderColor: '#7AC3DE' }}>
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                  </svg>
                  <div className="text-sm text-black font-medium">Token ID</div>
                </div>
                <div className="text-lg font-bold text-black">{journey.nft?.tokenId || tokenId}</div>
              </div>
              <div className="bg-white rounded-xl p-4 border" style={{ borderColor: '#7AC3DE' }}>
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  <div className="text-sm text-black font-medium">Tên thuốc</div>
                </div>
                <div className="text-lg font-bold text-black">{journey.drug?.commercialName || journey.nft?.drugName || 'N/A'}</div>
              </div>
              <div className="bg-white rounded-xl p-4 border" style={{ borderColor: '#7AC3DE' }}>
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  <div className="text-sm text-black font-medium">Chủ sở hữu hiện tại</div>
                </div>
                <div className="text-sm font-mono text-black">{journey.nft?.currentOwner || 'N/A'}</div>
              </div>
              <div className="bg-white rounded-xl p-4 border" style={{ borderColor: '#7AC3DE' }}>
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-black font-medium">Trạng thái</div>
                </div>
                <div className="text-lg font-bold">
                  <span className="px-3 py-1.5 rounded-lg text-sm font-semibold inline-block border" 
                    style={{
                      ...getStatusColor(journey.nft?.status || 'active'),
                      borderWidth: '1px',
                      borderStyle: 'solid'
                    }}>
                    {journey.nft?.status || 'active'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Hành trình (Timeline) */}
          <div className="bg-white/90 rounded-2xl border border-[#90e0ef55] p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Hành trình phân phối
            </h2>
            
            {journey.history && journey.history.length > 0 ? (
              <div className="relative pl-8 space-y-6">
                <div className="absolute left-3 top-0 bottom-0 w-0.5" style={{ background: 'linear-gradient(to bottom, #4BADD1, #7AC3DE)' }}></div>
                
                {journey.history.map((step, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-6 w-6 h-6 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: 'linear-gradient(to bottom right, #4BADD1, #7AC3DE)' }}>
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
                          <span className="px-3 py-1 rounded-full text-xs font-medium border"
                            style={{
                              ...getStatusColor(step.status),
                              borderWidth: '1px',
                              borderStyle: 'solid'
                            }}>
                            {step.status}
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 text-sm">
                        {step.from && (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-black inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                            <span className="text-slate-500 ml-1">Từ:</span>
                            <span className="font-medium text-slate-800">{step.from}</span>
                          </div>
                        )}
                        {step.to && (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-black inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                            <span className="text-slate-500 ml-1">Đến:</span>
                            <span className="font-medium text-slate-800">{step.to}</span>
                          </div>
                        )}
                        {step.quantity && (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-black inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
                            <span className="text-slate-500 ml-1">Số lượng:</span>
                            <span className="font-bold text-black">{step.quantity}</span>
                          </div>
                        )}
                        {step.transactionHash && (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-black inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>
                            <span className="text-slate-500 ml-1">TX:</span>
                            <span className="font-mono text-xs text-blue-600 truncate">{step.transactionHash}</span>
                          </div>
                        )}
                        {step.notes && (
                          <div className="mt-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                            <svg className="w-3 h-3 text-black inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                            <span className="text-amber-800 text-xs">{step.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500">
                <svg className="w-16 h-16 text-black mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <div>Chưa có lịch sử phân phối</div>
              </div>
            )}
          </div>

          {/* Thông tin thuốc chi tiết */}
          {journey.drug && (
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 p-6">
              <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                Thông tin thuốc
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
