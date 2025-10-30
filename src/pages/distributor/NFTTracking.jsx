import React, { useState } from 'react';
import { Input, Button, notification, Timeline, Spin } from 'antd';
import { trackNFT } from '../../services/distributor/nftService';
import DashboardLayout from '../../components/DashboardLayout';
import { getDistributorNavigationItems } from '../../utils/distributorNavigation';

const { Search } = Input;

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
      const history =
        Array.isArray(res?.data?.history)
          ? res.data.history
          : Array.isArray(res?.data?.data?.history)
          ? res.data.data.history
          : Array.isArray(res?.data)
          ? res.data
          : [];

      if (history.length === 0) {
        notification.info({
          message: 'Không tìm thấy hành trình cho NFT này.',
        });
      }
      setTimeline(history);
    } catch (error) {
      console.error('NFT tracking error:', error);
      notification.error({
        message: 'Không tìm thấy NFT hoặc lỗi hệ thống!',
      });
      setTimeline([]);
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
            Theo dõi hành trình thuốc qua NFT ID
          </h1>
          <p className="mt-2 text-white/90">
            Tra cứu lịch sử và hành trình của thuốc thông qua mã NFT.
          </p>
        </div>
      </section>

      <div className="mt-6 max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
          <Search
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
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Hành trình thuốc
                </h3>
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
                          {step.label || step.content || `Bước ${idx + 1}`}
                        </span>
                        <div className="text-gray-500 text-sm">
                          {step.time || step.createdAt || 'Không rõ thời gian'}
                        </div>
                      </div>
                    ),
                  }))}
                />
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>Nhập NFT ID để xem hành trình truy xuất nguồn gốc thuốc.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float-slow { 0%,100% { transform: translateY(0) } 50% { transform: translateY(10px) } }
        @keyframes float-slower { 0%,100% { transform: translateY(0) } 50% { transform: translateY(6px) } }
      `}</style>
    </DashboardLayout>
  );
}