import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { getDistributionStats } from '../../services/distributor/proofService';

export default function DistributorDashboard() {
  const [stats, setStats] = useState({
    totalDistributions: 0,
    confirmedDistributions: 0,
    pendingDistributions: 0,
    totalQuantity: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await getDistributionStats();
      if (response.success) {
        const data = response.data;
        setStats({
          totalDistributions: data.totalDistributions || 0,
          confirmedDistributions: data.statusBreakdown?.find(s => s._id === 'confirmed')?.count || 0,
          pendingDistributions: data.statusBreakdown?.find(s => s._id === 'pending')?.count || 0,
          totalQuantity: data.totalQuantity || 0,
        });
      }
    } catch (error) {
      console.error('Error loading distributor stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const metrics = [
    {
      title: 'Tổng phân phối',
      value: loading ? '...' : stats.totalDistributions.toString(),
      subtitle: 'Đã tạo',
      detail: `Đã xác nhận: ${stats.confirmedDistributions}`,
      color: 'cyan',
    },
    {
      title: 'Chờ xử lý',
      value: loading ? '...' : stats.pendingDistributions.toString(),
      subtitle: 'Lô hàng',
      detail: 'Cần xác nhận',
      color: 'orange',
    },
    {
      title: 'Đã xác nhận',
      value: loading ? '...' : stats.confirmedDistributions.toString(),
      subtitle: 'Lô hàng',
      detail: 'Hoàn tất',
      color: 'green',
    },
    {
      title: 'Tổng số lượng',
      value: loading ? '...' : stats.totalQuantity.toString(),
      subtitle: 'Sản phẩm',
      detail: 'Đã phân phối',
      color: 'blue',
    },
  ];

  const navigationItems = [
    {
      path: '/distributor',
      label: 'Trang chủ',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      active: true,
    },
    {
      path: '#',
      label: 'Proof of Distribution',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      active: false,
    },
    {
      path: '#',
      label: 'Theo dõi vận chuyển',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      active: false,
    },
    {
      path: '#',
      label: 'Quản lý NFT',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      active: false,
    },
  ];

  return (
    <DashboardLayout metrics={metrics} navigationItems={navigationItems}>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Quản lý phân phối</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Proof of Distribution</h3>
            <p className="text-sm text-gray-600">Nhận và chuyển giao lô hàng từ nhà sản xuất đến nhà thuốc.</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Theo dõi vận chuyển</h3>
            <p className="text-sm text-gray-600">Cập nhật trạng thái và tracking lô hàng trong quá trình vận chuyển.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
