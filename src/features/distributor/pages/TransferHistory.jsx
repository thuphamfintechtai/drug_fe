import { motion } from "framer-motion";
import DashboardLayout from "../../shared/components/DashboardLayout";
import TruckLoader from "../../shared/components/TruckLoader";
import { Search } from "../../shared/components/ui/search";
import { useTransferHistory } from "../hooks/useTransferHistory";
import { navigationItems } from "../constants/navigationItems";

export default function TransferHistory() {
  const {
    items,
    loading,
    loadingProgress,
    searchInput,
    setSearchInput,
    handleSearch,
    handleClearSearch,
    updateFilter,
    getStatusColor,
    getStatusLabel,
    pagination,
    page,
    status,
  } = useTransferHistory();

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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight drop-shadow-sm mb-3 !text-white">
                Lịch sử chuyển cho nhà thuốc
              </h1>
              <p className="text-base md:text-lg !text-white/90 max-w-2xl leading-relaxed">
                Theo dõi tất cả đơn chuyển giao NFT cho pharmacy
              </p>
            </div>
          </motion.section>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6"
          >
            <div className="flex flex-col md:flex-row gap-4 md:items-end">
              <div className="flex-1">
                <Search
                  searchInput={searchInput}
                  setSearchInput={setSearchInput}
                  handleSearch={handleSearch}
                  handleClearSearch={handleClearSearch}
                  placeholder="Tìm theo tên nhà thuốc, số đơn..."
                  data={items}
                  getSearchText={(item) => {
                    const invoiceNumber = item.invoiceNumber || "";
                    const pharmacyName =
                      item.pharmacy?.name ||
                      item.pharmacy?.fullName ||
                      (typeof item.pharmacy === "string" ? item.pharmacy : "");
                    return invoiceNumber || pharmacyName;
                  }}
                  matchFunction={(item, searchLower) => {
                    const invoiceNumber = (
                      item.invoiceNumber || ""
                    ).toLowerCase();
                    const pharmacyName = (
                      item.pharmacy?.name ||
                      item.pharmacy?.fullName ||
                      (typeof item.pharmacy === "string" ? item.pharmacy : "")
                    ).toLowerCase();
                    return (
                      invoiceNumber.includes(searchLower) ||
                      pharmacyName.includes(searchLower)
                    );
                  }}
                  getDisplayText={(item, searchLower) => {
                    const invoiceNumber = (
                      item.invoiceNumber || ""
                    ).toLowerCase();
                    const pharmacyName = (
                      item.pharmacy?.name ||
                      item.pharmacy?.fullName ||
                      (typeof item.pharmacy === "string" ? item.pharmacy : "")
                    ).toLowerCase();
                    if (invoiceNumber.includes(searchLower)) {
                      return item.invoiceNumber || "";
                    }
                    if (pharmacyName.includes(searchLower)) {
                      return (
                        item.pharmacy?.name ||
                        item.pharmacy?.fullName ||
                        (typeof item.pharmacy === "string"
                          ? item.pharmacy
                          : "") ||
                        ""
                      );
                    }
                    return (
                      item.invoiceNumber ||
                      item.pharmacy?.name ||
                      item.pharmacy?.fullName ||
                      (typeof item.pharmacy === "string"
                        ? item.pharmacy
                        : "") ||
                      ""
                    );
                  }}
                />
              </div>
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
                    <option value="pending">Đang chờ</option>
                    <option value="sent">Đã gửi</option>
                    <option value="received">Đã nhận</option>
                    <option value="paid">Đã thanh toán</option>
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
            </div>
          </motion.div>

          {/* List */}
          <div className="space-y-4">
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-slate-700 mb-2 text-center">
                    Chưa có lịch sử chuyển giao
                  </h3>
                  <p className="text-slate-500 text-sm text-center px-4">
                    Các đơn chuyển cho nhà thuốc sẽ hiển thị ở đây
                  </p>
                </div>
              </motion.div>
            ) : (
              items.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
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
                        <h3 className="text-lg font-bold text-slate-800">
                          {item.pharmacy?.name ||
                            item.pharmacy?.fullName ||
                            (typeof item.pharmacy === "string"
                              ? item.pharmacy
                              : "N/A")}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {item.invoiceNumber || "N/A"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {getStatusLabel(item.status)}
                    </span>
                  </div>

                  {/* Summary Boxes */}
                  <div className="px-6 py-4 space-y-4">
                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                            Số hóa đơn
                          </span>
                        </div>
                        <p className="font-mono font-bold text-slate-800 text-sm break-all">
                          {item.invoiceNumber || "N/A"}
                        </p>
                      </div>

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
                          {item.quantity || 0}{" "}
                          <span className="text-sm">NFT</span>
                        </p>
                      </div>

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
                            Ngày tạo
                          </span>
                        </div>
                        <p className="font-semibold text-slate-800 text-sm">
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleDateString(
                                "vi-VN"
                              )
                            : "N/A"}
                        </p>
                        {item.invoiceDate && (
                          <p className="text-xs text-slate-500 mt-1">
                            HĐ:{" "}
                            {new Date(item.invoiceDate).toLocaleDateString(
                              "vi-VN"
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress Tracker */}
                  <div className="px-6 pb-6 pt-4 border-t border-slate-200 bg-slate-50/50">
                    <div className="flex items-center gap-2 text-xs">
                      {/* Step 1: Pending */}
                      <div
                        className={`flex items-center gap-2 transition-all duration-300 ${
                          item.status === "pending"
                            ? "text-primary"
                            : ["sent", "received", "paid"].includes(item.status)
                            ? "text-slate-600"
                            : "text-slate-400"
                        }`}
                      >
                        <div className="relative">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                              item.status === "pending"
                                ? "bg-primary border-primary text-white shadow-lg shadow-primary/50"
                                : ["sent", "received", "paid"].includes(
                                    item.status
                                  )
                                ? "bg-white border-slate-300 text-slate-600"
                                : "bg-slate-100 border-slate-200 text-slate-400"
                            }`}
                          >
                            {["sent", "received", "paid"].includes(
                              item.status
                            ) ? (
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-current"></div>
                            )}
                          </div>
                        </div>
                        <span className="font-semibold whitespace-nowrap">
                          Đang chờ
                        </span>
                      </div>
                      <div
                        className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                          ["sent", "received", "paid"].includes(item.status)
                            ? "bg-primary"
                            : "bg-slate-200"
                        }`}
                      ></div>

                      {/* Step 2: Sent */}
                      <div
                        className={`flex items-center gap-2 transition-all duration-300 ${
                          item.status === "sent"
                            ? "text-primary"
                            : ["received", "paid"].includes(item.status)
                            ? "text-slate-600"
                            : "text-slate-400"
                        }`}
                      >
                        <div className="relative">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                              item.status === "sent"
                                ? "bg-primary border-primary text-white shadow-lg shadow-primary/50"
                                : ["received", "paid"].includes(item.status)
                                ? "bg-white border-slate-300 text-slate-600"
                                : "bg-slate-100 border-slate-200 text-slate-400"
                            }`}
                          >
                            {["received", "paid"].includes(item.status) ? (
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-current"></div>
                            )}
                          </div>
                        </div>
                        <span className="font-semibold whitespace-nowrap">
                          Đã gửi
                        </span>
                      </div>
                      <div
                        className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                          ["received", "paid"].includes(item.status)
                            ? "bg-primary"
                            : "bg-slate-200"
                        }`}
                      ></div>

                      {/* Step 3: Received */}
                      <div
                        className={`flex items-center gap-2 transition-all duration-300 ${
                          item.status === "received"
                            ? "text-primary"
                            : item.status === "paid"
                            ? "text-slate-600"
                            : "text-slate-400"
                        }`}
                      >
                        <div className="relative">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                              item.status === "received"
                                ? "bg-primary border-primary text-white shadow-lg shadow-primary/50"
                                : item.status === "paid"
                                ? "bg-white border-slate-300 text-slate-600"
                                : "bg-slate-100 border-slate-200 text-slate-400"
                            }`}
                          >
                            {item.status === "paid" ? (
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-current"></div>
                            )}
                          </div>
                        </div>
                        <span className="font-semibold whitespace-nowrap">
                          Đã nhận
                        </span>
                      </div>
                      <div
                        className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                          item.status === "paid" ? "bg-primary" : "bg-slate-200"
                        }`}
                      ></div>

                      {/* Step 4: Paid */}
                      <div
                        className={`flex items-center gap-2 transition-all duration-300 ${
                          item.status === "paid"
                            ? "text-primary"
                            : "text-slate-400"
                        }`}
                      >
                        <div className="relative">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                              item.status === "paid"
                                ? "bg-primary border-primary text-white shadow-lg shadow-primary/50"
                                : "bg-slate-100 border-slate-200 text-slate-400"
                            }`}
                          >
                            <div className="w-2 h-2 rounded-full bg-current"></div>
                          </div>
                        </div>
                        <span className="font-semibold whitespace-nowrap">
                          Đã thanh toán
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

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
                đơn chuyển giao
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
