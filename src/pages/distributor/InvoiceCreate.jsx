import React, { useState, useEffect } from 'react';
import { createInvoice } from '../../services/distributor/invoiceService';
import { getDeliveriesToPharmacy } from '../../services/distributor/proofOfPharmacyService';
import { Form, Input, Select, InputNumber, Button, notification, Card, Divider } from 'antd';
import DashboardLayout from '../../components/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { getDistributorNavigationItems } from '../../utils/distributorNavigation';

const { TextArea } = Input;

export default function InvoiceCreate() {
  const [loading, setLoading] = useState(false);
  const [proofOfPharmacies, setProofOfPharmacies] = useState([]);
  const [selectedProof, setSelectedProof] = useState(null);
  const [fetchingProofs, setFetchingProofs] = useState(true);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Lấy danh sách Proof of Pharmacy đã có (chưa có invoice)
  useEffect(() => {
    async function fetchProofs() {
      setFetchingProofs(true);
      try {
        const res = await getDeliveriesToPharmacy();
        const list =
          Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res?.data?.data)
            ? res.data.data
            : [];
        // Chỉ lấy những đơn đã confirmed và chưa có commercial invoice
        const available = list.filter(
          (p) =>
            p.status === 'confirmed' &&
            !p.commercialInvoice &&
            !p.commercialInvoiceId
        );
        setProofOfPharmacies(available);
      } catch (error) {
        notification.error({
          message: 'Không tải được danh sách đơn giao hàng',
        });
      } finally {
        setFetchingProofs(false);
      }
    }
    fetchProofs();
  }, []);

  const onFinish = async (values) => {
    if (!selectedProof) {
      notification.error({ message: 'Vui lòng chọn đơn giao hàng' });
      return;
    }

    setLoading(true);
    try {
      await createInvoice({
        proofOfPharmacyId: selectedProof._id,
        unitPrice: values.unitPrice,
        paymentMethod: values.paymentMethod || 'bank_transfer',
        notes: values.notes || '',
      });
      notification.success({ message: 'Tạo hóa đơn thành công!' });
      form.resetFields();
      setSelectedProof(null);
      setTimeout(() => navigate('/distributor/invoices'), 2000);
    } catch (error) {
      console.error('Create invoice error:', error);
      notification.error({
        message: 'Tạo hóa đơn thất bại!',
        description: error.response?.data?.message || 'Vui lòng thử lại.',
      });
    } finally {
      setLoading(false);
    }
  };

  const navigationItems = getDistributorNavigationItems();

  return (
    <DashboardLayout navigationItems={navigationItems}>
      {/* Banner đồng nhất */}
      <section className="relative overflow-hidden rounded-2xl border border-[#90e0ef33] shadow-[0_10px_30px_rgba(0,0,0,0.06)] bg-gradient-to-tr from-[#00b4d8] via-[#48cae4] to-[#90e0ef]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.25),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-white/30 blur-xl animate-float-slow" />
          <div className="absolute top-8 right-6 w-16 h-8 rounded-full bg-white/25 blur-md rotate-6 animate-float-slower" />
        </div>
        <div className="relative px-6 py-8 md:px-10 md:py-12 text-white">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight drop-shadow-sm">
            Tạo hóa đơn thương mại
          </h1>
          <p className="mt-2 text-white/90">
            Chọn đơn giao hàng đã xác nhận để tạo hóa đơn thương mại cho nhà thuốc.
          </p>
        </div>
      </section>

      <div className="mt-6 max-w-4xl mx-auto space-y-6">
        {/* Form chính */}
        <Card className="rounded-2xl shadow-lg border border-gray-100">
          <Form
            layout="vertical"
            form={form}
            onFinish={onFinish}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="proofOfPharmacyId"
              label={<span className="font-semibold text-gray-700">Chọn đơn giao hàng</span>}
              rules={[{ required: true, message: 'Vui lòng chọn đơn giao hàng' }]}
            >
              <Select
                showSearch
                placeholder="Chọn đơn giao hàng đã xác nhận..."
                loading={fetchingProofs}
                onChange={(value) => {
                  const proof = proofOfPharmacies.find((p) => p._id === value);
                  setSelectedProof(proof);
                  if (proof) {
                    form.setFieldsValue({
                      quantity: proof.receivedQuantity || proof.quantity,
                    });
                  }
                }}
                filterOption={(input, option) =>
                  option.label?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {proofOfPharmacies.map((proof) => {
                  const drug = proof.drug || proof.proofOfDistribution?.drug;
                  const drugName = drug?.name || drug?.tradeName || 'N/A';
                  const pharmacyName = proof.toPharmacy?.name || proof.toPharmacy?.fullName || 'N/A';
                  return (
                    <Select.Option key={proof._id} value={proof._id}>
                      {proof.code || proof.verificationCode || proof._id} - {drugName} - {pharmacyName} (
                      {proof.receivedQuantity || proof.quantity} đơn vị)
                    </Select.Option>
                  );
                })}
              </Select>
            </Form.Item>

            {/* Hiển thị thông tin đơn đã chọn */}
            {selectedProof && (
              <Card className="bg-gradient-to-br from-cyan-50 to-teal-50 border border-cyan-200 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">Mã đơn:</span>{' '}
                    <span className="font-mono">
                      {selectedProof.code || selectedProof.verificationCode}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Nhà thuốc:</span>{' '}
                    {selectedProof.toPharmacy?.name ||
                      selectedProof.toPharmacy?.fullName ||
                      'N/A'}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Thuốc:</span>{' '}
                    {(selectedProof.drug || selectedProof.proofOfDistribution?.drug)?.name ||
                      (selectedProof.drug || selectedProof.proofOfDistribution?.drug)?.tradeName ||
                      'N/A'}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Số lượng:</span>{' '}
                    {selectedProof.receivedQuantity || selectedProof.quantity}
                  </div>
                </div>
              </Card>
            )}

            <Form.Item
              name="unitPrice"
              label={<span className="font-semibold text-gray-700">Đơn giá (₫)</span>}
              rules={[
                { required: true, message: 'Vui lòng nhập đơn giá' },
                { type: 'number', min: 0, message: 'Đơn giá phải lớn hơn 0' },
              ]}
            >
              <InputNumber
                min={0}
                className="w-full"
                placeholder="Nhập đơn giá"
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                }
                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item>

            <Form.Item
              name="paymentMethod"
              label={<span className="font-semibold text-gray-700">Phương thức thanh toán</span>}
              initialValue="bank_transfer"
            >
              <Select>
                <Select.Option value="bank_transfer">Chuyển khoản ngân hàng</Select.Option>
                <Select.Option value="cash">Tiền mặt</Select.Option>
                <Select.Option value="credit_card">Thẻ tín dụng</Select.Option>
                <Select.Option value="other">Khác</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="notes" label={<span className="font-semibold text-gray-700">Ghi chú</span>}>
              <TextArea rows={4} placeholder="Nhập ghi chú nếu có" />
            </Form.Item>

            <Divider />

            <div className="flex justify-end gap-4">
              <Button onClick={() => navigate(-1)} size="large">
                Hủy
              </Button>
              <Button
                loading={loading}
                type="primary"
                htmlType="submit"
                size="large"
                className="bg-gradient-to-r from-[#00b4d8] via-[#48cae4] to-[#90e0ef] border-0"
              >
                Tạo hóa đơn
              </Button>
            </div>
          </Form>
        </Card>
      </div>

      <style>{`
        @keyframes float-slow { 0%,100% { transform: translateY(0) } 50% { transform: translateY(10px) } }
        @keyframes float-slower { 0%,100% { transform: translateY(0) } 50% { transform: translateY(6px) } }
      `}</style>
    </DashboardLayout>
  );
}