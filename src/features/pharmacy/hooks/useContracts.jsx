import { useState, useMemo } from "react";
import { usePharmacyContracts as usePharmacyContractsQuery } from "../../distributor/apis/contract";
import { useNavigate } from "react-router-dom";
import { Tag, Button } from "antd";

export const contractStatusColor = (status) => {
  switch (status) {
    case "pending":
      return "orange";
    case "approved":
      return "blue";
    case "signed":
      return "green";
    case "rejected":
      return "red";
    default:
      return "default";
  }
};

export const contractStatusLabel = (status) => {
  const labels = {
    pending: "Chờ xác nhận",
    approved: "Đã xác nhận - Chờ Distributor",
    signed: "Đã hoàn tất",
    rejected: "Đã từ chối",
    not_created: "Chưa tạo",
  };
  return labels[status] || status;
};

export const usePharmacyContracts = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");

  const {
    data: contractsResponse,
    isLoading: loading,
    refetch: fetchData,
  } = usePharmacyContractsQuery();

  const contracts = useMemo(() => {
    const data = contractsResponse?.data?.data;
    return Array.isArray(data) ? data : [];
  }, [contractsResponse]);

  const filteredContracts = useMemo(() => {
    if (!searchText.trim()) {
      return contracts;
    }

    return contracts.filter((contract) => {
      const searchLower = searchText.toLowerCase();
      return (
        contract._id?.toLowerCase().includes(searchLower) ||
        contract.contractFileName?.toLowerCase().includes(searchLower) ||
        contract.status?.toLowerCase().includes(searchLower)
      );
    });
  }, [contracts, searchText]);

  const columns = useMemo(
    () => [
      {
        title: "Mã hợp đồng",
        dataIndex: "_id",
        key: "_id",
        render: (text) => (
          <span className="font-mono text-sm text-gray-600">
            {text?.substring(0, 8)}...
          </span>
        ),
      },
      {
        title: "Tên file",
        dataIndex: "contractFileName",
        key: "contractFileName",
        ellipsis: true,
        render: (text) => text || "N/A",
      },
      {
        title: "Distributor",
        dataIndex: ["distributor", "businessName"],
        key: "distributorName",
        ellipsis: true,
        render: (text, record) => {
          return (
            record.distributor?.businessName ||
            record.distributor?.name ||
            "N/A"
          );
        },
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        render: (status) => (
          <Tag color={contractStatusColor(status)}>
            {contractStatusLabel(status)}
          </Tag>
        ),
      },
      {
        title: "Token ID",
        dataIndex: "tokenId",
        key: "tokenId",
        render: (tokenId) => (
          <span className="font-mono text-sm">
            {tokenId ? `#${tokenId}` : "-"}
          </span>
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
              onClick={() => navigate(`/pharmacy/contracts/${record._id}`)}
            >
              Chi tiết
            </Button>
            {record.status === "pending" && (
              <Button
                size="small"
                type="primary"
                onClick={() =>
                  navigate(`/pharmacy/contracts/${record._id}/confirm`)
                }
              >
                Xác nhận
              </Button>
            )}
          </div>
        ),
      },
    ],
    [navigate]
  );

  return {
    loading,
    contracts,
    filteredContracts,
    searchText,
    setSearchText,
    columns,
    fetchData,
  };
};
