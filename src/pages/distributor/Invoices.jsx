import React, { useEffect, useState } from 'react';
import { getMyInvoices } from '../../services/distributor/invoiceService';
import { Table, Tag, Spin, Button, notification } from 'antd';
import DashboardLayout from '../../components/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { getDistributorNavigationItems } from '../../utils/distributorNavigation';

export default function Invoices() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getMyInvoices();
      const list =
        Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
          ? res.data.data
          : [];
      setData(list);
    } catch (error) {
      console.error('Invoice fetch error:', error);
      notification.error({ message: 'Không tải được danh sách hóa đơn!' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const statusColor = (status) => {
    const colors = {
      paid: 'green',
      pending: 'orange',
      draft: 'blue',
      cancelled: 'red',
    };
    return colors[status] || 'default';
  };

  const statusLabel = (status) => {
    const labels = {
      paid: 'Đã thanh toán',
      pending: 'Chờ thanh toán',
      draft: 'Bản nháp',
      cancelled: 'Đã hủy',
    };
    return labels[status] || status;
  };

  const columns = [
    {
      title: 'Mã hóa đơn',
      dataIndex: 'code',
      key: 'code',
      render: (text) => (
        <span className="font-mono font-semibold text-gray-800">{text || 'N/A'}</span>
      ),
    },
    {
      title: 'Nhà thuốc',
      dataIndex: 'pharmacyName',
      key: 'pharmacyName',
      render: (text, record) =>
        text ||
        record.toPharmacy?.name ||
        record.toPharmacy?.username ||
        'N/A',
    },
    {
      title: 'Thuốc',
      dataIndex: 'drugName',
      key: 'drugName',
      render: (text, record) => {
        const drug = record.drug || record.proofOfPharmacy?.drug;
        return drug?.name || drug?.tradeName || text || 'N/A';
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={statusColor(status)}>{statusLabel(status)}</Tag>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (v) =>
        v ? `${Number(v).toLocaleString('vi-VN')} ₫` : '0 ₫',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) =>
        date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button
          size="small"
          onClick={() => navigate(`/distributor/invoices/${record._id}`)}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  const navigationItems = getDistributorNavigationItems();

  return (
    <DashboardLayout navigationItems={navigationItems}>
      {/* Banner kiểu Manufacturer (card trắng, viền cyan) */}
      <div className="bg-white rounded-xl border border-cyan-200 shadow-sm p-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#007b91]">Hóa đơn thương mại</h1>
          <p className="text-slate-500 text-sm mt-1">Quản lý các hóa đơn đã tạo cho nhà thuốc.</p>
        </div>
        <Button
          type="primary"
          size="large"
          onClick={() => navigate('/distributor/invoices/create')}
          className="bg-gradient-to-r from-[#00b4d8] via-[#48cae4] to-[#90e0ef] border-0"
        >
          + Tạo hóa đơn
        </Button>
      </div>

      {/* Content */}
      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-cyan-100 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Danh sách hóa đơn</h2>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={data}
            rowKey="_id"
            pagination={{ pageSize: 10, showSizeChanger: true }}
            scroll={{ x: 1000 }}
          />
        </Spin>
      </div>

      <style>{`
        @keyframes float-slow { 0%,100% { transform: translateY(0) } 50% { transform: translateY(10px) } }
        @keyframes float-slower { 0%,100% { transform: translateY(0) } 50% { transform: translateY(6px) } }
      `}</style>
    </DashboardLayout>
  );
}