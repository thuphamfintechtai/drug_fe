import React, { useState, useEffect } from 'react';
import { createProofToPharmacy } from '../../services/distributor/proofOfPharmacyService';
import { listPharmacies } from '../../services/admin/proofOfPharmacyService';
import { Input, Button, notification, Form, Select, InputNumber } from 'antd';
import DashboardLayout from '../../components/DashboardLayout';
import { useNavigate } from 'react-router-dom';

export default function CreateProofToPharmacy() {
  const [loading, setLoading] = useState(false);
  const [pharmacies, setPharmacies] = useState([]);
  const [fetchingPharmacy, setFetchingPharmacy] = useState(true);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // 🔄 Lấy danh sách nhà thuốc
  useEffect(() => {
    async function fetchPharmacies() {
      setFetchingPharmacy(true);
      try {
        const res = await listPharmacies();
        setPharmacies(
          (res?.data?.data || res?.data || []).map((p) => ({
            value: p._id,
            label: p.name || p._id,
          }))
        );
      } catch (error) {
        notification.error({ message: 'Không tải được danh sách nhà thuốc' });
      } finally {
        setFetchingPharmacy(false);
      }
    }
    fetchPharmacies();
  }, []);

  // 🚀 Gửi form
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const payload = {
        pharmacyId: values.pharmacyId,
        receivedBy: values.receivedBy,
        verificationCode: values.verificationCode,
        receiptTxHash: values.receiptTxHash || '',
        qualityCheck: values.qualityCheck,
        notes: values.notes || '',
      };

      await createProofToPharmacy(payload);
      notification.success({ message: 'Tạo đơn giao thành công!' });
      form.resetFields();
    } catch (error) {
      console.error('Create Proof error:', error);
      notification.error({ message: 'Tạo đơn thất bại!' });
    } finally {
      setLoading(false);
    }
  };

  // 📋 Menu bên trái
  const navigationItems = [
    { path: "/distributor", label: "Trang chủ" },
    { path: "/distributor/distributions", label: "Proof of Distribution" },
    { path: "/distributor/nft-tracking", label: "Theo dõi vận chuyển" },
    { path: "/distributor/create-proof", label: "Tạo minh chứng giao" },
    { path: "/distributor/invoices", label: "Hóa đơn" },
    { path: "/distributor/stats", label: "Thống kê" },
  ];

  return (
    <DashboardLayout metrics={[]} navigationItems={navigationItems}>
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 max-w-screen-sm mx-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          Tạo đơn giao hàng đến Nhà thuốc
        </h2>
        <p className="text-gray-500 mb-6 text-sm">
          Nhập thông tin đơn giao để tạo minh chứng giao hàng mới.
        </p>

        <Form layout="vertical" form={form} onFinish={onFinish} autoComplete="off">
          <Form.Item
            name="pharmacyId"
            label="Nhà thuốc"
            rules={[{ required: true, message: 'Vui lòng chọn nhà thuốc' }]}
          >
            <Select
              showSearch
              options={pharmacies}
              loading={fetchingPharmacy}
              placeholder="Chọn nhà thuốc"
              filterOption={(input, option) =>
                option.label?.toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item
            name="receivedBy"
            label="Người nhận"
            rules={[{ required: true, message: 'Vui lòng nhập tên người nhận' }]}
          >
            <Input placeholder="Tên người nhận tại nhà thuốc" />
          </Form.Item>

          <Form.Item
            name="verificationCode"
            label="Mã xác nhận"
            rules={[{ required: true, message: 'Vui lòng nhập mã xác nhận' }]}
          >
            <Input placeholder="Nhập mã xác nhận" />
          </Form.Item>

          <Form.Item
            name="receiptTxHash"
            label="Hash giao dịch (nếu có)"
          >
            <Input placeholder="0x..." />
          </Form.Item>

          <Form.Item
            name="qualityCheck"
            label="Kiểm tra chất lượng"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái kiểm tra' }]}
          >
            <Select
              options={[
                { value: 'pass', label: 'Đạt (Pass)' },
                { value: 'fail', label: 'Không đạt (Fail)' },
              ]}
              placeholder="Chọn kết quả kiểm tra"
            />
          </Form.Item>

          <Form.Item name="notes" label="Ghi chú">
            <Input.TextArea rows={3} placeholder="Nhập ghi chú nếu có" />
          </Form.Item>

          <div className="flex justify-end">
            <Button onClick={() => navigate(-1)} className="mr-3">
              Quay lại
            </Button>
            <Button loading={loading} type="primary" htmlType="submit">
              Tạo đơn giao ngay
            </Button>
          </div>
        </Form>
      </div>
    </DashboardLayout>
  );
}
