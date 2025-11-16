import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import DashboardLayout from "../../components/DashboardLayout";
import TruckLoader from "../../components/TruckLoader";
import {
  useGetInvoicesFromManufacturer,
  useDistributorConfirmReceipt,
} from "../../hooks/react-query/distributor/use.distributor";
import { Search } from "../../components/ui/search";
import { InvoiceComponent } from "../../components/invoice/invoice";
import { Card } from "../../components/ui/card";

export default function InvoicesFromManufacturer() {
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
  if (search) params.search = search;
  if (status) params.status = status;

  const {
    data: queryData,
    isLoading: queryLoading,
    isFetching,
    refetch,
  } = useGetInvoicesFromManufacturer(params);
  const { mutateAsync: confirmReceiptMutation } = useDistributorConfirmReceipt({
    successMessage:
      "Xác nhận nhận hàng thành công! Trạng thái: Đang chờ Manufacturer xác nhận chuyển quyền sở hữu NFT.",
    errorMessage: (error) =>
      `Không thể xác nhận nhận hàng: ${
        error?.response?.data?.message || error?.message
      }`,
  });

  useEffect(() => {
    // Chỉ update searchInput khi search thực sự thay đổi (không phải do page change)
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

  const navigationItems = [
    {
      path: "/distributor",
      label: "Tổng quan",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      active: false,
    },
    {
      path: "/distributor/invoices",
      label: "Đơn từ nhà SX",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      active: true,
    },
    {
      path: "/distributor/transfer-pharmacy",
      label: "Chuyển cho NT",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
      ),
      active: false,
    },
    {
      path: "/distributor/distribution-history",
      label: "Lịch sử phân phối",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
      active: false,
    },
    {
      path: "/distributor/transfer-history",
      label: "Lịch sử chuyển NT",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      active: false,
    },
    {
      path: "/distributor/drugs",
      label: "Quản lý thuốc",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
          />
        </svg>
      ),
      active: false,
    },
    {
      path: "/distributor/nft-tracking",
      label: "Tra cứu NFT",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      ),
      active: false,
    },
    {
      path: "/distributor/profile",
      label: "Hồ sơ",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      active: false,
    },
  ];

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
    if (isConfirming || !selectedInvoice) return;

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

      const response = await confirmReceiptMutation(payload);

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

  const fadeUp = {
    hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <DashboardLayout navigationItems={navigationItems}>
      {queryLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="w-full max-w-2xl">
            <TruckLoader height={72} progress={0.5} showTrack />
          </div>
          <div className="text-lg text-slate-600 mt-6">Đang tải dữ liệu...</div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Banner kiểu Manufacturer */}
          <Card
            title="Đơn hàng từ nhà sản xuất"
            subtitle="Xem và xác nhận nhận hàng từ pharma company"
          />

          {/* Filters */}
          <motion.div
            className="rounded-2xl bg-white border border-card-primary shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-4 mb-5"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            <div className="flex flex-col md:flex-row gap-3 md:items-end relative">
              <Search
                searchInput={searchInput}
                setSearchInput={setSearchInput}
                handleSearch={handleSearch}
                handleClearSearch={handleClearSearch}
                placeholder="Tìm theo số đơn"
                data={items}
                getSearchText={(item) => {
                  const invoiceNumber = item.invoiceNumber || "";
                  return `${invoiceNumber}`.trim();
                }}
                matchFunction={(item, searchLower) => {
                  const invoiceNumber = (
                    item.invoiceNumber || ""
                  ).toLowerCase();
                  return invoiceNumber.includes(searchLower);
                }}
                getDisplayText={(item, searchLower) => {
                  const invoiceNumber = (
                    item.invoiceNumber || ""
                  ).toLowerCase();
                  if (invoiceNumber.includes(searchLower)) {
                    return item.invoiceNumber || "";
                  }
                  return item.invoiceNumber || "";
                }}
              />
              <div>
                <label className="block text-sm text-[#003544]/70 mb-1">
                  Trạng thái
                </label>
                <select
                  value={status}
                  onChange={(e) =>
                    updateFilter({ status: e.target.value, page: 1 })
                  }
                  className="h-12 rounded-full border border-gray-200 bg-white text-gray-700 px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-[#48cae4] transition"
                >
                  <option value="">Tất cả</option>
                  <option value="pending">Pending</option>
                  <option value="sent">Sent</option>
                  <option value="received">Received</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* List */}
          <InvoiceComponent
            items={items || []}
            page={page}
            pagination={pagination}
            updateFilter={updateFilter}
            getStatusColor={getStatusColor}
            getStatusLabel={getStatusLabel}
            handleOpenConfirm={handleOpenConfirm}
            isConfirming={isConfirming}
          />

          {/* Confirm Receipt Dialog */}
          {showConfirmDialog && selectedInvoice && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              onClick={() => setShowConfirmDialog(false)}
            >
              <div
                className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto custom-scroll"
                onClick={(e) => e.stopPropagation()}
              >
                <style>{`
              .custom-scroll { scrollbar-width: none; -ms-overflow-style: none; }
              .custom-scroll::-webkit-scrollbar { width: 0; height: 0; }
            `}</style>

                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-secondary px-8 py-6 rounded-t-3xl flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold !text-white">
                      Xác nhận nhận hàng
                    </h2>
                    <p className="text-gray-100 text-sm">
                      Đơn: {selectedInvoice.invoiceNumber}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowConfirmDialog(false)}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center !text-white text-xl transition"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-8 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Người nhận hàng *
                      </label>
                      <input
                        value={confirmForm.receivedBy.fullName}
                        onChange={(e) => {
                          const value = e.target.value.replace(
                            /[^a-zA-ZÀ-ỹĂăÂâÊêÔôƠơƯưĐđ\s]/g,
                            ""
                          );
                          if (value.length <= 100) {
                            setConfirmForm({
                              ...confirmForm,
                              receivedBy: {
                                ...confirmForm.receivedBy,
                                fullName: value,
                              },
                            });
                            if (confirmFormErrors.receivedByFullName) {
                              setConfirmFormErrors({
                                ...confirmFormErrors,
                                receivedByFullName: "",
                              });
                            }
                          }
                        }}
                        placeholder="Họ và tên"
                        maxLength={100}
                        className={`w-full border-2 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:outline-none hover:shadow-sm transition-all duration-150 ${
                          confirmFormErrors.receivedByFullName
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-gray-400 hover:border-gray-400"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Chức vụ *
                      </label>
                      <input
                        value={confirmForm.receivedBy.position}
                        onChange={(e) => {
                          const value = e.target.value.replace(
                            /[^a-zA-ZÀ-ỹĂăÂâÊêÔôƠơƯưĐđ\s]/g,
                            ""
                          );
                          if (value.length <= 50) {
                            setConfirmForm({
                              ...confirmForm,
                              receivedBy: {
                                ...confirmForm.receivedBy,
                                position: value,
                              },
                            });
                            if (confirmFormErrors.receivedByPosition) {
                              setConfirmFormErrors({
                                ...confirmFormErrors,
                                receivedByPosition: "",
                              });
                            }
                          }
                        }}
                        placeholder="VD: Thủ kho"
                        maxLength={50}
                        className={`w-full border-2 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:outline-none hover:shadow-sm transition-all duration-150 ${
                          confirmFormErrors.receivedByPosition
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-gray-400 hover:border-gray-400"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Địa chỉ nhận (đường) *
                      </label>
                      <input
                        value={confirmForm.deliveryAddress.street}
                        onChange={(e) => {
                          const value = e.target.value.slice(0, 200);
                          setConfirmForm({
                            ...confirmForm,
                            deliveryAddress: {
                              ...confirmForm.deliveryAddress,
                              street: value,
                            },
                          });
                          if (confirmFormErrors.deliveryAddressStreet) {
                            setConfirmFormErrors({
                              ...confirmFormErrors,
                              deliveryAddressStreet: "",
                            });
                          }
                        }}
                        placeholder="Số nhà, đường..."
                        maxLength={200}
                        className={`w-full border-2 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:outline-none hover:shadow-sm transition-all duration-150 ${
                          confirmFormErrors.deliveryAddressStreet
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-gray-400 hover:border-gray-400"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Thành phố *
                      </label>
                      <input
                        value={confirmForm.deliveryAddress.city}
                        onChange={(e) => {
                          const value = e.target.value.slice(0, 100);
                          setConfirmForm({
                            ...confirmForm,
                            deliveryAddress: {
                              ...confirmForm.deliveryAddress,
                              city: value,
                            },
                          });
                          if (confirmFormErrors.deliveryAddressCity) {
                            setConfirmFormErrors({
                              ...confirmFormErrors,
                              deliveryAddressCity: "",
                            });
                          }
                        }}
                        placeholder="TP/Huyện"
                        maxLength={100}
                        className={`w-full border-2 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:outline-none hover:shadow-sm transition-all duration-150 ${
                          confirmFormErrors.deliveryAddressCity
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-gray-400 hover:border-gray-400"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Ngày nhận
                      </label>
                      <input
                        type="date"
                        value={confirmForm.distributionDate}
                        min={(() => {
                          const threeDaysAgo = new Date();
                          threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
                          return threeDaysAgo.toISOString().split("T")[0];
                        })()}
                        max={new Date().toISOString().split("T")[0]}
                        onChange={(e) => {
                          const selectedValue = e.target.value;
                          if (selectedValue) {
                            const selectedDate = new Date(selectedValue);
                            selectedDate.setHours(0, 0, 0, 0);
                            const today = new Date();
                            today.setHours(23, 59, 59, 999);
                            const threeDaysAgo = new Date();
                            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
                            threeDaysAgo.setHours(0, 0, 0, 0);

                            if (
                              selectedDate <= today &&
                              selectedDate >= threeDaysAgo
                            ) {
                              setConfirmForm({
                                ...confirmForm,
                                distributionDate: selectedValue,
                              });
                              if (confirmFormErrors.distributionDate) {
                                setConfirmFormErrors({
                                  ...confirmFormErrors,
                                  distributionDate: "",
                                });
                              }
                            } else {
                              setConfirmForm({
                                ...confirmForm,
                                distributionDate: selectedValue,
                              });
                            }
                          } else {
                            setConfirmForm({
                              ...confirmForm,
                              distributionDate: selectedValue,
                            });
                            if (confirmFormErrors.distributionDate) {
                              setConfirmFormErrors({
                                ...confirmFormErrors,
                                distributionDate: "",
                              });
                            }
                          }
                        }}
                        onBlur={(e) => {
                          const selectedValue = e.target.value;
                          if (selectedValue) {
                            const selectedDate = new Date(selectedValue);
                            selectedDate.setHours(0, 0, 0, 0);
                            const today = new Date();
                            today.setHours(23, 59, 59, 999);
                            const threeDaysAgo = new Date();
                            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
                            threeDaysAgo.setHours(0, 0, 0, 0);

                            if (selectedDate > today) {
                              setConfirmFormErrors({
                                ...confirmFormErrors,
                                distributionDate:
                                  "Ngày nhận không được vượt quá ngày hiện tại",
                              });
                            } else if (selectedDate < threeDaysAgo) {
                              setConfirmFormErrors({
                                ...confirmFormErrors,
                                distributionDate:
                                  "Ngày nhận không được quá khứ cách ngày hiện tại 3 ngày",
                              });
                            } else if (confirmFormErrors.distributionDate) {
                              setConfirmFormErrors({
                                ...confirmFormErrors,
                                distributionDate: "",
                              });
                            }
                          }
                        }}
                        className={`w-full border-2 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:outline-none hover:shadow-sm transition-all duration-150 bg-white ${
                          confirmFormErrors.distributionDate
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-gray-400 hover:border-gray-400"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Số lượng nhận *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={(() => {
                          const sentQuantity =
                            selectedInvoice?.totalQuantity ??
                            selectedInvoice?.quantity ??
                            selectedInvoice?.nftQuantity ??
                            (Array.isArray(selectedInvoice?.nfts)
                              ? selectedInvoice.nfts.length
                              : Array.isArray(selectedInvoice?.items)
                              ? selectedInvoice.items.length
                              : 0);
                          return sentQuantity > 0 ? sentQuantity : undefined;
                        })()}
                        value={confirmForm.distributedQuantity}
                        onChange={(e) => {
                          let value = e.target.value;
                          if (value === "" || value === "-") {
                            setConfirmForm({
                              ...confirmForm,
                              distributedQuantity: value,
                            });
                            if (confirmFormErrors.distributedQuantity) {
                              setConfirmFormErrors({
                                ...confirmFormErrors,
                                distributedQuantity: "",
                              });
                            }
                            return;
                          }
                          const numValue = parseInt(value);
                          if (isNaN(numValue) || numValue <= 0) {
                            value = "1";
                          } else {
                            const sentQuantity =
                              selectedInvoice?.totalQuantity ??
                              selectedInvoice?.quantity ??
                              selectedInvoice?.nftQuantity ??
                              (Array.isArray(selectedInvoice?.nfts)
                                ? selectedInvoice.nfts.length
                                : Array.isArray(selectedInvoice?.items)
                                ? selectedInvoice.items.length
                                : 0);
                            if (sentQuantity > 0 && numValue > sentQuantity) {
                              value = sentQuantity.toString();
                            } else {
                              value = numValue.toString();
                            }
                          }
                          setConfirmForm({
                            ...confirmForm,
                            distributedQuantity: value,
                          });
                          if (confirmFormErrors.distributedQuantity) {
                            setConfirmFormErrors({
                              ...confirmFormErrors,
                              distributedQuantity: "",
                            });
                          }
                        }}
                        onBlur={(e) => {
                          const value = e.target.value;
                          if (
                            !value ||
                            value === "-" ||
                            isNaN(parseInt(value)) ||
                            parseInt(value) <= 0
                          ) {
                            setConfirmForm({
                              ...confirmForm,
                              distributedQuantity: "1",
                            });
                            if (confirmFormErrors.distributedQuantity) {
                              setConfirmFormErrors({
                                ...confirmFormErrors,
                                distributedQuantity: "",
                              });
                            }
                          }
                        }}
                        className={`w-full border-2 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:outline-none hover:shadow-sm transition-all duration-150 ${
                          confirmFormErrors.distributedQuantity
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-gray-400 hover:border-gray-400"
                        }`}
                      />
                      {(() => {
                        const sentQuantity =
                          selectedInvoice?.totalQuantity ??
                          selectedInvoice?.quantity ??
                          selectedInvoice?.nftQuantity ??
                          (Array.isArray(selectedInvoice?.nfts)
                            ? selectedInvoice.nfts.length
                            : Array.isArray(selectedInvoice?.items)
                            ? selectedInvoice.items.length
                            : 0);
                        return sentQuantity > 0 ? (
                          <p className="mt-2 text-sm text-blue-500">
                            (Tối đa: {sentQuantity} NFT - số lượng đã được gửi
                            đến)
                          </p>
                        ) : null;
                      })()}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ghi chú
                    </label>
                    <textarea
                      rows="3"
                      value={confirmForm.notes}
                      onChange={(e) =>
                        setConfirmForm({
                          ...confirmForm,
                          notes: e.target.value.slice(0, 500),
                        })
                      }
                      maxLength={500}
                      className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:outline-none hover:border-gray-400 hover:shadow-sm transition-all duration-150 focus:ring-gray-400"
                      placeholder="Ghi chú thêm..."
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-gray-300 bg-gray-50 rounded-b-3xl flex justify-end gap-3">
                  <button
                    onClick={() => setShowConfirmDialog(false)}
                    disabled={isConfirming}
                    className="px-5 py-2.5 rounded-full border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition-all duration-200 font-medium disabled:opacity-50"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleConfirmReceipt}
                    disabled={isConfirming}
                    className="px-6 py-2.5 rounded-full bg-primary !text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                  >
                    {isConfirming ? "Đang xử lý..." : "Xác nhận nhận hàng"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
