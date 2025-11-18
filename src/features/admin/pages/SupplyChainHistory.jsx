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
          <div className="bg-white rounded-xl border border-card-primary shadow-sm p-5 mb-6">
            <h2 className="text-xl font-semibold text-cyan-900">
              Lịch sử truy xuất chuỗi cung ứng
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Theo dõi hành trình của từng lô hàng từ nhà sản xuất tới nhà
              thuốc.
            </p>
          </div>

          <motion.div
            className="rounded-2xl bg-white border border-card-primary shadow-[0_8px_24px_rgba(0,171,196,0.12)] p-4 mb-6"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Số lô
                </label>
                <input
                  type="text"
                  value={batchNumberInput}
                  onChange={(e) => {
                    // Chỉ cập nhật state, không trigger search
                    setBatchNumberInput(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    // Chỉ search khi nhấn Enter
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSearch();
                    }
                  }}
                  placeholder="Nhập số lô"
                  className="w-full h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Tên thuốc
                </label>
                <input
                  type="text"
                  value={drugNameInput}
                  onChange={(e) => {
                    // Chỉ cập nhật state, không trigger search
                    setDrugNameInput(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    // Chỉ search khi nhấn Enter
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSearch();
                    }
                  }}
                  placeholder="Lọc theo tên thuốc"
                  className="w-full h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                />
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
            <div className="flex items-center gap-3 justify-end">
              {(batchNumberInput || drugNameInput) && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition text-sm font-medium"
                >
                  Xóa tìm kiếm
                </button>
              )}
              <button
                type="button"
                onClick={handleSearch}
                className="px-6 py-2 rounded-lg bg-secondary hover:bg-primary text-white font-medium transition text-sm shadow-md"
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
                    <div className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-lg font-semibold text-slate-800">
                            Lô {batch.batchNumber}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.badgeClass}`}
                          >
                            {statusInfo.label}
                          </span>
                          <span className="text-xs text-slate-500">
                            {formatDateTime(batch.mfgDate)}
                          </span>
                        </div>
                        <div className="mt-2 text-sm text-slate-600">
                          <div>
                            Thuốc:{" "}
                            <span className="font-medium text-slate-800">
                              {batch.drug?.drugName || "—"}
                            </span>
                          </div>
                          <div>
                            Nhà sản xuất:{" "}
                            <span className="font-medium text-slate-800">
                              {batch.manufacturer?.name || "—"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm text-slate-600 md:text-right">
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
                    <div className="border-t border-slate-200 px-5 pb-6">
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
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => updateFilter({ page: page - 1 })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  page <= 1
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-white border border-cyan-300 text-cyan-700 hover:bg-cyan-50"
                }`}
              >
                ← Trước
              </button>
              <span className="text-sm text-slate-600">
                Trang <strong>{page}</strong> /{" "}
                <strong>{pagination.totalPages}</strong>
              </span>
              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() => updateFilter({ page: page + 1 })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
