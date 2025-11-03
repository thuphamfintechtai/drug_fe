import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  getDrugs,
  uploadToIPFS,
  saveMintedNFTs
} from '../../services/manufacturer/manufacturerService';

export default function ProductionManagement() {
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [step, setStep] = useState(1); // 1: Form input, 2: IPFS upload, 3: Minting NFT
  const [formData, setFormData] = useState({
    drugId: '',
    batchNumber: '',
    quantity: '',
    manufacturingDate: '',
    expiryDate: '',
    notes: '',
  });
  const [ipfsData, setIpfsData] = useState(null);
  const [mintResult, setMintResult] = useState(null);

  const navigationItems = [
    { path: '/manufacturer', label: 'Tổng quan', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>), active: false },
    { path: '/manufacturer/drugs', label: 'Quản lý thuốc', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>), active: false },
    { path: '/manufacturer/production', label: 'Sản xuất thuốc', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>), active: true },
    { path: '/manufacturer/transfer', label: 'Chuyển giao', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>), active: false },
    { path: '/manufacturer/production-history', label: 'Lịch sử sản xuất', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>), active: false },
    { path: '/manufacturer/transfer-history', label: 'Lịch sử chuyển giao', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>), active: false },
    { path: '/manufacturer/profile', label: 'Hồ sơ', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>), active: false },
  ];

  useEffect(() => {
    loadDrugs();
  }, []);

  const loadDrugs = async () => {
    try {
      const response = await getDrugs();
      if (response.data.success) {
        setDrugs(response.data.data.drugs || []);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách thuốc:', error);
    }
  };

  const handleStartProduction = () => {
    setStep(1);
    setFormData({
      drugId: '',
      batchNumber: '',
      quantity: '',
      manufacturingDate: '',
      expiryDate: '',
      notes: '',
    });
    setIpfsData(null);
    setMintResult(null);
    setShowDialog(true);
  };

  // Bước 1: Upload lên IPFS
  const handleUploadToIPFS = async () => {
    if (!formData.drugId || !formData.batchNumber || !formData.quantity) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (parseInt(formData.quantity) <= 0) {
      alert('Số lượng phải lớn hơn 0');
      return;
    }

    setLoading(true);
    try {
      const response = await uploadToIPFS(formData);
      
      if (response.data.success) {
        setIpfsData(response.data.data);
        setStep(2);
        alert('✅ Bước 1 thành công: Đã lưu thông tin lên IPFS!');
      }
    } catch (error) {
      console.error('Lỗi khi upload IPFS:', error);
      alert('❌ Không thể upload lên IPFS: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: Mint NFT trên blockchain
  const handleMintNFT = async () => {
    if (!ipfsData) {
      alert('Chưa có dữ liệu IPFS');
      return;
    }

    setLoading(true);
    setStep(3);

    try {
      // TODO: Gọi smart contract để mint NFT
      // Ví dụ: const tx = await contract.mint(ipfsData.amount);
      
      // Giả lập việc mint NFT
      alert('🔄 Đang gọi smart contract để mint NFT...\n\nLưu ý: Cần tích hợp Web3 để thực thi thực sự.');
      
      // Sau khi mint thành công, lưu vào database
      const saveData = {
        drugId: formData.drugId,
        batchNumber: formData.batchNumber,
        quantity: parseInt(formData.quantity),
        manufacturingDate: formData.manufacturingDate,
        expiryDate: formData.expiryDate,
        ipfsHash: ipfsData.ipfsHash,
        ipfsFolderId: ipfsData.folderId,
        // transactionHash: tx.hash, // Lấy từ blockchain
        // startTokenId: startId, // Lấy từ event smart contract
        // endTokenId: endId, // Lấy từ event smart contract
      };

      const response = await saveMintedNFTs(saveData);
      
      if (response.data.success) {
        setMintResult(response.data.data);
        alert('✅ Bước 2 thành công: NFT đã được mint và lưu vào database!');
        setStep(4); // Success
      }
    } catch (error) {
      console.error('Lỗi khi mint NFT:', error);
      alert('❌ Không thể mint NFT: ' + (error.response?.data?.message || error.message));
      setStep(2); // Quay lại bước 2
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowDialog(false);
    setStep(1);
    setFormData({
      drugId: '',
      batchNumber: '',
      quantity: '',
      manufacturingDate: '',
      expiryDate: '',
      notes: '',
    });
    setIpfsData(null);
    setMintResult(null);
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  const selectedDrug = drugs.find(d => d._id === formData.drugId);

  return (
    <DashboardLayout navigationItems={navigationItems}>
      {/* Banner */}
      <motion.section
        className="relative overflow-hidden rounded-2xl mb-6 border border-[#90e0ef33] shadow-[0_10px_30px_rgba(0,0,0,0.06)] bg-gradient-to-tr from-purple-600 via-purple-500 to-pink-500"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.25),transparent_55%)]" />
        <div className="relative px-6 py-8 md:px-10 md:py-12 text-white">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight drop-shadow-sm">🏭 Sản xuất thuốc & Mint NFT</h1>
          <p className="text-white/90 mt-2">Tạo lô sản xuất và mint NFT trên blockchain (2 bước: IPFS + Smart Contract)</p>
        </div>
      </motion.section>

      {/* Instructions */}
      <motion.div
        className="rounded-2xl bg-white/85 backdrop-blur-xl border border-purple-200 shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-6 mb-5"
        variants={fadeUp}
        initial="hidden"
        animate="show"
      >
        <h2 className="text-xl font-bold text-purple-800 mb-4">📋 Quy trình sản xuất</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center flex-shrink-0">1</div>
            <div>
              <div className="font-semibold text-slate-800">Nhập thông tin sản xuất</div>
              <div className="text-sm text-slate-600">Chọn thuốc, số lô, số lượng, ngày sản xuất & hạn sử dụng</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center flex-shrink-0">2</div>
            <div>
              <div className="font-semibold text-slate-800">Upload lên IPFS</div>
              <div className="text-sm text-slate-600">Frontend gọi API Backend → Backend lưu metadata lên Pinata IPFS</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center flex-shrink-0">3</div>
            <div>
              <div className="font-semibold text-slate-800">Mint NFT trên Blockchain</div>
              <div className="text-sm text-slate-600">Frontend gọi Smart Contract để mint NFT với số lượng = quantity. Smart Contract phát event, Backend bắt event và lưu vào DB</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action Button */}
      <motion.div
        className="flex justify-center"
        variants={fadeUp}
        initial="hidden"
        animate="show"
      >
        <button
          onClick={handleStartProduction}
          className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg shadow-2xl hover:shadow-purple-300 transition-all transform hover:scale-105 flex items-center gap-3"
        >
          <span className="text-2xl">🏭</span>
          <span>Bắt đầu sản xuất mới</span>
        </button>
      </motion.div>

      {/* Production Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6 rounded-t-3xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🏭</span>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Sản xuất & Mint NFT</h2>
                    <p className="text-purple-100 text-sm">
                      {step === 1 && 'Bước 1/2: Nhập thông tin sản xuất'}
                      {step === 2 && 'Bước 2/2: Sẵn sàng mint NFT'}
                      {step === 3 && 'Đang mint NFT...'}
                      {step === 4 && 'Hoàn thành!'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  disabled={step === 3}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white text-xl transition disabled:opacity-50"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Step 1: Form */}
            {step === 1 && (
              <div className="p-8 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Chọn thuốc *</label>
                  <select
                    value={formData.drugId}
                    onChange={(e) => setFormData({...formData, drugId: e.target.value})}
                    className="w-full border-2 border-purple-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="">-- Chọn thuốc --</option>
                    {drugs.map(drug => (
                      <option key={drug._id} value={drug._id}>
                        {drug.tradeName} ({drug.atcCode})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedDrug && (
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                    <div className="text-sm font-semibold text-purple-800 mb-2">Thông tin thuốc:</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-slate-600">Tên hoạt chất:</span> <span className="font-medium">{selectedDrug.genericName}</span></div>
                      <div><span className="text-slate-600">Dạng bào chế:</span> <span className="font-medium">{selectedDrug.dosageForm}</span></div>
                      <div><span className="text-slate-600">Hàm lượng:</span> <span className="font-medium">{selectedDrug.strength}</span></div>
                      <div><span className="text-slate-600">Quy cách:</span> <span className="font-medium">{selectedDrug.packaging}</span></div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Số lô sản xuất *</label>
                    <input
                      type="text"
                      value={formData.batchNumber}
                      onChange={(e) => setFormData({...formData, batchNumber: e.target.value})}
                      className="w-full border-2 border-purple-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      placeholder="VD: LOT2024001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Số lượng (hộp) *</label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                      className="w-full border-2 border-purple-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      placeholder="VD: 1000"
                      min="1"
                    />
                    <div className="text-xs text-purple-600 mt-1">
                      💡 Sẽ mint {formData.quantity || 0} NFT (1 NFT = 1 hộp thuốc)
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày sản xuất *</label>
                    <input
                      type="date"
                      value={formData.manufacturingDate}
                      onChange={(e) => setFormData({...formData, manufacturingDate: e.target.value})}
                      className="w-full border-2 border-purple-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Hạn sử dụng *</label>
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                      className="w-full border-2 border-purple-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ghi chú</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full border-2 border-purple-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    rows="3"
                    placeholder="Ghi chú thêm về lô sản xuất..."
                  />
                </div>
              </div>
            )}

            {/* Step 2: IPFS Success, Ready to Mint */}
            {step === 2 && ipfsData && (
              <div className="p-8 space-y-4">
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center text-2xl">✓</div>
                    <div>
                      <div className="font-bold text-green-800 text-lg">Bước 1 hoàn thành!</div>
                      <div className="text-sm text-green-600">Dữ liệu đã được lưu lên IPFS</div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">IPFS Hash:</span>
                      <span className="font-mono text-green-700">{ipfsData.ipfsHash}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Folder ID:</span>
                      <span className="font-mono text-green-700">{ipfsData.folderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Số lượng NFT:</span>
                      <span className="font-bold text-green-700">{ipfsData.amount || formData.quantity}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                  <div className="font-bold text-purple-800 mb-3">📝 Thông tin sản xuất:</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Thuốc:</span>
                      <span className="font-medium">{selectedDrug?.tradeName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Số lô:</span>
                      <span className="font-mono font-medium">{formData.batchNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Số lượng:</span>
                      <span className="font-bold text-purple-700">{formData.quantity} hộp</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">NSX:</span>
                      <span className="font-medium">{formData.manufacturingDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">HSD:</span>
                      <span className="font-medium">{formData.expiryDate}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                  <div className="font-semibold text-yellow-800 mb-2">⚠️ Sẵn sàng mint NFT</div>
                  <div className="text-sm text-yellow-700">
                    Bước tiếp theo sẽ gọi smart contract để mint {formData.quantity} NFT trên blockchain. 
                    Quá trình này không thể hoàn tác.
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Minting */}
            {step === 3 && (
              <div className="p-12 text-center">
                <div className="w-20 h-20 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                <div className="text-xl font-bold text-slate-800 mb-2">Đang mint NFT...</div>
                <div className="text-sm text-slate-600">Vui lòng chờ giao dịch blockchain hoàn tất</div>
              </div>
            )}

            {/* Step 4: Success */}
            {step === 4 && mintResult && (
              <div className="p-8">
                <div className="bg-green-50 rounded-xl p-8 border border-green-200 text-center">
                  <div className="w-20 h-20 rounded-full bg-green-500 text-white flex items-center justify-center text-4xl mx-auto mb-4">✓</div>
                  <div className="text-2xl font-bold text-green-800 mb-2">Sản xuất thành công!</div>
                  <div className="text-sm text-green-600 mb-6">NFT đã được mint và lưu vào hệ thống</div>
                  
                  <div className="bg-white rounded-lg p-4 space-y-2 text-sm text-left">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Số lô:</span>
                      <span className="font-mono font-medium">{formData.batchNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Số lượng NFT:</span>
                      <span className="font-bold text-green-700">{formData.quantity}</span>
                    </div>
                    {mintResult.transactionHash && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Transaction Hash:</span>
                        <span className="font-mono text-xs text-green-700">{mintResult.transactionHash.slice(0, 10)}...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Footer Actions */}
            <div className="px-8 py-6 border-t border-gray-200 bg-gray-50 rounded-b-3xl flex justify-end space-x-3">
              {step === 1 && (
                <>
                  <button
                    onClick={handleClose}
                    className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-100 font-medium transition"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleUploadToIPFS}
                    disabled={loading}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium shadow-lg hover:shadow-xl disabled:opacity-50 transition"
                  >
                    {loading ? 'Đang upload...' : '📤 Bước 1: Upload IPFS'}
                  </button>
                </>
              )}
              {step === 2 && (
                <>
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-100 font-medium transition"
                  >
                    ← Quay lại
                  </button>
                  <button
                    onClick={handleMintNFT}
                    disabled={loading}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium shadow-lg hover:shadow-xl disabled:opacity-50 transition"
                  >
                    {loading ? 'Đang mint...' : '🎯 Bước 2: Mint NFT'}
                  </button>
                </>
              )}
              {step === 4 && (
                <button
                  onClick={handleClose}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium shadow-lg hover:shadow-xl transition"
                >
                  ✓ Hoàn thành
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

