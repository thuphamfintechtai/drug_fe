import {
  Button,
  Card,
  Descriptions,
  Tag,
  Spin,
  Form,
  Select,
  Input,
} from "antd";
import DashboardLayout from "../../shared/components/DashboardLayout";
import { navigationItems } from "../constants/navigationItems";
import { useDeliveryDetail } from "../hooks/useDeliveryDetail";
import { useNavigate } from "react-router-dom";

const { TextArea } = Input;

export default function DeliveryDetail() {
  const { data, loading, updating, form, onStatusUpdate } = useDeliveryDetail();
  const navigate = useNavigate();

  if (loading) {
    return (
      <DashboardLayout navigationItems={navigationItems}>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return null;
  }

  const statusColor = {
    confirmed: "green",
    pending: "orange",
    cancelled: "red",
  };

  return (
    <DashboardLayout navigationItems={navigationItems}>
      {/* Banner đồng nhất */}
      <section className="relative overflow-hidden rounded-2xl border border-[#90e0ef33] shadow-[0_10px_30px_rgba(0,0,0,0.06)] bg-gradient-to-tr from-[#00b4d8] via-[#48cae4] to-[#90e0ef]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.25),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-white/30 blur-xl animate-float-slow" />
          <div className="absolute top-8 right-6 w-16 h-8 rounded-full bg-white/25 blur-md rotate-6 animate-float-slower" />
        </div>
        <div className="relative px-6 py-8 md:px-10 md:py-12 !text-white">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight drop-shadow-sm">
            Chi tiết đơn giao hàng
          </h1>
          <p className="mt-2 !text-white/90">
            Thông tin chi tiết về đơn giao hàng đến nhà thuốc.
          </p>
        </div>
      </section>

      <div className="mt-6 space-y-6">
        {/* Thông tin đơn hàng */}
        <Card
          title="Thông tin đơn giao hàng"
          className="rounded-2xl shadow-lg border border-gray-100"
        >
          <Descriptions column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label="Mã đơn">
              <span className="font-mono font-semibold">
                {data.code || data.verificationCode || "N/A"}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Mã xác minh">
              <span className="font-mono">
                {data.verificationCode || "N/A"}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Nhà thuốc">
              {data.toPharmacy?.name ||
                data.toPharmacy?.fullName ||
                data.pharmacyName ||
                "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Thuốc">
              {data.drug?.name ||
                data.drug?.tradeName ||
                data.proofOfDistribution?.drug?.name ||
                data.proofOfDistribution?.drug?.tradeName ||
                data.drugName ||
                "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Số lượng">
              <span className="font-medium">
                {data.receivedQuantity || data.quantity || 0}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={statusColor[data.status] || "default"}>
                {data.status === "confirmed"
                  ? "Đã xác nhận"
                  : data.status === "pending"
                  ? "Chờ xác nhận"
                  : data.status === "cancelled"
                  ? "Đã hủy"
                  : data.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ giao hàng">
              {data.receiptAddress || data.deliveryAddress || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {data.createdAt
                ? new Date(data.createdAt).toLocaleString("vi-VN")
                : "N/A"}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Form cập nhật trạng thái */}
        <Card
          title="Cập nhật trạng thái"
          className="rounded-2xl shadow-lg border border-gray-100"
        >
          <Form form={form} onFinish={onStatusUpdate} layout="vertical">
            <Form.Item
              name="status"
              label="Trạng thái"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
            >
              <Select>
                <Select.Option value="pending">Chờ xác nhận</Select.Option>
                <Select.Option value="confirmed">Đã xác nhận</Select.Option>
                <Select.Option value="cancelled">Đã hủy</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="notes" label="Ghi chú">
              <TextArea rows={3} placeholder="Nhập ghi chú" />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={updating}
                className="bg-gradient-to-r from-[#00b4d8] via-[#48cae4] to-[#90e0ef] border-0"
              >
                Cập nhật
              </Button>
              <Button onClick={() => navigate(-1)} className="ml-2">
                Quay lại
              </Button>
            </Form.Item>
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
