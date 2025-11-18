/* eslint-disable no-undef */
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { pharmacyQueries } from "../apis/pharmacyQueries";
import { toast } from "sonner";

export const useInvoicesFromDistributor = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const progressIntervalRef = useRef(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [expandedInvoice, setExpandedInvoice] = useState(null);
  const [localSearch, setLocalSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [confirmForm, setConfirmForm] = useState({
    receivedByName: "",
    receiptAddressStreet: "",
    receiptAddressCity: "",
    receiptAddressState: "",
    receiptAddressPostalCode: "",
    receiptAddressCountry: "Vietnam",
    shippingInfo: "",
    notes: "",
    receivedDate: new Date().toISOString().split("T")[0],
    receivedQuantity: "",
  });
  const [confirmFormErrors, setConfirmFormErrors] = useState({});
  const [isConfirming, setIsConfirming] = useState(false);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";

  // Đồng bộ localSearch với search params từ URL (khi component mount hoặc search thay đổi từ bên ngoài)
  useEffect(() => {
    if (search !== localSearch) {
      setLocalSearch(search);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Debounce search: đợi 1.5 giây sau khi người dùng dừng nhập
  useEffect(() => {
    // Bỏ qua nếu localSearch trống và search cũng trống
    if (localSearch === search) {
      setIsSearching(false);
      return;
    }

    // Nếu có giá trị localSearch khác search, bắt đầu debounce
    setIsSearching(true);

    const debounceTimer = setTimeout(() => {
      updateFilter({ search: localSearch, page: 1 });
      setIsSearching(false);
    }, 1500);

    return () => {
      clearTimeout(debounceTimer);
      setIsSearching(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSearch]);
  useEffect(() => {
    loadData();
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [page, search, status]);

  const loadData = async () => {
    try {
      setLoading(true);
      setLoadingProgress(0);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      progressIntervalRef.current = setInterval(() => {
        setLoadingProgress((prev) =>
          prev < 0.9 ? Math.min(prev + 0.02, 0.9) : prev
        );
      }, 50);
      const params = { page, limit: 10 };
      // Tìm kiếm theo mã đơn - backend sẽ tìm trong trường invoiceNumber
      if (search) {
        params.search = search;
      }
      if (status) {
        params.status = status;
      }

      const response = await pharmacyQueries.getInvoicesFromDistributor(params);
      if (response.data && response.data.success) {
        const invoices =
          response.data.data?.invoices || response.data.data || [];
        let filteredInvoices = invoices;
        if (search) {
          filteredInvoices = invoices.filter((invoice) => {
            const invoiceNumber = invoice.invoiceNumber || "";
            return invoiceNumber.toLowerCase().includes(search.toLowerCase());
          });
        }
        setItems(filteredInvoices);
        // Sử dụng pagination từ server, chỉ dùng filtered length nếu không có pagination
        const serverPagination = response.data.data?.pagination;
        if (serverPagination) {
          setPagination(serverPagination);
        } else {
          setPagination({
            page,
            limit: 10,
            total: filteredInvoices.length,
            pages: Math.ceil(filteredInvoices.length / 10),
          });
        }
      } else {
        setItems([]);
        setPagination({ page: 1, limit: 10, total: 0, pages: 0 });
      }
      // tăng tốc tới 100%
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      let current = 0;
      setLoadingProgress((p) => {
        current = p;
        return p;
      });
      if (current < 0.9) {
        await new Promise((resolve) => {
          const speedUp = setInterval(() => {
            setLoadingProgress((prev) => {
              if (prev < 1) {
                const np = Math.min(prev + 0.15, 1);
                if (np >= 1) {
                  clearInterval(speedUp);
                  resolve();
                }
                return np;
              }
              clearInterval(speedUp);
              resolve();
              return 1;
            });
          }, 30);
          setTimeout(() => {
            clearInterval(speedUp);
            setLoadingProgress(1);
            resolve();
          }, 500);
        });
      } else {
        setLoadingProgress(1);
        await new Promise((r) => setTimeout(r, 200));
      }
      await new Promise((r) => setTimeout(r, 100));
    } catch (error) {
      console.error("Lỗi khi tải đơn hàng:", error);
      setItems([]);
      setPagination({ page: 1, limit: 10, total: 0, pages: 0 });
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể tải danh sách đơn hàng";
      console.error("Chi tiết lỗi:", errorMessage);
      toast.error(`Không thể tải danh sách đơn hàng: ${errorMessage}`, {
        position: "top-right",
        duration: 4000,
      });
    } finally {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setLoading(false);
      setTimeout(() => setLoadingProgress(0), 500);
    }
  };

  const updateFilter = (next) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([k, v]) => {
      if (v === "" || v === undefined || v === null) {
        nextParams.delete(k);
      } else {
        nextParams.set(k, String(v));
      }
    });
    setSearchParams(nextParams);
  };

  const toggleExpand = (idx) => {
    setExpandedInvoice(expandedInvoice === idx ? null : idx);
  };

  // Validation function
  const validateConfirmForm = () => {
    const errors = {};

    // Người nhận hàng: bắt buộc
    const receivedByName = confirmForm.receivedByName?.trim() || "";
    if (!receivedByName) {
      errors.receivedByName = "Vui lòng nhập tên người nhận hàng";
    }

    // Địa chỉ nhận (đường): bắt buộc
    const receiptAddressStreet = confirmForm.receiptAddressStreet?.trim() || "";
    if (!receiptAddressStreet) {
      errors.receiptAddressStreet = "Vui lòng nhập địa chỉ nhận";
    }

    // Thành phố: bắt buộc
    const receiptAddressCity = confirmForm.receiptAddressCity?.trim() || "";
    if (!receiptAddressCity) {
      errors.receiptAddressCity = "Vui lòng nhập thành phố";
    }

    // Tỉnh/Thành: bắt buộc
    const receiptAddressState = confirmForm.receiptAddressState?.trim() || "";
    if (!receiptAddressState) {
      errors.receiptAddressState = "Vui lòng nhập tỉnh/thành";
    }

    // Mã bưu điện: bắt buộc và chỉ số
    const receiptAddressPostalCode =
      confirmForm.receiptAddressPostalCode?.trim() || "";
    if (!receiptAddressPostalCode) {
      errors.receiptAddressPostalCode = "Vui lòng nhập mã bưu điện";
    } else if (!/^\d+$/.test(receiptAddressPostalCode)) {
      errors.receiptAddressPostalCode = "Mã bưu điện chỉ được chứa số";
    }

    // Ngày nhận: không được quá khứ cách ngày hiện tại 3 ngày và không vượt quá ngày hiện tại
    if (confirmForm.receivedDate) {
      const selectedDate = new Date(confirmForm.receivedDate);
      selectedDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      threeDaysAgo.setHours(0, 0, 0, 0);

      if (selectedDate > today) {
        errors.receivedDate = "Ngày nhận không được vượt quá ngày hiện tại";
      } else if (selectedDate < threeDaysAgo) {
        errors.receivedDate =
          "Ngày nhận không được quá khứ cách ngày hiện tại 3 ngày";
      }
    }

    // Số lượng nhận: bắt buộc, >= 1 và <= số lượng NFT đã được gửi đến
    const receivedQuantity = confirmForm.receivedQuantity?.trim() || "";
    const quantity = parseInt(receivedQuantity) || 0;
    // Lấy số lượng đã được gửi đến
    const maxQuantity = parseInt(
      selectedInvoice?.quantity ??
        selectedInvoice?.totalQuantity ??
        selectedInvoice?.nftQuantity ??
        (Array.isArray(selectedInvoice?.nfts)
          ? selectedInvoice.nfts.length
          : Array.isArray(selectedInvoice?.items)
          ? selectedInvoice.items.length
          : 0)
    );

    if (!receivedQuantity) {
      errors.receivedQuantity = "Vui lòng nhập số lượng nhận";
    } else if (isNaN(quantity)) {
      errors.receivedQuantity = "Số lượng phải là số";
    } else if (quantity < 1) {
      errors.receivedQuantity = "Số lượng nhận phải >= 1";
    } else if (maxQuantity > 0 && quantity > maxQuantity) {
      errors.receivedQuantity = `Số lượng nhận không được vượt quá ${maxQuantity} NFT`;
    } else if (maxQuantity <= 0) {
      errors.receivedQuantity = "Không thể xác định số lượng đã được gửi đến";
    }

    setConfirmFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirmReceipt = async () => {
    if (isConfirming || !selectedInvoice) {
      return;
    }

    // Validate form
    if (!validateConfirmForm()) {
      toast.error("Vui lòng kiểm tra và sửa các lỗi trong form", {
        position: "top-right",
        duration: 4000,
      });
      return;
    }

    setIsConfirming(true);
    setLoading(true);
    try {
      // Tính số lượng đã được gửi đến
      const sentQuantity =
        selectedInvoice?.quantity ??
        selectedInvoice?.totalQuantity ??
        selectedInvoice?.nftQuantity ??
        (Array.isArray(selectedInvoice?.nfts)
          ? selectedInvoice.nfts.length
          : Array.isArray(selectedInvoice?.items)
          ? selectedInvoice.items.length
          : 0);

      const requestData = {
        invoiceId: selectedInvoice._id,
        receivedBy: {
          fullName: confirmForm.receivedByName.trim(),
        },
        deliveryAddress: {
          street: confirmForm.receiptAddressStreet.trim(),
          city: confirmForm.receiptAddressCity.trim(),
          state: confirmForm.receiptAddressState.trim(),
          postalCode: confirmForm.receiptAddressPostalCode.trim(),
          country: confirmForm.receiptAddressCountry || "Vietnam",
        },
        shippingInfo: confirmForm.shippingInfo || "",
        notes: confirmForm.notes || "",
        receivedDate:
          confirmForm.receivedDate || new Date().toISOString().split("T")[0],
        receivedQuantity:
          parseInt(confirmForm.receivedQuantity) || sentQuantity,
      };

      console.log("Gửi request xác nhận nhận hàng:", {
        endpoint: "/pharmacy/invoices/confirm-receipt",
        data: requestData,
      });

      const response = await pharmacyService.confirmReceipt(requestData);

      console.log("Response từ server:", response);

      if (response.data && response.data.success) {
        toast.success(
          "✅ Xác nhận nhận hàng thành công! Trạng thái: Đang chờ Distributor xác nhận chuyển quyền sở hữu NFT.",
          {
            position: "top-right",
            duration: 5000,
          }
        );
        // Reset form
        setConfirmForm({
          receivedByName: "",
          receiptAddressStreet: "",
          receiptAddressCity: "",
          receiptAddressState: "",
          receiptAddressPostalCode: "",
          receiptAddressCountry: "Vietnam",
          shippingInfo: "",
          notes: "",
          receivedDate: new Date().toISOString().split("T")[0],
          receivedQuantity: "",
        });
        setConfirmFormErrors({});
        setShowConfirmDialog(false);
        loadData();
      } else {
        const errorMessage =
          response.data?.message || "Không thể xác nhận nhận hàng";
        console.error("Response không thành công:", response.data);
        toast.error(`❌ ${errorMessage}`, {
          position: "top-right",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Lỗi khi xác nhận nhận hàng:", error);
      console.error("Chi tiết lỗi:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
      });

      let errorMessage = "Không thể xác nhận nhận hàng";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(`❌ Lỗi server khi xác nhận nhận hàng: ${errorMessage}`, {
        position: "top-right",
        duration: 5000,
      });
    } finally {
      setIsConfirming(false);
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: "Chờ xác nhận",
      sent: "Đã gửi",
      received: "Đã nhận",
      confirmed: "Đã xác nhận",
      paid: "Đã thanh toán",
    };
    return labels[status] || status;
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

  return {
    items,
    loading,
    loadingProgress,
    handleSearch,
    handleClearSearch,
    updateFilter,
    getStatusColor,
    getStatusLabel,
    toggleExpand,
    validateConfirmForm,
    handleConfirmReceipt,
    pagination,
    searchParams,
    setSearchParams,
    search,
    status,
    page,
    localSearch,
    isSearching,
    confirmForm,
    confirmFormErrors,
    isConfirming,
    selectedInvoice,
    expandedInvoice,
    setSelectedInvoice,
    setExpandedInvoice,
  };
};
