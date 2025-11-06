import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import TruckLoader from '../../components/TruckLoader';
import { 
  getDrugs,
  addDrug, 
  updateDrug, 
  deleteDrug, 
  searchDrugByATC 
} from '../../services/manufacturer/manufacturerService';

export default function DrugManagement() {
  const [drugs, setDrugs] = useState([]);
  const [allDrugs, setAllDrugs] = useState([]); // lưu toàn bộ để lọc client
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [searchAtc, setSearchAtc] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const progressIntervalRef = useRef(null);
  const [submitting, setSubmitting] = useState(false); // FIX: Separate state
  
  const [formData, setFormData] = useState({
    tradeName: '',
    genericName: '',
    atcCode: '',
    dosageForm: '',
    strength: '',
    route: '',
    packaging: '',
    storage: '',
    warnings: '',
    activeIngredients: [],
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
    loadDrugs();
    
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // FIX: Extract common loading logic
  const animateProgress = async () => {
    setLoadingProgress(0);
    
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    progressIntervalRef.current = setInterval(() => {
      setLoadingProgress(prev => Math.min(prev + 0.02, 0.9));
    }, 50);
  };

  const completeProgress = async () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    
    setLoadingProgress(1);
    await new Promise(resolve => setTimeout(resolve, 300));
  };

  const resetProgress = () => {
    setTimeout(() => setLoadingProgress(0), 500);
  };

  const loadDrugs = async () => {
    try {
      setLoading(true);
      animateProgress();
      
      const response = await getDrugs();
      
      await completeProgress();
      
      if (response.data.success) {
        const list = response.data.data.drugs || [];
        setDrugs(list);
        setAllDrugs(list);
      }
    } catch (error) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      console.error('Lỗi khi tải danh sách thuốc:', error);
      alert('Không thể tải danh sách thuốc');
    } finally {
      setLoading(false);
      resetProgress();
    }
  };

  const handleSearch = async () => {
    const term = searchAtc.trim().toLowerCase();
    if (!term) {
      setDrugs(allDrugs);
      return;
    }
    // Lọc client theo Tên thương mại | Tên hoạt chất | Mã ATC
    const filtered = (allDrugs || []).filter(d => {
      const trade = (d.tradeName || '').toLowerCase();
      const generic = (d.genericName || '').toLowerCase();
      const atc = (d.atcCode || '').toLowerCase();
      return trade.includes(term) || generic.includes(term) || atc.includes(term);
    });
    setDrugs(filtered);
  };

  const handleCreate = () => {
    setIsEditMode(false);
    setSelectedDrug(null);
    resetForm();
    setShowDialog(true);
  };

  const handleEdit = (drug) => {
    setIsEditMode(true);
    setSelectedDrug(drug);
    setFormData({
      tradeName: drug.tradeName || '',
      genericName: drug.genericName || '',
      atcCode: drug.atcCode || '',
      dosageForm: drug.dosageForm || '',
      strength: drug.strength || '',
      route: drug.route || '',
      packaging: drug.packaging || '',
      storage: drug.storage || '',
      warnings: drug.warnings || '',
      activeIngredients: drug.activeIngredients || [],
    });
    setShowDialog(true);
  };

  const handleDelete = async (drugId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa thuốc này?')) {
      return;
    }

    try {
      const response = await deleteDrug(drugId);
      if (response.data.success) {
        alert('Xóa thuốc thành công!');
        loadDrugs();
      }
    } catch (error) {
      console.error('Lỗi khi xóa thuốc:', error);
      alert('Không thể xóa thuốc: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleSubmit = async () => {
    if (submitting) return; // Prevent double submission
    
    try {
      setSubmitting(true);
      
      if (isEditMode && selectedDrug) {
        const response = await updateDrug(selectedDrug._id, formData);
        if (response.data.success) {
          alert('Cập nhật thuốc thành công!');
        }
      } else {
        const response = await addDrug(formData);
        if (response.data.success) {
          alert('Tạo thuốc thành công!');
        }
      }
      
      setShowDialog(false);
      resetForm();
      loadDrugs();
    } catch (error) {
      console.error('Lỗi khi lưu thuốc:', error);
      alert('Không thể lưu thuốc: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      tradeName: '',
      genericName: '',
      atcCode: '',
      dosageForm: '',
      strength: '',
      route: '',
      packaging: '',
      storage: '',
      warnings: '',
      activeIngredients: [],
    });
  };

  return (
    <DashboardLayout navigationItems={navigationItems}>
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="w-full max-w-2xl">
            <TruckLoader height={72} progress={loadingProgress} showTrack />
          </div>
          <div className="text-lg text-slate-600 mt-6">Đang tải dữ liệu...</div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Banner */}
          <div className="bg-white rounded-2xl border border-cyan-200 shadow-sm p-6">
            <h1 className="text-xl md:text-2xl font-semibold text-[#007b91] flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#00a3c4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              Quản lý thuốc
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Thêm, sửa, xóa và tìm kiếm thuốc trong hệ thống
            </p>
          </div>

          {/* Search & Create */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
                </svg>
              </span>

              <input
                type="text"
                value={searchAtc}
                onChange={e => setSearchAtc(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Tìm theo tên thương mại, tên hoạt chất, mã ATC..."
                className="w-full h-12 pl-11 pr-32 rounded-full border border-gray-200 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#48cae4] transition"
              />

              <button
              style={{ color: "white" }}
                onClick={handleSearch}
                className="absolute right-1 top-1 bottom-1 px-6 rounded-full bg-[#3db6d9] hover:bg-[#2fa2c5] text-white font-medium transition"
              >
                Tìm kiếm
              </button>
            </div>

            <button
              onClick={() => { setSearchAtc(''); loadDrugs(); }}
              className="px-4 py-2.5 rounded-full border border-gray-300 text-slate-700 hover:bg-gray-50 transition"
            >
              ↻ Reset
            </button>

            <button
              onClick={handleCreate}
              style={{ color: "white" }}
              className="px-4 py-2.5 rounded-full bg-[#3db6d9] hover:bg-[#2fa2c5] font-medium transition"
            >
              Tạo thuốc mới
            </button>

          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-cyan-100 shadow-sm overflow-hidden">
            {drugs.length === 0 ? (
              <div className="p-16 flex flex-col items-center justify-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mb-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M5 10h14M4 14h16M6 18h12" />
                </svg>
                <p className="text-gray-500 text-sm">Không có dữ liệu</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tên thương mại</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tên hoạt chất</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Mã ATC</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Dạng bào chế</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Hàm lượng</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Trạng thái</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Hành động</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {drugs.map((drug, index) => (
                      <tr key={drug._id || index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-800">{drug.tradeName}</td>
                        <td className="px-6 py-4 text-gray-600">{drug.genericName}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-cyan-50 text-cyan-700 border border-cyan-100">
                            {drug.atcCode}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{drug.dosageForm}</td>
                        <td className="px-6 py-4 text-gray-600">{drug.strength}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            drug.status === "active"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              : "bg-rose-50 text-rose-600 border border-rose-100"
                          }`}>
                            {drug.status === "active" ? "Hoạt động" : "Không hoạt động"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                          <button
                              onClick={() => handleEdit(drug)}
                              className="px-4 py-2 border-2 border-[#3db6d9] rounded-full font-semibold !text-[#3db6d9] hover:!text-white hover:bg-[#3db6d9] transition-all duration-200"
                            >
                              Sửa
                            </button>

                            <button
                            onClick={() => handleDelete(drug._id)}
                            className="px-4 py-2 border-2 border-red-500 rounded-full font-semibold !text-red-500 bg-red-50 hover:bg-red-500 hover:!text-white transition-all duration-200"
                          >
                            Xóa
                          </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create/Edit Dialog */}
      {showDialog && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    onClick={() => setShowDialog(false)}
  >
    <div
      className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto custom-scroll"
      onClick={(e) => e.stopPropagation()}
    >
      <style>{`
        .custom-scroll { scrollbar-width: none; -ms-overflow-style: none; }
        .custom-scroll::-webkit-scrollbar { width: 0; height: 0; }
      `}</style>

      {/* Header */}
      <div className="bg-gradient-to-r from-[#00b4d8] to-[#48cae4] px-8 py-6 rounded-t-3xl flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {isEditMode ? "Cập nhật thuốc" : "Tạo thuốc mới"}
          </h2>
          <p className="text-gray-100 text-sm">Vui lòng nhập thông tin thuốc bên dưới</p>
        </div>
        <button
          onClick={() => setShowDialog(false)}
          className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white text-xl transition"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="p-8 space-y-4">
        <div className="grid grid-cols-2 gap-6">
          <InputField
            label="Tên thương mại"
            placeholder="VD: Vitamin A, ..."
            value={formData.tradeName}
            onChange={(v) => setFormData({ ...formData, tradeName: v })}
          />
          <InputField
            label="Tên hoạt chất"
            placeholder="VD: Khoáng chất a, ..."
            value={formData.genericName}
            onChange={(v) => setFormData({ ...formData, genericName: v })}
          />
          <InputField
            label="Mã ATC"
            placeholder="VD: N1A65E03, ..."
            value={formData.atcCode}
            onChange={(v) => setFormData({ ...formData, atcCode: v })}
          />
          <InputField
            label="Dạng bào chế"
            placeholder="VD: Viên nén, ..."
            value={formData.dosageForm}
            onChange={(v) => setFormData({ ...formData, dosageForm: v })}
          />
          <InputField
            label="Hàm lượng"
            placeholder="VD: 500mg, ..."
            value={formData.strength}
            onChange={(v) => setFormData({ ...formData, strength: v })}
          />
          <InputField
            label="Đường dùng"
            placeholder="VD: Uống, ..."
            value={formData.route}
            onChange={(v) => setFormData({ ...formData, route: v })}
          />
          <InputField
            label="Quy cách đóng gói"
            placeholder="VD: Hộp 10 vỉ x 10 viên, ..."
            value={formData.packaging}
            onChange={(v) => setFormData({ ...formData, packaging: v })}
          />
          <InputField
            label="Bảo quản"
            placeholder="VD: Để nơi khô ráo, ..."
            value={formData.storage}
            onChange={(v) => setFormData({ ...formData, storage: v })}
          />
        </div>

        {/* Divider */}
        <div className="flex items-center justify-center gap-3 mt-4">
          <hr className="flex-1 border-gray-300" />
          <span className="text-gray-500 text-sm">Tùy chọn</span>
          <hr className="flex-1 border-gray-300" />
        </div>

        {/* Textarea */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Cảnh báo</label>
          <textarea
            value={formData.warnings}
            onChange={(e) => setFormData({ ...formData, warnings: e.target.value })}
            rows="3"
            className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-gray-400 focus:outline-none hover:border-gray-400 hover:shadow-sm transition-all duration-150"
            placeholder="VD: Không dùng cho trẻ em dưới 2 tuổi ..."
          />
        </div>
      </div>

      {/* Footer */}
      <div className="px-8 py-6 border-t border-gray-300 bg-gray-50 rounded-b-3xl flex justify-end">
        <button
        style={{ color: "white" }}
          onClick={handleSubmit}
          disabled={submitting}
          className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#00b4d8] to-[#48cae4] text-white font-medium shadow-md hover:shadow-lg disabled:opacity-50 transition-all duration-200"
        >
          {submitting ? "Đang lưu..." : isEditMode ? "Cập nhật" : "Tạo thuốc"}
        </button>
      </div>
    </div>
  </div>
)}

    </DashboardLayout>
  );
}

function InputField({ label, placeholder, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-gray-400 focus:outline-none hover:border-gray-400 hover:shadow-sm transition-all duration-150"
      />
    </div>
  );
}