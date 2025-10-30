import React, { useEffect, useState } from 'react';
import { getDistributions, confirmDistribution } from '../../services/distributor/proofService';
import { Button, Table, Tag, notification, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';

const statusColor = (status) => {
  switch (status) {
    case 'confirmed': return 'green';
    case 'pending': return 'orange';
    default: return 'blue';
  }
};

export default function Distributions() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getDistributions();
      console.log('📦 getDistributions response:', res);

      const list =
        Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
          ? res.data.data
          : [];

      setData(list);
    } catch (error) {
      console.error('Fetch error:', error);
      notification.error({ message: 'Không tải được danh sách lô hàng!' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const onConfirm = async (id) => {
    try {
      await confirmDistribution(id);
      notification.success({ message: 'Xác nhận nhận lô hàng thành công!' });
      fetchData();
    } catch {
      notification.error({ message: 'Xác nhận thất bại!' });
    }
  };

  const columns = [
    { title: 'Mã đơn', dataIndex: 'code', key: 'code' },
    { title: 'Tên thuốc', dataIndex: 'drugName', key: 'drugName' },
    { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity' },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={statusColor(status)}>{status}</Tag>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, row) => (
        <>
          <Button
            size="small"
            onClick={() => navigate(`/distributor/distributions/${row._id}`)}
            style={{ marginRight: 8 }}
          >
            Chi tiết
          </Button>
          {row.status === 'pending' && (
            <Button
              size="small"
              type="primary"
              onClick={() => onConfirm(row._id)}
              style={{ marginRight: 8 }}
            >
              Xác nhận nhận
            </Button>
          )}
          {row.status === 'pending' && (
            <Button
              size="small"
              type="dashed"
              onClick={() => onConfirm(row._id)}
            >
              Xác nhận chứng từ
            </Button>
          )}
        </>
      ),
    },
  ];

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
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Danh sách đơn nhận từ Nhà sản xuất
        </h2>

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={data}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
          />
        </Spin>
      </div>
    </DashboardLayout>
  );
}
