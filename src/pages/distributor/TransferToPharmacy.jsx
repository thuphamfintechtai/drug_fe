import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  getDistributionHistory,
  getPharmacies,
  transferToPharmacy
} from '../../services/distributor/distributorService';

export default function TransferToPharmacy() {
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

  const handleSelectDistribution = (dist) => {
    console.log('Selected distribution:', dist);
    setSelectedDistribution(dist);
    setFormData({
      distributionId: dist._id,
      pharmacyId: '',
      quantity: dist.distributedQuantity?.toString() || '',
      notes: '',
    });
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    if (!formData.pharmacyId || !formData.quantity) {
      alert('Vui lòng chọn nhà thuốc và nhập số lượng');
      return;
    }

    if (parseInt(formData.quantity) <= 0 || parseInt(formData.quantity) > selectedDistribution.distributedQuantity) {
      alert('Số lượng không hợp lệ');
      return;
    }

    setLoading(true);
    try {
      const response = await transferToPharmacy({
        ...formData,
        quantity: parseInt(formData.quantity),
      });

      if (response.data.success) {
        alert('✅ Tạo yêu cầu chuyển giao thành công!\n\nTrạng thái: Pending\n\nBước tiếp theo: Gọi smart contract để chuyển quyền sở hữu NFT cho pharmacy.');
        setShowDialog(false);
        loadData();
      }
    } catch (error) {
      console.error('Lỗi khi tạo chuyển giao:', error);
      alert('❌ Không thể tạo chuyển giao: ' + (error.response?.data?.message || error.message));
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
              <div className="font-semibold text-slate-800">Xác nhận trên hệ thống</div>
              <div className="text-sm text-slate-600">Frontend gọi API Backend để lưu vào database với trạng thái "pending"</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 font-bold flex items-center justify-center flex-shrink-0">3</div>
            <div>
              <div className="font-semibold text-slate-800">Chuyển quyền sở hữu NFT</div>
              <div className="text-sm text-slate-600">Frontend gọi Smart Contract để transfer NFT từ Distributor wallet → Pharmacy wallet</div>
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
                  ⚠️ Sau khi xác nhận, yêu cầu chuyển giao sẽ được lưu với trạng thái <strong>"pending"</strong>. 
                  Bước tiếp theo cần gọi smart contract để chuyển quyền sở hữu NFT.
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

