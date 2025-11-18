/* eslint-disable no-undef */
import { motion } from "framer-motion";
import DashboardLayout from "../../shared/components/DashboardLayout";
import TruckLoader from "../../shared/components/TruckLoader";
import { useInvoicesFromDistributor } from "../hooks/useInvoicesFromDistributor";
import { navigationItems } from "../constants/constant";

export default function InvoicesFromDistributor() {
  const {
    items,
    loading,
    loadingProgress,
    pagination,
    status,
    page,
    localSearch,
    confirmForm,
    confirmFormErrors,
    isConfirming,
    selectedInvoice,
    setSelectedInvoice,
    setConfirmForm,
    setConfirmFormErrors,
    setShowConfirmDialog,
    handleConfirmReceipt,
    getStatusColor,
    getStatusLabel,
  } = useInvoicesFromDistributor();
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
