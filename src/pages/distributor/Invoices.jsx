import React, {useEffect, useState} from 'react';
import { getMyInvoices } from '../../services/distributor/invoiceService';
import { Table, Tag, Spin } from 'antd';

export default function Invoices(){
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{ fetchData(); },[]);
  const fetchData = async()=>{
    setLoading(true);
    try{
      const res = await getMyInvoices();
      setData(res.data || []);
    }finally{ setLoading(false); }
  };
  const columns = [
    {title:'Mã hóa đơn',dataIndex:'code'},
    {title:'Nhà thuốc',dataIndex:'pharmacyName'},
    {title:'Trạng thái',dataIndex:'status',render:s=>(<Tag>{s}</Tag>)},
    {title:'Tổng tiền',dataIndex:'totalAmount'},
    // Xem chi tiết có thể navigate tại đây.
  ];
  return (
    <div className="bg-white p-4 rounded">
      <h2 className="text-lg font-bold mb-2">Danh sách hóa đơn</h2>
      <Spin spinning={loading}>
        <Table columns={columns} dataSource={data} rowKey="_id" pagination />
      </Spin>
    </div>
  )
}
