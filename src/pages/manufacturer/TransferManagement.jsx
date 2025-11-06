import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import TruckAnimationButton from '../../components/TruckAnimationButton';
import BlockchainTransferView from '../../components/BlockchainTransferView';
import { 
  getProductionHistory,
  getDistributors,
  createTransferToDistributor,
  getAvailableTokensForProduction,
  saveTransferTransaction
} from '../../services/manufacturer/manufacturerService';
import { transferNFTToDistributor, getCurrentWalletAddress } from '../../utils/web3Helper';
import { useAuth } from '../../context/AuthContext';

export default function TransferManagement() {
  const { user } = useAuth();
  const [productions, setProductions] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedProduction, setSelectedProduction] = useState(null);
  const [availableTokenIds, setAvailableTokenIds] = useState([]);
  const [buttonAnimating, setButtonAnimating] = useState(false);
  const [buttonDone, setButtonDone] = useState(false);
  const [showBlockchainView, setShowBlockchainView] = useState(false);
  const [transferProgress, setTransferProgress] = useState(0);
  const [transferStatus, setTransferStatus] = useState('minting'); // 'minting' | 'completed' | 'error'
  const [formData, setFormData] = useState({
    productionId: '',
    distributorId: '',
    quantity: '',
    notes: '',
  });

  const navigationItems = [
    { path: '/manufacturer', label: 'Tổng quan', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>), active: false },
    { path: '/manufacturer/drugs', label: 'Quản lý thuốc', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>), active: false },
    { path: '/manufacturer/production', label: 'Sản xuất thuốc', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>), active: false },
    { path: '/manufacturer/transfer', label: 'Chuyển giao', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>), active: false },
    { path: '/manufacturer/production-history', label: 'Lịch sử sản xuất', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>), active: false },
    { path: '/manufacturer/transfer-history', label: 'Lịch sử chuyển giao', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>), active: false },
    { path: '/manufacturer/profile', label: 'Hồ sơ', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>), active: false },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, distRes] = await Promise.all([
        getProductionHistory({ status: 'minted' }), // Chỉ lấy NFT chưa chuyển
        getDistributors({ page: 1, limit: 100 })
      ]);
      
      if (prodRes.data.success) {
        setProductions(prodRes.data.data.productions || []);
      }
      if (distRes.data?.success && distRes.data?.data) {
        const list = distRes.data.data.distributors;
        setDistributors(Array.isArray(list) ? list : []);
      } else {
        setDistributors([]);
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduction = async (production) => {
    setSelectedProduction(production);
    setFormData({
      productionId: production._id,
      distributorId: '',
      quantity: production.quantity.toString(),
      notes: '',
    });
    // Lấy danh sách tokenId còn minted cho lô này
    try {
      setLoading(true);
      const res = await getAvailableTokensForProduction(production._id);
      const ids = res?.data?.data?.availableTokenIds || res?.data?.availableTokenIds || [];
      setAvailableTokenIds(Array.isArray(ids) ? ids : []);
    } catch (e) {
      console.error('Không thể tải token khả dụng:', e);
      setAvailableTokenIds([]);
    } finally {
      setLoading(false);
      setShowDialog(true);
    }
  };

  const handleSubmit = async () => {
    if (!formData.distributorId || !formData.quantity) {
      alert('Vui lòng chọn nhà phân phối và nhập số lượng');
      return;
    }

    if (parseInt(formData.quantity) <= 0 || parseInt(formData.quantity) > selectedProduction.quantity) {
      alert('Số lượng không hợp lệ');
      return;
    }

    // Dùng danh sách tokenIds khả dụng từ backend
    const requestedQty = parseInt(formData.quantity);
    const tokenIds = (availableTokenIds || []).slice(0, requestedQty);
    const amounts = tokenIds.map(() => 1);

    if (tokenIds.length === 0) {
      console.error('Không có tokenId khả dụng cho lô:', selectedProduction?._id);
      alert('Không tìm thấy tokenId phù hợp để chuyển. Vui lòng đảm bảo lô còn NFT ở trạng thái minted.');
      return;
    }

    // Trigger button animation
    if (buttonAnimating) return;
    setButtonAnimating(true);
    setButtonDone(false);
    setShowBlockchainView(false); // Chưa hiển thị blockchain view

    setLoading(true);
    try {
      const response = await createTransferToDistributor({
        productionId: selectedProduction._id,
        distributorId: formData.distributorId,
        tokenIds,
        amounts,
        notes: formData.notes || '',
      });

      if (response.data.success) {
        const { invoice, distributorAddress } = response.data.data || {};
        
        if (invoice && distributorAddress) {
          // Hiển thị blockchain view ngay
          setShowBlockchainView(true);
          handleBlockchainTransfer(invoice, distributorAddress, tokenIds);
        } else {
          // Không có invoice hoặc distributorAddress - stop animation
          setButtonAnimating(false);
          setButtonDone(false);
          alert('✅ Tạo yêu cầu chuyển giao thành công! Trạng thái: Pending');
          setShowDialog(false);
          setAvailableTokenIds([]);
          loadData();
        }
      }
    } catch (error) {
      console.error('Lỗi khi tạo chuyển giao:', error);
      alert('❌ Không thể tạo chuyển giao: ' + (error.response?.data?.message || error.message));
      setButtonAnimating(false);
      setButtonDone(false);
      setShowBlockchainView(false);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockchainTransfer = async (invoice, distributorAddress, tokenIds) => {
    let progressInterval = null;
    
    // Reset progress
    setTransferProgress(0);
    setTransferStatus('minting');
    
    try {
      // 10% - Kiểm tra ví
      setTransferProgress(0.1);
      const currentWallet = await getCurrentWalletAddress();
      if (user?.walletAddress && currentWallet.toLowerCase() !== user.walletAddress.toLowerCase()) {
        alert('Ví đang kết nối không khớp với ví của manufacturer trong hệ thống.\nVui lòng chuyển tài khoản MetaMask sang: ' + user.walletAddress);
        throw new Error('Wrong wallet connected');
      }

      // 20% - Chuẩn bị transfer
      setTransferProgress(0.2);
      
      // Wrap transferNFTToDistributor để track progress
      const transferPromise = transferNFTToDistributor(tokenIds, distributorAddress);
      
      // 30% - Transaction đã được gửi (giả định sau 500ms)
      setTimeout(() => {
        setTransferProgress(prev => prev < 0.3 ? 0.3 : prev);
      }, 500);
      
      // Simulate progress while waiting for transaction - update mượt hơn
      progressInterval = setInterval(() => {
        setTransferProgress(prev => {
          if (prev < 0.9) {
            // Tăng progress từ 30% đến 90% trong khi chờ confirm
            // Tăng nhỏ hơn nhưng update thường xuyên hơn để mượt hơn
            return Math.min(prev + 0.005, 0.9);
          }
          return prev;
        });
      }, 50); // Update mỗi 50ms để cực kỳ mượt mà
      
      // 90% - Transaction đang được confirm
      const onchain = await transferPromise;
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      setTransferProgress(0.9);
      
      // 95% - Đang lưu transaction
      await saveTransferTransaction({
        invoiceId: invoice._id,
        transactionHash: onchain.transactionHash,
        tokenIds,
      });
      
      // 100% - Hoàn thành
      setTransferProgress(1);
      setTransferStatus('completed');
      setButtonDone(true);
      setButtonAnimating(false);
      
      // Đợi hiển thị success animation trước khi đóng dialog
      setTimeout(() => {
        setButtonDone(false);
        setShowBlockchainView(false);
        setShowDialog(false);
        setAvailableTokenIds([]);
        setTransferProgress(0);
        setTransferStatus('minting');
        loadData();
      }, 2000); // Hiển thị success 2s
    } catch (e) {
      // Clear interval nếu có
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      
      console.error('Lỗi khi ký giao dịch hoặc lưu transaction:', e);
      
      // Set error state - người dùng sẽ tự đóng bằng nút close
      setTransferStatus('error');
      setTransferProgress(0);
      setButtonAnimating(false);
      setButtonDone(false);
      // Không hiển thị alert nữa, để người dùng tự đóng bằng nút close
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  // Helper function để format date an toàn
  const formatDate = (dateValue) => {
    if (!dateValue) return 'Chưa có';
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return 'Không hợp lệ';
    return date.toLocaleDateString('vi-VN');
  };

  // Đảm bảo distributors luôn là array
  const safeDistributors = Array.isArray(distributors) ? distributors : [];
  const selectedDistributor = safeDistributors.find(d => d._id === formData.distributorId);

  return (
    <DashboardLayout navigationItems={navigationItems}>
      {/* Banner */}
      <div className="bg-white rounded-xl border border-cyan-200 shadow-sm p-5 flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[#007b91] flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#007b91]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M5 10h14M4 14h16M6 18h12" />
            </svg>
            Chuyển giao cho nhà phân phối
          </h1>
          <p className="text-slate-500 text-sm mt-1">Chọn lô sản xuất và distributor để chuyển quyền sở hữu NFT</p>
        </div>
      </div>

      {/* Instructions */}
      <motion.div
        className="rounded-2xl bg-white border border-cyan-200 shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-6 mb-5"
        variants={fadeUp}
        initial="hidden"
        animate="show"
      >
        <h2 className="text-xl font-bold text-[#007b91] mb-4">Quy trình chuyển giao</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 font-bold flex items-center justify-center flex-shrink-0">1</div>
            <div>
              <div className="font-semibold text-slate-800">Chọn lô sản xuất & Distributor</div>
              <div className="text-sm text-slate-600">Chọn NFT cần chuyển và nhà phân phối nhận hàng</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 font-bold flex items-center justify-center flex-shrink-0">2</div>
            <div>
              <div className="font-semibold text-slate-800">Xác nhận trên hệ thống</div>
              <div className="text-sm text-slate-600">Frontend gọi API Backend để lưu vào database với trạng thái "pending"</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 font-bold flex items-center justify-center flex-shrink-0">3</div>
            <div>
              <div className="font-semibold text-slate-800">Chuyển quyền sở hữu NFT</div>
              <div className="text-sm text-slate-600">Frontend gọi Smart Contract để transfer NFT từ Manufacturer wallet → Distributor wallet. Sau khi thành công, cập nhật trạng thái thành "sent"</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Productions List */}
      <motion.div
        className="bg-white rounded-2xl border border-cyan-100 shadow-sm overflow-hidden mt-6"
        variants={fadeUp}
        initial="hidden"
        animate="show"
      >
        {loading ? (
          <div className="p-12 text-center text-gray-500">Đang tải...</div>
        ) : productions.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-12 h-12 mb-3 opacity-60"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7h18M5 10h14M4 14h16M6 18h12"
              />
            </svg>
            <p className="text-gray-500 text-sm">Không có dữ liệu</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              {/* Header */}
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Thuốc</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Số lô</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Số lượng NFT</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Ngày SX</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">HSD</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Trạng thái</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Hành động</th>
                </tr>
              </thead>
              {/* Body */}
              <tbody className="divide-y divide-gray-100">
                {productions.map((prod, index) => (
                  <tr
                    key={prod._id || index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {prod.drug?.tradeName || 'N/A'}
                      <div className="text-xs text-slate-500">{prod.drug?.atcCode}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-cyan-50 text-cyan-700 border border-cyan-100">
                        {prod.batchNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <span className="font-semibold text-gray-800">{prod.quantity}</span>
                      <span className="text-xs text-slate-500 ml-1">NFT</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{formatDate(prod.mfgDate)}</td>
                    <td className="px-6 py-4 text-gray-600">{formatDate(prod.expDate)}</td>
                    <td className="px-6 py-4">
                      {(() => {
                        const status = prod.transferStatus;
                        if (status === 'transferred') {
                          return (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">Đã chuyển</span>
                          );
                        }
                        if (status === 'pending') {
                          return (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">Chưa chuyển</span>
                          );
                        }
                        return (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">Không xác định</span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => handleSelectProduction(prod)}
                          disabled={prod.transferStatus === 'transferred'}
                          className={`px-4 py-2 border-2 rounded-full font-semibold transition-all duration-200 ${
                            prod.transferStatus === 'transferred'
                              ? 'border-gray-300 bg-gray-200 text-gray-500 cursor-not-allowed'
                              : 'border-[#3db6d9] bg-[#b3e9f4] text-black hover:bg-[#3db6d9] hover:text-white'
                          }`}
                        >
                          {prod.transferStatus === 'transferred' ? 'Đã chuyển' : 'Chuyển giao'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Blockchain Animation Overlay - chỉ hiển thị sau khi xe tải chạy xong */}
      {showDialog && showBlockchainView && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-3xl px-4">
            <BlockchainTransferView 
              status={transferStatus}
              progress={transferProgress}
              onClose={() => {
                setShowBlockchainView(false);
                setTransferProgress(0);
                setTransferStatus('minting');
                setButtonAnimating(false);
                setButtonDone(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Transfer Dialog */}
      {showDialog && selectedProduction && !showBlockchainView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto custom-scroll">
            <style>{`
              .custom-scroll { scrollbar-width: none; -ms-overflow-style: none; }
              .custom-scroll::-webkit-scrollbar { width: 0; height: 0; }
              .custom-scroll::-webkit-scrollbar-track { background: transparent; }
              .custom-scroll::-webkit-scrollbar-thumb { background: transparent; }
            `}</style>
            {/* Header */}
            <div className="bg-gradient-to-r from-[#00b4d8] to-[#48cae4] px-8 py-6 rounded-t-3xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Chuyển giao NFT</h2>
                    <p className="text-cyan-100 text-sm">Chọn distributor và số lượng</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDialog(false)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white text-xl transition"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-8 space-y-4">
              {/* Production Info */}
              <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-200">
                <div className="font-bold text-cyan-800 mb-3">Thông tin lô sản xuất:</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Thuốc:</span>
                    <span className="font-medium">{selectedProduction.drug?.tradeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Số lô:</span>
                    <span className="font-mono font-medium">{selectedProduction.batchNumber || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tổng số NFT:</span>
                    <span className="font-bold text-orange-700">{selectedProduction.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Trạng thái chuyển giao:</span>
                    <span className="font-semibold">
                      {selectedProduction.transferStatus === 'transferred' && (
                        <span className="text-green-700">Đã chuyển</span>
                      )}
                      {selectedProduction.transferStatus === 'pending' && (
                        <span className="text-yellow-700">Chưa chuyển</span>
                      )}
                      {!['transferred','pending'].includes(selectedProduction.transferStatus) && (
                        <span className="text-gray-600">Không xác định</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">IPFS Hash:</span>
                    <span className="font-mono text-xs text-slate-700">{selectedProduction.ipfsHash?.slice(0, 20)}...</span>
                  </div>
                </div>
              </div>

              {/* Select Distributor */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Chọn nhà phân phối *</label>
                <select
                  value={formData.distributorId}
                  onChange={(e) => setFormData({...formData, distributorId: e.target.value})}
                  className="w-full border-2 border-cyan-300 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                >
                  <option value="">-- Chọn distributor --</option>
                  {safeDistributors.map(dist => (
                    <option key={dist._id} value={dist._id}>
                      {dist.name} ({dist.taxCode})
                    </option>
                  ))}
                </select>
              </div>

              {selectedDistributor && (
                <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-200">
                  <div className="text-sm font-semibold text-cyan-800 mb-2">Thông tin distributor:</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div><span className="text-slate-600">Tên:</span> <span className="font-medium">{selectedDistributor.name || 'N/A'}</span></div>
                    <div><span className="text-slate-600">Mã số thuế:</span> <span className="font-medium">{selectedDistributor.taxCode || 'N/A'}</span></div>
                    <div><span className="text-slate-600">Số giấy phép:</span> <span className="font-medium">{selectedDistributor.licenseNo || 'N/A'}</span></div>
                    <div><span className="text-slate-600">Quốc gia:</span> <span className="font-medium">{selectedDistributor.country || 'N/A'}</span></div>
                    <div className="md:col-span-2"><span className="text-slate-600">Địa chỉ:</span> <span className="font-medium">{selectedDistributor.address || 'N/A'}</span></div>
                    <div><span className="text-slate-600">Email liên hệ:</span> <span className="font-medium">{selectedDistributor.contactEmail || 'N/A'}</span></div>
                    <div><span className="text-slate-600">SĐT liên hệ:</span> <span className="font-medium">{selectedDistributor.contactPhone || 'N/A'}</span></div>
                    <div className="md:col-span-2"><span className="text-slate-600">Wallet Address:</span> <span className="font-mono text-xs break-all">{selectedDistributor.walletAddress || selectedDistributor.user?.walletAddress || 'Chưa có'}</span></div>
                  </div>
                  
                  {selectedDistributor.user && (
                    <div className="mt-3 pt-3 border-t border-cyan-200">
                      <div className="text-xs font-semibold text-cyan-700 mb-1">Thông tin tài khoản:</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-xs">
                        <div><span className="text-slate-600">Tên:</span> <span className="font-medium">{selectedDistributor.user.fullName || selectedDistributor.user.username || 'N/A'}</span></div>
                        <div><span className="text-slate-600">Username:</span> <span className="font-mono">{selectedDistributor.user.username || 'N/A'}</span></div>
                        <div className="md:col-span-2"><span className="text-slate-600">Email:</span> <span className="font-medium">{selectedDistributor.user.email || 'N/A'}</span></div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Số lượng NFT cần chuyển *</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  className="w-full border-2 border-cyan-300 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  placeholder="Nhập số lượng"
                  min="1"
                  max={selectedProduction.quantity}
                />
                <div className="text-xs text-cyan-600 mt-1">
                  Tối đa: {selectedProduction.quantity} NFT
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ghi chú</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full border-2 border-cyan-300 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  rows="3"
                  placeholder="Ghi chú về đơn chuyển giao..."
                />
              </div>

              <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                <div className="text-sm text-yellow-800">
                  Sau khi xác nhận, yêu cầu chuyển giao sẽ được lưu với trạng thái <strong>"pending"</strong>. 
                  Bước tiếp theo cần gọi smart contract để chuyển quyền sở hữu NFT.
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-gray-200 bg-gray-50 rounded-b-3xl flex justify-end space-x-3">
              <TruckAnimationButton
                onClick={handleSubmit}
                disabled={loading}
                buttonState={buttonDone ? 'completed' : (buttonAnimating ? 'uploading' : 'idle')}
                defaultText="Xác nhận chuyển giao"
                uploadingText="Đang xử lý..."
                successText="Hoàn thành"
                loading={loading}
                animationMode="infinite"
                animationDuration={3}
              />
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

