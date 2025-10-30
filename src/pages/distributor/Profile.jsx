import React, { useState, useEffect } from 'react';
import { getProfile } from '../../services/authService';
import { Card, Spin, Button, notification } from 'antd';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile()
      .then(res => setProfile(res.data))
      .catch(() => notification.error({message:'Không tải được thông tin cá nhân'}))
      .finally(() => setLoading(false));
  }, []);

  // Nếu có API update thì thêm Form tại đây
  return (
    <div className="max-w-xl mx-auto">
      <Spin spinning={loading}>
        {profile && (
          <Card title="Thông tin cá nhân" bordered>
            <div>Email: <b>{profile.email}</b></div>
            <div>Vai trò: <b>{profile.role}</b></div>
            <div>Company: {profile.companyName || '-'}</div>
            <Button style={{marginTop:12}} disabled>Cập nhật (đang phát triển)</Button>
          </Card>
        )}
      </Spin>
    </div>
  );
}
