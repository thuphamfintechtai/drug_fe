import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { getPharmacyStats } from '../../services/pharmacy/proofOfPharmacyService';
import { getPharmacyNavigationItems } from '../../utils/pharmacyNavigation.jsx';

export default function PharmacyProofStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await getPharmacyStats();
      if (response.data && response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigationItems = getPharmacyNavigationItems();

  return (
    <DashboardLayout navigationItems={navigationItems}>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Thống kê Proof of Pharmacy</h1>
              <p className="text-sm text-gray-500">Tổng quan về đơn hàng nhận từ nhà phân phối</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12">
            <div className="flex flex-col items-center">
              <div className="h-12 w-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Đang tải thống kê...</p>
            </div>
          </div>
        ) : stats ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">📦</span>
                  </div>
                </div>
                <div className="text-3xl font-bold text-cyan-600 mb-1">
                  {stats.totalProofs || 0}
                </div>
                <div className="text-sm text-gray-600">Tổng đơn hàng</div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">✅</span>
                  </div>
                </div>
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {stats.confirmedProofs || 0}
                </div>
                <div className="text-sm text-gray-600">Đã xác nhận</div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">⏳</span>
                  </div>
                </div>
                <div className="text-3xl font-bold text-orange-600 mb-1">
                  {stats.pendingProofs || 0}
                </div>
                <div className="text-sm text-gray-600">Chờ xác nhận</div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">📈</span>
                  </div>
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {stats.totalQuantity || 0}
                </div>
                <div className="text-sm text-gray-600">Tổng số lượng</div>
              </div>
            </div>

            {/* Status Breakdown */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="text-2xl">📊</span>
                Phân bố theo trạng thái
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.byStatus && Object.entries(stats.byStatus).map(([status, count]) => {
                  const statusInfo = {
                    pending: { label: 'Chờ xác nhận', color: 'orange', icon: '⏳' },
                    confirmed: { label: 'Đã xác nhận', color: 'green', icon: '✅' },
                    delivered: { label: 'Đã giao', color: 'blue', icon: '🚚' },
                    received: { label: 'Đã nhận', color: 'cyan', icon: '📦' },
                    cancelled: { label: 'Đã hủy', color: 'red', icon: '❌' },
                  };

                  const info = statusInfo[status] || { label: status, color: 'gray', icon: '📄' };

                  return (
                    <div key={status} className="p-4 border-2 border-gray-100 rounded-xl hover:shadow-md transition-all">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{info.icon}</span>
                        <div>
                          <div className="text-2xl font-bold text-gray-800">{count}</div>
                          <div className="text-sm text-gray-600">{info.label}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            {stats.recentProofs && stats.recentProofs.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <span className="text-2xl">🕒</span>
                  Đơn hàng gần đây
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-cyan-600 to-teal-600">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase">Mã đơn</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase">Thuốc</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase">Số lượng</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase">Trạng thái</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase">Ngày tạo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {stats.recentProofs.map((proof, index) => (
                        <tr key={index} className="hover:bg-gradient-to-r hover:from-cyan-50 hover:to-teal-50 transition-all">
                          <td className="px-6 py-4">
                            <span className="font-mono font-semibold text-gray-800">
                              {proof.verificationCode || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {proof.drug?.tradeName || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {proof.deliveredQuantity || 0}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                              proof.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              proof.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {proof.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600 text-sm">
                            {new Date(proof.createdAt).toLocaleDateString('vi-VN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-5xl">📊</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Không có dữ liệu thống kê</h3>
              <p className="text-gray-600">Chưa có đơn hàng nào để hiển thị thống kê</p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

