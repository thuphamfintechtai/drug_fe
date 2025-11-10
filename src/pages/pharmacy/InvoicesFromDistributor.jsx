import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../../components/DashboardLayout";
import TruckLoader from "../../components/TruckLoader";
import pharmacyService from "../../services/pharmacy/pharmacyService";

export default function InvoicesFromDistributor() {
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

  const navigationItems = [
    { path: "/pharmacy", label: "Tổng quan", active: false },
    { path: "/pharmacy/invoices", label: "Đơn từ NPP", active: true },
    {
      path: "/pharmacy/distribution-history",
      label: "Lịch sử phân phối",
      active: false,
    },
    { path: "/pharmacy/drugs", label: "Quản lý thuốc", active: false },
    { path: "/pharmacy/nft-tracking", label: "Tra cứu NFT", active: false },
    { path: "/pharmacy/profile", label: "Hồ sơ", active: false },
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
      // Tìm kiếm theo mã đơn - backend sẽ tìm trong trường invoiceNumber
      if (search) params.search = search;
      if (status) params.status = status;

      const response = await pharmacyService.getInvoicesFromDistributor(params);
      if (response.data && response.data.success) {
        const invoices =
          response.data.data?.invoices || response.data.data || [];
        // Nếu có search, filter lại theo mã đơn để đảm bảo chỉ hiển thị kết quả khớp
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
      if (v === "" || v === undefined || v === null) nextParams.delete(k);
      else nextParams.set(k, String(v));
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
    if (isConfirming || !selectedInvoice) return;

    // Validate form
    if (!validateConfirmForm()) {
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
        alert(
          "✅ Xác nhận nhận hàng thành công!\n\nTrạng thái: Đang chờ Distributor xác nhận chuyển quyền sở hữu NFT."
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
        alert("❌ " + errorMessage);
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

      alert("❌ Lỗi server khi xác nhận nhận hàng: " + errorMessage);
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
          {/* Banner */}
          <div className="bg-white rounded-xl border border-card-primary shadow-sm p-5 mb-6">
            <h1 className="text-xl font-semibold text-[#007b91]">
              Đơn hàng từ nhà phân phối
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Xem và xác nhận nhận hàng từ distributor
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
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      updateFilter({ search: localSearch, page: 1 })
                    }
                    placeholder="Tìm theo số đơn, ghi chú..."
                    className="w-full h-12 pl-11 pr-40 rounded-full border border-gray-200 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#48cae4] transition"
                  />
                  <button
                    onClick={() =>
                      updateFilter({ search: localSearch, page: 1 })
                    }
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
                  <option value="pending">Đang chờ</option>
                  <option value="sent">Đã gửi</option>
                  <option value="received">Đã nhận</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="paid">Đã thanh toán</option>
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
              <div className="bg-white rounded-2xl border border-card-primary p-10 text-center">
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  Chưa có đơn hàng nào
                </h3>
                <p className="text-slate-600">
                  Đơn hàng từ nhà phân phối sẽ hiển thị ở đây
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
                              {item.fromDistributor?.fullName ||
                                item.fromDistributor?.username ||
                                "N/A"}
                            </span>
                          </div>
                          <div>
                            Số lượng:{" "}
                            <span className="font-bold text-blue-700">
                              {item.quantity} NFT
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
                          onClick={() => {
                            setSelectedInvoice(item);
                            // Tính số lượng đã được gửi đến
                            const sentQuantity =
                              item.quantity ??
                              item.totalQuantity ??
                              item.nftQuantity ??
                              (Array.isArray(item.nfts)
                                ? item.nfts.length
                                : Array.isArray(item.items)
                                ? item.items.length
                                : 0);
                            setConfirmForm({
                              receivedByName: "",
                              receiptAddressStreet: "",
                              receiptAddressCity: "",
                              receiptAddressState: "",
                              receiptAddressPostalCode: "",
                              receiptAddressCountry: "Vietnam",
                              shippingInfo: "",
                              notes: "",
                              receivedDate: new Date()
                                .toISOString()
                                .split("T")[0],
                              receivedQuantity:
                                sentQuantity > 0 ? sentQuantity.toString() : "",
                            });
                            setConfirmFormErrors({});
                            setShowConfirmDialog(true);
                          }}
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
                    : "!text-white bg-secondary hover:bg-primary !text-white font-medium transition"
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
              .custom-scroll::-webkit-scrollbar-track { background: transparent; }
              .custom-scroll::-webkit-scrollbar-thumb { background: transparent; }
            `}</style>
                <div className="bg-gradient-to-r from-[#00b4d8] to-[#48cae4] px-8 py-6 rounded-t-3xl flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div>
                      <h2 className="text-2xl font-bold !text-white">
                        Xác nhận nhận hàng
                      </h2>
                      <p className="text-cyan-100 text-sm">
                        Đơn: {selectedInvoice.invoiceNumber}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowConfirmDialog(false)}
                    disabled={isConfirming}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center !text-white transition disabled:opacity-50"
                  >
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Người nhận hàng *
                      </label>
                      <input
                        value={confirmForm.receivedByName}
                        onChange={(e) => {
                          setConfirmForm({
                            ...confirmForm,
                            receivedByName: e.target.value,
                          });
                          if (confirmFormErrors.receivedByName) {
                            setConfirmFormErrors({
                              ...confirmFormErrors,
                              receivedByName: "",
                            });
                          }
                        }}
                        placeholder="Họ và tên"
                        maxLength={100}
                        className={`w-full border-2 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:outline-none hover:shadow-sm transition-all duration-150 ${
                          confirmFormErrors.receivedByName
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
                            selectedInvoice?.quantity ??
                            selectedInvoice?.totalQuantity ??
                            selectedInvoice?.nftQuantity ??
                            (Array.isArray(selectedInvoice?.nfts)
                              ? selectedInvoice.nfts.length
                              : Array.isArray(selectedInvoice?.items)
                              ? selectedInvoice.items.length
                              : 0);
                          return sentQuantity > 0 ? sentQuantity : undefined;
                        })()}
                        value={confirmForm.receivedQuantity}
                        onChange={(e) => {
                          let value = e.target.value;
                          if (value === "" || value === "-") {
                            setConfirmForm({
                              ...confirmForm,
                              receivedQuantity: value,
                            });
                            if (confirmFormErrors.receivedQuantity) {
                              setConfirmFormErrors({
                                ...confirmFormErrors,
                                receivedQuantity: "",
                              });
                            }
                            return;
                          }
                          const numValue = parseInt(value);
                          if (isNaN(numValue) || numValue <= 0) {
                            value = "1";
                          } else {
                            const sentQuantity =
                              selectedInvoice?.quantity ??
                              selectedInvoice?.totalQuantity ??
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
                            receivedQuantity: value,
                          });
                          if (confirmFormErrors.receivedQuantity) {
                            setConfirmFormErrors({
                              ...confirmFormErrors,
                              receivedQuantity: "",
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
                              receivedQuantity: "1",
                            });
                            if (confirmFormErrors.receivedQuantity) {
                              setConfirmFormErrors({
                                ...confirmFormErrors,
                                receivedQuantity: "",
                              });
                            }
                          }
                        }}
                        className={`w-full border-2 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:outline-none hover:shadow-sm transition-all duration-150 ${
                          confirmFormErrors.receivedQuantity
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-gray-400 hover:border-gray-400"
                        }`}
                      />
                      {(() => {
                        const sentQuantity =
                          selectedInvoice?.quantity ??
                          selectedInvoice?.totalQuantity ??
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Địa chỉ nhận (đường) *
                      </label>
                      <input
                        value={confirmForm.receiptAddressStreet}
                        onChange={(e) => {
                          const value = e.target.value.slice(0, 200);
                          setConfirmForm({
                            ...confirmForm,
                            receiptAddressStreet: value,
                          });
                          if (confirmFormErrors.receiptAddressStreet) {
                            setConfirmFormErrors({
                              ...confirmFormErrors,
                              receiptAddressStreet: "",
                            });
                          }
                        }}
                        placeholder="Số nhà, đường..."
                        maxLength={200}
                        className={`w-full border-2 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:outline-none hover:shadow-sm transition-all duration-150 ${
                          confirmFormErrors.receiptAddressStreet
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
                        value={confirmForm.receiptAddressCity}
                        onChange={(e) => {
                          const value = e.target.value.slice(0, 100);
                          setConfirmForm({
                            ...confirmForm,
                            receiptAddressCity: value,
                          });
                          if (confirmFormErrors.receiptAddressCity) {
                            setConfirmFormErrors({
                              ...confirmFormErrors,
                              receiptAddressCity: "",
                            });
                          }
                        }}
                        placeholder="TP/Huyện"
                        maxLength={100}
                        className={`w-full border-2 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:outline-none hover:shadow-sm transition-all duration-150 ${
                          confirmFormErrors.receiptAddressCity
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
                        value={confirmForm.receivedDate}
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
                                receivedDate: selectedValue,
                              });
                              if (confirmFormErrors.receivedDate) {
                                setConfirmFormErrors({
                                  ...confirmFormErrors,
                                  receivedDate: "",
                                });
                              }
                            } else {
                              setConfirmForm({
                                ...confirmForm,
                                receivedDate: selectedValue,
                              });
                            }
                          } else {
                            setConfirmForm({
                              ...confirmForm,
                              receivedDate: selectedValue,
                            });
                            if (confirmFormErrors.receivedDate) {
                              setConfirmFormErrors({
                                ...confirmFormErrors,
                                receivedDate: "",
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
                                receivedDate:
                                  "Ngày nhận không được vượt quá ngày hiện tại",
                              });
                            } else if (selectedDate < threeDaysAgo) {
                              setConfirmFormErrors({
                                ...confirmFormErrors,
                                receivedDate:
                                  "Ngày nhận không được quá khứ cách ngày hiện tại 3 ngày",
                              });
                            } else if (confirmFormErrors.receivedDate) {
                              setConfirmFormErrors({
                                ...confirmFormErrors,
                                receivedDate: "",
                              });
                            }
                          }
                        }}
                        className={`w-full border-2 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:outline-none hover:shadow-sm transition-all duration-150 bg-white ${
                          confirmFormErrors.receivedDate
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-gray-400 hover:border-gray-400"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tỉnh/Thành *
                      </label>
                      <input
                        value={confirmForm.receiptAddressState}
                        onChange={(e) => {
                          const value = e.target.value.slice(0, 100);
                          setConfirmForm({
                            ...confirmForm,
                            receiptAddressState: value,
                          });
                          if (confirmFormErrors.receiptAddressState) {
                            setConfirmFormErrors({
                              ...confirmFormErrors,
                              receiptAddressState: "",
                            });
                          }
                        }}
                        placeholder="Tỉnh/Thành"
                        maxLength={100}
                        className={`w-full border-2 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:outline-none hover:shadow-sm transition-all duration-150 ${
                          confirmFormErrors.receiptAddressState
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-gray-400 hover:border-gray-400"
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Mã bưu điện *
                    </label>
                    <input
                      value={confirmForm.receiptAddressPostalCode}
                      onChange={(e) => {
                        // Chỉ cho phép số
                        const value = e.target.value.replace(/[^\d]/g, "");
                        setConfirmForm({
                          ...confirmForm,
                          receiptAddressPostalCode: value,
                        });
                        if (confirmFormErrors.receiptAddressPostalCode) {
                          setConfirmFormErrors({
                            ...confirmFormErrors,
                            receiptAddressPostalCode: "",
                          });
                        }
                      }}
                      placeholder="Mã bưu điện"
                      maxLength={10}
                      className={`w-full border-2 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:outline-none hover:shadow-sm transition-all duration-150 ${
                        confirmFormErrors.receiptAddressPostalCode
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-gray-400 hover:border-gray-400"
                      }`}
                    />
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
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#00b4d8] to-[#48cae4] !text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
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
