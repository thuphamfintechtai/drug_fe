import React, { useState, useEffect } from 'react';
import { Card, Spin, Descriptions, Button, notification } from 'antd';
import DashboardLayout from '../../components/DashboardLayout';
import { getDistributorNavigationItems } from '../../utils/distributorNavigation';
import { useAuth } from '../../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  const [loading] = useState(false);

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
            Thông tin cá nhân
          </h1>
          <p className="mt-2 text-white/90">
            Xem và quản lý thông tin tài khoản của bạn.
          </p>
        </div>
      </section>

      <div className="mt-6 max-w-3xl mx-auto">
        <Spin spinning={loading}>
          <Card
            title="Thông tin tài khoản"
            className="rounded-2xl shadow-lg border border-gray-100"
          >
            {user && (
              <Descriptions column={{ xs: 1, sm: 2 }}>
                <Descriptions.Item label="Email">
                  <span className="font-medium">{user.email || 'N/A'}</span>
                </Descriptions.Item>
                <Descriptions.Item label="Tên đăng nhập">
                  {user.username || user.fullName || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Vai trò">
                  <span className="capitalize">{user.role || 'N/A'}</span>
                </Descriptions.Item>
                {user.companyName && (
                  <Descriptions.Item label="Tên công ty">
                    {user.companyName}
                  </Descriptions.Item>
                )}
                {user.address && (
                  <Descriptions.Item label="Địa chỉ" span={2}>
                    {user.address}
                  </Descriptions.Item>
                )}
                {user.phone && (
                  <Descriptions.Item label="Số điện thoại">
                    {user.phone}
                  </Descriptions.Item>
                )}
                {user.createdAt && (
                  <Descriptions.Item label="Ngày tạo tài khoản">
                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </Descriptions.Item>
                )}
              </Descriptions>
            )}
            <div className="mt-6">
              <Button type="primary" disabled className="bg-gradient-to-r from-[#00b4d8] via-[#48cae4] to-[#90e0ef] border-0">
                Chức năng cập nhật đang phát triển
              </Button>
            </div>
          </Card>
        </Spin>
      </div>

      <style>{`
        @keyframes float-slow { 0%,100% { transform: translateY(0) } 50% { transform: translateY(10px) } }
        @keyframes float-slower { 0%,100% { transform: translateY(0) } 50% { transform: translateY(6px) } }
      `}</style>
    </DashboardLayout>
  );
}
