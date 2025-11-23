import { Form, Button, Select, InputNumber, Input, Card, Divider } from "antd";
import DashboardLayout from "../../shared/components/DashboardLayout";
import { navigationItems } from "../constants/navigationItems";
import { useCreateProofToPharmacy } from "../hooks/useCreateProofToPharmacy";
import { useNavigate } from "react-router-dom";

const { TextArea } = Input;

export default function CreateProofToPharmacy() {
  const {
    loading,
    pharmacies,
    distributions,
    fetchingPharmacy,
    fetchingDistribution,
    form,
    onFinish,
  } = useCreateProofToPharmacy();
  const navigate = useNavigate();

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
            Tạo đơn giao hàng đến Nhà thuốc
          </h1>
          <p className="mt-2 !text-white/90">
            Chọn đơn phân phối đã được xác nhận để tạo đơn giao hàng cho nhà
            thuốc.
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
              name="proofOfDistributionId"
              label={
                <span className="font-semibold text-gray-700">
                  Chọn đơn phân phối đã xác nhận
                </span>
              }
              rules={[
                { required: true, message: "Vui lòng chọn đơn phân phối" },
              ]}
            >
              <Select
                showSearch
                placeholder="Chọn đơn phân phối..."
                loading={fetchingDistribution}
                filterOption={(input, option) =>
                  option.label?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {distributions.map((dist) => {
                  const drug =
                    dist.drug ||
                    dist.proofOfProduction?.drug ||
                    dist.nftInfo?.drug;
                  const drugName = drug?.name || drug?.tradeName || "N/A";
                  return (
                    <Select.Option
                      key={dist._id}
                      value={dist._id}
                      label={`${
                        dist.code || dist.verificationCode || dist._id
                      } - ${drugName} (${
                        dist.distributedQuantity || dist.quantity
                      } đơn vị)`}
                    >
                      {dist.code || dist.verificationCode || dist._id} -{" "}
                      {drugName} ({dist.distributedQuantity || dist.quantity}{" "}
                      đơn vị)
                    </Select.Option>
                  );
                })}
              </Select>
            </Form.Item>

            <Form.Item
              name="toPharmacyId"
              label={
                <span className="font-semibold text-gray-700">
                  Chọn nhà thuốc
                </span>
              }
              rules={[{ required: true, message: "Vui lòng chọn nhà thuốc" }]}
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
              name="deliveredQuantity"
              label={
                <span className="font-semibold text-gray-700">
                  Số lượng giao
                </span>
              }
              rules={[
                { required: true, message: "Vui lòng nhập số lượng" },
                { type: "number", min: 1, message: "Số lượng phải lớn hơn 0" },
                {
                  validator: (_, value) => {
                    const selectedDistId = form.getFieldValue(
                      "proofOfDistributionId"
                    );
                    if (selectedDistId) {
                      const selectedDist = distributions.find(
                        (d) => d._id === selectedDistId
                      );
                      if (
                        selectedDist &&
                        value >
                          (selectedDist.distributedQuantity ||
                            selectedDist.quantity)
                      ) {
                        return Promise.reject(
                          "Số lượng giao không được vượt quá số lượng có sẵn"
                        );
                      }
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber
                min={1}
                className="w-full"
                placeholder="Nhập số lượng"
              />
            </Form.Item>

            <Form.Item
              name="deliveryAddress"
              label={
                <span className="font-semibold text-gray-700">
                  Địa chỉ giao hàng
                </span>
              }
            >
              <Input placeholder="Nhập địa chỉ giao hàng (tùy chọn)" />
            </Form.Item>

            <Form.Item
              name="estimatedDelivery"
              label={
                <span className="font-semibold text-gray-700">
                  Ngày giao dự kiến
                </span>
              }
            >
              <Input type="date" />
            </Form.Item>

            <Form.Item
              name="notes"
              label={
                <span className="font-semibold text-gray-700">Ghi chú</span>
              }
            >
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
                Tạo đơn giao hàng
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
