import { motion } from "framer-motion";
import DashboardLayout from "../../shared/components/DashboardLayout";
import TruckLoader from "../../shared/components/TruckLoader";
import { Search } from "../../shared/components/ui/search";
import { InvoiceComponent } from "../components/invoice";
import { Card } from "../../shared/components/ui/cardUI";
import { navigationItemsInvoices } from "../constants/navigationItemsInvoices";
import { useInvoicesFromManufacturer } from "../hooks/useInvoicesFromManufacturer";

export default function InvoicesFromManufacturer() {
  const {
    queryLoading,
    items,
    pagination,
    status,
    page,
    searchInput,
    setSearchInput,
    handleSearch,
    handleClearSearch,
    updateFilter,
    getStatusColor,
    getStatusLabel,
    handleOpenConfirm,
    isConfirming,
    showConfirmDialog,
    selectedInvoice,
    confirmForm,
    confirmFormErrors,
    setConfirmForm,
    setConfirmFormErrors,
    setShowConfirmDialog,
    handleConfirmReceipt,
  } = useInvoicesFromManufacturer();

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
    <DashboardLayout navigationItems={navigationItemsInvoices}>
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
