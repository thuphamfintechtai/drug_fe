import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/DashboardLayout";
import TruckLoader from "../../components/TruckLoader";
import {
  getInvoicesFromManufacturer,
  confirmReceipt,
} from "../../services/distributor/distributorService";

export default function InvoicesFromManufacturer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false); // FIX: Prevent double submission
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
  const [loadingProgress, setLoadingProgress] = useState(0);
  const progressIntervalRef = useRef(null);
  // Separate search input state from URL param
  const [searchInput, setSearchInput] = useState("");
  // Form validation errors
  const [confirmFormErrors, setConfirmFormErrors] = useState({});

  const page = parseInt(searchParams.get("page") || "1", 10);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";

  // Sync searchInput with URL search param on mount/change
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

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
      if (search) params.search = search;
      if (status) params.status = status;

      const response = await getInvoicesFromManufacturer(params);

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      if (response.data.success) {
        setItems(response.data.data.invoices || []);
        setPagination(
          response.data.data.pagination || {
            page: 1,
            limit: 10,
            total: 0,
            pages: 0,
          }
        );
      } else {
        setItems([]);
      }

      let currentProgress = 0;
      setLoadingProgress((prev) => {
        currentProgress = prev;
        return prev;
      });

      if (currentProgress < 0.9) {
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
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      console.error("Lỗi khi tải danh sách đơn hàng:", error);
      setItems([]);
      setLoadingProgress(0);
      toast.error(
        "Không thể tải danh sách đơn hàng: " +
          (error.response?.data?.message || error.message),
        { position: "top-right", duration: 4000 }
      );
    } finally {
      setLoading(false);
      setTimeout(() => setLoadingProgress(0), 500);
    }
  };

  // Handle search - only trigger on Enter or button click
  const handleSearch = () => {
    updateFilter({ search: searchInput, page: 1 });
  };

  // Clear search button
  const handleClearSearch = () => {
    setSearchInput("");
    updateFilter({ search: "", page: 1 });
  };

  const updateFilter = (next) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([k, v]) => {
      if (v === "" || v === undefined || v === null) nextParams.delete(k);
      else nextParams.set(k, String(v));
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
    // Bắt đầu progress cho TruckLoader
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

    try {
      // Tính số lượng đã được gửi đến
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

      const response = await confirmReceipt(payload);

      if (response.data.success) {
        toast.success(
          "Xác nhận nhận hàng thành công! Trạng thái: Đang chờ Manufacturer xác nhận chuyển quyền sở hữu NFT.",
          { position: "top-right", duration: 5000 }
        );

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

        // Hoàn tất progress trước khi reload
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
        loadData();
      }
    } catch (error) {
      console.error("Lỗi khi xác nhận:", error);
      toast.error(
        "Không thể xác nhận nhận hàng: " +
          (error.response?.data?.message || error.message),
        { position: "top-right", duration: 4000 }
      );
    } finally {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setIsConfirming(false);
      setLoading(false);
      setTimeout(() => setLoadingProgress(0), 500);
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
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="w-full max-w-2xl">
            <TruckLoader height={72} progress={loadingProgress} showTrack />
          </div>
          <div className="text-lg text-slate-600 mt-6">Đang tải dữ liệu...</div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Banner kiểu Manufacturer */}
          <div className="bg-white rounded-xl border border-card-primary shadow-sm p-5 mb-6">
            <h1 className="text-xl font-semibold text-[#007b91]">
              Đơn hàng từ nhà sản xuất
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Xem và xác nhận nhận hàng từ pharma company
            </p>
          </div>

          {/* Filters */}
          <motion.div
            className="rounded-2xl bg-white border border-card-primary shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-4 mb-5"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            <div className="flex flex-col md:flex-row gap-3 md:items-end">
              <div className="flex-1">
                <label className="block text-sm text-[#003544]/70 mb-1">
                  Tìm kiếm
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
                      />
                    </svg>
                  </span>
                  <input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearch();
                      }
                    }}
                    placeholder="Tìm theo số đơn, ghi chú..."
                    className="w-full h-12 pl-11 pr-40 rounded-full border border-gray-200 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#48cae4] transition"
                    maxLength={200}
                  />
                  {/* FIX: Clear button */}
                  {searchInput && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute right-24 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      title="Xóa tìm kiếm"
                    >
                      ✕
                    </button>
                  )}
                  <button
                    onClick={handleSearch}
                    className="absolute right-1 top-1 bottom-1 px-6 rounded-full bg-secondary hover:bg-primary !text-white font-medium transition"
                  >
                    Tìm Kiếm
                  </button>
                </div>
              </div>
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
          <motion.div
            className="space-y-4"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            {items.length === 0 ? (
              <div className="bg-white rounded-2xl border border-cyan-200 p-10 text-center">
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  Chưa có đơn hàng nào
                </h3>
                <p className="text-slate-600">
                  Đơn hàng từ nhà sản xuất sẽ hiển thị ở đây
                </p>
              </div>
            ) : (
              items.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-card-primary shadow-sm overflow-hidden hover:shadow-lg transition"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-[#003544]">
                            Đơn: {item.invoiceNumber || "N/A"}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                              item.status
                            )}`}
                          >
                            {getStatusLabel(item.status)}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-slate-600">
                          <div>
                            Từ:{" "}
                            <span className="font-medium text-slate-800">
                              {item.fromManufacturer?.fullName ||
                                item.fromManufacturer?.username ||
                                "N/A"}
                            </span>
                          </div>
                          <div>
                            Số lượng:{" "}
                            <span className="font-bold text-blue-700">
                              {(() => {
                                const quantity =
                                  item.totalQuantity ??
                                  item.quantity ??
                                  item.nftQuantity ??
                                  (Array.isArray(item.nfts)
                                    ? item.nfts.length
                                    : Array.isArray(item.items)
                                    ? item.items.length
                                    : null);
                                return quantity !== null &&
                                  quantity !== undefined
                                  ? `${quantity} NFT`
                                  : "N/A";
                              })()}
                            </span>
                          </div>
                          <div>
                            Ngày tạo:{" "}
                            <span className="font-medium">
                              {new Date(item.createdAt).toLocaleString("vi-VN")}
                            </span>
                          </div>
                        </div>
                      </div>

                      {item.status === "sent" && (
                        <button
                          onClick={() => handleOpenConfirm(item)}
                          disabled={isConfirming}
                          className="px-6 py-3 rounded-full bg-secondary hover:bg-primary !text-white font-semibold shadow-md hover:shadow-lg transition disabled:opacity-50"
                        >
                          Xác nhận nhận hàng
                        </button>
                      )}
                    </div>

                    {item.notes && (
                      <div className="bg-slate-50 rounded-xl p-3 text-sm mb-3">
                        <div className="font-semibold text-slate-700 mb-1">
                          Ghi chú:
                        </div>
                        <div className="text-slate-600">{item.notes}</div>
                      </div>
                    )}

                    {item.proofOfProduction && (
                      <div className="bg-purple-50 rounded-xl p-3 border border-purple-200 text-sm">
                        <div className="font-semibold text-purple-800 mb-2">
                          Thông tin sản xuất:
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            Số lô:{" "}
                            <span className="font-mono">
                              {item.proofOfProduction.batchNumber}
                            </span>
                          </div>
                          <div>
                            NSX:{" "}
                            {new Date(
                              item.proofOfProduction.manufacturingDate
                            ).toLocaleDateString("vi-VN")}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </motion.div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-5">
            <div className="text-sm text-slate-600">
              Hiển thị {items.length} / {pagination.total} đơn hàng
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => updateFilter({ page: page - 1 })}
                className={`px-3 py-2 rounded-xl ${
                  page <= 1
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-white/90 border border-[#90e0ef55] hover:bg-[#f5fcff]"
                }`}
              >
                Trước
              </button>
              <span className="text-sm text-slate-700">
                Trang {page} / {pagination.pages || 1}
              </span>
              <button
                disabled={page >= pagination.pages}
                onClick={() => updateFilter({ page: page + 1 })}
                className={`px-3 py-2 rounded-xl ${
                  page >= pagination.pages
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "!text-white bg-linear-to-r from-[#00b4d8] via-[#48cae4] to-[#90e0ef] shadow-[0_10px_24px_rgba(0,180,216,0.30)] hover:shadow-[0_14px_36px_rgba(0,180,216,0.40)]"
                }`}
              >
                Sau
              </button>
            </div>
          </div>

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

                {/* Body */}
                <div className="p-8 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Người nhận hàng *
                      </label>
                      <input
                        value={confirmForm.receivedBy.fullName}
                        onChange={(e) => {
                          // FIX: Only allow letters with proper length validation
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
                          // FIX: Only allow letters with proper length validation
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
                          // Validate ngay khi onChange
                          if (selectedValue) {
                            const selectedDate = new Date(selectedValue);
                            selectedDate.setHours(0, 0, 0, 0);
                            const today = new Date();
                            today.setHours(23, 59, 59, 999);
                            const threeDaysAgo = new Date();
                            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
                            threeDaysAgo.setHours(0, 0, 0, 0);

                            // Nếu ngày hợp lệ, cập nhật form và xóa lỗi
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
                              // Nếu ngày không hợp lệ, vẫn cập nhật nhưng sẽ validate lại khi submit
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
                          // Validate khi blur để hiển thị lỗi ngay
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
                          // Tính số lượng đã được gửi đến
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
                          // Chuyển sang number để kiểm tra
                          const numValue = parseInt(value);
                          // Nếu là NaN hoặc <= 0, tự động set về 1
                          if (isNaN(numValue) || numValue <= 0) {
                            value = "1";
                          } else {
                            // Tính số lượng đã được gửi đến
                            const sentQuantity =
                              selectedInvoice?.totalQuantity ??
                              selectedInvoice?.quantity ??
                              selectedInvoice?.nftQuantity ??
                              (Array.isArray(selectedInvoice?.nfts)
                                ? selectedInvoice.nfts.length
                                : Array.isArray(selectedInvoice?.items)
                                ? selectedInvoice.items.length
                                : 0);
                            // Đảm bảo không vượt quá số lượng đã được gửi đến
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
                          // Khi blur (rời khỏi field), nếu rỗng hoặc <= 0, tự động set về 1
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
                        // Tính số lượng đã được gửi đến
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
