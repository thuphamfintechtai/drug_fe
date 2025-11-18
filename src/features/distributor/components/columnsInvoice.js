import { Button, Table, Tag } from "antd";
import { useNavigate } from "react-router-dom";

const { Column } = Table;

const statusColor = (status) => {
  const colors = {
    paid: "green",
    pending: "orange",
    draft: "blue",
    cancelled: "red",
  };
  return colors[status] || "default";
};

const statusLabel = (status) => {
  const labels = {
    paid: "Đã thanh toán",
    pending: "Chờ thanh toán",
    draft: "Bản nháp",
    cancelled: "Đã hủy",
  };
  return labels[status] || status;
};

const formatCurrency = (value) =>
  value ? `${Number(value).toLocaleString("vi-VN")} ₫` : "0 ₫";

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("vi-VN") : "N/A";

export default function DistributorInvoiceColumns() {
  const navigate = useNavigate();

  const handleViewDetail = (id) => {
    navigate(`/distributor/invoices/${id}`);
  };

  return (
    <>
      <Column
        title="Mã hóa đơn"
        dataIndex="code"
        key="code"
        render={(text) => (
          <span className="font-mono font-semibold text-gray-800">
            {text || "N/A"}
          </span>
        )}
      />
      <Column
        title="Nhà thuốc"
        dataIndex="pharmacyName"
        key="pharmacyName"
        render={(text, record) =>
          text ||
          record.toPharmacy?.name ||
          record.toPharmacy?.username ||
          "N/A"
        }
      />
      <Column
        title="Thuốc"
        dataIndex="drugName"
        key="drugName"
        render={(text, record) => {
          const drug = record.drug || record.proofOfPharmacy?.drug;
          return drug?.name || drug?.tradeName || text || "N/A";
        }}
      />
      <Column
        title="Trạng thái"
        dataIndex="status"
        key="status"
        render={(status) => (
          <Tag color={statusColor(status)}>{statusLabel(status)}</Tag>
        )}
      />
      <Column
        title="Tổng tiền"
        dataIndex="totalAmount"
        key="totalAmount"
        render={formatCurrency}
      />
      <Column
        title="Ngày tạo"
        dataIndex="createdAt"
        key="createdAt"
        render={formatDate}
      />
      <Column
        title="Thao tác"
        key="action"
        render={(_, record) => (
          <Button size="small" onClick={() => handleViewDetail(record._id)}>
            Xem chi tiết
          </Button>
        )}
      />
    </>
  );
}
