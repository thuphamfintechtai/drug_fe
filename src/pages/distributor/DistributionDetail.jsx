import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDistributionDetail, confirmDistribution } from '../../services/distributor/proofService';
import { Button, Tag, Timeline, notification, Spin } from 'antd';

export default function DistributionDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { load(); }, [id]);
  const load = async () => {
    setLoading(true);
    try {
      const res = await getDistributionDetail(id);
      setData(res.data);
    } catch {
      notification.error({ message: 'Không xem được chi tiết lô hàng' });
      navigate(-1);
    } finally { setLoading(false); }
  };
  const onConfirm = async () => {
    try {
      await confirmDistribution(id);
      notification.success({ message: 'Đã xác nhận nhận hàng!' });
      load();
    } catch {
      notification.error({ message: 'Xác nhận thất bại' });
    }
  };
  if (loading) return <Spin spinning />;
  if (!data) return null;
  return (
    <div className="bg-white p-5 rounded shadow">
      <h2 className="font-bold text-xl mb-3">Chi tiết đơn phân phối</h2>
      <div className="mb-3">
        <div>Mã đơn: <b>{data.code}</b></div>
        <div>Tên thuốc: <span>{data.drugName}</span></div>
        <div>Số lượng: <span>{data.quantity}</span></div>
        <div>Trạng thái: <Tag color={data.status==='confirmed'?'green':'orange'}>{data.status}</Tag></div>
      </div>
      {data.timeline && (
        <Timeline items={data.timeline.map(t=>( {color:t.status==='confirmed'?'green':'orange',children:<span>{t.content} - {t.time}</span> } ))} />
      )}
      {data.status==='pending' && <Button onClick={onConfirm} type="primary">Xác nhận nhận lô hàng</Button>}
    </div>
  );
}
