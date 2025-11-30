import DashboardLayout from "../../shared/components/DashboardLayout";
import TruckLoader from "../../shared/components/TruckLoader";
import { CardUI } from "../../shared/components/ui/cardUI";
import { Search } from "../../shared/components/ui/search";
import { useTransferHistory } from "../hooks/useTransferhistory";
import { navigationItems } from "../constants/navigationTransferHistory";

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
    expandedItems,
    toggleItem,
    retryingId,
    allItems,
    handleRetry,
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
          <CardUI
            title="Lịch sử chuyển giao"
            subtitle="Theo dõi tất cả các đơn chuyển giao NFT cho nhà phân phối"
          />

          {/* Filters */}
          <div className="rounded-2xl bg-white border border-card-primary shadow-sm p-4">
            <div className="flex flex-col lg:flex-row gap-3 lg:items-end">
              <div className="flex-1 min-w-0">
                <Search
                  searchInput={searchInput}
                  setSearchInput={setSearchInput}
                  handleSearch={handleSearch}
                  handleClearSearch={handleClearSearch}
                  placeholder="Tìm theo tên nhà phân phối, số lô..."
                  enableAutoSearch={true}
                  debounceMs={300}
                  data={allItems}
                  getSearchText={(item) => {
                    // Ưu tiên trả về mã hóa đơn nếu có, nếu không thì trả về tên nhà phân phối
                    return (
                      item.invoiceNumber ||
                      item.distributor?.fullName ||
                      item.distributor?.name ||
                      ""
                    );
                  }}
                  matchFunction={(item, searchLower) => {
                    const distributorName = (
                      item.distributor?.fullName ||
                      item.distributor?.name ||
                      ""
                    ).toLowerCase();
                    const invoiceNumber = (
                      item.invoiceNumber || ""
                    ).toLowerCase();
                    const batchNumber = (
                      item.production?.batchNumber || ""
                    ).toLowerCase();
                    const email = (item.distributor?.email || "").toLowerCase();
                    return (
                      distributorName.includes(searchLower) ||
                      invoiceNumber.includes(searchLower) ||
                      batchNumber.includes(searchLower) ||
                      email.includes(searchLower)
                    );
                  }}
                  getDisplayText={(item, searchTerm = "") => {
                    const distributorName =
                      item.distributor?.fullName ||
                      item.distributor?.name ||
                      "Không có tên";
                    const batch = item.production?.batchNumber || "N/A";
                    const invoiceNumber = item.invoiceNumber || "";
                    const searchLower = searchTerm.toLowerCase();

                    // Nếu tìm theo mã hóa đơn, hiển thị mã hóa đơn trước
                    if (
                      invoiceNumber &&
                      invoiceNumber.toLowerCase().includes(searchLower)
                    ) {
                      return `${invoiceNumber} - ${distributorName} (Lô: ${batch})`;
                    }
                    return `${distributorName} - Lô: ${batch}${
                      invoiceNumber ? ` - HĐ: ${invoiceNumber}` : ""
                    }`;
                  }}
                />
              </div>
              <div className="w-full lg:w-auto lg:min-w-[180px]">
                <label className="block text-sm text-slate-600 mb-1">
                  Trạng thái
                </label>
                <select
                  value={status}
                  onChange={(e) =>
                    updateFilter({ status: e.target.value, page: 1 })
                  }
                  className="h-12 w-full rounded-full appearance-none border border-gray-200 bg-white text-gray-700 px-4 pr-10 shadow-sm hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400 transition"
                >
                  <option value="">Tất cả</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="sent">Sent</option>
                  <option value="received">Received</option>
                  <option value="paid">Paid</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="issued">Issued</option>
                </select>
              </div>
            </div>
          </div>

          {/* List */}
          <div className="space-y-4">
            {items.length === 0 ? (
              <div className="bg-white rounded-2xl border border-cyan-200 p-10 text-center">
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  Chưa có lịch sử chuyển giao
                </h3>
                <p className="text-slate-600">
                  Các đơn chuyển giao của bạn sẽ hiển thị ở đây
                </p>
              </div>
            ) : (
              items.map((item) => {
                const itemId = item._id;
                const isExpanded = expandedItems.has(itemId);
                return (
                  <div
                    key={itemId}
                    className="bg-white rounded-2xl border border-card-primary shadow-sm overflow-hidden hover:shadow-md transition"
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
                              {item.distributor?.fullName ||
                                item.distributor?.name ||
                                item.distributor?.username ||
                                item.distributor?.email ||
                                item.invoiceNumber ||
                                "Chưa có thông tin"}
                            </h3>
                            <div className="text-sm text-slate-600 mt-1">
                              Số hóa đơn:{" "}
                              <span className="font-mono font-medium">
                                {item.invoiceNumber || "N/A"}
                              </span>
                              {item.distributor?.email && (
                                <span className="ml-3 text-xs">
                                  • {item.distributor.email}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            item.status
                          )}`}
                        >
                          {getStatusLabel(item.status)}
                        </span>
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
                        {/* Summary */}
                        <div className="grid grid-cols-1  gap-3 mb-4 text-sm mt-4">
                          <div className="rounded-lg p-3 border border-slate-200">
                            <div className="text-slate-700 mb-2">
                              Số lượng:{" "}
                              <span className="font-semibold text-slate-800">
                                {item.quantity} NFT
                              </span>
                            </div>
                            <div className="text-slate-700">
                              Ngày tạo:{" "}
                              <span className="font-medium text-slate-800">
                                {new Date(item.createdAt).toLocaleString(
                                  "vi-VN"
                                )}
                              </span>
                            </div>
                          </div>
                          {item.drug && (
                            <div className="rounded-lg p-3 border border-slate-200">
                              <div className="text-xs text-slate-600 mb-1">
                                Thông tin thuốc
                              </div>
                              <div className="font-medium text-slate-800">
                                {item.drug.tradeName || "N/A"}
                              </div>
                              {item.drug.atcCode && (
                                <div className="text-slate-700 mt-2">
                                  ATC Code:{" "}
                                  <span className="font-mono text-slate-800">
                                    {item.drug.atcCode}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Token IDs */}
                        {item.tokenIds && item.tokenIds.length > 0 && (
                          <div className="rounded-lg p-3 border border-slate-200 text-sm mb-4">
                            <div className="font-medium text-slate-800 mb-2">
                              Token IDs ({item.tokenIds.length})
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {item.tokenIds
                                .slice(0, 10)
                                .map((tokenId, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 rounded text-xs font-mono text-slate-700 border border-slate-200"
                                  >
                                    #{tokenId}
                                  </span>
                                ))}
                              {item.tokenIds.length > 10 && (
                                <span className="px-2 py-1 rounded text-xs font-medium text-slate-600 border border-slate-200">
                                  +{item.tokenIds.length - 10} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Distributor Panel */}
                        {item.distributor ? (
                          <div className="grid grid-cols-1 gap-3 mb-4">
                            <div className="rounded-lg p-3 border border-slate-200">
                              <div className="text-xs text-slate-600 mb-1">
                                Nhà phân phối
                              </div>
                              <div className="font-medium text-slate-800">
                                {item.distributor.fullName ||
                                  item.distributor.name ||
                                  item.distributor.username ||
                                  "N/A"}
                              </div>
                              {item.distributor.email && (
                                <div className="text-slate-700 mt-2 text-sm">
                                  Email:{" "}
                                  <span className="text-slate-800">
                                    {item.distributor.email}
                                  </span>
                                </div>
                              )}
                              {item.distributor.phone && (
                                <div className="text-slate-700 mt-1 text-sm">
                                  Điện thoại:{" "}
                                  <span className="text-slate-800">
                                    {item.distributor.phone}
                                  </span>
                                </div>
                              )}
                              {item.distributor.address && (
                                <div className="text-slate-700 mt-1 text-sm">
                                  Địa chỉ:{" "}
                                  <span className="text-slate-800">
                                    {item.distributor.address}
                                  </span>
                                </div>
                              )}
                            </div>
                            {item.distributor.walletAddress && (
                              <div className="rounded-lg p-3 border border-slate-200">
                                <div className="text-xs text-slate-600 mb-1">
                                  Wallet Address
                                </div>
                                <div className="font-mono text-xs text-slate-700 break-all">
                                  {item.distributor.walletAddress}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="rounded-lg p-3 border border-slate-200 mb-4">
                            <div className="text-slate-600 text-sm">
                              Chưa có thông tin nhà phân phối
                            </div>
                          </div>
                        )}

                        {item.transactionHash && (
                          <div className="rounded-lg p-3 border border-slate-200 text-sm mb-3">
                            <div className="font-medium text-slate-800 mb-1">
                              Transaction Hash (Blockchain)
                            </div>
                            <div className="font-mono text-xs text-slate-600 break-all">
                              {item.transactionHash}
                            </div>
                            <a
                              href={`https://zeroscan.org/tx/${item.transactionHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-slate-600 hover:text-slate-800 underline mt-1 inline-block"
                            >
                              Xem trên ZeroScan →
                            </a>
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
              Hiển thị {items.length} / {pagination.total} đơn chuyển giao
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
