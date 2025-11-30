import { motion } from "framer-motion";
import DashboardLayout from "../../shared/components/DashboardLayout";
import TruckLoader from "../../shared/components/TruckLoader";
import { Search } from "../../shared/components/ui/search";
import { useDistributionHistory } from "../hooks/useDistributionHistory";
import { navigationItems } from "../constants/navigationItems";

export default function DistributionHistory() {
  const {
    items,
    loading,
    loadingProgress,
    pagination,
    searchInput,
    setSearchInput,
    status,
    page,
    handleSearch,
    handleClearSearch,
    updateFilter,
    getStatusColor,
    availableStatuses,
    statusLabels,
  } = useDistributionHistory();
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
          <motion.section
            className="relative overflow-hidden rounded-2xl mb-6 border border-[#90e0ef33] shadow-[0_10px_30px_rgba(0,0,0,0.06)] bg-gradient-to-r from-primary to-secondary"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Decorative background elements */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full -ml-24 -mb-24"></div>
            </div>

            <div className="relative px-6 py-8 md:px-10 md:py-10 lg:py-12 flex flex-col items-center text-center">
              <div className="mb-3 flex items-center justify-center">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-8 h-8 md:w-10 md:h-10 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight drop-shadow-sm mb-3 !text-white">
                Lịch sử phân phối
              </h1>
              <p className="text-base md:text-lg !text-white/90 max-w-2xl leading-relaxed">
                Theo dõi toàn bộ lịch sử nhận hàng và phân phối
              </p>
            </div>
          </motion.section>

          {/* Filters */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6"
          >
            <div className="flex flex-col md:flex-row gap-4 md:items-end">
              <div className="flex-1">
                <Search
                  searchInput={searchInput}
                  setSearchInput={setSearchInput}
                  handleSearch={handleSearch}
                  handleClearSearch={handleClearSearch}
                  placeholder="Tìm theo doanh nghiệp"
                  data={items}
                  getSearchText={(item) => {
                    const invoiceNumber =
                      item.manufacturerInvoice?.invoiceNumber || "";
                    const fromName =
                      item.fromManufacturer?.fullName ||
                      item.fromManufacturer?.username ||
                      "";
                    return invoiceNumber || fromName;
                  }}
                  matchFunction={(item, searchLower) => {
                    const invoiceNumber = (
                      item.manufacturerInvoice?.invoiceNumber || ""
                    ).toLowerCase();
                    const fromName = (
                      item.fromManufacturer?.fullName ||
                      item.fromManufacturer?.username ||
                      ""
                    ).toLowerCase();
                    return (
                      invoiceNumber.includes(searchLower) ||
                      fromName.includes(searchLower)
                    );
                  }}
                  getDisplayText={(item, searchLower) => {
                    const invoiceNumber = (
                      item.manufacturerInvoice?.invoiceNumber || ""
                    ).toLowerCase();
                    const fromName = (
                      item.fromManufacturer?.fullName ||
                      item.fromManufacturer?.username ||
                      ""
                    ).toLowerCase();
                    if (invoiceNumber.includes(searchLower)) {
                      return item.manufacturerInvoice?.invoiceNumber || "";
                    }
                    if (fromName.includes(searchLower)) {
                      return (
                        item.fromManufacturer?.fullName ||
                        item.fromManufacturer?.username ||
                        ""
                      );
                    }
                    return (
                      item.manufacturerInvoice?.invoiceNumber ||
                      item.fromManufacturer?.fullName ||
                      item.fromManufacturer?.username ||
                      ""
                    );
                  }}
                />
              </div>
              {availableStatuses.length > 0 && (
                <div className="md:w-48">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Trạng thái
                  </label>
                  <div className="relative">
                    <select
                      value={status}
                      onChange={(e) =>
                        updateFilter({ status: e.target.value, page: 1 })
                      }
                      className="h-14 w-full rounded-xl appearance-none border-2 border-slate-300 bg-white text-slate-700 px-4 pr-12 shadow-sm hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                    >
                      <option value="">Tất cả</option>
                      {availableStatuses.map((s) => (
                        <option key={s} value={s}>
                          {statusLabels[s] || s}
                        </option>
                      ))}
                    </select>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 10.17l3.71-2.94a.75.75 0 111.04 1.08l-4.24 3.36a.75.75 0 01-.94 0L5.21 8.31a.75.75 0 01.02-1.1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            className="space-y-4"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            {items.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 md:p-16"
              >
                <div className="flex flex-col items-center justify-center">
                  <div className="p-4 bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-12 h-12 md:w-16 md:h-16 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-slate-700 mb-2 text-center">
                    Chưa có lịch sử phân phối
                  </h3>
                  <p className="text-slate-500 text-sm text-center px-4">
                    Lịch sử nhận hàng từ nhà sản xuất sẽ hiển thị ở đây
                  </p>
                </div>
              </motion.div>
            ) : (
              items.map((item, idx) => (
                <motion.div
                  key={item._id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 group"
                >
                  {/* Header */}
                  <div className="p-6 pb-4 flex items-start justify-between border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl group-hover:from-primary/20 group-hover:to-secondary/20 transition-colors">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 h-5 text-primary"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                          Từ Nhà sản xuất
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">
                          {item.fromManufacturer?.fullName ||
                            item.fromManufacturer?.username ||
                            "N/A"}
                        </h3>
                      </div>
                    </div>
                    <span
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {item.status === "confirmed"
                        ? "Confirmed"
                        : item.status === "pending"
                        ? "Pending"
                        : item.status === "transferred"
                        ? "Transferred"
                        : item.status}
                    </span>
                  </div>

                  {/* Summary Cards */}
                  <div className="px-6 py-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Invoice Number */}
                      {(item.manufacturerInvoice?.invoiceNumber ||
                        item.invoiceNumber) && (
                        <div className="bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5 rounded-xl p-4 border-2 border-primary/10">
                          <div className="flex items-center gap-2 mb-2">
                            <svg
                              className="w-4 h-4 text-primary"
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
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                              Đơn hàng
                            </span>
                          </div>
                          <p className="font-mono font-bold text-slate-800 text-sm break-all">
                            {item.manufacturerInvoice?.invoiceNumber ||
                              item.invoiceNumber}
                          </p>
                        </div>
                      )}

                      {/* Quantity */}
                      <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-xl p-4 border-2 border-emerald-100">
                        <div className="flex items-center gap-2 mb-2">
                          <svg
                            className="w-4 h-4 text-emerald-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                            />
                          </svg>
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Số lượng
                          </span>
                        </div>
                        <p className="font-bold text-emerald-700 text-lg">
                          {item.distributedQuantity || 0}{" "}
                          <span className="text-sm">NFT</span>
                        </p>
                      </div>

                      {/* Date */}
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border-2 border-amber-100">
                        <div className="flex items-center gap-2 mb-2">
                          <svg
                            className="w-4 h-4 text-amber-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Ngày nhận
                          </span>
                        </div>
                        <p className="font-semibold text-slate-800 text-sm">
                          {item.distributionDate
                            ? new Date(
                                item.distributionDate
                              ).toLocaleDateString("vi-VN")
                            : "Chưa có"}
                        </p>
                      </div>

                      {/* Address */}
                      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border-2 border-indigo-100">
                        <div className="flex items-center gap-2 mb-2">
                          <svg
                            className="w-4 h-4 text-indigo-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Địa chỉ
                          </span>
                        </div>
                        <p className="font-medium text-slate-800 text-xs line-clamp-2">
                          {typeof item.deliveryAddress === "object" &&
                          item.deliveryAddress !== null
                            ? `${item.deliveryAddress.street || ""}${
                                item.deliveryAddress.street &&
                                item.deliveryAddress.city
                                  ? ", "
                                  : ""
                              }${item.deliveryAddress.city || ""}`.trim() ||
                              "Chưa có"
                            : item.deliveryAddress || "Chưa có"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Information Panels */}
                  <div className="px-6 pb-6 space-y-4 border-t border-slate-200 pt-4">
                    {item.fromManufacturer && (
                      <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-5 border-2 border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-lg">
                            <svg
                              className="w-5 h-5 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                          </div>
                          <h4 className="font-bold text-slate-800 text-lg">
                            Thông tin nhà sản xuất
                          </h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                              Tên
                            </span>
                            <span className="font-semibold text-slate-800">
                              {item.fromManufacturer.fullName ||
                                item.fromManufacturer.username ||
                                "N/A"}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                              Username
                            </span>
                            <span className="font-mono text-slate-800">
                              {item.fromManufacturer.username || "N/A"}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                              Email
                            </span>
                            <span className="font-medium text-slate-800 break-all">
                              {item.fromManufacturer.email || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {item.manufacturerInvoice && (
                      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-5 border-2 border-cyan-100">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg">
                            <svg
                              className="w-5 h-5 text-white"
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
                          </div>
                          <h4 className="font-bold text-slate-800 text-lg">
                            Thông tin hóa đơn
                          </h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                              Số hóa đơn
                            </span>
                            <span className="font-mono font-bold text-slate-800">
                              {item.manufacturerInvoice.invoiceNumber}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                              Ngày hóa đơn
                            </span>
                            <span className="font-semibold text-slate-800">
                              {item.manufacturerInvoice.invoiceDate
                                ? new Date(
                                    item.manufacturerInvoice.invoiceDate
                                  ).toLocaleDateString("vi-VN")
                                : "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {item.notes && (
                      <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-5 border-2 border-slate-200">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-gradient-to-br from-slate-500 to-slate-600 rounded-lg">
                            <svg
                              className="w-5 h-5 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </div>
                          <h4 className="font-bold text-slate-800">Ghi chú</h4>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {item.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>

          {/* Pagination */}
          {items.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm"
            >
              <div className="text-sm text-slate-600 font-medium">
                Hiển thị{" "}
                <span className="font-bold text-slate-800">{items.length}</span>{" "}
                /{" "}
                <span className="font-bold text-slate-800">
                  {pagination?.total || 0}
                </span>{" "}
                lô phân phối
              </div>
              <div className="flex items-center gap-3">
                <button
                  disabled={page <= 1}
                  onClick={() => updateFilter({ page: page - 1 })}
                  className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    page <= 1
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "bg-white border-2 border-slate-300 text-slate-700 hover:border-primary hover:bg-primary/5 hover:text-primary"
                  }`}
                >
                  Trước
                </button>
                <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-sm font-semibold text-slate-700">
                    Trang {page} / {pagination?.pages || 1}
                  </span>
                </div>
                <button
                  disabled={page >= pagination?.pages}
                  onClick={() => updateFilter({ page: page + 1 })}
                  className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    page >= pagination?.pages
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "text-white bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary shadow-lg hover:shadow-xl"
                  }`}
                >
                  Sau
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
