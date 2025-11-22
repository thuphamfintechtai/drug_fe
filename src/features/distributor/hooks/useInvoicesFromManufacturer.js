import { useState, useEffect, useRef } from "react";
import {
  useDistributorInvoicesFromManufacturer,
  useConfirmReceipt,
} from "../apis/distributor";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

export const useInvoicesFromManufacturer = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [isConfirming, setIsConfirming] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [confirmForm, setConfirmForm] = useState({
    receivedBy: {
      fullName: "",
      position: "",
      signature: "",
    },
    deliveryAddress: {
      street: "",
      district: "",
      city: "",
    },
    shippingInfo: {
      carrier: "",
      trackingNumber: "",
      shippedDate: "",
    },
    notes: "",
    distributionDate: new Date().toISOString().split("T")[0],
    distributedQuantity: "",
  });
  const [searchInput, setSearchInput] = useState("");
  const [confirmFormErrors, setConfirmFormErrors] = useState({});

  const page = parseInt(searchParams.get("page") || "1", 10);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const prevSearchRef = useRef(search);

  const params = { page, limit: 10 };
  if (search) {
    params.search = search;
  }
  if (status) {
    params.status = status;
  }

  const {
    data: queryData,
    isLoading: queryLoading,
    isFetching,
    refetch,
  } = useDistributorInvoicesFromManufacturer(params);
  const confirmReceiptMutation = useConfirmReceipt();

  useEffect(() => {
    if (prevSearchRef.current !== search) {
      setSearchInput(search);
      prevSearchRef.current = search;
    }
  }, [search]);

  // Update data from query
  useEffect(() => {
    if (queryData?.data?.data) {
      setItems(queryData.data.data.invoices || []);
      setPagination(
        queryData.data.data.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0,
        }
      );
    }
  }, [queryData]);

  const handleSearch = (searchValue = null, resetPage = true) => {
    const valueToSearch = searchValue !== null ? searchValue : searchInput;
    if (searchValue !== null) {
      setSearchInput(searchValue);
    }
    if (resetPage) {
      updateFilter({ search: valueToSearch, page: 1 });
    } else {
      updateFilter({ search: valueToSearch });
    }
  };

  // Clear search button
  const handleClearSearch = () => {
    setSearchInput("");
    updateFilter({ search: "", page: 1 });
  };

  const updateFilter = (next) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([k, v]) => {
      if (v === "" || v === undefined || v === null) {
        nextParams.delete(k);
      } else {
        if (k === "page") {
          const pageNum = parseInt(v, 10);
          if (pageNum > 0) {
            nextParams.set(k, String(pageNum));
          } else {
            nextParams.delete(k);
          }
        } else {
          nextParams.set(k, String(v));
        }
      }
    });
    setSearchParams(nextParams);
  };

  const handleOpenConfirm = (invoice) => {
    setSelectedInvoice(invoice);
    setConfirmForm({
      receivedBy: {
        fullName: "",
        position: "",
        signature: "",
      },
      deliveryAddress: {
        street: "",
        district: "",
        city: "",
      },
      shippingInfo: {
        carrier: "",
        trackingNumber: "",
        shippedDate: "",
      },
      notes: "",
      distributionDate: new Date().toISOString().split("T")[0],
      distributedQuantity: (() => {
        // Tính số lượng đã được gửi đến
        const sentQuantity =
          invoice.totalQuantity ??
          invoice.quantity ??
          invoice.nftQuantity ??
          (Array.isArray(invoice.nfts)
            ? invoice.nfts.length
            : Array.isArray(invoice.items)
            ? invoice.items.length
            : 0);
        return sentQuantity > 0 ? sentQuantity.toString() : "";
      })(),
    });
    setConfirmFormErrors({});
    setShowConfirmDialog(true);
  };

  // FIX: Better form validation logic
  const validateConfirmForm = () => {
    const errors = {};

    // Người nhận hàng: bắt buộc và chỉ chữ
    const fullName = confirmForm.receivedBy?.fullName?.trim() || "";
    if (!fullName) {
      errors.receivedByFullName = "Vui lòng nhập tên người nhận hàng";
    } else if (!/^[a-zA-ZÀ-ỹĂăÂâÊêÔôƠơƯưĐđ\s]+$/.test(fullName)) {
      errors.receivedByFullName = "Tên người nhận hàng chỉ được chứa chữ cái";
    } else if (fullName.length > 100) {
      errors.receivedByFullName = "Tên không được vượt quá 100 ký tự";
    }

    // Chức vụ: bắt buộc và chỉ chữ
    const position = confirmForm.receivedBy?.position?.trim() || "";
    if (!position) {
      errors.receivedByPosition = "Vui lòng nhập chức vụ";
    } else if (!/^[a-zA-ZÀ-ỹĂăÂâÊêÔôƠơƯưĐđ\s]+$/.test(position)) {
      errors.receivedByPosition = "Chức vụ chỉ được chứa chữ cái";
    } else if (position.length > 50) {
      errors.receivedByPosition = "Chức vụ không được vượt quá 50 ký tự";
    }

    // Địa chỉ nhận: bắt buộc
    const street = confirmForm.deliveryAddress?.street?.trim() || "";
    if (!street) {
      errors.deliveryAddressStreet = "Vui lòng nhập địa chỉ nhận";
    } else if (street.length > 200) {
      errors.deliveryAddressStreet = "Địa chỉ không được vượt quá 200 ký tự";
    }

    // Thành phố: bắt buộc
    const city = confirmForm.deliveryAddress?.city?.trim() || "";
    if (!city) {
      errors.deliveryAddressCity = "Vui lòng nhập thành phố";
    } else if (city.length > 100) {
      errors.deliveryAddressCity = "Thành phố không được vượt quá 100 ký tự";
    }

    // Ngày nhận: không được quá khứ cách ngày hiện tại 3 ngày và không vượt quá ngày hiện tại
    if (confirmForm.distributionDate) {
      const selectedDate = new Date(confirmForm.distributionDate);
      selectedDate.setHours(0, 0, 0, 0); // Reset time to start of day
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      threeDaysAgo.setHours(0, 0, 0, 0); // Start of 3 days ago

      if (selectedDate > today) {
        errors.distributionDate = "Ngày nhận không được vượt quá ngày hiện tại";
      } else if (selectedDate < threeDaysAgo) {
        errors.distributionDate =
          "Ngày nhận không được quá khứ cách ngày hiện tại 3 ngày";
      }
    }

    // Số lượng nhận: bắt buộc, >= 1 và <= số lượng NFT đã được gửi đến
    const distributedQuantity = confirmForm.distributedQuantity?.trim() || "";
    const quantity = parseInt(distributedQuantity) || 0;
    // Lấy số lượng đã được gửi đến - kiểm tra nhiều trường để đảm bảo chính xác
    const maxQuantity = parseInt(
      selectedInvoice?.totalQuantity ??
        selectedInvoice?.quantity ??
        selectedInvoice?.nftQuantity ??
        (Array.isArray(selectedInvoice?.nfts)
          ? selectedInvoice.nfts.length
          : Array.isArray(selectedInvoice?.items)
          ? selectedInvoice.items.length
          : 0)
    );

    if (!distributedQuantity) {
      errors.distributedQuantity = "Vui lòng nhập số lượng nhận";
    } else if (isNaN(quantity)) {
      errors.distributedQuantity = "Số lượng phải là số";
    } else if (quantity < 1) {
      errors.distributedQuantity = "Số lượng nhận phải >= 1";
    } else if (maxQuantity > 0 && quantity > maxQuantity) {
      errors.distributedQuantity = `Số lượng nhận không được vượt quá ${maxQuantity} NFT (số lượng đã được gửi đến)`;
    } else if (maxQuantity <= 0) {
      errors.distributedQuantity =
        "Không thể xác định số lượng đã được gửi đến. Vui lòng liên hệ quản trị viên.";
    }

    setConfirmFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirmReceipt = async () => {
    if (isConfirming || !selectedInvoice) {
      return;
    }

    if (!validateConfirmForm()) {
      toast.error("Vui lòng kiểm tra và sửa các lỗi trong form");
      return;
    }

    setIsConfirming(true);

    try {
      const sentQuantity =
        selectedInvoice?.totalQuantity ??
        selectedInvoice?.quantity ??
        selectedInvoice?.nftQuantity ??
        (Array.isArray(selectedInvoice?.nfts)
          ? selectedInvoice.nfts.length
          : Array.isArray(selectedInvoice?.items)
          ? selectedInvoice.items.length
          : 0);

      const payload = {
        invoiceId: selectedInvoice._id,
        distributionDate: confirmForm.distributionDate,
        distributedQuantity:
          parseInt(confirmForm.distributedQuantity) || sentQuantity,
        notes: confirmForm.notes || undefined,
      };

      const fullName = confirmForm.receivedBy?.fullName?.trim();
      if (fullName) {
        payload.receivedBy = {
          fullName,
          ...(confirmForm.receivedBy.position?.trim() && {
            position: confirmForm.receivedBy.position.trim(),
          }),
          ...(confirmForm.receivedBy.signature?.trim() && {
            signature: confirmForm.receivedBy.signature.trim(),
          }),
        };
      }

      const street = confirmForm.deliveryAddress?.street?.trim();
      const city = confirmForm.deliveryAddress?.city?.trim();
      if (street && city) {
        payload.deliveryAddress = {
          street,
          ...(confirmForm.deliveryAddress.district?.trim() && {
            district: confirmForm.deliveryAddress.district.trim(),
          }),
          city,
        };
      }

      if (
        confirmForm.shippingInfo?.carrier?.trim() ||
        confirmForm.shippingInfo?.trackingNumber?.trim()
      ) {
        payload.shippingInfo = {
          ...(confirmForm.shippingInfo.carrier?.trim() && {
            carrier: confirmForm.shippingInfo.carrier.trim(),
          }),
          ...(confirmForm.shippingInfo.trackingNumber?.trim() && {
            trackingNumber: confirmForm.shippingInfo.trackingNumber.trim(),
          }),
          ...(confirmForm.shippingInfo.shippedDate && {
            shippedDate: confirmForm.shippingInfo.shippedDate,
          }),
        };
      }

      const response = await confirmReceiptMutation.mutateAsync(payload);

      if (response.data.success) {
        // FIX: Reset form after successful submission
        setConfirmForm({
          receivedBy: {
            fullName: "",
            position: "",
            signature: "",
          },
          deliveryAddress: {
            street: "",
            district: "",
            city: "",
          },
          shippingInfo: {
            carrier: "",
            trackingNumber: "",
            shippedDate: "",
          },
          notes: "",
          distributionDate: new Date().toISOString().split("T")[0],
          distributedQuantity: "",
        });
        setConfirmFormErrors({});
        setShowConfirmDialog(false);
        refetch();
      }
    } catch (error) {
      console.error("Lỗi khi xác nhận:", error);
    } finally {
      setIsConfirming(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-amber-100 text-amber-700 border-amber-200",
      sent: "bg-cyan-100 text-cyan-700 border-cyan-200",
      received: "bg-blue-100 text-blue-700 border-blue-200",
      confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200",
      paid: "bg-green-100 text-green-700 border-green-200",
    };
    return colors[status] || "bg-slate-100 text-slate-600 border-slate-200";
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: "Đang chờ",
      sent: "Đã gửi",
      received: "Received",
      confirmed: "Confirmed (Chờ Manufacturer)",
      paid: "Paid",
    };
    return labels[status] || status;
  };
};
