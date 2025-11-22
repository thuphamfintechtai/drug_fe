import { useEffect, useState, useMemo, useCallback } from "react";
import { distributorQueries } from "../apis/distributor";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button, Tag } from "antd";

export const statusColor = (status) => {
  switch (status) {
    case "confirmed":
      return "green";
    case "pending":
      return "orange";
    default:
      return "blue";
  }
};

export const statusLabel = (status) => {
  const labels = {
    confirmed: "Đã xác nhận",
    pending: "Chờ xác nhận",
    cancelled: "Đã hủy",
  };
  return labels[status] || status;
};

export const useDistributions = () => {
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();
  const {
    data: distributionsData,
    isLoading: loading,
    refetch: fetchData,
  } = distributorQueries.getDistributions();
  const { mutateAsync: confirmDistributionMutation } =
    distributorQueries.confirmDistribution();

  const data = Array.isArray(distributionsData?.data)
    ? distributionsData.data
    : Array.isArray(distributionsData?.data?.data)
    ? distributionsData.data.data
    : distributionsData?.data
    ? [distributionsData.data]
    : [];

  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredData(data);
      return;
    }
    const filtered = data.filter((item) => {
      const drug =
        item.drug || item.proofOfProduction?.drug || item.nftInfo?.drug;
      const drugName = drug?.name || drug?.tradeName || item.drugName || "";
      return (
        item.code?.toLowerCase().includes(searchText.toLowerCase()) ||
        drugName.toLowerCase().includes(searchText.toLowerCase()) ||
        item.verificationCode?.toLowerCase().includes(searchText.toLowerCase())
      );
    });
    setFilteredData(filtered);
  }, [searchText, data]);

  const onConfirm = useCallback(
    async (id) => {
      try {
        await confirmDistributionMutation(id);
        toast.success("Xác nhận nhận lô hàng thành công!");
        fetchData();
      } catch {
        toast.error("Xác nhận thất bại!");
      }
    },
    [confirmDistributionMutation, fetchData]
  );

  const columns = useMemo(
    () => [
      {
        title: "Mã đơn",
        dataIndex: "code",
        key: "code",
        render: (text) => (
          <span className="font-mono font-semibold text-gray-800">
            {text || "N/A"}
          </span>
        ),
      },
      {
        title: "Mã xác minh",
        dataIndex: "verificationCode",
        key: "verificationCode",
        render: (text) => (
          <span className="font-mono text-sm text-gray-600">
            {text || "N/A"}
          </span>
        ),
      },
      {
        title: "Nhà sản xuất",
        dataIndex: "manufacturerName",
        key: "manufacturerName",
        ellipsis: true,
      },
      {
        title: "Tên thuốc",
        dataIndex: "drugName",
        key: "drugName",
        ellipsis: true,
        render: (text, record) => {
          const drug =
            record.drug ||
            record.proofOfProduction?.drug ||
            record.nftInfo?.drug;
          return drug?.name || drug?.tradeName || text || "N/A";
        },
      },
      {
        title: "Số lượng",
        dataIndex: "quantity",
        key: "quantity",
        render: (val) => <span className="font-medium">{val || 0}</span>,
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        render: (status) => (
          <Tag color={statusColor(status)}>{statusLabel(status)}</Tag>
        ),
      },
      {
        title: "Ngày tạo",
        dataIndex: "createdAt",
        key: "createdAt",
        render: (date) =>
          date ? new Date(date).toLocaleDateString("vi-VN") : "N/A",
      },
      {
        title: "Thao tác",
        key: "action",
        render: (_, record) => (
          <div className="flex gap-2">
            <Button
              size="small"
              onClick={() =>
                navigate(`/distributor/distributions/${record._id}`)
              }
            >
              Chi tiết
            </Button>
            {record.status === "pending" && (
              <Button
                size="small"
                type="primary"
                onClick={() => onConfirm(record._id)}
              >
                Xác nhận nhận
              </Button>
            )}
          </div>
        ),
      },
    ],
    [navigate, onConfirm]
  );

  return {
    loading,
    filteredData,
    searchText,
    setSearchText,
    onConfirm,
    columns,
    data,
  };
};
