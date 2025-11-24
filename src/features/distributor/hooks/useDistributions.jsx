import { useEffect, useState, useMemo, useCallback } from "react";
import {
  useDistributorDistributions,
  useConfirmDistribution,
} from "../apis/distributor";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button, Tag } from "antd";
import api from "../../utils/api";

export const statusColor = (status) => {
  switch (status) {
    case "confirmed":
      return "green";
    case "pending":
      return "orange";
    case "issued":
      return "blue";
    default:
      return "blue";
  }
};

export const statusLabel = (status) => {
  const labels = {
    confirmed: "Đã xác nhận",
    pending: "Chờ xác nhận",
    issued: "Đã phát hành",
    cancelled: "Đã hủy",
  };
  return labels[status] || status;
};

export const useDistributions = () => {
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmForm, setConfirmForm] = useState({
    receivedBy: "",
    receivedByTitle: "",
    deliveryAddress: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "Việt Nam",
    },
    shippingInfo: {
      carrier: "",
      trackingNumber: "",
    },
    notes: "",
    distributionDate: new Date().toISOString().split("T")[0],
    distributedQuantity: "",
  });
  const [confirmFormErrors, setConfirmFormErrors] = useState({});
  const navigate = useNavigate();
  const {
    data: distributionsData,
    isLoading: loading,
    refetch: fetchData,
  } = useDistributorDistributions();
  const { mutateAsync: confirmDistributionMutation } = useConfirmDistribution();

  const data = Array.isArray(distributionsData?.data)
    ? distributionsData.data.map(item => ({
        ...item,
        _id: item._id || item.id, // Normalize _id field
      }))
    : Array.isArray(distributionsData?.data?.data)
    ? distributionsData.data.data.map(item => ({
        ...item,
        _id: item._id || item.id,
      }))
    : distributionsData?.data
    ? [{ ...distributionsData.data, _id: distributionsData.data._id || distributionsData.data.id }]
    : [];

  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredData(data);
      return;
    }
    const searchLower = searchText.toLowerCase();
    const filtered = data.filter((item) => {
      const drug =
        item.drug || item.proofOfProduction?.drug || item.nftInfo?.drug;
      const drugName = drug?.name || drug?.tradeName || item.drugName || "";
      const invoiceNumber = item.invoiceNumber || item.code || "";
      const verificationCode = item.verificationCode || "";
      return (
        invoiceNumber.toLowerCase().includes(searchLower) ||
        drugName.toLowerCase().includes(searchLower) ||
        verificationCode.toLowerCase().includes(searchLower) ||
        item.manufacturerId?.toLowerCase().includes(searchLower) ||
        item.drugId?.toLowerCase().includes(searchLower)
      );
    });
    setFilteredData(filtered);
  }, [searchText, data]);

  const handleOpenConfirmDialog = useCallback((record) => {
    setSelectedRecord(record);
    setConfirmForm({
      receivedBy: "",
      receivedByTitle: "",
      deliveryAddress: {
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "Việt Nam",
      },
      shippingInfo: {
        carrier: "",
        trackingNumber: "",
      },
      notes: "",
      distributionDate: new Date().toISOString().split("T")[0],
      distributedQuantity: record.quantity?.toString() || "",
    });
    setConfirmFormErrors({});
    setShowConfirmDialog(true);
  }, []);

  const handleCloseConfirmDialog = useCallback(() => {
    setShowConfirmDialog(false);
    setSelectedRecord(null);
    setConfirmFormErrors({});
  }, []);

  const validateForm = useCallback((maxQuantity) => {
    const errors = {};

    if (
      confirmForm.distributedQuantity &&
      parseInt(confirmForm.distributedQuantity, 10) <= 0
    ) {
      errors.distributedQuantity = "Số lượng phải lớn hơn 0";
    } else if (
      confirmForm.distributedQuantity &&
      maxQuantity > 0 &&
      parseInt(confirmForm.distributedQuantity, 10) > maxQuantity
    ) {
      errors.distributedQuantity = `Số lượng không được vượt quá ${maxQuantity}`;
    }

    setConfirmFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [confirmForm]);

  const handleSubmitConfirm = useCallback(async () => {
    if (!selectedRecord || isConfirming) {
      return;
    }

    setIsConfirming(true);

    try {
      const invoiceId = selectedRecord._id || selectedRecord.id;
      if (!invoiceId) {
        toast.error("Không tìm thấy ID đơn hàng!");
        setIsConfirming(false);
        return;
      }

      let latestInvoice;
      try {
        const response = await api.get(`/distributor/invoices/${invoiceId}/detail`);
        latestInvoice = response.data?.data || response.data;
      } catch (error) {
        const message = error?.response?.data?.message || error.message || "Không thể tải thông tin invoice";
        toast.error(message);
        setIsConfirming(false);
        return;
      }

      const latestStatus = (latestInvoice?._status || "").toLowerCase();
      if (latestStatus !== "sent") {
        toast.error("Invoice hiện chưa ở trạng thái 'sent'. Vui lòng kiểm tra lại bước lưu transaction.");
        setIsConfirming(false);
        return;
      }

      const maxQuantity =
        latestInvoice?.quantity ||
        latestInvoice?.totalQuantity ||
        latestInvoice?.tokenIds?.length ||
        selectedRecord.quantity ||
        0;

      if (!validateForm(maxQuantity)) {
        toast.error("Vui lòng kiểm tra và sửa các lỗi trong form");
        setIsConfirming(false);
        return;
      }

      const payload = {
        invoiceId,
        ...(confirmForm.distributionDate && {
          distributionDate: new Date(confirmForm.distributionDate).toISOString(),
        }),
        ...(confirmForm.distributedQuantity && {
          distributedQuantity: parseInt(confirmForm.distributedQuantity, 10),
        }),
        ...(confirmForm.receivedBy?.trim() && {
          receivedBy: {
            name: confirmForm.receivedBy.trim(),
            ...(confirmForm.receivedByTitle?.trim() && {
              title: confirmForm.receivedByTitle.trim(),
            }),
          },
        }),
        ...(confirmForm.notes?.trim() && { notes: confirmForm.notes.trim() }),
      };

      await confirmDistributionMutation(payload);
      toast.success("Xác nhận nhận lô hàng thành công!");
      handleCloseConfirmDialog();
      fetchData();
    } catch (error) {
      console.error("Lỗi xác nhận nhận hàng:", error);
      toast.error(error?.response?.data?.message || error?.message || "Xác nhận thất bại!");
    } finally {
      setIsConfirming(false);
    }
  }, [
    selectedRecord,
    confirmForm,
    isConfirming,
    validateForm,
    confirmDistributionMutation,
    handleCloseConfirmDialog,
    fetchData,
  ]);

  const onConfirm = handleOpenConfirmDialog;

  const columns = useMemo(
    () => [
      {
        title: "Mã đơn",
        dataIndex: "invoiceNumber",
        key: "invoiceNumber",
        render: (text, record) => (
          <span className="font-mono font-semibold text-gray-800">
            {text || record.code || "N/A"}
          </span>
        ),
      },
      {
        title: "Mã xác minh",
        dataIndex: "verificationCode",
        key: "verificationCode",
        render: (text, record) => {
          // Nếu có chainTxHash, hiển thị một phần của nó
          if (record.chainTxHash) {
            return (
              <span className="font-mono text-xs text-gray-600" title={record.chainTxHash}>
                {record.chainTxHash.slice(0, 10)}...{record.chainTxHash.slice(-8)}
              </span>
            );
          }
          return (
            <span className="font-mono text-sm text-gray-600">
              {text || "N/A"}
            </span>
          );
        },
      },
      {
        title: "Nhà sản xuất",
        key: "manufacturer",
        render: (_, record) => {
          const manufacturer = record.manufacturer || record.manufacturerName;
          if (typeof manufacturer === "object") {
            return manufacturer.fullName || manufacturer.name || manufacturer.username || "N/A";
          }
          return manufacturer || record.manufacturerId || "N/A";
        },
      },
      {
        title: "Tên thuốc",
        key: "drug",
        ellipsis: true,
        render: (_, record) => {
          const drug =
            record.drug ||
            record.proofOfProduction?.drug ||
            record.nftInfo?.drug;
          if (drug) {
            return drug.name || drug.tradeName || drug.genericName || "N/A";
          }
          return record.drugName || record.drugId || "N/A";
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
        render: (_, record) => {
          const recordId = record._id || record.id;
          return (
            <div className="flex gap-2">
              <Button
                size="small"
                onClick={() =>
                  navigate(`/distributor/distributions/${recordId}`)
                }
              >
                Chi tiết
              </Button>
              {(record?.status || "").toLowerCase() === "sent" && (
                <Button
                  size="small"
                  type="primary"
                  onClick={() => onConfirm(record)}
                >
                  Xác nhận nhận
                </Button>
              )}
            </div>
          );
        },
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
    showConfirmDialog,
    selectedRecord,
    isConfirming,
    confirmForm,
    setConfirmForm,
    confirmFormErrors,
    setConfirmFormErrors,
    handleCloseConfirmDialog,
    handleSubmitConfirm,
  };
};

