import React, { useEffect, useState } from 'react';
import { getDeliveriesToPharmacy, updatePharmacyDeliveryStatus } from '../../services/distributor/proofOfPharmacyService';
import { Button, Table, Tag, notification, Spin } from 'antd';
import DashboardLayout from '../../components/DashboardLayout';

const statusColor = (status) => {
  switch (status) {
    case 'confirmed': return 'green';
    case 'pending': return 'orange';
    default: return 'blue';
  }
};

export default function DeliveriesToPharmacy() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getDeliveriesToPharmacy();
      console.log('📦 getDeliveriesToPharmacy response:', res);

      // ✅ Đảm bảo luôn là array
      const list =
        Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
          ? res.data.data
          : [];

      setData(list);
    } catch (error) {
      console.error('Fetch deliveries error:', error);
      notification.error({ message: 'Không tải được danh sách!' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const updateStatus = async (id) => {
    try {
      await updatePharmacyDeliveryStatus(id, { status: 'confirmed' });
      notification.success({ message: 'Cập nhật thành công!' });
      fetchData();
    } catch (error) {
      console.error('Update delivery status error:', error);
      notification.error({ message: 'Cập nhật lỗi!' });
    }
  };

  const columns = [
    { title: 'Mã đơn', dataIndex: 'code', key: 'code' },
    { title: 'Nhà thuốc', dataIndex: 'pharmacyName', key: 'pharmacyName' },
    { title: 'Tên thuốc', dataIndex: 'drugName', key: 'drugName' },
    { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity' },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status',
      render: (status) => <Tag color={statusColor(status)}>{status}</Tag>
    },
    { 
      title: 'Thao tác', 
      key: 'action', 
      render: (_, record) => (
        record.status === 'pending' ? (
          <Button
            size="small"
            type="primary"
            onClick={() => updateStatus(record._id)}
          >
            Xác nhận giao thành công
          </Button>
        ) : (
          <Tag color="green">Đã xác nhận</Tag>
        )
      )
    },
  ];

  // 🔗 Navigation items cho Distributor Layout
  const navigationItems = [
    {
      path: '/distributor',
      label: 'Trang chủ',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M4 10v10h16V10" />
        </svg>
      ),
    },
    {
      path: '/distributor/distributions',
      label: 'Proof of Distribution',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    {
      path: '/distributor/deliveries',
      label: 'Đơn giao đến nhà thuốc',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m-9 6h12a2 2 0 002-2V5a2 2 0 00-2-2H9.828a2 2 0 00-1.414.586L4 8v12a2 2 0 002 2z" />
        </svg>
      ),
      active: true,
    },
    {
      path: '/distributor/create-proof',
      label: 'Tạo minh chứng giao',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
    {
      path: '/distributor/invoices',
      label: 'Hóa đơn',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6M5 4h14a2 2 0 012 2v14l-4-2-4 2-4-2-4 2V6a2 2 0 012-2z" />
        </svg>
      ),
    },
  ];

  return (
    <DashboardLayout navigationItems={navigationItems}>
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Danh sách đơn giao đến Nhà thuốc
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
