import React, { useEffect, useState } from 'react';
import { getDistributionStats } from '../../services/distributor/proofService';
import { Card, Row, Col, Spin } from 'antd';

export default function Stats() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    getDistributionStats().then(res=>setData(res.data||{})).finally(()=>setLoading(false));
  },[]);

  return (
    <Spin spinning={loading}>
      <Row gutter={24} className="my-6">
        <Col span={8}><Card title="Tổng đơn phân phối">{data.totalDistributions||0}</Card></Col>
        <Col span={8}><Card title="Đã xác nhận">{data.confirmedDistributions||0}</Card></Col>
        <Col span={8}><Card title="Sản phẩm phân phối">{data.totalQuantity||0}</Card></Col>
      </Row>
    </Spin>
  );
}
