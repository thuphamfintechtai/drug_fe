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
import { useInvoiceDetail } from "../hooks/useInvoiceDetail";
import { useNavigate } from "react-router-dom";
export default function InvoiceDetail() {
  const { data, loading, updating, form, onStatusUpdate } = useInvoiceDetail();
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
    paid: "green",
    pending: "orange",
    draft: "blue",
    cancelled: "red",
  };

  return (
    <DashboardLayout navigationItems={navigationItems}>
      {/* Banner kiểu Manufacturer */}
      <div className="bg-white rounded-xl border border-cyan-200 shadow-sm p-5">
        <h1 className="text-xl font-semibold text-[#007b91]">
          Chi tiết hóa đơn
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Xem và cập nhật thông tin hóa đơn thương mại.
        </p>
      </div>

      <div className="mt-6 space-y-6">
        {/* Thông tin hóa đơn */}
        <Card
          title="Thông tin hóa đơn"
          className="rounded-2xl shadow-sm border border-cyan-100"
        >
          <Descriptions column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label="Mã hóa đơn">
              <span className="font-mono font-semibold">
                {data.code || data._id}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={statusColor[data.status] || "default"}>
                {data.status === "paid"
                  ? "Đã thanh toán"
                  : data.status === "pending"
                  ? "Chờ thanh toán"
                  : data.status === "draft"
                  ? "Bản nháp"
                  : data.status === "cancelled"
                  ? "Đã hủy"
                  : data.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Nhà thuốc">
              {data.toPharmacy?.name ||
                data.toPharmacy?.username ||
                data.pharmacyName ||
                "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Thuốc">
              {data.drug?.name ||
                data.drug?.tradeName ||
                data.proofOfPharmacy?.drug?.name ||
                data.proofOfPharmacy?.drug?.tradeName ||
                data.drugName ||
                "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Tổng tiền">
              <span className="font-semibold text-lg">
                {data.totalAmount
                  ? `${Number(data.totalAmount).toLocaleString("vi-VN")} ₫`
                  : "0 ₫"}
              </span>
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
          className="rounded-2xl shadow-sm border border-cyan-100"
        >
          <Form form={form} onFinish={onStatusUpdate} layout="vertical">
            <Form.Item
              name="status"
              label="Trạng thái"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
            >
              <Select>
                <Select.Option value="draft">Bản nháp</Select.Option>
                <Select.Option value="pending">Chờ thanh toán</Select.Option>
                <Select.Option value="paid">Đã thanh toán</Select.Option>
                <Select.Option value="cancelled">Đã hủy</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="notes" label="Ghi chú">
              <Input.TextArea rows={3} placeholder="Nhập ghi chú" />
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
