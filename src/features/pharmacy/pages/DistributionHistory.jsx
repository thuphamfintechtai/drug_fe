import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "../../shared/components/DashboardLayout";
import TruckLoader from "../../shared/components/TruckLoader";
import { useDistributionHistory } from "../hooks/useDistributionHistory";
import { navigationItems, COLORS } from "../constants/constant";

export default function DistributionHistory() {
  const [expandedItems, setExpandedItems] = useState(new Set());
  const {
    items,
    loading,
    loadingProgress,
    pagination,
    searchParams,
    setSearchParams,
    searchInput,
    setSearchInput,
    handleSearch,
    handleClearSearch,
    updateFilter,
    getStatusColor,
    translateStatus,
    extractName,
    formatNotes,
    status,
    page,
    availableStatuses,
  } = useDistributionHistory();

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const toggleItem = (idx) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(idx)) {
      newExpanded.delete(idx);
    } else {
      newExpanded.add(idx);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <DashboardLayout navigationItems={navigationItems}>
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="w-full max-w-2xl">
            <TruckLoader height={72} progress={loadingProgress} showTrack />
          </div>
          <div className="text-lg text-slate-600 mt-6 font-medium">
            Đang tải dữ liệu...
          </div>
        </div>
      ) : (
        <div className="space-y-6 max-w-7xl mx-auto">
          {/* Header Section */}
          <motion.div
            className="bg-gradient-to-r from-[#054f67] to-[#077ca3] rounded-2xl shadow-lg overflow-hidden"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            <div className="p-6 md:p-8 text-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <svg
                    className="w-6 h-6"
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
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">
                    Lịch sử phân phối
                  </h1>
                  <p className="text-white/90 text-sm md:text-base mt-1">
                    Theo dõi toàn bộ lịch sử nhận hàng và phân phối
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Search and Filter Section */}
          <motion.div
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 md:p-6"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            <div className="flex flex-col lg:flex-row gap-4 lg:items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tìm kiếm
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
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
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSearch();
                      }
                    }}
                    placeholder="Tìm theo tên thuốc,..."
                    className="w-full h-12 pl-11 pr-36 rounded-lg border border-slate-300 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#077ca3] focus:border-transparent transition-all shadow-sm"
                  />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute right-28 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                      title="Xóa tìm kiếm"
                    >
                      <svg
                        className="w-4 h-4"
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
                  )}
                  <button
                    type="button"
                    onClick={handleSearch}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 px-5 rounded-lg bg-[#077ca3] hover:bg-[#054f67] text-white font-medium text-sm transition-colors shadow-sm"
                  >
                    Tìm kiếm
                  </button>
                </div>
              </div>
              {availableStatuses.length > 0 && (
                <div className="lg:w-56">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Lọc theo trạng thái
                  </label>
                  <div className="relative">
                    <select
                      value={status}
                      onChange={(e) =>
                        updateFilter({ status: e.target.value, page: 1 })
                      }
                      className="w-full h-12 rounded-lg border border-slate-300 bg-white text-slate-800 px-4 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-[#077ca3] focus:border-transparent transition-all shadow-sm cursor-pointer"
                    >
                      <option value="">Tất cả trạng thái</option>
                      {availableStatuses.map((s) => (
                        <option key={s} value={s}>
                          {translateStatus(s)}
                        </option>
                      ))}
                    </select>
                    <svg
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* List Section */}
          <motion.div
            className="space-y-4"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            {items.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 md:p-16 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-slate-400"
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
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">
                    Chưa có lịch sử phân phối
                  </h3>
                  <p className="text-slate-500">
                    Lịch sử nhận hàng sẽ hiển thị ở đây khi có dữ liệu
                  </p>
                </div>
              </div>
            ) : (
              items.map((item, idx) => {
                const isExpanded = expandedItems.has(idx);
                return (
                  <motion.div
                    key={idx}
                    className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    {/* Header - Clickable */}
                    <div
                      className="p-5 md:p-6 flex items-start justify-between cursor-pointer hover:bg-slate-50/50 transition-colors"
                      onClick={() => toggleItem(idx)}
                    >
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-1.5 bg-slate-100 rounded-lg">
                            <svg
                              className="w-4 h-4 text-slate-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                              />
                            </svg>
                          </div>
                          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                            Nhà phân phối
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4 truncate">
                          {item.fromDistributor?.fullName ||
                            item.fromDistributor?.name ||
                            item.fromDistributor?.username ||
                            "Không có thông tin"}
                        </h3>
                        {/* Summary Info - Always visible */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="p-1 bg-blue-50 rounded">
                              <svg
                                className="w-3.5 h-3.5 text-[#077ca3]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                />
                              </svg>
                            </div>
                            <div>
                              <span className="text-slate-500 block text-xs">
                                Thuốc
                              </span>
                              <span className="font-medium text-slate-900">
                                {item.drug?.tradeName ||
                                  item.drug?.commercialName ||
                                  item.drugInfo?.commercialName ||
                                  item.drugInfo?.tradeName ||
                                  item.drugName ||
                                  item.drug?.name ||
                                  "Chưa xác định"}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="p-1 bg-emerald-50 rounded">
                              <svg
                                className="w-3.5 h-3.5 text-emerald-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                                />
                              </svg>
                            </div>
                            <div>
                              <span className="text-slate-500 block text-xs">
                                Số lượng
                              </span>
                              <span className="font-semibold text-slate-900">
                                {item.quantity || item.receivedQuantity || 0}{" "}
                                <span className="text-xs font-normal text-slate-500">
                                  NFT
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${getStatusColor(
                            item.status
                          )}`}
                        >
                          {translateStatus(item.status)}
                        </span>
                        <div className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                          <svg
                            className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Content */}
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden border-t border-slate-100"
                      >
                        <div className="px-5 md:px-6 pb-5 md:pb-6 pt-5 bg-slate-50/30">
                          {/* Additional Summary Info */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="bg-white rounded-lg p-4 border border-slate-200">
                              <div className="flex items-center gap-2 mb-2">
                                <svg
                                  className="w-4 h-4 text-slate-500"
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
                                <span className="text-xs font-medium text-slate-500 uppercase">
                                  Địa chỉ nhận hàng
                                </span>
                              </div>
                              <p className="text-sm font-medium text-slate-900">
                                {typeof item.deliveryAddress === "object" &&
                                item.deliveryAddress !== null
                                  ? `${item.deliveryAddress.street || ""}${
                                      item.deliveryAddress.street &&
                                      item.deliveryAddress.city
                                        ? ", "
                                        : ""
                                    }${
                                      item.deliveryAddress.city || ""
                                    }`.trim() || "Chưa có thông tin"
                                  : item.deliveryAddress || "Chưa có thông tin"}
                              </p>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-slate-200">
                              <div className="flex items-center gap-2 mb-2">
                                <svg
                                  className="w-4 h-4 text-slate-500"
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
                                <span className="text-xs font-medium text-slate-500 uppercase">
                                  Ngày nhận
                                </span>
                              </div>
                              <p className="text-sm font-medium text-slate-900">
                                {item.receivedDate
                                  ? new Date(
                                      item.receivedDate
                                    ).toLocaleDateString("vi-VN", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })
                                  : item.createdAt
                                  ? new Date(item.createdAt).toLocaleDateString(
                                      "vi-VN",
                                      {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      }
                                    )
                                  : "Chưa có thông tin"}
                              </p>
                            </div>
                          </div>

                          {/* Information Panels */}
                          <div className="space-y-3">
                            {item.fromDistributor && (
                              <div className="bg-white rounded-lg p-4 border border-slate-200">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="p-1.5 bg-blue-50 rounded-lg">
                                    <svg
                                      className="w-4 h-4 text-[#077ca3]"
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
                                  <h4 className="font-semibold text-slate-900">
                                    Thông tin nhà phân phối
                                  </h4>
                                </div>
                                <div className="space-y-2 pl-8">
                                  <div className="text-sm">
                                    <span className="text-slate-500">Tên:</span>{" "}
                                    <span className="font-medium text-slate-900 ml-1">
                                      {item.fromDistributor.fullName ||
                                        item.fromDistributor.name ||
                                        item.fromDistributor.username ||
                                        "Không có"}
                                    </span>
                                  </div>
                                  {item.fromDistributor.username && (
                                    <div className="text-sm">
                                      <span className="text-slate-500">
                                        Tên đăng nhập:
                                      </span>{" "}
                                      <span className="font-mono text-slate-900 ml-1">
                                        {item.fromDistributor.username}
                                      </span>
                                    </div>
                                  )}
                                  {item.fromDistributor.email && (
                                    <div className="text-sm">
                                      <span className="text-slate-500">
                                        Thư điện tử:
                                      </span>{" "}
                                      <span className="font-medium text-slate-900 ml-1">
                                        {item.fromDistributor.email}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {item.receivedBy && (
                              <div className="bg-white rounded-lg p-4 border border-slate-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="p-1.5 bg-emerald-50 rounded-lg">
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
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                      />
                                    </svg>
                                  </div>
                                  <h4 className="font-semibold text-slate-900">
                                    Người nhận
                                  </h4>
                                </div>
                                <p className="text-sm font-medium text-slate-900 pl-8">
                                  {extractName(item.receivedBy, "—")}
                                </p>
                              </div>
                            )}

                            {(item.transactionHash ||
                              item.chainTxHash ||
                              item.receiptTxHash) && (
                              <div className="bg-white rounded-lg p-4 border border-slate-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="p-1.5 bg-purple-50 rounded-lg">
                                    <svg
                                      className="w-4 h-4 text-purple-600"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                      />
                                    </svg>
                                  </div>
                                  <h4 className="font-semibold text-slate-900">
                                    Mã giao dịch blockchain
                                  </h4>
                                </div>
                                <div className="pl-8">
                                  <p className="text-xs font-mono text-slate-900 break-all bg-slate-50 p-2 rounded border border-slate-200">
                                    {item.transactionHash ||
                                      item.chainTxHash ||
                                      item.receiptTxHash}
                                  </p>
                                </div>
                              </div>
                            )}

                            <div className="bg-white rounded-lg p-4 border border-slate-200">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 bg-amber-50 rounded-lg">
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
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                                </div>
                                <h4 className="font-semibold text-slate-900">
                                  Ghi chú
                                </h4>
                              </div>
                              <p className="text-sm text-slate-700 pl-8">
                                {formatNotes(item.notes)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })
            )}
          </motion.div>

          {/* Pagination */}
          {pagination.total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
              <div className="text-sm text-slate-600">
                <span className="font-medium text-slate-900">
                  {items.length}
                </span>{" "}
                trong tổng số{" "}
                <span className="font-medium text-slate-900">
                  {pagination.total}
                </span>{" "}
                lô phân phối
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => updateFilter({ page: page - 1 })}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    page <= 1
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400"
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Trước
                </button>
                <div className="px-4 py-2 bg-white border border-slate-300 rounded-lg">
                  <span className="text-sm font-medium text-slate-700">
                    Trang <span className="text-[#077ca3]">{page}</span> /{" "}
                    {pagination.pages || 1}
                  </span>
                </div>
                <button
                  disabled={page >= pagination.pages}
                  onClick={() => updateFilter({ page: page + 1 })}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    page >= pagination.pages
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "bg-[#077ca3] text-white hover:bg-[#054f67] shadow-sm"
                  }`}
                >
                  Sau
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
