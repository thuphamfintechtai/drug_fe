import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  getDistributionHistory,
  getPharmacies,
  transferToPharmacy,
  saveTransferToPharmacyTransaction,
  getInvoiceDetail
} from '../../services/distributor/distributorService';
import { getDistributionDetail } from '../../services/distributor/proofService';
import { transferNFTToPharmacy, getCurrentWalletAddress, checkDistributorNFTBalances } from '../../utils/web3Helper';
import { useAuth } from '../../context/AuthContext';

export default function TransferToPharmacy() {
  const { user } = useAuth();
  const [distributions, setDistributions] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedDistribution, setSelectedDistribution] = useState(null);
  const [formData, setFormData] = useState({
    distributionId: '',
    pharmacyId: '',
    quantity: '',
    notes: '',
  });

  const navigationItems = [
    { path: '/distributor', label: 'Tổng quan', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>), active: false },
    { path: '/distributor/invoices', label: 'Đơn từ nhà SX', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>), active: false },
    { path: '/distributor/transfer-pharmacy', label: 'Chuyển cho NT', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>), active: true },
    { path: '/distributor/distribution-history', label: 'Lịch sử phân phối', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>), active: false },
    { path: '/distributor/transfer-history', label: 'Lịch sử chuyển NT', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>), active: false },
    { path: '/distributor/drugs', label: 'Quản lý thuốc', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>), active: false },
    { path: '/distributor/nft-tracking', label: 'Tra cứu NFT', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>), active: false },
    { path: '/distributor/profile', label: 'Hồ sơ', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>), active: false },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [distRes, pharmRes] = await Promise.all([
        getDistributionHistory({ status: 'confirmed' }), // Chỉ lấy đã confirmed (đã nhận NFT từ manufacturer)
        getPharmacies()
      ]);
      
      if (distRes.data.success) {
        setDistributions(distRes.data.data.distributions || []);
      }
      if (pharmRes.data.success && pharmRes.data.data) {
        setPharmacies(Array.isArray(pharmRes.data.data.pharmacies) 
          ? pharmRes.data.data.pharmacies 
          : []);
      } else {
        setPharmacies([]);
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDistribution = async (dist) => {
    console.log('Selected distribution:', dist);
    console.log('Distribution keys:', Object.keys(dist || {}));
    console.log('manufacturerInvoice:', dist?.manufacturerInvoice);
    console.log('manufacturerInvoice keys:', dist?.manufacturerInvoice ? Object.keys(dist.manufacturerInvoice) : 'N/A');
    console.log('manufacturerInvoice.tokenIds:', dist?.manufacturerInvoice?.tokenIds);
    
    // Hàm helper để tìm tokenIds từ distribution object
    const extractTokenIds = (distributionObj, source = 'unknown') => {
      console.log(`[extractTokenIds] Source: ${source}, Object:`, distributionObj);
      let tokenIds = [];
      
      // Ưu tiên 1: Lấy từ manufacturerInvoice.tokenIds (từ ManufacturerInvoice model)
      if (distributionObj.manufacturerInvoice?.tokenIds && Array.isArray(distributionObj.manufacturerInvoice.tokenIds)) {
        tokenIds = distributionObj.manufacturerInvoice.tokenIds.map(id => String(id));
        console.log('✅ Found tokenIds from manufacturerInvoice.tokenIds:', tokenIds);
        return tokenIds;
      }
      // Ưu tiên 1b: manufacturerInvoice có thể là string ID, không phải object
      if (distributionObj.manufacturerInvoice && typeof distributionObj.manufacturerInvoice === 'string') {
        console.log('⚠️ manufacturerInvoice là string ID, không phải object được populate');
      }
      
      // Ưu tiên 2: Lấy từ invoice.tokenIds (nếu API trả về với tên field khác)
      if (distributionObj.invoice?.tokenIds && Array.isArray(distributionObj.invoice.tokenIds)) {
        tokenIds = distributionObj.invoice.tokenIds.map(id => String(id));
        console.log('✅ Found tokenIds from invoice.tokenIds:', tokenIds);
        return tokenIds;
      }
      
      // Ưu tiên 3: Thử lấy từ distribution.nftInfos (nếu có)
      if (distributionObj.nftInfos && Array.isArray(distributionObj.nftInfos)) {
        tokenIds = distributionObj.nftInfos.map(nft => {
          if (typeof nft === 'string') return nft;
          return String(nft.tokenId || nft._id || (nft.nftInfo && nft.nftInfo.tokenId) || '');
        }).filter(Boolean);
        if (tokenIds.length > 0) {
          console.log('✅ Found tokenIds from nftInfos:', tokenIds);
          return tokenIds;
        }
      }
      
      // Ưu tiên 4: Thử lấy từ distribution.tokenIds (nếu có trực tiếp)
      if (distributionObj.tokenIds && Array.isArray(distributionObj.tokenIds)) {
        tokenIds = distributionObj.tokenIds.map(id => String(id));
        console.log('✅ Found tokenIds from distribution.tokenIds:', tokenIds);
        return tokenIds;
      }
      
      console.log(`❌ Không tìm thấy tokenIds trong ${source}`);
      return [];
    };
    
    // Thử lấy tokenIds từ distribution object ngay từ list trước
    let tokenIds = extractTokenIds(dist, 'distribution list');
    
    setLoading(true);
    try {
      // Nếu chưa có tokenIds, mới gọi API detail
      if (tokenIds.length === 0) {
        console.log('Không tìm thấy tokenIds trong distribution list, đang thử lấy từ các nguồn khác...');
        
        // Lấy manufacturerInvoiceId (có thể là object._id hoặc string)
        const manufacturerInvoiceId = dist?.manufacturerInvoice?._id || dist?.manufacturerInvoice;
        
        // Thử 1: Gọi getDistributionDetail (có thể không tồn tại)
        if (!tokenIds.length) {
          try {
                        const detailRes = await getDistributionDetail(dist._id);
            const detail = detailRes?.data?.data || detailRes?.data || dist;
            console.log('Distribution detail from API:', detail);
            console.log('Detail keys:', Object.keys(detail || {}));
            console.log('Detail manufacturerInvoice:', detail?.manufacturerInvoice);
            tokenIds = extractTokenIds(detail, 'API detail');
          } catch (apiError) {
            console.warn('API getDistributionDetail không khả dụng:', apiError.response?.status || apiError.message);
            // Tiếp tục với phương án khác
          }
        }
        
        // Thử 2: Nếu vẫn chưa có tokenIds và có manufacturerInvoiceId, gọi API lấy invoice detail
        if (!tokenIds.length && manufacturerInvoiceId && typeof manufacturerInvoiceId === 'string') {
          console.log('Đang gọi API getInvoiceDetail để lấy tokenIds từ invoice ID:', manufacturerInvoiceId);
          try {
            const invoiceDetailRes = await getInvoiceDetail(manufacturerInvoiceId);
            if (invoiceDetailRes?.data?.success && invoiceDetailRes.data.data) {
              const invoiceDetail = invoiceDetailRes.data.data;
              if (invoiceDetail.tokenIds && Array.isArray(invoiceDetail.tokenIds) && invoiceDetail.tokenIds.length > 0) {
                tokenIds = invoiceDetail.tokenIds.map(id => String(id));
                console.log('✅ Lấy được tokenIds từ API getInvoiceDetail:', tokenIds);
              } else {
                console.warn('⚠️ API getInvoiceDetail không trả về tokenIds hoặc tokenIds rỗng:', invoiceDetail);
              }
            }
          } catch (invoiceError) {
            console.warn('Lỗi khi gọi getInvoiceDetail:', invoiceError);
            console.warn('Chi tiết lỗi:', invoiceError.response?.data || invoiceError.message);
          }
        }
        
        // Nếu vẫn không có tokenIds
        if (tokenIds.length === 0) {
          console.warn('⚠️ Không thể lấy tokenIds từ bất kỳ nguồn nào');
        }
      }
      
      // Lưu distribution với tokenIds vào state
      const distributionWithTokens = {
        ...dist,
        tokenIds: tokenIds,
      };
      
      setSelectedDistribution(distributionWithTokens);
      setFormData({
        distributionId: dist._id,
        pharmacyId: '',
        quantity: dist.distributedQuantity?.toString() || '',
        notes: '',
      });
      
      if (tokenIds.length === 0) {
        console.warn('⚠️ Không tìm thấy tokenIds trong distribution:', dist._id);
        const manufacturerInvoiceId = dist?.manufacturerInvoice?._id || dist?.manufacturerInvoice;
        
        // Hiển thị cảnh báo chi tiết hơn
        let warningMessage = 'Cảnh báo: Không tìm thấy token IDs trong distribution.\n\n';
        warningMessage += `Distribution ID: ${dist._id}\n`;
        if (manufacturerInvoiceId) {
          warningMessage += `Manufacturer Invoice ID: ${manufacturerInvoiceId}\n`;
        }
        warningMessage += '\nVui lòng kiểm tra:\n';
        warningMessage += '1. Distribution đã có NFT được gán chưa?\n';
        warningMessage += '2. Invoice từ manufacturer đã có tokenIds chưa?\n';
        warningMessage += '3. Hoặc liên hệ quản trị viên để kiểm tra.\n\n';
        warningMessage += 'Bạn vẫn có thể tiếp tục, nhưng sẽ không thể tạo chuyển giao nếu không có tokenIds.';
        
        alert(warningMessage);
        console.error('Full distribution object:', JSON.stringify(dist, null, 2));
      }
      
      setShowDialog(true);
    } catch (error) {
      console.error('Lỗi khi xử lý distribution:', error);
      // Fallback: vẫn mở dialog với distribution từ list
      setSelectedDistribution({
        ...dist,
        tokenIds: tokenIds, // Dùng tokenIds đã tìm được (nếu có)
      });
      setFormData({
        distributionId: dist._id,
        pharmacyId: '',
        quantity: dist.distributedQuantity?.toString() || '',
        notes: '',
      });
      setShowDialog(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.pharmacyId || !formData.quantity) {
      alert('Vui lòng chọn nhà thuốc và nhập số lượng');
      return;
    }
  
    const requestedQty = parseInt(formData.quantity);
    
    if (requestedQty <= 0 || requestedQty > selectedDistribution.distributedQuantity) {
      alert('Số lượng không hợp lệ');
      return;
    }
  
    // ✅ BẮT BUỘC phải có tokenIds
    let tokenIds = selectedDistribution.tokenIds || [];
    
    if (tokenIds.length === 0) {
      alert('❌ Không tìm thấy tokenIds!\n\nDistribution này chưa có NFT được gán.\nVui lòng liên hệ quản trị viên.');
      return;
    }
  
    // ✅ Slice tokenIds theo quantity
    const selectedTokenIds = tokenIds.slice(0, requestedQty);
    
    if (selectedTokenIds.length < requestedQty) {
      if (!window.confirm(
        `⚠️ Chỉ có ${selectedTokenIds.length} tokenIds khả dụng.\n\n` +
        `Bạn yêu cầu ${requestedQty} nhưng chỉ có thể chuyển ${selectedTokenIds.length}.\n\n` +
        `Tiếp tục?`
      )) {
        return;
      }
    }
  
    // ✅ Tạo amounts = 1 cho mỗi token
    const amounts = selectedTokenIds.map(() => 1);

    // ✅ Kiểm tra balance trên blockchain trước khi tiếp tục
    setLoading(true);
    try {
      console.log('🔍 Đang kiểm tra balance trên blockchain...');
      const balanceCheck = await checkDistributorNFTBalances(selectedTokenIds);
      
      if (!balanceCheck.canTransfer) {
        const issuesList = balanceCheck.issues
          .filter(issue => issue.tokenId) // Chỉ lấy issues có tokenId
          .map(issue => `  - Token ID ${issue.tokenId}: có ${issue.balance}, cần ${issue.needed}`)
          .join('\n');
        
        const errorMessage = 
          `❌ Không đủ số lượng NFT để chuyển giao!\n\n` +
          `📊 Chi tiết:\n${issuesList}\n\n` +
          `🔍 Nguyên nhân có thể:\n` +
          `1. NFT chưa được transfer từ Manufacturer → Distributor trên blockchain\n` +
          `2. Manufacturer chưa hoàn thành bước transfer NFT (chưa gọi smart contract)\n` +
          `3. Transaction transfer từ Manufacturer bị revert hoặc thất bại\n` +
          `4. Token ID không đúng hoặc chưa được mint\n\n` +
          `✅ Giải pháp:\n` +
          `1. Kiểm tra trong "Lịch sử chuyển giao" (Manufacturer) xem NFT đã được transfer chưa\n` +
          `2. Nếu chưa, yêu cầu Manufacturer thực hiện transfer NFT trước\n` +
          `3. Nếu đã transfer, kiểm tra transaction hash trên blockchain explorer\n` +
          `4. Liên hệ quản trị viên nếu vấn đề vẫn tiếp tục\n\n` +
          `💡 Lưu ý: Token ID có trong database nhưng chưa có trên blockchain nghĩa là ` +
          `Manufacturer đã tạo invoice nhưng chưa thực hiện transfer NFT trên smart contract.`;
        
        alert(errorMessage);
        setLoading(false);
        return;
      }
      
      console.log('✅ Balance check passed, all tokens are available');
    } catch (balanceError) {
      console.error('❌ Lỗi khi kiểm tra balance:', balanceError);
      // Nếu lỗi do network hoặc contract, vẫn cho phép tiếp tục (sẽ báo lỗi ở bước sau)
      if (balanceError.message?.includes('Contract not deployed') || 
          balanceError.message?.includes('MetaMask')) {
        if (!window.confirm(
          `⚠️ Không thể kiểm tra balance trên blockchain!\n\n` +
          `Lỗi: ${balanceError.message}\n\n` +
          `Bạn có muốn tiếp tục không? (Sẽ kiểm tra lại ở bước transfer NFT)`
        )) {
          setLoading(false);
          return;
        }
      } else {
        alert(`❌ Lỗi khi kiểm tra balance: ${balanceError.message}`);
        setLoading(false);
        return;
      }
    }

    try {
      // ✅ Payload đúng theo backend spec
      const payload = {
        pharmacyId: formData.pharmacyId,
        tokenIds: selectedTokenIds,  // Required
        amounts: amounts,            // Required
        quantity: selectedTokenIds.length, // Optional
        notes: formData.notes || undefined, // Optional
        // Không gửi distributionId, manufacturerInvoiceId
      };
  
      console.log('Payload gửi lên backend:', payload);
  
      // Bước 1: Tạo invoice với status "draft"
      const response = await transferToPharmacy(payload);

      if (response.data.success) {
        const { commercialInvoice, pharmacyAddress, tokenIds: responseTokenIds, amounts: responseAmounts } = response.data.data;

        console.log('✅ Bước 1 hoàn thành - Invoice đã được tạo:', {
          invoiceId: commercialInvoice._id,
          invoiceNumber: commercialInvoice.invoiceNumber,
          status: commercialInvoice.status,
          pharmacyAddress,
          tokenIds: responseTokenIds,
          amounts: responseAmounts,
        });

        // Bước 2: Gọi smart contract để chuyển NFT
        try {
          console.log('📤 Bước 2: Đang gọi smart contract để chuyển NFT...');
          
          const transferResult = await transferNFTToPharmacy(
            responseTokenIds,
            responseAmounts,
            pharmacyAddress
          );

          if (transferResult.success) {
            console.log('✅ Bước 2 hoàn thành - Smart contract thành công:', {
              transactionHash: transferResult.transactionHash,
              blockNumber: transferResult.blockNumber,
            });

            // Bước 3: Lưu transaction hash vào database
            try {
              console.log('💾 Bước 3: Đang lưu transaction hash...');
              
              const saveResponse = await saveTransferToPharmacyTransaction({
                invoiceId: commercialInvoice._id,
                transactionHash: transferResult.transactionHash,
                tokenIds: responseTokenIds,
              });

              if (saveResponse.data.success) {
                console.log('✅ Bước 3 hoàn thành - Transaction hash đã được lưu');
                
                alert(
                  '✅ Chuyển giao NFT thành công!\n\n' +
                  `Invoice: ${commercialInvoice.invoiceNumber}\n` +
                  `Transaction Hash: ${transferResult.transactionHash}\n` +
                  `Block Number: ${transferResult.blockNumber}\n\n` +
                  'Pharmacy có thể xác nhận nhận hàng ngay bây giờ.'
                );

                // Đóng dialog và reload data
                setShowDialog(false);
                setFormData({
                  distributionId: '',
                  pharmacyId: '',
                  quantity: '',
                  notes: '',
                });
                loadData();
              } else {
                throw new Error(saveResponse.data.message || 'Lỗi khi lưu transaction hash');
              }
            } catch (saveError) {
              console.error('❌ Lỗi khi lưu transaction hash:', saveError);
              alert(
                '⚠️ Smart contract đã thành công nhưng lưu transaction hash thất bại!\n\n' +
                `Transaction Hash: ${transferResult.transactionHash}\n\n` +
                'Vui lòng liên hệ quản trị viên để cập nhật thủ công.\n\n' +
                'Lỗi: ' + (saveError.response?.data?.message || saveError.message)
              );
            }
          } else {
            throw new Error('Smart contract transfer không thành công');
          }
        } catch (transferError) {
          console.error('❌ Lỗi khi gọi smart contract:', transferError);
          
          // Kiểm tra nếu là lỗi contract chưa deploy
          const isContractNotDeployed = transferError.message?.includes('Contract not deployed');
          
          let errorMessage = '❌ Lỗi khi chuyển NFT trên smart contract!\n\n';
          errorMessage += 'Invoice đã được tạo với status "draft".\n';
          errorMessage += 'Bạn có thể thử lại chuyển NFT sau.\n\n';
          
          if (isContractNotDeployed) {
            errorMessage += '⚠️ Smart Contract chưa được deploy trên network hiện tại!\n\n';
            errorMessage += 'Vui lòng:\n';
            errorMessage += '1. Kiểm tra network trong MetaMask (localhost:8545, Sepolia, etc.)\n';
            errorMessage += '2. Đảm bảo contract đã được deploy trên network đó\n';
            errorMessage += '3. Hoặc chuyển sang network có contract đã deploy\n\n';
          }
          
          errorMessage += 'Chi tiết lỗi:\n' + (transferError.message || 'Unknown error');
          
          alert(errorMessage);
        }
      }
    } catch (error) {
      console.error('❌ Lỗi:', error);
      alert('❌ ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  // Đảm bảo pharmacies luôn là array
  const safePharmacies = Array.isArray(pharmacies) ? pharmacies : [];
  const selectedPharmacy = safePharmacies.find(p => p._id === formData.pharmacyId);

  return (
    <DashboardLayout navigationItems={navigationItems}>
      {/* Banner kiểu Manufacturer */}
      <div className="bg-white rounded-xl border border-cyan-200 shadow-sm p-5 mb-6">
        <h1 className="text-xl font-semibold text-[#007b91]">Chuyển giao cho nhà thuốc</h1>
        <p className="text-slate-500 text-sm mt-1">Chọn NFT và pharmacy để chuyển quyền sở hữu</p>
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
              <div className="font-semibold text-slate-800">Chọn NFT & Pharmacy</div>
              <div className="text-sm text-slate-600">Chọn lô hàng đã nhận từ manufacturer và nhà thuốc nhận hàng</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 font-bold flex items-center justify-center flex-shrink-0">2</div>
            <div>
              <div className="font-semibold text-slate-800">Tạo invoice (Bước 1)</div>
              <div className="text-sm text-slate-600">Frontend gọi API Backend để tạo invoice với trạng thái "draft"</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 font-bold flex items-center justify-center flex-shrink-0">3</div>
            <div>
              <div className="font-semibold text-slate-800">Chuyển quyền sở hữu NFT</div>
              <div className="text-sm text-slate-600">Frontend gọi Smart Contract để transfer NFT từ Distributor wallet → Pharmacy wallet</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 font-bold flex items-center justify-center flex-shrink-0">4</div>
            <div>
              <div className="font-semibold text-slate-800">Lưu transaction hash (Bước 2)</div>
              <div className="text-sm text-slate-600">Frontend gọi API Backend để lưu transaction hash, invoice status chuyển từ "draft" → "sent"</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Distributions List */}
      <motion.div
        className="bg-white rounded-2xl border border-cyan-100 shadow-sm overflow-hidden"
        variants={fadeUp}
        initial="hidden"
        animate="show"
      >
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
          <h2 className="text-xl font-bold text-slate-800">Lô hàng có sẵn (đã nhận từ Manufacturer)</h2>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-600">Đang tải...</div>
        ) : distributions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-5xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Chưa có lô hàng nào</h3>
            <p className="text-slate-600">Vui lòng nhận hàng từ nhà sản xuất trước</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Từ Manufacturer</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Đơn hàng</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Số lượng NFT</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Ngày nhận</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {distributions.map((dist, index) => (
                  <tr key={dist._id || index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-[#003544]">
                      {dist.fromManufacturer?.fullName || dist.fromManufacturer?.username || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-cyan-50 text-cyan-700 border border-cyan-100">
                        {dist.manufacturerInvoice?.invoiceNumber || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-800">{dist.distributedQuantity}</span>
                      <span className="text-xs text-slate-500 ml-1">NFT</span>
                    </td>
                    <td className="px-6 py-4 text-slate-700 text-sm">
                      {dist.distributionDate ? new Date(dist.distributionDate).toLocaleDateString('vi-VN') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => handleSelectDistribution(dist)}
                          className="px-4 py-2 border-2 border-[#3db6d9] bg-[#b3e9f4] text-black rounded-full font-semibold hover:bg-[#3db6d9] hover:text-white transition-all duration-200"
                        >
                          Chuyển cho NT
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

      {/* Transfer Dialog */}
      {showDialog && selectedDistribution && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowDialog(false)}>
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto custom-scroll" onClick={(e) => e.stopPropagation()}>
            <style>{`
              .custom-scroll { scrollbar-width: none; -ms-overflow-style: none; }
              .custom-scroll::-webkit-scrollbar { width: 0; height: 0; }
              .custom-scroll::-webkit-scrollbar-track { background: transparent; }
              .custom-scroll::-webkit-scrollbar-thumb { background: transparent; }
            `}</style>
            <div className="bg-gradient-to-r from-[#00b4d8] to-[#48cae4] px-8 py-6 rounded-t-3xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Chuyển giao NFT cho Pharmacy</h2>
                    <p className="text-cyan-100 text-sm">Chọn nhà thuốc và số lượng</p>
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
              {/* Distribution Info */}
              <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-200">
                <div className="font-bold text-cyan-800 mb-3">Thông tin lô hàng:</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Đơn hàng:</span>
                    <span className="font-mono font-medium">
                      {selectedDistribution.manufacturerInvoice?.invoiceNumber 
                        || selectedDistribution.invoice?.invoiceNumber 
                        || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Từ:</span>
                    <span className="font-medium">
                      {selectedDistribution.fromManufacturer?.fullName 
                        || selectedDistribution.fromManufacturer?.username
                        || selectedDistribution.invoice?.fromManufacturer?.fullName
                        || selectedDistribution.invoice?.fromManufacturer?.username
                        || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tổng số NFT:</span>
                    <span className="font-bold text-orange-700">{selectedDistribution.distributedQuantity || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Ngày nhận:</span>
                    <span className="font-medium">
                      {selectedDistribution.distributionDate 
                        ? new Date(selectedDistribution.distributionDate).toLocaleDateString('vi-VN') 
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Select Pharmacy */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Chọn nhà thuốc *</label>
                <select
                  value={formData.pharmacyId}
                  onChange={(e) => setFormData({...formData, pharmacyId: e.target.value})}
                  className="w-full border-2 border-cyan-300 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                >
                  <option value="">-- Chọn pharmacy --</option>
                  {safePharmacies.map(pharm => (
                    <option key={pharm._id} value={pharm._id}>
                      {pharm.name} ({pharm.taxCode})
                    </option>
                  ))}
                </select>
              </div>

              {selectedPharmacy && (
                <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-200">
                  <div className="text-sm font-semibold text-cyan-800 mb-2">🏥 Thông tin nhà thuốc:</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div><span className="text-slate-600">Tên:</span> <span className="font-medium">{selectedPharmacy.name || 'N/A'}</span></div>
                    <div><span className="text-slate-600">Mã số thuế:</span> <span className="font-medium">{selectedPharmacy.taxCode || 'N/A'}</span></div>
                    <div><span className="text-slate-600">Số giấy phép:</span> <span className="font-medium">{selectedPharmacy.licenseNo || 'N/A'}</span></div>
                    <div><span className="text-slate-600">Quốc gia:</span> <span className="font-medium">{selectedPharmacy.country || 'N/A'}</span></div>
                    <div className="md:col-span-2"><span className="text-slate-600">Địa chỉ:</span> <span className="font-medium">{selectedPharmacy.address || 'N/A'}</span></div>
                    <div><span className="text-slate-600">Email liên hệ:</span> <span className="font-medium">{selectedPharmacy.contactEmail || 'N/A'}</span></div>
                    <div><span className="text-slate-600">SĐT liên hệ:</span> <span className="font-medium">{selectedPharmacy.contactPhone || 'N/A'}</span></div>
                    <div className="md:col-span-2"><span className="text-slate-600">Wallet Address:</span> <span className="font-mono text-xs break-all">{selectedPharmacy.walletAddress || selectedPharmacy.user?.walletAddress || 'Chưa có'}</span></div>
                  </div>
                  
                  {selectedPharmacy.user && (
                    <div className="mt-3 pt-3 border-t border-cyan-200">
                      <div className="text-xs font-semibold text-cyan-700 mb-1">👤 Thông tin tài khoản:</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-xs">
                        <div><span className="text-slate-600">Tên:</span> <span className="font-medium">{selectedPharmacy.user.fullName || selectedPharmacy.user.username || 'N/A'}</span></div>
                        <div><span className="text-slate-600">Username:</span> <span className="font-mono">{selectedPharmacy.user.username || 'N/A'}</span></div>
                        <div className="md:col-span-2"><span className="text-slate-600">Email:</span> <span className="font-medium">{selectedPharmacy.user.email || 'N/A'}</span></div>
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
                  max={selectedDistribution.distributedQuantity}
                />
                <div className="text-xs text-cyan-600 mt-1">
                  Tối đa: {selectedDistribution.distributedQuantity} NFT
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
                  ⚠️ Sau khi xác nhận, invoice sẽ được tạo với trạng thái <strong>"draft"</strong>. 
                  Bạn sẽ được hỏi có muốn chuyển NFT on-chain ngay không. Nếu chọn "Cancel", bạn có thể thử lại từ lịch sử chuyển giao sau.
                </div>
              </div>
            </div>

            <div className="px-8 py-6 border-t border-gray-200 bg-gray-50 rounded-b-3xl flex justify-end space-x-3">
              <button
                onClick={() => setShowDialog(false)}
                className="px-6 py-2.5 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium transition"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#00b4d8] to-[#48cae4] text-white font-medium shadow-md hover:shadow-lg disabled:opacity-50 transition"
              >
                {loading ? 'Đang xử lý...' : '✓ Xác nhận chuyển giao'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

