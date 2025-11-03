import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  getDrugs,
  addDrug, 
  updateDrug, 
  deleteDrug, 
  searchDrugByATC 
} from '../../services/manufacturer/manufacturerService';

export default function DrugManagement() {
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [searchAtc, setSearchAtc] = useState('');
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
    { path: '/manufacturer/drugs', label: 'Quản lý thuốc', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>), active: true },
    { path: '/manufacturer/production', label: 'Sản xuất thuốc', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>), active: false },
    { path: '/manufacturer/transfer', label: 'Chuyển giao', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>), active: false },
    { path: '/manufacturer/production-history', label: 'Lịch sử sản xuất', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>), active: false },
    { path: '/manufacturer/transfer-history', label: 'Lịch sử chuyển giao', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>), active: false },
    { path: '/manufacturer/profile', label: 'Hồ sơ', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>), active: false },
  ];

  useEffect(() => {
    loadDrugs();
  }, []);

  const loadDrugs = async () => {
    setLoading(true);
    try {
      const response = await getDrugs();
      if (response.data.success) {
        setDrugs(response.data.data.drugs || []);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách thuốc:', error);
      alert('Không thể tải danh sách thuốc');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchAtc.trim()) {
      loadDrugs();
      return;
    }

    setLoading(true);
    try {
      const response = await searchDrugByATC(searchAtc);
      if (response.data.success) {
        setDrugs(response.data.data || []);
      }
    } catch (error) {
      console.error('Lỗi khi tìm kiếm:', error);
      alert('Không thể tìm kiếm thuốc');
    } finally {
      setLoading(false);
    }
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
    try {
      setLoading(true);
      
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
      setLoading(false);
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

  const fadeUp = {
    hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <DashboardLayout navigationItems={navigationItems}>
      {/* Banner */}
      <motion.section
        className="relative overflow-hidden rounded-2xl mb-6 border border-[#90e0ef33] shadow-[0_10px_30px_rgba(0,0,0,0.06)] bg-gradient-to-tr from-[#00b4d8] via-[#48cae4] to-[#90e0ef]"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.25),transparent_55%)]" />
        <div className="relative px-6 py-8 md:px-10 md:py-12 text-white">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight drop-shadow-sm">Quản lý thuốc</h1>
          <p className="text-white/90 mt-2">Thêm, sửa, xóa và tìm kiếm thuốc</p>
        </div>
      </motion.section>

      {/* Search & Create */}
      <motion.div
        className="rounded-2xl bg-white/85 backdrop-blur-xl border border-[#90e0ef55] shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-5 mb-5"
        variants={fadeUp}
        initial="hidden"
        animate="show"
      >
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 flex gap-3">
            <input
              value={searchAtc}
              onChange={e => setSearchAtc(e.target.value)}
              placeholder="Tìm kiếm theo mã ATC code..."
              className="flex-1 border border-[#90e0ef55] bg-white/60 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#48cae4] focus:border-[#48cae4] transition"
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00b4d8] to-[#48cae4] text-white font-medium shadow-lg hover:shadow-xl transition"
            >
              🔍 Tìm kiếm
            </button>
            <button
              onClick={() => { setSearchAtc(''); loadDrugs(); }}
              className="px-4 py-2.5 rounded-xl border border-[#90e0ef55] text-slate-700 hover:bg-[#90e0ef22] transition"
            >
              ↻ Reset
            </button>
          </div>
          <button
            onClick={handleCreate}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium shadow-lg hover:shadow-xl transition flex items-center gap-2 whitespace-nowrap"
          >
            <span className="text-lg">+</span>
            <span>Tạo thuốc mới</span>
          </button>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        className="bg-white/90 rounded-2xl border border-[#90e0ef55] shadow-[0_10px_30px_rgba(0,0,0,0.06)] overflow-hidden"
        variants={fadeUp}
        initial="hidden"
        animate="show"
      >
        {loading ? (
          <div className="p-12 text-center text-slate-600">Đang tải...</div>
        ) : drugs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-5xl mb-4">💊</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Chưa có thuốc nào</h3>
            <p className="text-slate-600">Hãy tạo thuốc đầu tiên của bạn</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#00b4d8] to-[#48cae4]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase">Tên thương mại</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase">Tên hoạt chất</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase">Mã ATC</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase">Dạng bào chế</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase">Hàm lượng</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase">Trạng thái</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-white uppercase">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {drugs.map((drug, index) => (
                  <tr key={drug._id || index} className="hover:bg-[#f5fcff] transition group">
                    <td className="px-6 py-4 font-semibold text-[#003544]">{drug.tradeName}</td>
                    <td className="px-6 py-4 text-slate-700">{drug.genericName}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-mono font-semibold bg-cyan-100 text-cyan-800">
                        {drug.atcCode}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{drug.dosageForm}</td>
                    <td className="px-6 py-4 text-slate-700">{drug.strength}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        drug.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {drug.status === 'active' ? '✓ Active' : '✗ Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(drug)}
                          className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 text-sm font-medium transition"
                        >
                          ✏️ Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(drug._id)}
                          className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 text-sm font-medium transition"
                        >
                          🗑️ Xóa
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

      {/* Create/Edit Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowDialog(false)}>
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-[#00b4d8] to-[#48cae4] px-8 py-6 rounded-t-3xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">💊</span>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{isEditMode ? 'Cập nhật thuốc' : 'Tạo thuốc mới'}</h2>
                    <p className="text-cyan-100 text-sm">Điền thông tin thuốc</p>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tên thương mại *</label>
                  <input
                    type="text"
                    value={formData.tradeName}
                    onChange={(e) => setFormData({...formData, tradeName: e.target.value})}
                    className="w-full border-2 border-cyan-300 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    placeholder="VD: Paracetamol 500mg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tên hoạt chất *</label>
                  <input
                    type="text"
                    value={formData.genericName}
                    onChange={(e) => setFormData({...formData, genericName: e.target.value})}
                    className="w-full border-2 border-cyan-300 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    placeholder="VD: Paracetamol"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Mã ATC *</label>
                  <input
                    type="text"
                    value={formData.atcCode}
                    onChange={(e) => setFormData({...formData, atcCode: e.target.value})}
                    className="w-full border-2 border-cyan-300 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    placeholder="VD: N02BE01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Dạng bào chế *</label>
                  <input
                    type="text"
                    value={formData.dosageForm}
                    onChange={(e) => setFormData({...formData, dosageForm: e.target.value})}
                    className="w-full border-2 border-cyan-300 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    placeholder="VD: Viên nén"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Hàm lượng *</label>
                  <input
                    type="text"
                    value={formData.strength}
                    onChange={(e) => setFormData({...formData, strength: e.target.value})}
                    className="w-full border-2 border-cyan-300 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    placeholder="VD: 500mg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Đường dùng *</label>
                  <input
                    type="text"
                    value={formData.route}
                    onChange={(e) => setFormData({...formData, route: e.target.value})}
                    className="w-full border-2 border-cyan-300 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    placeholder="VD: Uống"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Quy cách đóng gói *</label>
                  <input
                    type="text"
                    value={formData.packaging}
                    onChange={(e) => setFormData({...formData, packaging: e.target.value})}
                    className="w-full border-2 border-cyan-300 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    placeholder="VD: Hộp 10 vỉ x 10 viên"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Bảo quản *</label>
                  <input
                    type="text"
                    value={formData.storage}
                    onChange={(e) => setFormData({...formData, storage: e.target.value})}
                    className="w-full border-2 border-cyan-300 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    placeholder="VD: Nơi khô ráo, tránh ánh sáng"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cảnh báo</label>
                <textarea
                  value={formData.warnings}
                  onChange={(e) => setFormData({...formData, warnings: e.target.value})}
                  className="w-full border-2 border-purple-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  rows="3"
                  placeholder="Cảnh báo đặc biệt khi sử dụng thuốc..."
                />
              </div>
            </div>

            <div className="px-8 py-6 border-t border-gray-200 bg-gray-50 rounded-b-3xl flex justify-end space-x-3">
              <button
                onClick={() => setShowDialog(false)}
                className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-100 font-medium transition"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00b4d8] to-[#48cae4] text-white font-medium shadow-lg hover:shadow-xl disabled:opacity-50 transition"
              >
                {loading ? 'Đang lưu...' : isEditMode ? 'Cập nhật' : 'Tạo thuốc'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
