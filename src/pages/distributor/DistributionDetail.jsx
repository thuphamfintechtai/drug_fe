import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDistributionDetail, confirmDistribution } from '../../services/distributor/proofService';
import { Button, Tag, Timeline, notification, Spin } from 'antd';
import DashboardLayout from '../../components/DashboardLayout';

export default function DistributionDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🔄 Load data
  const load = async () => {
    setLoading(true);
    try {
      const res = await getDistributionDetail(id);
      console.log('📦 DistributionDetail response:', res);

      // ✅ Chuẩn hóa data để tránh undefined
      const detail =
        res?.data?.data
          ? res.data.data
          : res?.data || null;

      setData(detail);
    } catch (error) {
      console.error('Fetch detail error:', error);
      notification.error({ message: 'Không xem được chi tiết lô hàng' });
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  // 🧾 Xác nhận đơn hàng
  const onConfirm = async () => {
    try {
      await confirmDistribution(id);
      notification.success({ message: 'Đã xác nhận nhận hàng!' });
      load();
    } catch {
      notification.error({ message: 'Xác nhận thất bại' });
    }
  };

  if (loading) return (
    <DashboardLayout>
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spin size="large" />
      </div>
    </DashboardLayout>
  );

  if (!data) return null;

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
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 max-w-3xl mx-auto">
        <h2 className="font-bold text-xl mb-4 text-gray-800">
          Chi tiết đơn phân phối
        </h2>

        <div className="space-y-2 mb-5 text-gray-700">
          <div>Mã đơn: <b>{data.code}</b></div>
          <div>Tên thuốc: <span>{data.drugName || 'Không rõ'}</span></div>
          <div>Số lượng: <span>{data.quantity || 0}</span></div>
          <div>
            Trạng thái:{' '}
            <Tag color={data.status === 'confirmed' ? 'green' : 'orange'}>
              {data.status}
            </Tag>
          </div>
        </div>

        {/* 🧭 Timeline */}
        {Array.isArray(data.timeline) && data.timeline.length > 0 && (
          <Timeline
            items={data.timeline.map((t, i) => ({
              key: i,
              color: t.status === 'confirmed' ? 'green' : 'orange',
              children: (
                <div>
                  <span className="font-medium text-gray-800">{t.content}</span>
                  <div className="text-gray-500 text-sm">{t.time}</div>
                </div>
              ),
            }))}
          />
        )}

        {data.status === 'pending' && (
          <div className="mt-5">
            <Button
              type="primary"
              onClick={onConfirm}
              className="transition-all hover:scale-105"
            >
              Xác nhận nhận lô hàng
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
