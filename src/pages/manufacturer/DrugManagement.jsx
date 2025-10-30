import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import { getDrugsByManufacturerId, createDrug } from '../../services/manufacturer/drugService';
import { getManufacturerNavigationItems } from '../../utils/manufacturerNavigation.jsx';

export default function DrugManagement() {
  const { user } = useAuth();
  const location = useLocation();
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
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
    activeIngredients: []
  });

  const loadDrugs = async () => {
    setLoading(true);
    try {
      // Gọi API theo manufacturer id lấy từ user đăng nhập
      const response = await getDrugsByManufacturerId(user._id);
      if (response.success) {
        setDrugs(response.data.drugs || response.data || []);
      }
    } catch (error) {
      console.error('Error loading drugs:', error);
      alert('Không thể tải danh sách thuốc');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrugs();
  }, []);

  const handleCreateDrug = async () => {
    try {
      setLoading(true);
      const response = await createDrug(formData);
      
      if (response.success) {
        alert('Tạo thuốc thành công!');
        setShowCreateDialog(false);
        resetForm();
        loadDrugs();
      }
    } catch (error) {
      console.error('Error creating drug:', error);
      alert('Không thể tạo thuốc: ' + (error.response?.data?.message || error.message));
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
      activeIngredients: []
    });
  };

  const navigationItems = getManufacturerNavigationItems();

  return (
    <DashboardLayout navigationItems={navigationItems}>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">💊</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Quản lý thuốc</h1>
                <p className="text-sm text-gray-500">Danh sách thuốc của công ty</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateDialog(true)}
              className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              <span>Tạo thuốc mới</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 flex flex-col items-center">
              <div className="h-10 w-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Đang tải...</p>
            </div>
          ) : drugs.length === 0 ? (
            <div className="p-12 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-5xl">💊</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Chưa có thuốc nào</h3>
              <p className="text-gray-600 mb-4">Hãy tạo thuốc đầu tiên của bạn</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-cyan-600 to-teal-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase">Tên thương mại</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase">Tên hoạt chất</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase">Mã ATC</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase">Dạng bào chế</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase">Hàm lượng</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {drugs.map((drug, index) => (
                    <tr key={drug._id || index} className="hover:bg-gradient-to-r hover:from-cyan-50 hover:to-teal-50 transition-all duration-200 group">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-800 group-hover:text-cyan-700">{drug.tradeName}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{drug.genericName}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-mono font-semibold bg-cyan-100 text-cyan-800 group-hover:bg-cyan-200">
                          {drug.atcCode}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{drug.dosageForm}</td>
                      <td className="px-6 py-4 text-gray-700">{drug.strength}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          drug.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {drug.status === 'active' ? '✓ Hoạt động' : '✗ Ngừng'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-cyan-600 to-teal-600 px-8 py-6 rounded-t-3xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">💊</span>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Tạo thuốc mới</h2>
                    <p className="text-cyan-100 text-sm">Điền thông tin thuốc</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateDialog(false)}
                  className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center text-white text-xl"
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
                    className="w-full border-2 border-cyan-300 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500"
                    placeholder="VD: Paracetamol 500mg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tên hoạt chất *</label>
                  <input
                    type="text"
                    value={formData.genericName}
                    onChange={(e) => setFormData({...formData, genericName: e.target.value})}
                    className="w-full border-2 border-cyan-300 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500"
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
                    className="w-full border-2 border-cyan-300 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500"
                    placeholder="VD: N02BE01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Dạng bào chế *</label>
                  <input
                    type="text"
                    value={formData.dosageForm}
                    onChange={(e) => setFormData({...formData, dosageForm: e.target.value})}
                    className="w-full border-2 border-cyan-300 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500"
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
                    className="w-full border-2 border-cyan-300 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500"
                    placeholder="VD: 500mg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Đường dùng *</label>
                  <input
                    type="text"
                    value={formData.route}
                    onChange={(e) => setFormData({...formData, route: e.target.value})}
                    className="w-full border-2 border-cyan-300 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500"
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
                    className="w-full border-2 border-cyan-300 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500"
                    placeholder="VD: Hộp 10 vỉ x 10 viên"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Bảo quản *</label>
                  <input
                    type="text"
                    value={formData.storage}
                    onChange={(e) => setFormData({...formData, storage: e.target.value})}
                    className="w-full border-2 border-cyan-300 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500"
                    placeholder="VD: Nơi khô ráo, tránh ánh sáng"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cảnh báo</label>
                <textarea
                  value={formData.warnings}
                  onChange={(e) => setFormData({...formData, warnings: e.target.value})}
                  className="w-full border-2 border-purple-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-500"
                  rows="3"
                  placeholder="Cảnh báo đặc biệt khi sử dụng thuốc..."
                />
              </div>
            </div>

            <div className="px-8 py-6 border-t border-gray-200 bg-gray-50 rounded-b-3xl flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateDialog(false)}
                className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-100 font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateDrug}
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white font-medium shadow-lg disabled:opacity-50"
              >
                {loading ? 'Đang tạo...' : 'Tạo thuốc'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

