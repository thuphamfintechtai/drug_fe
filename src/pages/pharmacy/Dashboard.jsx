import { useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { getPharmacyNavigationItems } from '../../utils/pharmacyNavigation.jsx';

export default function PharmacyDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const metrics = [
    {
      title: 'Đơn hàng',
      value: '67',
      subtitle: 'Đã nhận',
      detail: 'Đã xác nhận: 64',
      color: 'cyan',
    },
    {
      title: 'Chờ xác nhận',
      value: '9',
      subtitle: 'Đơn hàng',
      detail: 'Từ hôm qua: 4',
      color: 'orange',
    },
    {
      title: 'Proof of Pharmacy',
      value: '52',
      subtitle: 'Đã tạo',
      detail: 'Đã ký: 50',
      color: 'green',
    },
    {
      title: 'Tra cứu',
      value: '128',
      subtitle: 'Lượt tra cứu',
      detail: 'Hôm nay: 15',
      color: 'blue',
    },
  ];

  const navigationItems = getPharmacyNavigationItems(location.pathname);

  return (
    <DashboardLayout metrics={metrics} navigationItems={navigationItems}>
      <div className="space-y-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            Thao tác nhanh
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/pharmacy/proof-of-pharmacy/my')}
              className="p-6 border-2 border-dashed border-cyan-300 hover:border-cyan-500 rounded-xl hover:bg-cyan-50 transition-all group"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📦</div>
              <h3 className="font-semibold text-gray-800 group-hover:text-cyan-700 mb-1">Đơn hàng của tôi</h3>
              <p className="text-sm text-gray-600">Xem và xác nhận đơn hàng</p>
            </button>

            <button
              onClick={() => navigate('/pharmacy/proof-of-pharmacy/stats')}
              className="p-6 border-2 border-dashed border-teal-300 hover:border-teal-500 rounded-xl hover:bg-teal-50 transition-all group"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📊</div>
              <h3 className="font-semibold text-gray-800 group-hover:text-teal-700 mb-1">Xem thống kê</h3>
              <p className="text-sm text-gray-600">Thống kê đơn hàng</p>
            </button>

            <button
              onClick={() => navigate('/pharmacy/nft-tracking')}
              className="p-6 border-2 border-dashed border-blue-300 hover:border-blue-500 rounded-xl hover:bg-blue-50 transition-all group"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🔍</div>
              <h3 className="font-semibold text-gray-800 group-hover:text-blue-700 mb-1">Tra cứu NFT</h3>
              <p className="text-sm text-gray-600">Xem nguồn gốc thuốc</p>
            </button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-2xl shadow-lg border-2 border-cyan-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="font-semibold text-gray-800 text-lg">Xác nhận đơn hàng</h3>
            </div>
            <p className="text-sm text-gray-600">Nhận và xác nhận đơn giao từ nhà phân phối. Kiểm tra chất lượng và số lượng hàng hóa.</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg border-2 border-blue-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="font-semibold text-gray-800 text-lg">Tra cứu nguồn gốc</h3>
            </div>
            <p className="text-sm text-gray-600">Xem thông tin lô hàng và lịch sử truy xuất nguồn gốc thuốc qua NFT blockchain.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
