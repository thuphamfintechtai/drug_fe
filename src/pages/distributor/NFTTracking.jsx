import React, { useState } from 'react';
import { Input, Button, notification, Timeline, Spin } from 'antd';
import { trackNFT } from '../../services/distributor/nftService';
import DashboardLayout from '../../components/DashboardLayout';

export default function NFTTracking() {
  const [value, setValue] = useState('');
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleTrack = async () => {
    if (!value.trim()) {
      notification.warning({ message: 'Vui lòng nhập NFT ID!' });
      return;
    }
    setLoading(true);
    try {
      const res = await trackNFT(value.trim());
      console.log('🔍 NFT Tracking response:', res);

      const history =
        Array.isArray(res?.data?.history)
          ? res.data.history
          : Array.isArray(res?.data)
          ? res.data
          : [];

      if (history.length === 0) {
        notification.info({ message: 'Không tìm thấy hành trình cho NFT này.' });
      }
      setTimeline(history);
    } catch (error) {
      console.error('NFT tracking error:', error);
      notification.error({ message: 'Không tìm thấy NFT hoặc lỗi hệ thống!' });
    } finally {
      setLoading(false);
    }
  };

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
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 max-w-screen-md mx-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
          🔍 Theo dõi hành trình thuốc qua NFT ID
        </h2>

        <Input.Search
          placeholder="Nhập NFT ID để tra cứu..."
          enterButton="Tra cứu"
          size="large"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onSearch={handleTrack}
          loading={loading}
          allowClear
        />

        <div className="mt-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Spin size="large" />
            </div>
          ) : timeline.length > 0 ? (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <Timeline
                items={timeline.map((step, idx) => ({
                  key: idx,
                  color:
                    step.status === 'success'
                      ? 'green'
                      : step.status === 'error'
                      ? 'red'
                      : 'blue',
                  children: (
                    <div>
                      <span className="font-semibold text-gray-800">
                        {step.label || `Bước ${idx + 1}`}
                      </span>
                      <div className="text-gray-500 text-sm">
                        {step.time || 'Không rõ thời gian'}
                      </div>
                    </div>
                  ),
                }))}
              />
            </div>
          ) : (
            <p className="text-gray-500 mt-6 text-center">
              Nhập NFT ID để xem hành trình truy xuất nguồn gốc thuốc.
            </p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
