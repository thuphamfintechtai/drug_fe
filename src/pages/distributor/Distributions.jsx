import React, { useEffect, useState } from 'react';
import { getDistributions, confirmDistribution } from '../../services/distributor/proofService';
import { Button, Table, Tag, notification, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';

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
      setData(res.data||[]);
    } catch {
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
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: status => <Tag color={statusColor(status)}>{status}</Tag> },
    { title: 'Thao tác', key: 'action', render: (_, row) => (
      <>
        <Button size="small" onClick={() => navigate(`/distributor/distributions/${row._id}`)} style={{marginRight: 8}}>Chi tiết</Button>
        {row.status==='pending' && (
            <Button size="small" type="primary" onClick={() => onConfirm(row._id)}>Xác nhận nhận</Button>
        )}
      </>
    ) },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-lg font-bold mb-4">Danh sách đơn nhận từ Nhà sản xuất</h2>
      <Spin spinning={loading}>
        <Table columns={columns} dataSource={data} rowKey="_id" pagination />
      </Spin>
    </div>
  );
}
