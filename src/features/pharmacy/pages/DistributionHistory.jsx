import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "../../shared/components/DashboardLayout";
import TruckLoader from "../../shared/components/TruckLoader";
import { useDistributionHistory } from "../hooks/useDistributionHistory";
import { navigationItems } from "../constants/constant";
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
    hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
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
          <div className="text-lg text-slate-600 mt-6">Đang tải dữ liệu...</div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-card-primary shadow-sm p-5 mb-6">
            <h1 className="text-xl font-semibold text-[#007b91]">
              Lịch sử phân phối
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Theo dõi toàn bộ lịch sử nhận hàng và phân phối
            </p>
          </div>

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
                    type="text"
                    value={searchInput}
                    onChange={(e) => {
                      // Chỉ cập nhật state, không trigger search
                      setSearchInput(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      // Chỉ search khi nhấn Enter
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSearch();
                      }
                    }}
                    placeholder="Tìm theo tên thuốc, mã..."
                    className="w-full h-12 pl-11 pr-40 rounded-full border border-gray-200 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#48cae4] transition"
                  />
                  {/* Clear button */}
                  {searchInput && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute right-24 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                      title="Xóa tìm kiếm"
                    >
                      ✕
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSearch}
                    className="absolute right-1 top-1 bottom-1 px-6 rounded-full bg-secondary hover:bg-primary !text-white font-medium transition"
                  >
                    Tìm Kiếm
                  </button>
                </div>
              </div>
              {availableStatuses.length > 0 && (
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
                    {availableStatuses.map((s) => (
                      <option key={s} value={s}>
                        {translateStatus(s)}
                      </option>
                    ))}
                  </select>
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
              <div className="bg-white rounded-2xl border border-card-primary p-10 text-center">
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  Chưa có lịch sử phân phối
                </h3>
                <p className="text-slate-600">
                  Lịch sử nhận hàng sẽ hiển thị ở đây
                </p>
              </div>
            ) : (
              items.map((item, idx) => {
                const isExpanded = expandedItems.has(idx);
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-card-primary shadow-sm overflow-hidden hover:shadow-lg transition"
                  >
                    {/* Header - Clickable */}
                    <div
                      className="p-5 flex items-start justify-between cursor-pointer"
                      onClick={() => toggleItem(idx)}
                    >
                      <div className="flex-1">
                        <div className="text-sm text-slate-600">Từ</div>
                        <h3 className="text-lg font-semibold text-[#003544]">
                          {item.fromDistributor?.fullName ||
                            item.fromDistributor?.name ||
                            item.fromDistributor?.username ||
                            "Không có"}
                        </h3>
                        {/* Summary Info - Always visible */}
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-600">Thuốc:</span>
                            <span className="font-medium text-slate-800">
                              {item.drug?.tradeName ||
                                item.drug?.commercialName ||
                                item.drugInfo?.commercialName ||
                                item.drugInfo?.tradeName ||
                                item.drugName ||
                                item.drug?.name ||
                                "Không có"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-600">Số lượng:</span>
                            <span className="font-semibold text-slate-800">
                              {item.quantity || item.receivedQuantity || 0} NFT
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            item.status
                          )}`}
                        >
                          {translateStatus(item.status)}
                        </span>
                        <svg
                          className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
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

                    {/* Expandable Content */}
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 space-y-3 border-t border-slate-100 pt-5">
                          {/* Additional Summary Info */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-600">Địa chỉ:</span>
                              <span className="text-slate-800">
                                {typeof item.deliveryAddress === "object" &&
                                item.deliveryAddress !== null
                                  ? `${item.deliveryAddress.street || ""}${
                                      item.deliveryAddress.street &&
                                      item.deliveryAddress.city
                                        ? ", "
                                        : ""
                                    }${
                                      item.deliveryAddress.city || ""
                                    }`.trim() || "Chưa có"
                                  : item.deliveryAddress || "Chưa có"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-600">Ngày nhận:</span>
                              <span className="text-slate-800">
                                {item.receivedDate
                                  ? new Date(
                                      item.receivedDate
                                    ).toLocaleDateString("vi-VN")
                                  : item.createdAt
                                  ? new Date(item.createdAt).toLocaleDateString(
                                      "vi-VN"
                                    )
                                  : "Chưa có"}
                              </span>
                            </div>
                          </div>

                          {/* Information Panels */}
                          {item.fromDistributor && (
                            <div className="rounded-xl p-4 border border-slate-200 bg-slate-50">
                              <div className="font-semibold text-slate-800 mb-1">
                                Thông tin nhà phân phối
                              </div>
                              <div className="text-sm text-slate-700">
                                Tên:{" "}
                                <span className="font-medium">
                                  {item.fromDistributor.fullName ||
                                    item.fromDistributor.name ||
                                    item.fromDistributor.username ||
                                    "Không có"}
                                </span>
                              </div>
                              {item.fromDistributor.username && (
                                <div className="text-sm text-slate-700 mt-1">
                                  Tên đăng nhập:{" "}
                                  <span className="font-mono">
                                    {item.fromDistributor.username}
                                  </span>
                                </div>
                              )}
                              {item.fromDistributor.email && (
                                <div className="text-sm text-slate-700 mt-1">
                                  Email:{" "}
                                  <span className="font-medium">
                                    {item.fromDistributor.email}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          {item.receivedBy && (
                            <div className="rounded-xl p-4 border border-slate-200 bg-slate-50">
                              <div className="font-semibold text-slate-800 mb-1">
                                Người nhận
                              </div>
                              <div className="text-sm text-slate-700">
                                {extractName(item.receivedBy, "—")}
                              </div>
                            </div>
                          )}

                          {(item.transactionHash ||
                            item.chainTxHash ||
                            item.receiptTxHash) && (
                            <div className="rounded-xl p-4 border border-slate-200 bg-slate-50">
                              <div className="font-semibold text-slate-800 mb-1">
                                Mã giao dịch
                              </div>
                              <div className="text-sm text-slate-700 font-mono break-all">
                                {item.transactionHash ||
                                  item.chainTxHash ||
                                  item.receiptTxHash}
                              </div>
                            </div>
                          )}

                          <div className="rounded-xl p-4 border border-slate-200 bg-slate-50">
                            <div className="font-semibold text-slate-800 mb-1">
                              Ghi chú
                            </div>
                            <div className="text-sm text-slate-700">
                              {formatNotes(item.notes)}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                );
              })
            )}
          </motion.div>

          <div className="flex items-center justify-between mt-5">
            <div className="text-sm text-slate-600">
              Hiển thị {items.length} / {pagination.total} lô phân phối
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
        </div>
      )}
    </DashboardLayout>
  );
}
