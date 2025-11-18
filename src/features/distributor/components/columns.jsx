import PropTypes from "prop-types";
import { Button, Table, Tag } from "antd";
import { useNavigate } from "react-router-dom";

const { Column } = Table;

const statusColor = (status) => {
  switch (status) {
    case "confirmed":
      return "green";
    case "pending":
      return "orange";
    default:
      return "blue";
  }
};

const statusLabel = (status) => {
  const labels = {
    confirmed: "Đã xác nhận",
    pending: "Chờ xác nhận",
    cancelled: "Đã hủy",
  };
  return labels[status] || status;
};

export default function DistributorDeliveryColumns({ onUpdateStatus }) {
  const navigate = useNavigate();

  return (
    <>
      <Column
        title="Mã đơn"
        dataIndex="code"
        key="code"
        render={(text) => (
          <span className="font-mono font-semibold text-gray-800">
            {text || "N/A"}
          </span>
        )}
      />
      <Column
        title="Mã xác minh"
        dataIndex="verificationCode"
        key="verificationCode"
        render={(text) => (
          <span className="font-mono text-sm text-gray-600">
            {text || "N/A"}
          </span>
        )}
      />
      <Column
        title="Nhà thuốc"
        dataIndex="pharmacyName"
        key="pharmacyName"
        ellipsis
      />
      <Column
        title="Tên thuốc"
        dataIndex="drugName"
        key="drugName"
        ellipsis
        render={(text, record) => {
          const drug = record.drug || record.proofOfDistribution?.drug;
          return drug?.name || drug?.tradeName || text || "N/A";
        }}
      />
      <Column
        title="Số lượng"
        dataIndex="quantity"
        key="quantity"
        render={(val) => <span className="font-medium">{val || 0}</span>}
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
        title="Ngày tạo"
        dataIndex="createdAt"
        key="createdAt"
        render={(date) =>
          date ? new Date(date).toLocaleDateString("vi-VN") : "N/A"
        }
      />
      <Column
        title="Thao tác"
        key="action"
        render={(_, record) => (
          <div className="flex gap-2">
            <Button
              size="small"
              onClick={() => navigate(`/distributor/deliveries/${record._id}`)}
            >
              Chi tiết
            </Button>
            {record.status === "pending" && (
              <Button
                size="small"
                type="primary"
                onClick={() => onUpdateStatus(record._id)}
              >
                Xác nhận giao
              </Button>
            )}
          </div>
        )}
      />
    </>
  );
}

DistributorDeliveryColumns.propTypes = {
  onUpdateStatus: PropTypes.func.isRequired,
};
