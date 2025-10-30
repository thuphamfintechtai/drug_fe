import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import { getMyProofs } from '../../services/manufacturer/proofService';
import { getMyNFTs } from '../../services/manufacturer/nftService';
import { getDrugsByManufacturerId } from '../../services/manufacturer/drugService';
import { getManufacturerNavigationItems } from '../../utils/manufacturerNavigation.jsx';

export default function ManufacturerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [stats, setStats] = useState({
    totalProofs: 0,
    totalNFTs: 0,
    totalDrugs: 0,
    recentProofs: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [proofsRes, nftsRes, drugsRes] = await Promise.allSettled([
        getMyProofs(1, 5),
        getMyNFTs(),
        getDrugsByManufacturerId(user._id)
      ]);

      const totalProofs = proofsRes.status === 'fulfilled' ? (proofsRes.value.data?.pagination?.total || 0) : 0;
      const recentProofs = proofsRes.status === 'fulfilled' ? (proofsRes.value.data?.proofs || []) : [];
      const totalNFTs = nftsRes.status === 'fulfilled' ? (nftsRes.value.data?.nfts?.length || 0) : 0;
      const totalDrugs = drugsRes.status === 'fulfilled' ? (drugsRes.value.data?.drugs?.length || 0) : 0;

      setStats({
        totalProofs,
        totalNFTs,
        totalDrugs,
        recentProofs
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const metrics = [
    {
      title: 'Proof of Production',
      value: loading ? '...' : stats.totalProofs.toString(),
      subtitle: 'Đã tạo',
      detail: 'Chứng nhận sản xuất',
      color: 'cyan',
      icon: '📦',
      onClick: () => navigate('/manufacturer/proofs')
    },
    {
      title: 'NFT',
      value: loading ? '...' : stats.totalNFTs.toString(),
      subtitle: 'Đã mint',
      detail: 'NFT hoạt động',
      color: 'cyan',
      icon: '🎨',
      onClick: () => navigate('/manufacturer/nfts')
    },
    {
      title: 'Thuốc',
      value: loading ? '...' : stats.totalDrugs.toString(),
      subtitle: 'Đã đăng ký',
      detail: 'Sản phẩm',
      color: 'green',
      icon: '💊',
      onClick: () => navigate('/manufacturer/drugs')
    },
    {
      title: 'Nhà sản xuất',
      value: user?.fullName || user?.username || 'N/A',
      subtitle: 'Tài khoản',
      detail: 'Đang hoạt động',
      color: 'blue',
      icon: '🏭',
      isText: true
    },
  ];

  const navigationItems = getManufacturerNavigationItems(location.pathname);

  return (
    <DashboardLayout 
      metrics={metrics.map(m => ({...m, onClick: m.onClick}))} 
      navigationItems={navigationItems}
    >
      <div className="space-y-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>⚡</span> Thao tác nhanh
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/manufacturer/proofs/create')}
              className="p-6 border-2 border-dashed border-cyan-300 hover:border-cyan-500 rounded-xl hover:bg-cyan-50 transition-all group"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🏭</div>
              <h3 className="font-semibold text-gray-800 group-hover:text-cyan-700 mb-1">Tạo Proof of Production</h3>
              <p className="text-sm text-gray-600">Tạo chứng nhận sản xuất và mint NFT</p>
            </button>

            <button
              onClick={() => navigate('/manufacturer/drugs')}
              className="p-6 border-2 border-dashed border-cyan-300 hover:border-cyan-500 rounded-xl hover:bg-cyan-50 transition-all group"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">💊</div>
              <h3 className="font-semibold text-gray-800 group-hover:text-cyan-700 mb-1">Quản lý thuốc</h3>
              <p className="text-sm text-gray-600">Thêm và quản lý danh sách thuốc</p>
            </button>

            <button
              onClick={() => navigate('/manufacturer/nfts')}
              className="p-6 border-2 border-dashed border-teal-300 hover:border-teal-500 rounded-xl hover:bg-teal-50 transition-all group"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🎨</div>
              <h3 className="font-semibold text-gray-800 group-hover:text-teal-700 mb-1">Xem NFT</h3>
              <p className="text-sm text-gray-600">Quản lý NFT đã tạo</p>
            </button>
          </div>
        </div>

        {/* Recent Proofs */}
        {stats.recentProofs.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span>📋</span> Proof gần đây
              </h2>
              <button
                onClick={() => navigate('/manufacturer/proofs')}
                className="text-cyan-600 hover:text-cyan-700 font-semibold text-sm"
              >
                Xem tất cả →
              </button>
            </div>
            <div className="space-y-3">
              {stats.recentProofs.map((proof, idx) => (
                <div
                  key={proof._id || idx}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-all"
                  onClick={() => navigate(`/manufacturer/proofs/${proof._id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">{idx + 1}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{proof.drug?.tradeName || proof.drugName || 'N/A'}</div>
                      <div className="text-sm text-gray-500">Batch: {proof.batchNumber || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-800">{proof.quantity?.toLocaleString() || 0}</div>
                    <div className="text-sm text-gray-500">viên</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
