import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { getRegistrationStats } from '../../services/admin/statsService';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalPending: 0,
    totalApproved: 0,
    totalRejected: 0,
    totalBlockchainFailed: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await getRegistrationStats();
      if (response.success) {
        setStats({
          totalPending: response.data.summary.totalPending || 0,
          totalApproved: response.data.summary.totalApproved || 0,
          totalRejected: response.data.summary.totalRejected || 0,
          totalBlockchainFailed: response.data.summary.totalBlockchainFailed || 0,
        });
      }
    } catch (error) {
      console.error('Error loading admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const metrics = [
    {
      title: 'Chờ duyệt',
      value: loading ? '...' : stats.totalPending.toString(),
      subtitle: 'Yêu cầu đăng ký',
      detail: `Đã duyệt: ${stats.totalApproved}`,
      color: 'blue',
    },
    {
      title: 'Blockchain Failed',
      value: loading ? '...' : stats.totalBlockchainFailed.toString(),
      subtitle: 'Yêu cầu',
      detail: 'Cần xử lý lại',
      color: 'red',
    },
    {
      title: 'Từ chối',
      value: loading ? '...' : stats.totalRejected.toString(),
      subtitle: 'Yêu cầu',
      detail: 'Đã bị từ chối',
      color: 'orange',
    },
    {
      title: 'Đã duyệt',
      value: loading ? '...' : stats.totalApproved.toString(),
      subtitle: 'Yêu cầu',
      detail: 'Thành công',
      color: 'green',
    },
  ];

  const navigationItems = [
    {
      path: '/admin',
      label: 'Trang chủ',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      active: true,
    },
    {
      path: '/admin/registrations',
      label: 'Duyệt đăng ký',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      active: false,
    },
    {
      path: '#',
      label: 'Quản trị người dùng',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      active: false,
    },
    {
      path: '#',
      label: 'Hệ thống',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      active: false,
    },
    {
      path: '/admin/drugs',
      label: 'Quản lý thuốc',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-7 7-7-7" />
        </svg>
      ),
      active: false,
    },
    {
      path: '/admin/proof-of-production',
      label: 'Proof of Production',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2z" />
        </svg>
      ),
      active: false,
    },
    {
      path: '/admin/proof-of-distribution',
      label: 'Proof of Distribution',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-7 7-7-7" />
        </svg>
      ),
      active: false,
    },
    {
      path: '/admin/proof-of-pharmacy',
      label: 'Proof of Pharmacy',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-7 7-7-7" />
        </svg>
      ),
      active: false,
    },
    {
      path: '/admin/invoices',
      label: 'Invoices',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v12a2 2 0 01-2 2z" />
        </svg>
      ),
      active: false,
    },
    {
      path: '/admin/manufacturers',
      label: 'Nhà sản xuất',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V7a2 2 0 00-2-2h-3V3H9v2H6a2 2 0 00-2 2v6" />
        </svg>
      ),
      active: false,
    },
    {
      path: '/admin/nft-tracking',
      label: 'NFT Tracking',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2z" />
        </svg>
      ),
      active: false,
    },
  ];

  return (
    <DashboardLayout metrics={metrics} navigationItems={navigationItems}>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Tổng quan hệ thống</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Duyệt đăng ký doanh nghiệp</h3>
            <p className="text-sm text-gray-600">Xem và duyệt các yêu cầu đăng ký từ nhà sản xuất, nhà phân phối, nhà thuốc.</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Quản trị hệ thống</h3>
            <p className="text-sm text-gray-600">Quản lý quyền, người dùng, và cấu hình hệ thống.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
