import React, { useState } from 'react';
import { createProofToPharmacy } from '../../services/distributor/proofOfPharmacyService';
import { Input, Button, notification, Form, InputNumber, Select } from 'antd';
import DashboardLayout from '../../components/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { listPharmacies } from '../../services/admin/proofOfPharmacyService';

export default function CreateProofToPharmacy() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [pharmacies, setPharmacies] = useState([]);
  const [fetchingPharmacy, setFetchingPharmacy] = useState(true);

  React.useEffect(() => {
    async function fetchPharmacies() {
      setFetchingPharmacy(true);
      try {
        const res = await listPharmacies();
        setPharmacies(
          (res?.data?.data || res?.data || []).map((pharmacy) => ({
            value: pharmacy._id,
            label: pharmacy.name || pharmacy._id,
          }))
        );
      } catch (error) {
        setPharmacies([]);
      } finally {
        setFetchingPharmacy(false);
      }
    }
    fetchPharmacies();
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await createProofToPharmacy(values);
      notification.success({ message: 'Tạo đơn giao thành công!' });
      form.resetFields();
    } catch (error) {
      console.error('Create Proof error:', error);
      notification.error({ message: 'Tạo đơn thất bại!' });
    } finally {
      setLoading(false);
    }
  };

  const navigationItems = [
    {
      path: "/distributor",
      label: "Trang chủ",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 12l9-9 9 9M4 10v10h16V10"
          />
        </svg>
      ),
      active: true,
    },
    {
      path: "/distributor/distributions",
      label: "Proof of Distribution",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    {
      path: "/distributor/nft-tracking",
      label: "Theo dõi vận chuyển",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v4l3 3m-9 6h12a2 2 0 002-2V5a2 2 0 00-2-2H9.828a2 2 0 00-1.414.586L4 8v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      path: "/distributor/create-proof",
      label: "Tạo minh chứng giao",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
    {
      path: "/distributor/invoices",
      label: "Hóa đơn",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12h6m-6 4h6M5 4h14a2 2 0 012 2v14l-4-2-4 2-4-2-4 2V6a2 2 0 012-2z"
          />
        </svg>
      ),
    },
    {
      path: "/distributor/stats",
      label: "Thống kê",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h10M4 14h6m-2 4h12" />
        </svg>
      ),
    },
  ];

  // 📊 Không có metrics cho trang này (vì chỉ là form)
  const metrics = [];

  return (
    <DashboardLayout metrics={metrics} navigationItems={navigationItems}>
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
            rules={[{ required: true, message: 'Vui lòng nhập hoặc chọn nhà thuốc' }]}
          >
            <Select
              showSearch
              options={pharmacies}
              loading={fetchingPharmacy}
              placeholder="Chọn nhà thuốc"
              filterOption={(input, option) =>
                option.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            />
          </Form.Item>

          <Form.Item
            name="drugName"
            label="Tên thuốc"
            rules={[{ required: true, message: 'Vui lòng nhập tên thuốc' }]}
          >
            <Input placeholder="Nhập tên thuốc" />
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Số lượng"
            rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
          >
            <InputNumber min={1} className="w-full" placeholder="Nhập số lượng" />
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
