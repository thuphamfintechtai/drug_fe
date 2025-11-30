import { useMemo } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "../../shared/components/DashboardLayout";
import TruckLoader from "../../shared/components/TruckLoader";
import { formatDateTime, formatNumber } from "../../utils/helper";
import { supplyChainHistory } from "../constants/supplyChainHistory";
import SupplyChainJourney from "../components/SupplyChainJourney";
import { useSupplyChainHistory } from "../hooks/useSupplyChainHistory";

const { statusMeta } = supplyChainHistory;

export default function SupplyChainHistory() {
  const {
    page,
    batchNumberInput,
    drugNameInput,
    statusFilter,
    fromDate,
    toDate,
    batches,
    pagination,
    loading,
    error,
    expandedBatch,
    journeys,
    journeyLoading,
    fadeUp,
    setBatchNumberInput,
    setDrugNameInput,
    handleSearch,
    handleClearSearch,
    handleToggleBatch,
    updateFilter,
    filteredBatchSuggestions,
    filteredDrugSuggestions,
    showBatchSuggestions,
    setShowBatchSuggestions,
    showDrugSuggestions,
    setShowDrugSuggestions,
  } = useSupplyChainHistory();

  const navigationItems = useMemo(
    () => [
      { path: "/admin", label: "Tổng quan", icon: null, active: false },
      {
        path: "/admin/supply-chain",
        label: "Lịch sử truy xuất",
        icon: null,
        active: true,
      },
    ],
    []
  );

  return (
    <DashboardLayout navigationItems={navigationItems}>
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="w-full max-w-2xl">
            <TruckLoader height={72} showTrack progress={0.6} />
          </div>
          <div className="text-lg text-slate-600 mt-6">Đang tải dữ liệu...</div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-card-primary shadow-sm p-4 sm:p-5 mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-cyan-900">
              Lịch sử truy xuất chuỗi cung ứng
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1">
              Theo dõi hành trình của từng lô hàng từ nhà sản xuất tới nhà
              thuốc.
            </p>
          </div>

          <motion.div
            className="rounded-2xl bg-white border border-card-primary shadow-[0_8px_24px_rgba(0,171,196,0.12)] p-3 sm:p-4 mb-6"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
              <div className="relative">
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Số lô
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={batchNumberInput}
                    onChange={(e) => {
                      setBatchNumberInput(e.target.value);
                      setShowBatchSuggestions(true);
                    }}
                    onFocus={() => setShowBatchSuggestions(true)}
                    onBlur={() => {
                      // Delay để cho phép click vào suggestion
                      // eslint-disable-next-line no-undef
                      setTimeout(() => setShowBatchSuggestions(false), 200);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        setShowBatchSuggestions(false);
                        handleSearch();
                      } else if (e.key === "Escape") {
                        setShowBatchSuggestions(false);
                      }
                    }}
                    placeholder="Nhập số lô"
                    className="w-full h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                  />
                  {showBatchSuggestions &&
                    filteredBatchSuggestions.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filteredBatchSuggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setBatchNumberInput(suggestion);
                              setShowBatchSuggestions(false);
                              handleSearch();
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-cyan-50 hover:text-cyan-700 transition-colors first:rounded-t-lg last:rounded-b-lg"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                </div>
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Tên thuốc
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={drugNameInput}
                    onChange={(e) => {
                      setDrugNameInput(e.target.value);
                      setShowDrugSuggestions(true);
                    }}
                    onFocus={() => setShowDrugSuggestions(true)}
                    onBlur={() => {
                      // Delay để cho phép click vào suggestion
                      // eslint-disable-next-line no-undef
                      setTimeout(() => setShowDrugSuggestions(false), 200);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        setShowDrugSuggestions(false);
                        handleSearch();
                      } else if (e.key === "Escape") {
                        setShowDrugSuggestions(false);
                      }
                    }}
                    placeholder="Lọc theo tên thuốc"
                    className="w-full h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                  />
                  {showDrugSuggestions &&
                    filteredDrugSuggestions.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filteredDrugSuggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setDrugNameInput(suggestion);
                              setShowDrugSuggestions(false);
                              handleSearch();
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-cyan-50 hover:text-cyan-700 transition-colors first:rounded-t-lg last:rounded-b-lg"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Trạng thái lô
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    updateFilter({ status: e.target.value, page: 1 })
                  }
                  className="w-full h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                >
                  <option value="">Tất cả</option>
                  <option value="produced">Đã sản xuất</option>
                  <option value="in_transit">Đang vận chuyển</option>
                  <option value="completed">Hoàn tất</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Từ ngày
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) =>
                    updateFilter({ fromDate: e.target.value, page: 1 })
                  }
                  className="w-full h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Đến ngày
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) =>
                    updateFilter({ toDate: e.target.value, page: 1 })
                  }
                  className="w-full h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                />
              </div>
            </div>
            {/* Search buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 justify-end">
              {(batchNumberInput ||
                drugNameInput ||
                statusFilter ||
                fromDate ||
                toDate) && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="px-3 sm:px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition text-sm font-medium whitespace-nowrap"
                >
                  Xóa tìm kiếm
                </button>
              )}
              <button
                type="button"
                onClick={handleSearch}
                className="px-4 sm:px-6 py-2 rounded-lg bg-secondary hover:bg-primary !text-white font-medium transition text-sm shadow-md whitespace-nowrap"
              >
                Tìm kiếm
              </button>
            </div>
          </motion.div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {batches.length === 0 && !error && (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
                Không tìm thấy lô hàng nào phù hợp.
              </div>
            )}

            {batches.map((batch) => {
              const isExpanded = expandedBatch === batch.batchNumber;
              const statusInfo = statusMeta[batch.status] || statusMeta.default;

              return (
                <motion.div
                  key={batch.batchNumber}
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  className="rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleBatch(batch)}
                    className="w-full text-left"
                  >
                    <div className="flex flex-col gap-3 sm:gap-4 p-4 sm:p-5 md:flex-row md:items-center md:justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                          <span className="text-base sm:text-lg font-semibold text-slate-800">
                            Lô {batch.batchNumber}
                          </span>
                          <span
                            className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.badgeClass}`}
                          >
                            {statusInfo.label}
                          </span>
                          <span className="text-xs text-slate-500">
                            {formatDateTime(batch.mfgDate)}
                          </span>
                        </div>
                        <div className="mt-2 text-xs sm:text-sm text-slate-600 space-y-1">
                          <div className="truncate">
                            Thuốc:{" "}
                            <span className="font-medium text-slate-800">
                              {batch.drug?.drugName || "—"}
                            </span>
                          </div>
                          <div className="truncate">
                            Nhà sản xuất:{" "}
                            <span className="font-medium text-slate-800">
                              {batch.manufacturer?.name || "—"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm text-slate-600 md:text-right">
                        <div>
                          <div className="text-xs uppercase text-slate-500">
                            Tổng số lượng
                          </div>
                          <div className="font-semibold text-slate-800">
                            {formatNumber(batch.totalQuantity)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs uppercase text-slate-500">
                            Tổng NFT
                          </div>
                          <div className="font-semibold text-slate-800">
                            {formatNumber(batch.nftCount)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs uppercase text-slate-500">
                            Đã phân phối
                          </div>
                          <div className="font-semibold text-slate-800">
                            {formatNumber(batch.distributedCount)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs uppercase text-slate-500">
                            Hoàn tất
                          </div>
                          <div className="font-semibold text-slate-800">
                            {formatNumber(batch.completedCount)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-slate-200 px-3 sm:px-5 py-4 sm:pb-6">
                      <SupplyChainJourney
                        journey={journeys[batch.batchNumber]}
                        isLoading={journeyLoading[batch.batchNumber]}
                      />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {pagination.totalPages > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => updateFilter({ page: page - 1 })}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  page <= 1
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-white border border-cyan-300 text-cyan-700 hover:bg-cyan-50"
                }`}
              >
                ← Trước
              </button>
              <span className="text-xs sm:text-sm text-slate-600">
                Trang <strong>{page}</strong> /{" "}
                <strong>{pagination.totalPages}</strong>
              </span>
              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() => updateFilter({ page: page + 1 })}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  page >= pagination.totalPages
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "text-white bg-secondary shadow-[0_10px_24px_rgba(0,180,216,0.30)] hover:shadow-[0_14px_36px_rgba(0,180,216,0.40)]"
                }`}
              >
                Sau →
              </button>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
