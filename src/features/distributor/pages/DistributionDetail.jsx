import { Button, Tag, Spin } from "antd";
import DashboardLayout from "../../shared/components/DashboardLayout";
import { navigationItems } from "../constants/navigationItems";
import { useDistributionDetail } from "../hooks/useDistributionDetail";
import { useNavigate } from "react-router-dom";
import { CardUI } from "../../shared/components/ui/cardUI";

export default function DistributionDetail() {
  const navigate = useNavigate();
  const { data, loading, updating, form, onConfirm, onStatusUpdate } =
    useDistributionDetail();

  const getStatusColor = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "confirmed") return "green";
    if (s === "sent") return "blue";
    if (s === "issued") return "cyan";
    if (s === "pending") return "orange";
    if (s === "cancelled") return "red";
    return "default";
  };

  const getStatusLabel = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "confirmed") return "Đã xác nhận";
    if (s === "sent") return "Đã nhận";
    if (s === "issued") return "Đã phát hành";
    if (s === "pending") return "Chờ nhận";
    if (s === "cancelled") return "Đã hủy";
    return status || "N/A";
  };

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
    return (
      <DashboardLayout navigationItems={navigationItems}>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="text-lg text-slate-600 mb-4">
            Không tìm thấy thông tin chi tiết lô hàng
          </div>
          <Button onClick={() => navigate(-1)}>Quay lại</Button>
        </div>
      </DashboardLayout>
    );
  }

  const currentStatus = data.status || data._status || "pending";

  return (
    <DashboardLayout navigationItems={navigationItems}>
      <CardUI
        title="Chi tiết đơn hàng nhận từ Nhà sản xuất"
        subtitle="Thông tin chi tiết về đơn hàng nhận từ nhà sản xuất dược phẩm"
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-[#00a3c4]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
        }
      />

      <div className="space-y-6">
        {/* Thông tin chính */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">
            Thông tin đơn hàng
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Mã đơn
              </label>
              <div className="font-mono font-semibold text-gray-800 text-lg">
                {data.invoiceNumber || data.code || "N/A"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Trạng thái
              </label>
              <Tag color={getStatusColor(currentStatus)} className="text-sm px-3 py-1">
                {getStatusLabel(currentStatus)}
              </Tag>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Mã xác minh (Chain TX Hash)
              </label>
              <div className="font-mono text-xs text-gray-600 break-all">
                {data.chainTxHash ? (
                  <span title={data.chainTxHash}>
                    {data.chainTxHash.slice(0, 12)}...{data.chainTxHash.slice(-10)}
                  </span>
                ) : (
                  data.verificationCode || "N/A"
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Số lô
              </label>
              <div className="font-mono text-gray-800">
                {data.batchNumber || "N/A"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Tên thuốc
              </label>
              <div className="text-gray-800 font-medium">
                {data.drugName ||
                  data.drug?.name ||
                  data.drug?.tradeName ||
                  data.proofOfProduction?.drug?.name ||
                  data.proofOfProduction?.drug?.tradeName ||
                  data.nftInfo?.drug?.name ||
                  data.nftInfo?.drug?.tradeName ||
                  "N/A"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Nhà sản xuất
              </label>
              <div className="text-gray-800">
                {data.manufacturerName ||
                  (typeof (data.fromManufacturer || data.manufacturer) === "object"
                    ? (data.fromManufacturer || data.manufacturer)?.name ||
                      (data.fromManufacturer || data.manufacturer)?.username ||
                      (data.fromManufacturer || data.manufacturer)?.fullName ||
                      "N/A"
                    : (data.fromManufacturer || data.manufacturer) || "N/A")}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Số lượng
              </label>
              <div className="text-gray-800 font-semibold text-lg">
                {data.quantity || 0}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Ngày tạo đơn
              </label>
              <div className="text-gray-800">
                {data.invoiceDate || data.createdAt
                  ? new Date(data.invoiceDate || data.createdAt).toLocaleString("vi-VN")
                  : "N/A"}
              </div>
            </div>
            {data.notes && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Ghi chú
                </label>
                <div className="text-gray-800 bg-gray-50 rounded-lg p-3">
                  {data.notes}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Token IDs */}
        {data.tokenIds && Array.isArray(data.tokenIds) && data.tokenIds.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Danh sách Token IDs (NFT)
            </h2>
            <div className="flex flex-wrap gap-2">
              {data.tokenIds.map((tokenId, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-cyan-50 text-cyan-700 rounded-lg font-mono text-sm border border-cyan-200"
                >
                  #{tokenId}
                </span>
              ))}
            </div>
            <div className="mt-4 text-sm text-slate-500">
              Tổng số: {data.tokenIds.length} token
            </div>
          </div>
        )}

        {/* Thông tin bổ sung */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Thông tin bổ sung
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.unitPrice !== null && (
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Đơn giá
                </label>
                <div className="text-gray-800">
                  {data.unitPrice?.toLocaleString("vi-VN") || "N/A"} VNĐ
                </div>
              </div>
            )}
            {data.totalAmount !== null && (
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Tổng tiền
                </label>
                <div className="text-gray-800 font-semibold">
                  {data.totalAmount?.toLocaleString("vi-VN") || "N/A"} VNĐ
                </div>
              </div>
            )}
            {data.vatRate !== null && (
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  VAT (%)
                </label>
                <div className="text-gray-800">{data.vatRate || "N/A"}%</div>
              </div>
            )}
            {data.finalAmount !== null && (
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Thành tiền
                </label>
                <div className="text-gray-800 font-semibold text-lg">
                  {data.finalAmount?.toLocaleString("vi-VN") || "N/A"} VNĐ
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Ngày cập nhật
              </label>
              <div className="text-gray-800">
                {data.updatedAt
                  ? new Date(data.updatedAt).toLocaleString("vi-VN")
                  : "N/A"}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        {currentStatus === "sent" && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Xác nhận nhận hàng
            </h2>
            <p className="text-slate-600 mb-4">
              Đơn hàng đã được gửi từ nhà sản xuất. Vui lòng xác nhận khi đã nhận được hàng.
            </p>
            <Button
              type="primary"
              size="large"
              onClick={onConfirm}
              className="bg-primary hover:bg-secondary !text-white border-0 px-8 py-6 h-auto text-base font-semibold rounded-full"
            >
              Xác nhận nhận lô hàng
            </Button>
          </div>
        )}

        {/* Nút quay lại */}
        <div className="flex justify-end">
          <Button
            onClick={() => navigate(-1)}
            className="px-6 py-2 rounded-full border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Quay lại
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
