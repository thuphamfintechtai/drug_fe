import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { getDistributionStats } from '../../services/distributor/proofService';
import { getDistributorNavigationItems } from '../../utils/distributorNavigation';
import { useNavigate } from 'react-router-dom';

export default function DistributorDashboard() {
  const [stats, setStats] = useState({
    totalDistributions: 0,
    confirmedDistributions: 0,
    pendingDistributions: 0,
    totalQuantity: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await getDistributionStats();
      if (response.success || response.data) {
        const data = response.data?.data || response.data || {};
        setStats({
          totalDistributions: data.totalDistributions || data.total || 0,
          confirmedDistributions:
            data.statusBreakdown?.find((s) => s._id === 'confirmed')?.count ||
            data.confirmed || 0,
          pendingDistributions:
            data.statusBreakdown?.find((s) => s._id === 'pending')?.count ||
            data.pending || 0,
          totalQuantity: data.totalQuantity || data.quantity || 0,
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

  const navigationItems = getDistributorNavigationItems();

  return (
    <DashboardLayout metrics={metrics} navigationItems={navigationItems}>
      {/* Banner hiện đại */}
      <section className="relative overflow-hidden rounded-2xl border border-[#90e0ef33] shadow-[0_10px_30px_rgba(0,0,0,0.06)] bg-gradient-to-tr from-[#00b4d8] via-[#48cae4] to-[#90e0ef]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.25),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-white/30 blur-xl animate-float-slow" />
          <div className="absolute top-8 right-6 w-16 h-8 rounded-full bg-white/25 blur-md rotate-6 animate-float-slower" />
        </div>
        <div className="relative px-6 py-8 md:px-10 md:py-12 text-white">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight drop-shadow-sm">
            Trang chủ Nhà phân phối
          </h1>
          <p className="mt-2 text-white/90">
            Quản lý đơn hàng, phân phối và hóa đơn một cách hiệu quả.
          </p>
        </div>
      </section>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <button
          onClick={() => navigate('/distributor/distributions')}
          className="group relative rounded-2xl border border-[#90e0ef55] bg-white/80 backdrop-blur-xl p-6 shadow-[0_10px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_14px_36px_rgba(0,0,0,0.08)] transition-all duration-300 text-left"
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#90e0ef0f] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00b4d8] to-[#90e0ef] shadow-lg mb-4 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#003544] mb-2">
              Đơn nhận từ NSX
            </h3>
            <p className="text-sm text-[#003544]/70">
              Xem và xác nhận các đơn hàng nhận từ nhà sản xuất.
            </p>
          </div>
        </button>

        <button
          onClick={() => navigate('/distributor/create-proof')}
          className="group relative rounded-2xl border border-[#90e0ef55] bg-white/80 backdrop-blur-xl p-6 shadow-[0_10px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_14px_36px_rgba(0,0,0,0.08)] transition-all duration-300 text-left"
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#90e0ef0f] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00b4d8] to-[#90e0ef] shadow-lg mb-4 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#003544] mb-2">
              Tạo đơn giao hàng
            </h3>
            <p className="text-sm text-[#003544]/70">
              Tạo đơn giao hàng mới cho nhà thuốc.
            </p>
          </div>
        </button>

        <button
          onClick={() => navigate('/distributor/invoices')}
          className="group relative rounded-2xl border border-[#90e0ef55] bg-white/80 backdrop-blur-xl p-6 shadow-[0_10px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_14px_36px_rgba(0,0,0,0.08)] transition-all duration-300 text-left"
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#90e0ef0f] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00b4d8] to-[#90e0ef] shadow-lg mb-4 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#003544] mb-2">
              Hóa đơn thương mại
            </h3>
            <p className="text-sm text-[#003544]/70">
              Quản lý và xem các hóa đơn đã tạo.
            </p>
          </div>
        </button>
      </div>

      <style>{`
        @keyframes float-slow { 0%,100% { transform: translateY(0) } 50% { transform: translateY(10px) } }
        @keyframes float-slower { 0%,100% { transform: translateY(0) } 50% { transform: translateY(6px) } }
      `}</style>
    </DashboardLayout>
  );
}