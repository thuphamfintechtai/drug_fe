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
      {/* Banner đồng nhất */}
      <section className="relative overflow-hidden rounded-2xl border border-[#90e0ef33] shadow-[0_10px_30px_rgba(0,0,0,0.06)] bg-gradient-to-tr from-[#00b4d8] via-[#48cae4] to-[#90e0ef]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.25),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-white/30 blur-xl animate-float-slow" />
          <div className="absolute top-8 right-6 w-16 h-8 rounded-full bg-white/25 blur-md rotate-6 animate-float-slower" />
        </div>
        <div className="relative px-6 py-8 md:px-10 md:py-12 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight drop-shadow-sm">
                Hóa đơn thương mại
              </h1>
              <p className="mt-2 text-white/90">
                Quản lý các hóa đơn đã tạo cho nhà thuốc.
              </p>
            </div>
            <Button
              type="primary"
              size="large"
              onClick={() => navigate('/distributor/invoices/create')}
              className="bg-white/20 hover:bg-white/30 border-white/30"
            >
              + Tạo hóa đơn
            </Button>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
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