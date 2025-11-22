import { useState, useMemo } from "react";
import { useDistributorContracts } from "../apis/contract";
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
    pending: "Chờ Pharmacy xác nhận",
    approved: "Chờ Distributor ký",
    signed: "Đã ký & Mint NFT",
    rejected: "Đã từ chối",
    not_created: "Chưa tạo",
  };
  return labels[status] || status;
};

export const useContracts = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  
  const {
    data: contractsResponse,
    isLoading: loading,
    refetch: fetchData,
  } = useDistributorContracts();

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
        title: "Pharmacy",
        dataIndex: ["pharmacy", "businessName"],
        key: "pharmacyName",
        ellipsis: true,
        render: (text, record) => {
          return record.pharmacy?.businessName || record.pharmacy?.name || "N/A";
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
              onClick={() =>
                navigate(`/distributor/contracts/${record._id}`)
              }
            >
              Chi tiết
            </Button>
            {record.status === "approved" && (
              <Button
                size="small"
                type="primary"
                onClick={() =>
                  navigate(`/distributor/contracts/${record._id}/finalize`)
                }
              >
                Ký & Mint NFT
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

