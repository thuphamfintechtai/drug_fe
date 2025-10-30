import React, { useEffect, useState } from 'react';
import { getDeliveriesToPharmacy, updatePharmacyDeliveryStatus } from '../../services/distributor/proofOfPharmacyService';
import { Button, Table, Tag, notification, Spin } from 'antd';

const statusColor = status => status==='confirmed' ? 'green' : (status==='pending' ? 'orange' : 'blue');

export default function DeliveriesToPharmacy() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getDeliveriesToPharmacy();
      setData(res.data||[]);
    } catch {
      notification.error({ message: 'Không tải được danh sách!'});
    } finally {
      setLoading(false);
    }
  };
  useEffect(()=>{ fetchData(); }, []);

  const updateStatus = async (id) => {
    try {
      await updatePharmacyDeliveryStatus(id, {status:'confirmed'});
      notification.success({message:'Cập nhật thành công!'});
      fetchData();
    }catch{ notification.error({message:'Cập nhật lỗi!'}); }
  };
  
  const columns = [
    {title:'Mã đơn', dataIndex:'code', key:'code'},
    {title:'Nhà thuốc', dataIndex:'pharmacyName', key:'pharmacyName'},
    {title:'Tên thuốc', dataIndex:'drugName', key:'drugName'},
    {title:'Số lượng', dataIndex:'quantity', key:'quantity'},
    {title:'Trạng thái', dataIndex:'status', render:status=>(<Tag color={statusColor(status)}>{status}</Tag>)},
    {title:'Thao tác', key:'action', render:(_,r)=>(r.status==='pending' ? <Button onClick={()=>updateStatus(r._id)} size="small">Xác nhận giao thành công</Button>:null)}
  ];

  return (
    <div className="bg-white p-4 rounded">
      <h2 className="font-bold text-lg mb-3">Danh sách đơn giao đến Nhà thuốc</h2>
      <Spin spinning={loading}>
        <Table columns={columns} dataSource={data} rowKey="_id" pagination />
      </Spin>
    </div>
  );
}
