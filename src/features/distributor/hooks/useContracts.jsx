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

const extractPharmacyInfo = (pharmacyObj, pharmacyIdField) => {
  if (pharmacyObj && Object.keys(pharmacyObj).length > 0) {
    return pharmacyObj;
  }

  if (typeof pharmacyIdField === "string") {
    const nameMatch = pharmacyIdField.match(/name:\s*'([^']+)'/);
    const licenseMatch = pharmacyIdField.match(/licenseNo:\s*'([^']+)'/);
    const taxMatch = pharmacyIdField.match(/taxCode:\s*'([^']+)'/);

    return {
      name: nameMatch ? nameMatch[1] : pharmacyIdField,
      licenseNo: licenseMatch ? licenseMatch[1] : undefined,
      taxCode: taxMatch ? taxMatch[1] : undefined,
    };
  }

  return {};
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
    const rawData = contractsResponse?.data ?? contractsResponse;
    const list = Array.isArray(rawData?.data)
      ? rawData.data
      : Array.isArray(rawData)
      ? rawData
      : [];

    return list.map((item) => {
      const pharmacyInfo = extractPharmacyInfo(item.pharmacy, item.pharmacyId);
      return {
        ...item,
        _id: item._id || item.id || item.contractId,
        pharmacy: pharmacyInfo,
      };
    });
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
        dataIndex: ["pharmacy", "name"],
        key: "pharmacyName",
        ellipsis: true,
        render: (_, record) =>
          record.pharmacy?.businessName ||
          record.pharmacy?.name ||
          record.pharmacyId ||
          "N/A",
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

