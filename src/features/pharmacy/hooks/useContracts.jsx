import { useState, useMemo, useEffect } from "react";
import { usePharmacyContracts as usePharmacyContractsQuery } from "../../distributor/apis/contract";
import { useNavigate } from "react-router-dom";
import { Tag, Button, Empty } from "antd";

export const contractStatusColor = (status) => {
  switch (status) {
    case "pending":
      return "orange";
    case "approved":
      return "blue";
    case "signed":
      return "green";
    case "confirmed":
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
    confirmed: "Đã xác nhận",
    rejected: "Đã từ chối",
    not_created: "Chưa tạo",
  };
  return labels[status] || status;
};

export const usePharmacyContracts = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [loadingProgress, setLoadingProgress] = useState(0);

  const {
    data: contractsResponse,
    isLoading: loading,
    refetch: fetchData,
  } = usePharmacyContractsQuery();

  // Update loading progress when loading state changes
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingProgress((prev) =>
          prev < 0.9 ? Math.min(prev + 0.02, 0.9) : prev
        );
      }, 50);
      return () => clearInterval(interval);
    } else {
      setLoadingProgress(1);
      setTimeout(() => setLoadingProgress(0), 500);
    }
  }, [loading]);

  const contracts = useMemo(() => {
    const data = contractsResponse?.data;
    return Array.isArray(data) ? data : [];
  }, [contractsResponse]);

  const filteredContracts = useMemo(() => {
    if (!searchText.trim()) {
      return contracts;
    }

    return contracts.filter((contract) => {
      const searchLower = searchText.toLowerCase();
      return (
        contract.id?.toLowerCase().includes(searchLower) ||
        contract.contractFileName?.toLowerCase().includes(searchLower) ||
        contract.status?.toLowerCase().includes(searchLower)
      );
    });
  }, [contracts, searchText]);

  const columns = useMemo(
    () => [
      {
        title: "Mã hợp đồng",
        dataIndex: "id",
        key: "id",
        render: (text) => (
          <span className="font-mono text-sm text-gray-600" title={text}>
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
        title: "URL hợp đồng",
        dataIndex: "contractFileUrl",
        key: "contractFileUrl",
        ellipsis: true,
        render: (url) => 
          url ? (
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              Xem file
            </a>
          ) : (
            "N/A"
          ),
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
        title: "Ký bởi Distributor",
        dataIndex: "distributorSignedAt",
        key: "distributorSignedAt",
        render: (date) =>
          date ? new Date(date).toLocaleDateString("vi-VN") : "Chưa ký",
      },
      {
        title: "Ký bởi Pharmacy",
        dataIndex: "pharmacySignedAt",
        key: "pharmacySignedAt",
        render: (date) =>
          date ? new Date(date).toLocaleDateString("vi-VN") : "Chưa ký",
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
        width: 150,
        fixed: "right",
        render: (_, record) => (
          <div className="flex gap-2">
            <Button
              size="small"
              onClick={() => navigate(`/pharmacy/contracts/${record.id}`)}
            >
              Chi tiết
            </Button>
            {record.status === "pending" && (
              <Button
                size="small"
                type="primary"
                onClick={() =>
                  navigate(`/pharmacy/contracts/${record.id}/confirm`)
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
    loadingProgress,
    contracts,
    filteredContracts,
    searchText,
    setSearchText,
    columns,
    fetchData,
  };
};
