import React, { useState } from 'react';
import { Input, Button, notification, Timeline } from 'antd';
import { trackNFT } from '../../services/distributor/nftService';

export default function NFTTracking() {
  const [value, setValue] = useState('');
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleTrack = async () => {
    if (!value) return;
    setLoading(true);
    try {
      const res = await trackNFT(value);
      setTimeline(res.data?.history||[]);
    } catch {
      notification.error({message:'Không tìm thấy NFT hoặc lỗi BE!'});
    } finally { setLoading(false); }
  };

  return (
    <div className="bg-white p-4 rounded max-w-screen-sm mx-auto">
      <h2 className="font-bold mb-2">Theo dõi hành trình thuốc qua NFT ID</h2>
      <Input.Search placeholder="Nhập NFT ID..." enterButton="Tra cứu" loading={loading} size="large" onSearch={handleTrack} value={value} onChange={e=>setValue(e.target.value)} />
      {timeline.length>0 && (
        <Timeline items={timeline.map((step,idx)=>( { color:step.status==='success'?'green':'blue', children:<span>{step.label} ({step.time})</span> }))}/>
      )}
    </div>
  );
}
