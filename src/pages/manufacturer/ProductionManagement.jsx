import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  getDrugs,
  uploadToIPFS,
  saveMintedNFTs
} from '../../services/manufacturer/manufacturerService';
import { 
  mintNFT, 
  isMetaMaskInstalled, 
  connectWallet,
  getNFTContract,
  getWeb3Provider,
  getCurrentWalletAddress
} from '../../utils/web3Helper';
import { ethers } from 'ethers';

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
  const [shelfLifeValue, setShelfLifeValue] = useState('');
  const [shelfLifeUnit, setShelfLifeUnit] = useState('month');
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  const navigationItems = [
    { path: '/manufacturer', label: 'Tổng quan', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>), active: false },
    { path: '/manufacturer/drugs', label: 'Quản lý thuốc', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>), active: false },
    { path: '/manufacturer/production', label: 'Sản xuất thuốc', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>), active: false },
    { path: '/manufacturer/transfer', label: 'Chuyển giao', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>), active: false },
    { path: '/manufacturer/distribution-confirmation', label: 'Xác nhận quyền NFT', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>), active: true },
    { path: '/manufacturer/production-history', label: 'Lịch sử sản xuất', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>), active: false },
    { path: '/manufacturer/transfer-history', label: 'Lịch sử chuyển giao', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>), active: false },
    { path: '/manufacturer/profile', label: 'Hồ sơ', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>), active: false },
  ];

  useEffect(() => {
    loadDrugs();
    // Kiểm tra kết nối ví khi component mount
    checkInitialWalletConnection();
  }, []);

  // Kiểm tra kết nối ví ban đầu
  const checkInitialWalletConnection = async () => {
    if (isMetaMaskInstalled()) {
      try {
        const provider = await getWeb3Provider();
        if (provider) {
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            setWalletConnected(true);
          }
        }
      } catch (error) {
        console.log('Ví chưa được kết nối:', error.message);
      }
    }
  };

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

    const quantity = parseInt(formData.quantity);
    if (quantity <= 0) {
      alert('Số lượng phải lớn hơn 0');
      return;
    }

    setLoading(true);
    try {
      // Tạo metadata object theo format NFT metadata standard
      const selectedDrug = drugs.find(d => d._id === formData.drugId);
      const metadata = {
        name: `${selectedDrug?.tradeName || 'Unknown'} - Batch ${formData.batchNumber}`,
        description: `Lô sản xuất ${selectedDrug?.tradeName || 'Unknown'} - Số lô: ${formData.batchNumber}`,
        image: selectedDrug?.image || 'https://via.placeholder.com/400x400?text=Drug+Image',
        attributes: [
          {
            trait_type: 'Drug',
            value: selectedDrug?.tradeName || 'Unknown'
          },
          {
            trait_type: 'Generic Name',
            value: selectedDrug?.genericName || 'N/A'
          },
          {
            trait_type: 'Batch',
            value: formData.batchNumber
          },
          {
            trait_type: 'Manufacturing Date',
            value: formData.manufacturingDate || 'N/A'
          },
          {
            trait_type: 'Expiry Date',
            value: formData.expiryDate || 'N/A'
          },
          {
            trait_type: 'ATC Code',
            value: selectedDrug?.atcCode || 'N/A'
          },
          {
            trait_type: 'Dosage Form',
            value: selectedDrug?.dosageForm || 'N/A'
          },
          {
            trait_type: 'Strength',
            value: selectedDrug?.strength || 'N/A'
          }
        ]
      };

      // Gọi API upload IPFS với format đúng
      const uploadPayload = {
        quantity: quantity,
        metadata: metadata
      };

      console.log('📤 Uploading to IPFS:', uploadPayload);

      const response = await uploadToIPFS(uploadPayload);
      
      if (response.data.success) {
        const ipfsData = response.data.data || response.data;
        setIpfsData(ipfsData);
        setStep(2);
        alert('✅ Bước 1 thành công: Đã lưu thông tin lên IPFS!');
        console.log('✅ IPFS data:', ipfsData);
      }
    } catch (error) {
      console.error('Lỗi khi upload IPFS:', error);
      alert('❌ Không thể upload lên IPFS: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra và kết nối MetaMask
  const checkWalletConnection = async () => {
    if (!isMetaMaskInstalled()) {
      alert('⚠️ Vui lòng cài đặt MetaMask để mint NFT!');
      return false;
    }

    try {
      const result = await connectWallet();
      if (result && result.success && result.address) {
        setWalletAddress(result.address);
        setWalletConnected(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Lỗi kết nối ví:', error);
      alert('❌ Không thể kết nối ví MetaMask: ' + error.message);
      return false;
    }
  };

  // Bước 2: Mint NFT trên blockchain
    const handleMintNFT = async () => {
      if (!ipfsData) {
        alert('Chưa có dữ liệu IPFS');
        return;
      }

      // Validate đầy đủ
      if (!formData.drugId || !formData.batchNumber || !formData.quantity) {
        alert('❌ Thiếu thông tin bắt buộc');
        return;
      }

      const quantity = parseInt(formData.quantity);
      if (quantity <= 0 || quantity > 10000) {
        alert('❌ Số lượng không hợp lệ (1-10000)');
        return;
      }

      // Kiểm tra wallet
      if (!walletConnected) {
        const connected = await checkWalletConnection();
        if (!connected) return;
      }

      setLoading(true);
      setStep(3);

      try {
        const ipfsUrl = ipfsData.ipfsUrl || `ipfs://${ipfsData.ipfsHash}`;
        
        console.log('🎨 Mint NFT:', { quantity, ipfsUrl });

        const contract = await getNFTContract();
        
        // ✅ Sửa: Mint quantity NFTs độc lập (mỗi NFT = 1 amount)
        const amounts = Array(quantity).fill(1);
        
        console.log('📤 Call mintNFT with amounts:', amounts);
        
        const tx = await contract.mintNFT(amounts);
        console.log('⏳ TX submitted:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('✅ TX confirmed:', receipt);

        // Parse token IDs
        const tokenIds = [];
        let foundEvent = false;

        // Tìm mintNFTEvent
        for (const log of receipt.logs) {
          try {
            const parsed = contract.interface.parseLog(log);
            if (parsed?.name === 'mintNFTEvent' && parsed.args.tokenIds) {
              const ids = parsed.args.tokenIds;
              if (Array.isArray(ids)) {
                ids.forEach(id => tokenIds.push(id.toString()));
              } else {
                tokenIds.push(ids.toString());
              }
              foundEvent = true;
              break;
            }
          } catch (e) {
            // Skip unparseable logs
          }
        }

        // Fallback: Tìm TransferSingle/TransferBatch
        if (!foundEvent) {
          for (const log of receipt.logs) {
            try {
              const parsed = contract.interface.parseLog(log);
              if (parsed?.name === 'TransferSingle') {
                const from = parsed.args.from;
                if (from === ethers.ZeroAddress) {
                  const tokenId = parsed.args.id.toString();
                  const amount = parseInt(parsed.args.value.toString());
                  
                  // ✅ Nếu amount = 1, thêm tokenId
                  // Nếu amount > 1, tạo tokenIds tuần tự (vì backend cần unique IDs)
                  if (amount === 1) {
                    tokenIds.push(tokenId);
                  } else {
                    const base = BigInt(tokenId);
                    for (let i = 0; i < amount; i++) {
                      tokenIds.push((base + BigInt(i)).toString());
                    }
                  }
                }
              } else if (parsed?.name === 'TransferBatch') {
                const from = parsed.args.from;
                if (from === ethers.ZeroAddress) {
                  const ids = parsed.args.ids || [];
                  const values = parsed.args.values || [];
                  
                  for (let i = 0; i < ids.length; i++) {
                    const tokenId = ids[i].toString();
                    const amount = parseInt(values[i].toString());
                    
                    if (amount === 1) {
                      tokenIds.push(tokenId);
                    } else {
                      const base = BigInt(tokenId);
                      for (let j = 0; j < amount; j++) {
                        tokenIds.push((base + BigInt(j)).toString());
                      }
                    }
                  }
                  foundEvent = true;
                  break;
                }
              }
            } catch (e) {
              console.warn('Cannot parse log:', e.message);
            }
          }
        }

        // ✅ Sort tokenIds đúng cách
        tokenIds.sort((a, b) => {
          const bigA = BigInt(a);
          const bigB = BigInt(b);
          if (bigA < bigB) return -1;
          if (bigA > bigB) return 1;
          return 0;
        });

        console.log('📋 Token IDs:', tokenIds);

        if (tokenIds.length === 0) {
          console.error('❌ No events found in', receipt.logs.length, 'logs');
          throw new Error('Không tìm thấy token IDs. Kiểm tra smart contract events.');
        }

        // ✅ Điều chỉnh số lượng tokenIds nếu cần
        if (tokenIds.length < quantity) {
          console.warn(`⚠️ Thiếu token IDs: ${tokenIds.length}/${quantity}`);
          const lastId = BigInt(tokenIds[tokenIds.length - 1]);
          let nextId = lastId + BigInt(1);
          
          while (tokenIds.length < quantity) {
            tokenIds.push(nextId.toString());
            nextId = nextId + BigInt(1);
          }
        } else if (tokenIds.length > quantity) {
          console.warn(`⚠️ Thừa token IDs: ${tokenIds.length}/${quantity}, cắt bớt`);
          tokenIds.splice(quantity);
        }

        console.log('✅ Final token IDs:', tokenIds);

        // Lưu vào backend
        const selectedDrug = drugs.find(d => d._id === formData.drugId);
        
        const saveData = {
          drugId: formData.drugId,
          tokenIds: tokenIds, // Đã là array of strings
          transactionHash: tx.hash,
          quantity: quantity,
          ipfsUrl: ipfsUrl,
          mfgDate: formData.manufacturingDate || undefined,
          expDate: formData.expiryDate || undefined,
          batchNumber: formData.batchNumber || undefined,
          metadata: {
            name: `${selectedDrug?.tradeName || 'Unknown'} - Batch ${formData.batchNumber}`,
            description: `Lô sản xuất ${selectedDrug?.tradeName}`,
            drug: selectedDrug?.tradeName,
            genericName: selectedDrug?.genericName,
            atcCode: selectedDrug?.atcCode
          }
        };

        console.log('💾 Saving to backend:', saveData);

        const response = await saveMintedNFTs(saveData);
        
        if (response.data.success) {
          setMintResult(response.data.data);
          alert(`✅ Mint thành công ${quantity} NFT!\n\nTX: ${tx.hash.slice(0, 10)}...`);
          setStep(4);
        } else {
          throw new Error(response.data.message || 'Backend failed');
        }
      } catch (error) {
        console.error('❌ Mint error:', error);
        
        let errorMsg = 'Không thể mint NFT';
        
        if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
          errorMsg = 'Giao dịch bị từ chối';
        } else if (error.response?.data?.message) {
          errorMsg = error.response.data.message;
        } else if (error.message) {
          errorMsg = error.message;
        }
        
        alert('❌ ' + errorMsg);
        setStep(2);
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
    setShelfLifeValue('');
    setShelfLifeUnit('month');
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  const selectedDrug = drugs.find(d => d._id === formData.drugId);

  // Tính toán HSD từ NSX + thời hạn
  const addDuration = (dateStr, amount, unit) => {
    if (!dateStr || !amount) return '';
    const d = new Date(dateStr);
    const n = parseInt(amount, 10);
    if (Number.isNaN(n)) return '';
    if (unit === 'day') {
      d.setDate(d.getDate() + n);
    } else if (unit === 'month') {
      const currentDate = d.getDate();
      d.setMonth(d.getMonth() + n);
      // Điều chỉnh nếu vượt sang tháng không có ngày này
      if (d.getDate() < currentDate) {
        d.setDate(0);
      }
    } else if (unit === 'year') {
      d.setFullYear(d.getFullYear() + n);
    }
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const formatDateMDY = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return '';
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  };

  useEffect(() => {
    const computed = addDuration(formData.manufacturingDate, shelfLifeValue, shelfLifeUnit);
    setFormData(prev => ({ ...prev, expiryDate: computed }));
  }, [formData.manufacturingDate, shelfLifeValue, shelfLifeUnit]);

  return (
    <DashboardLayout navigationItems={navigationItems}>
      {/* Banner */}
      <div className="bg-white rounded-xl border border-cyan-200 shadow-sm p-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[#007b91] flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#007b91]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M5 10h14M4 14h16M6 18h12" />
              </svg>
              Sản xuất thuốc & Mint NFT
            </h1>
            <p className="text-slate-500 text-sm mt-1">Tạo lô sản xuất và mint NFT trên blockchain (2 bước: IPFS + Smart Contract)</p>
          </div>
        </div>

      {/* Instructions */}
      <motion.div
        className="rounded-2xl bg-white border border-cyan-200 shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-6 mb-5 mt-5"
        variants={fadeUp}
        initial="hidden"
        animate="show"
      >
        <h2 className="text-xl font-bold text-[#007b91] mb-4">Quy trình sản xuất</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 font-bold flex items-center justify-center flex-shrink-0">1</div>
            <div>
              <div className="font-semibold text-slate-800">Nhập thông tin sản xuất</div>
              <div className="text-sm text-slate-600">Chọn thuốc, số lô, số lượng, ngày sản xuất & hạn sử dụng</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 font-bold flex items-center justify-center flex-shrink-0">2</div>
            <div>
              <div className="font-semibold text-slate-800">Upload lên IPFS</div>
              <div className="text-sm text-slate-600">Frontend gọi API Backend → Backend lưu metadata lên Pinata IPFS</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 font-bold flex items-center justify-center flex-shrink-0">3</div>
            <div>
              <div className="font-semibold text-slate-800">Mint NFT trên Blockchain</div>
              <div className="text-sm text-slate-600">Frontend gọi Smart Contract để mint NFT với số lượng = quantity. Smart Contract phát event, Backend bắt event và lưu vào DB</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action Button */}
      <motion.div
        className="flex justify-end"
        variants={fadeUp}
        initial="hidden"
        animate="show"
      >
        <button
          onClick={handleStartProduction}
          className="px-4 py-2.5 rounded-full bg-gradient-to-r from-[#00a3c4] to-[#3db6d9] text-white font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2"
        >
          <span className="text-white">Bắt đầu sản xuất mới</span>
        </button>
      </motion.div>

      {/* Production Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto custom-scroll">
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
                    <h2 className="text-2xl font-bold text-white">Sản xuất & Mint NFT</h2>
                    <p className="text-cyan-100 text-sm">
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
                    className="w-full border-2 border-cyan-300 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
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
                  <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-200">
                    <div className="text-sm font-semibold text-cyan-800 mb-2">Thông tin thuốc:</div>
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
                      className="w-full border-2 border-cyan-300 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                      placeholder="VD: LOT2024001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Số lượng (hộp) *</label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                      className="w-full border-2 border-cyan-300 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                      placeholder="VD: 1000"
                      min="1"
                    />
                    <div className="text-xs text-cyan-600 mt-1">
                      Sẽ mint {formData.quantity || 0} NFT (1 NFT = 1 hộp thuốc)
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
                      className="w-full border-2 border-cyan-300 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Thời hạn sử dụng</label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        min="0"
                        value={shelfLifeValue}
                        onChange={(e) => setShelfLifeValue(e.target.value)}
                        className="w-full border-2 border-cyan-300 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        placeholder="VD: 12"
                      />
                      <select
                        value={shelfLifeUnit}
                        onChange={(e) => setShelfLifeUnit(e.target.value)}
                        className="w-full border-2 border-cyan-300 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                      >
                        <option value="day">ngày</option>
                        <option value="month">tháng</option>
                        <option value="year">năm</option>
                      </select>
                    </div>
                    <div className="mt-2">
                      <div className="text-cyan-600 text-sm font-medium">
                        Ngày hết hạn :{formatDateMDY(formData.expiryDate) || 'mm/dd/yyyy'}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ghi chú</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full border-2 border-cyan-300 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
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

                <div className="bg-cyan-50 rounded-xl p-6 border border-cyan-200">
                  <div className="font-bold text-cyan-800 mb-3">Thông tin sản xuất:</div>
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
                <div className="w-20 h-20 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
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
                    onClick={handleUploadToIPFS}
                    disabled={loading}
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#00b4d8] to-[#48cae4] text-white font-medium shadow-md hover:shadow-lg disabled:opacity-50 transition"
                  >
                    <a className="text-white">{loading ? 'Đang upload...' : 'Bước 1: Upload IPFS'}</a>
                  </button>
                </>
              )}
              {step === 2 && (
                <>
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-2.5 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium transition"
                  >
                    ← Quay lại
                  </button>
                  <button
                    onClick={handleMintNFT}
                    disabled={loading}
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#00b4d8] to-[#48cae4] text-white font-medium shadow-md hover:shadow-lg disabled:opacity-50 transition"
                  >
                    <a className="text-white">{loading ? 'Đang mint...' : 'Bước 2: Mint NFT'}</a>
                  </button>
                </>
              )}
              {step === 4 && (
                <button
                  onClick={handleClose}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium shadow-md hover:shadow-lg transition"
                >
                  <a className="text-white">Hoàn thành</a>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

