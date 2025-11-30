import DashboardLayout from "../../shared/components/DashboardLayout";
import TruckLoader from "../../shared/components/TruckLoader";
import { CardUI } from "../../shared/components/ui/cardUI";
import { Search } from "../../shared/components/ui/search";
import { navigationItems } from "../constants/navigationProductionHistory";
import { useProductionHistory } from "../hooks/useProductionHistory";

export default function ProductionHistory() {
  const {
    items,
    loading,
    loadingProgress,
    pagination,
    searchInput,
    setSearchInput,
    handleSearch,
    handleClearSearch,
    updateFilter,
    getTransferStatusColor,
    getTransferStatusLabel,
    toggleItem,
    expandedItems,
    allItems,
    status,
    page,
  } = useProductionHistory();
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
          <CardUI
            title="Lịch sử sản xuất"
            subtitle="Xem tất cả các lô sản xuất và trạng thái chuyển giao NFT"
          />

          {/* Filters */}
          <div className="rounded-2xl bg-white border border-card-primary shadow-sm p-4">
            <div className="flex flex-col md:flex-row gap-3 md:items-center">
              <div className="flex-1">
                <Search
                  searchInput={searchInput}
                  setSearchInput={setSearchInput}
                  handleSearch={handleSearch}
                  handleClearSearch={handleClearSearch}
                  placeholder="Tìm theo tên thuốc, số lô..."
                  enableAutoSearch={true}
                  debounceMs={300}
                  data={allItems}
                  getSearchText={(item) => {
                    const drug = item.drug || {};
                    return drug.tradeName || "";
                  }}
                  matchFunction={(item, searchLower) => {
                    const drug = item.drug || {};
                    const tradeName = (drug.tradeName || "").toLowerCase();
                    const genericName = (drug.genericName || "").toLowerCase();
                    const atcCode = (drug.atcCode || "").toLowerCase();
                    const batchNumber = (item.batchNumber || "").toLowerCase();
                    return (
                      tradeName.includes(searchLower) ||
                      genericName.includes(searchLower) ||
                      atcCode.includes(searchLower) ||
                      batchNumber.includes(searchLower)
                    );
                  }}
                  getDisplayText={(item) => {
                    const drug = item.drug || {};
                    const drugName = drug.tradeName || "Không có tên";
                    const batch = item.batchNumber || "N/A";
                    return `${drugName} - Lô: ${batch}`;
                  }}
                />
              </div>
            </div>
          </div>

          {/* List */}
          <div className="space-y-4">
            {items.length === 0 ? (
              <div className="bg-white rounded-2xl border border-card-primary p-10 text-center">
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  Chưa có lịch sử sản xuất
                </h3>
                <p className="text-slate-600">
                  Các lô sản xuất của bạn sẽ hiển thị ở đây
                </p>
              </div>
            ) : (
              items.map((item, idx) => {
                const itemId = item._id || idx;
                const isExpanded = expandedItems.has(itemId);
                return (
                  <div
                    key={itemId}
                    className="bg-white rounded-2xl border border-card-primary shadow-sm overflow-hidden hover:shadow-lg transition"
                  >
                    {/* Clickable Header */}
                    <div
                      className="p-5 cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => toggleItem(itemId)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div
                            className={`transform transition-transform duration-300 ${
                              isExpanded ? "rotate-180" : "rotate-0"
                            }`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-5 h-5 text-slate-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-slate-800">
                              {item.drug?.tradeName || "N/A"}
                            </h3>
                            <div className="text-sm text-slate-600 mt-1">
                              Số lô:{" "}
                              <span className="font-mono font-medium">
                                {item.batchNumber || "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                        {item.transferStatus && (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${getTransferStatusColor(
                              item.transferStatus
                            )}`}
                          >
                            {getTransferStatusLabel(item.transferStatus)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Expandable Content */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isExpanded
                          ? "max-h-[2000px] opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="px-5 pb-5 border-t border-slate-200">
                        {/* Top facts */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-sm mt-4">
                          <div className="rounded-lg p-3 border border-slate-200">
                            <div className="text-slate-700 mb-2">
                              Số lượng sản xuất:{" "}
                              <span className="font-semibold text-slate-800">
                                {item.quantity || 0}
                              </span>
                            </div>
                            <div className="text-slate-700">
                              ATC Code:{" "}
                              <span className="font-mono text-slate-800">
                                {item.drug?.atcCode || "N/A"}
                              </span>
                            </div>
                            {item.nftCount !== undefined && (
                              <div className="text-slate-700 mt-2">
                                Số lượng NFT đã mint:{" "}
                                <span className="font-semibold text-slate-800">
                                  {item.nftCount}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="rounded-lg p-3 border border-slate-200">
                            <div className="text-xs text-slate-600 mb-1">
                              Trạng thái sản xuất
                            </div>
                            <div className="font-medium text-slate-800">
                              {item.status === "completed"
                                ? "Hoàn thành"
                                : item.status === "pending"
                                ? "Đang chờ"
                                : item.status === "distributed"
                                ? "Đã phân phối"
                                : item.status === "failed"
                                ? "Thất bại"
                                : item.status || "N/A"}
                            </div>
                            {item.transferStatus && (
                              <div className="text-xs text-slate-600 mt-2">
                                Trạng thái chuyển giao:{" "}
                                <span className="font-medium text-slate-700">
                                  {item.transferStatus === "transferred"
                                    ? "Đã chuyển"
                                    : item.transferStatus === "pending"
                                    ? "Đang chờ"
                                    : "Chưa chuyển"}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                          <div className="rounded-lg p-3 border border-slate-200">
                            <div className="text-xs text-slate-600 mb-1">
                              Ngày sản xuất
                            </div>
                            <div className="font-medium text-slate-800">
                              {item.mfgDate
                                ? new Date(item.mfgDate).toLocaleDateString(
                                    "vi-VN"
                                  )
                                : "N/A"}
                            </div>
                          </div>
                          <div className="rounded-lg p-3 border border-slate-200">
                            <div className="text-xs text-slate-600 mb-1">
                              Hạn sử dụng
                            </div>
                            <div className="font-medium text-slate-800">
                              {item.expDate
                                ? new Date(item.expDate).toLocaleDateString(
                                    "vi-VN"
                                  )
                                : "N/A"}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                          <div className="rounded-lg p-3 border border-slate-200">
                            <div className="text-xs text-slate-600 mb-1">
                              Ngày tạo
                            </div>
                            <div className="font-medium text-slate-700 text-sm">
                              {item.createdAt || item.drug?.createdAt
                                ? new Date(
                                    item.createdAt || item.drug?.createdAt
                                  ).toLocaleString("vi-VN")
                                : "N/A"}
                            </div>
                          </div>
                          <div className="rounded-lg p-3 border border-slate-200">
                            <div className="text-xs text-slate-600 mb-1">
                              Cập nhật lần cuối
                            </div>
                            <div className="font-medium text-slate-700 text-sm">
                              {item.updatedAt || item.drug?.updatedAt
                                ? new Date(
                                    item.updatedAt || item.drug?.updatedAt
                                  ).toLocaleString("vi-VN")
                                : "N/A"}
                            </div>
                          </div>
                        </div>

                        {item.chainTxHash && (
                          <div className="rounded-lg p-3 border border-slate-200 text-sm mb-3">
                            <div className="font-medium text-slate-800 mb-1">
                              Transaction Hash (Blockchain)
                            </div>
                            <div className="font-mono text-xs text-slate-600 break-all">
                              {item.chainTxHash}
                            </div>
                            <a
                              href={`https://zeroscan.org/tx/${item.chainTxHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-slate-600 hover:text-slate-800 underline mt-1 inline-block"
                            >
                              Xem trên ZeroScan →
                            </a>
                          </div>
                        )}

                        {item.notes && (
                          <div className="rounded-lg p-3 border border-slate-200 text-sm mb-3">
                            <div className="font-medium text-slate-800 mb-1">
                              Ghi chú:
                            </div>
                            <div className="text-slate-700">{item.notes}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-5">
            <div className="text-sm text-slate-600">
              Hiển thị {items.length} / {pagination.total} lô sản xuất
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => updateFilter({ page: page - 1 })}
                className={`px-3 py-2 rounded-xl ${
                  page <= 1
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-white border border-cyan-300 hover:bg-cyan-50"
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
                    : "bg-secondary !text-white hover:shadow-lg"
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
