import React, { useState } from 'react';
import { createProofToPharmacy } from '../../services/distributor/proofOfPharmacyService';
import { Input, Button, notification, Select, Form, InputNumber } from 'antd';

export default function CreateProofToPharmacy() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  
  const onFinish = async (values) => {
    setLoading(true);
    try {
      await createProofToPharmacy(values);
      notification.success({ message: 'Tạo đơn giao thành công!' });
      form.resetFields();
    } catch {
      notification.error({ message: 'Tạo đơn thất bại!' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-5 rounded shadow max-w-screen-sm mx-auto">
      <h2 className="font-bold text-xl mb-4">Tạo đơn giao hàng đến Nhà thuốc</h2>
      <Form layout='vertical' form={form} onFinish={onFinish}>
        <Form.Item name='pharmacyId' label='Nhà thuốc' rules={[{ required:true, message:'Bắt buộc'}]}>
          <Input placeholder='Nhập hoặc chọn nhà thuốc'/>
        </Form.Item>
        <Form.Item name='drugName' label='Tên thuốc' rules={[{ required:true }] }>
          <Input/>
        </Form.Item>
        <Form.Item name='quantity' label='Số lượng' rules={[{ required:true }] }>
          <InputNumber min={1} className='w-full'/>
        </Form.Item>
        <Button loading={loading} type='primary' htmlType='submit'>Tạo đơn giao ngay</Button>
      </Form>
    </div>
  );
}
