import React, { useEffect, useState } from 'react';
import { getDistributionStats } from '../../services/distributor/proofService';
import { getInvoiceStats } from '../../services/distributor/invoiceService';
import DashboardLayout from '../../components/DashboardLayout';
import { getDistributorNavigationItems } from '../../utils/distributorNavigation';
import { Card, Spin, notification } from 'antd';

export default function Stats() {
  const [distributionStats, setDistributionStats] = useState({});
  const [invoiceStats, setInvoiceStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [distRes, invRes] = await Promise.all([
        getDistributionStats(),
        getInvoiceStats(),
      ]);

      const distData = distRes?.data?.data || distRes?.data || {};
      const invData = invRes?.data?.data || invRes?.data || {};

      setDistributionStats({
        totalDistributions: distData.totalDistributions || distData.total || 0,
        confirmedDistributions:
          distData.statusBreakdown?.find((s) => s._id === 'confirmed')?.count ||
          distData.confirmed ||
          0,
        pendingDistributions:
          distData.statusBreakdown?.find((s) => s._id === 'pending')?.count ||
          distData.pending ||
          0,
        totalQuantity: distData.totalQuantity || distData.quantity || 0,
      });

      setInvoiceStats({
        totalInvoices: invData.totalInvoices || invData.total || 0,
        paidInvoices:
          invData.statusBreakdown?.find((s) => s._id === 'paid')?.count ||
          invData.paid ||
          0,
        pendingInvoices:
          invData.statusBreakdown?.find((s) => s._id === 'pending')?.count ||
          invData.pending ||
          0,
        totalRevenue: invData.totalRevenue || invData.revenue || 0,
      });
    } catch (error) {
      console.error('Stats fetch error:', error);
      notification.error({ message: 'Không tải được thống kê!' });
    } finally {
      setLoading(false);
    }
  };

  const navigationItems = getDistributorNavigationItems();

  return (
    <DashboardLayout navigationItems={navigationItems}>
      {/* Banner đồng nhất */}
      <section className="relative overflow-hidden rounded-2xl border border-[#90e0ef33] shadow-[0_10px_30px_rgba(0,0,0,0.06)] bg-gradient-to-tr from-[#00b4d8] via-[#48cae4] to-[#90e0ef]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.25),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-white/30 blur-xl animate-float-slow" />
          <div className="absolute top-8 right-6 w-16 h-8 rounded-full bg-white/25 blur-md rotate-6 animate-float-slower" />
        </div>
        <div className="relative px-6 py-8 md:px-10 md:py-12 text-white">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight drop-shadow-sm">
            Thống kê hoạt động
          </h1>
          <p className="mt-2 text-white/90">
            Tổng quan về hoạt động phân phối và hóa đơn.
          </p>
        </div>
      </section>

      <Spin spinning={loading}>
        <div className="mt-6 space-y-6">
          {/* Thống kê phân phối */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Thống kê phân phối
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <Card className="rounded-2xl shadow-lg border border-gray-100">
                <div className="text-sm text-gray-600 mb-2">Tổng đơn phân phối</div>
                <div className="text-3xl font-bold text-cyan-600">
                  {distributionStats.totalDistributions || 0}
                </div>
              </Card>
              <Card className="rounded-2xl shadow-lg border border-gray-100">
                <div className="text-sm text-gray-600 mb-2">Đã xác nhận</div>
                <div className="text-3xl font-bold text-green-600">
                  {distributionStats.confirmedDistributions || 0}
                </div>
              </Card>
              <Card className="rounded-2xl shadow-lg border border-gray-100">
                <div className="text-sm text-gray-600 mb-2">Chờ xác nhận</div>
                <div className="text-3xl font-bold text-orange-600">
                  {distributionStats.pendingDistributions || 0}
                </div>
              </Card>
              <Card className="rounded-2xl shadow-lg border border-gray-100">
                <div className="text-sm text-gray-600 mb-2">Tổng số lượng</div>
                <div className="text-3xl font-bold text-blue-600">
                  {distributionStats.totalQuantity || 0}
                </div>
              </Card>
            </div>
          </div>

          {/* Thống kê hóa đơn */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Thống kê hóa đơn
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <Card className="rounded-2xl shadow-lg border border-gray-100">
                <div className="text-sm text-gray-600 mb-2">Tổng hóa đơn</div>
                <div className="text-3xl font-bold text-cyan-600">
                  {invoiceStats.totalInvoices || 0}
                </div>
              </Card>
              <Card className="rounded-2xl shadow-lg border border-gray-100">
                <div className="text-sm text-gray-600 mb-2">Đã thanh toán</div>
                <div className="text-3xl font-bold text-green-600">
                  {invoiceStats.paidInvoices || 0}
                </div>
              </Card>
              <Card className="rounded-2xl shadow-lg border border-gray-100">
                <div className="text-sm text-gray-600 mb-2">Chờ thanh toán</div>
                <div className="text-3xl font-bold text-orange-600">
                  {invoiceStats.pendingInvoices || 0}
                </div>
              </Card>
              <Card className="rounded-2xl shadow-lg border border-gray-100">
                <div className="text-sm text-gray-600 mb-2">Tổng doanh thu</div>
                <div className="text-3xl font-bold text-blue-600">
                  {invoiceStats.totalRevenue
                    ? `${Number(invoiceStats.totalRevenue).toLocaleString('vi-VN')} ₫`
                    : '0 ₫'}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </Spin>

      <style>{`
        @keyframes float-slow { 0%,100% { transform: translateY(0) } 50% { transform: translateY(10px) } }
        @keyframes float-slower { 0%,100% { transform: translateY(0) } 50% { transform: translateY(6px) } }
      `}</style>
    </DashboardLayout>
  );
}