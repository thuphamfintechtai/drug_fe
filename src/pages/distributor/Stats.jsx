import React, { useEffect, useState } from 'react';
import { getDistributions } from '../../services/distributor/proofService';
import { Card, Row, Col, Spin, notification } from 'antd';
import DashboardLayout from '../../components/DashboardLayout';

export default function Stats() {
  const [data, setData] = useState({
    totalDistributions: 0,
    confirmedDistributions: 0,
    totalQuantity: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getDistributions();
      console.log('📊 Stats getDistributions response:', res);

      const parsed =
        res?.data?.data
          ? res.data.data
          : res?.data || {};

      setData({
        totalDistributions: parsed.totalDistributions || 0,
        confirmedDistributions: parsed.confirmedDistributions || 0,
        totalQuantity: parsed.totalQuantity || 0,
      });
    } catch (error) {
      console.error('Stats fetch error:', error);
      notification.error({ message: 'Không tải được thống kê!' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const navigationItems = [
    {
      path: "/distributor",
      label: "Trang chủ",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 12l9-9 9 9M4 10v10h16V10"
          />
        </svg>
      ),
      active: true,
    },
    {
      path: "/distributor/distributions",
      label: "Proof of Distribution",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    {
      path: "/distributor/nft-tracking",
      label: "Theo dõi vận chuyển",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v4l3 3m-9 6h12a2 2 0 002-2V5a2 2 0 00-2-2H9.828a2 2 0 00-1.414.586L4 8v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      path: "/distributor/create-proof",
      label: "Tạo minh chứng giao",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
    {
      path: "/distributor/invoices",
      label: "Hóa đơn",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12h6m-6 4h6M5 4h14a2 2 0 012 2v14l-4-2-4 2-4-2-4 2V6a2 2 0 012-2z"
          />
        </svg>
      ),
    },
    {
      path: "/distributor/stats",
      label: "Thống kê",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h10M4 14h6m-2 4h12" />
        </svg>
      ),
    },
  ];

  return (
    <DashboardLayout navigationItems={navigationItems}>
      <Spin spinning={loading}>
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Thống kê hoạt động phân phối
          </h2>

          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <Card
                title="Tổng đơn phân phối"
                bordered={false}
                className="shadow-md rounded-xl"
              >
                <span className="text-3xl font-bold text-cyan-600">
                  {data.totalDistributions}
                </span>
              </Card>
            </Col>

            <Col xs={24} md={8}>
              <Card
                title="Đã xác nhận"
                bordered={false}
                className="shadow-md rounded-xl"
              >
                <span className="text-3xl font-bold text-green-600">
                  {data.confirmedDistributions}
                </span>
              </Card>
            </Col>

            <Col xs={24} md={8}>
              <Card
                title="Sản phẩm phân phối"
                bordered={false}
                className="shadow-md rounded-xl"
              >
                <span className="text-3xl font-bold text-blue-600">
                  {data.totalQuantity}
                </span>
              </Card>
            </Col>
          </Row>
        </div>
      </Spin>
    </DashboardLayout>
  );
}
