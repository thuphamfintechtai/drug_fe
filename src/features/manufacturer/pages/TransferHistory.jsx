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
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7h18M5 10h14M4 14h16M6 18h12"
                />
              </svg>
            }
          />

          {/* Filters */}
          <div className="rounded-2xl bg-white border border-card-primary shadow-sm p-4">
            <div className="flex flex-col md:flex-row gap-3 md:items-end">
              <div className="flex-1">
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
              <div>
                <label className="block text-sm text-slate-600 mb-1">
                  Trạng thái
                </label>
                <select
                  value={status}
                  onChange={(e) =>
                    updateFilter({ status: e.target.value, page: 1 })
                  }
                  className="h-12 w-full rounded-full appearance-none border border-gray-200 bg-white text-gray-700 px-4 pr-12 shadow-sm hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400 transition"
                >
                  <option value="">Tất cả</option>
                  <option value="issued">Đã phát hành</option>
                  <option value="pending">Pending</option>
                  <option value="sent">Sent</option>
                  <option value="received">Received</option>
                  <option value="paid">Paid</option>
                  <option value="cancelled">Cancelled</option>
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
                      className={`overflow-hidden transition-all duration-500 ease-in-out ${
                        isExpanded
                          ? "max-h-[2000px] opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="px-5 pb-6 border-t border-slate-200 bg-gradient-to-b from-slate-50/50 to-white">
                        {/* Summary */}
                        <div className="grid grid-cols-1 gap-4 mb-4 text-sm mt-5">
                          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200/50 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="p-2 bg-blue-500 rounded-lg">
                                <svg
                                  className="w-4 h-4 text-white"
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
                              </div>
                              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                                Thông tin đơn hàng
                              </span>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-600">
                                  Số lượng:
                                </span>
                                <span className="font-bold text-slate-800 text-base">
                                  {item.quantity} NFT
                                </span>
                              </div>
                              <div className="flex items-center justify-between pt-2 border-t border-blue-200/50">
                                <span className="text-slate-600">
                                  Ngày tạo:
                                </span>
                                <span className="font-medium text-slate-800">
                                  {new Date(item.createdAt).toLocaleString(
                                    "vi-VN"
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                          {item.drug && (
                            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200/50 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 bg-emerald-500 rounded-lg">
                                  <svg
                                    className="w-4 h-4 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                                    />
                                  </svg>
                                </div>
                                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                                  Thông tin thuốc
                                </span>
                              </div>
                              <div className="space-y-2">
                                <div className="font-semibold text-slate-800 text-base">
                                  {item.drug.tradeName || "N/A"}
                                </div>
                                {item.drug.atcCode && (
                                  <div className="flex items-center gap-2 pt-2 border-t border-emerald-200/50">
                                    <span className="text-xs text-slate-500">
                                      ATC Code:
                                    </span>
                                    <span className="text-xs font-mono font-semibold text-emerald-700 bg-white px-2 py-1 rounded border border-emerald-200">
                                      {item.drug.atcCode}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Token IDs */}
                        {item.tokenIds && item.tokenIds.length > 0 && (
                          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200/50 shadow-sm mb-4">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="p-2 bg-purple-500 rounded-lg">
                                <svg
                                  className="w-4 h-4 text-white"
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
                              <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
                                Token IDs ({item.tokenIds.length})
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {item.tokenIds
                                .slice(0, 10)
                                .map((tokenId, idx) => (
                                  <span
                                    key={idx}
                                    className="px-3 py-1.5 bg-white rounded-lg text-xs font-mono font-semibold text-purple-700 border border-purple-200 shadow-sm hover:shadow-md hover:border-purple-300 transition-all cursor-default"
                                  >
                                    #{tokenId}
                                  </span>
                                ))}
                              {item.tokenIds.length > 10 && (
                                <span className="px-3 py-1.5 bg-purple-100 rounded-lg text-xs font-semibold text-purple-700 border border-purple-300">
                                  +{item.tokenIds.length - 10} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Distributor Panel */}
                        {item.distributor ? (
                          <div className="grid grid-cols-1 gap-4 mb-4">
                            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-4 border border-cyan-200/50 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="p-2 bg-cyan-500 rounded-lg">
                                  <svg
                                    className="w-4 h-4 text-white"
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
                                <span className="text-xs font-semibold text-cyan-700 uppercase tracking-wide">
                                  Nhà phân phối
                                </span>
                              </div>
                              <div className="space-y-2">
                                <div className="font-semibold text-slate-800 text-base">
                                  {item.distributor.fullName ||
                                    item.distributor.name ||
                                    item.distributor.username ||
                                    "N/A"}
                                </div>
                                {item.distributor.email && (
                                  <div className="flex items-center gap-2 pt-2 border-t border-cyan-200/50">
                                    <svg
                                      className="w-3.5 h-3.5 text-cyan-600"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                      />
                                    </svg>
                                    <span className="text-xs text-slate-600">
                                      {item.distributor.email}
                                    </span>
                                  </div>
                                )}
                                {item.distributor.phone && (
                                  <div className="flex items-center gap-2">
                                    <svg
                                      className="w-3.5 h-3.5 text-cyan-600"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                      />
                                    </svg>
                                    <span className="text-xs text-slate-600">
                                      {item.distributor.phone}
                                    </span>
                                  </div>
                                )}
                                {item.distributor.address && (
                                  <div className="flex items-start gap-2">
                                    <svg
                                      className="w-3.5 h-3.5 text-cyan-600 mt-0.5"
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
                                    <span className="text-xs text-slate-600 leading-relaxed">
                                      {item.distributor.address}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            {item.distributor.walletAddress && (
                              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200/50 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="p-2 bg-indigo-500 rounded-lg">
                                    <svg
                                      className="w-4 h-4 text-white"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                      />
                                    </svg>
                                  </div>
                                  <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">
                                    Wallet Address
                                  </span>
                                </div>
                                <div className="font-mono text-xs text-slate-800 break-all bg-white/60 p-2 rounded-lg border border-indigo-200/50">
                                  {item.distributor.walletAddress}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-300 shadow-sm mb-4">
                            <div className="flex items-center gap-2 text-amber-800">
                              <svg
                                className="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span className="font-semibold">
                                Chưa có thông tin nhà phân phối
                              </span>
                            </div>
                          </div>
                        )}

                        {item.transactionHash && (
                          <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-4 border border-slate-200 shadow-sm mb-4">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="p-2 bg-slate-600 rounded-lg">
                                <svg
                                  className="w-4 h-4 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
                                  />
                                </svg>
                              </div>
                              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                Transaction Hash (Blockchain)
                              </span>
                            </div>
                            <div className="font-mono text-xs text-slate-800 break-all bg-white/80 p-3 rounded-lg border border-slate-200 mb-3">
                              {item.transactionHash}
                            </div>
                            <a
                              href={`https://zeroscan.org/tx/${item.transactionHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors group"
                            >
                              <span>Xem trên ZeroScan</span>
                              <svg
                                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                                />
                              </svg>
                            </a>
                          </div>
                        )}

                        {/* Status Timeline */}
                        <div className="mt-5 pt-5 border-t border-slate-200">
                          <div className="mb-3">
                            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                              Tiến trình đơn hàng
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <div
                              className={`flex flex-col items-center gap-1 min-w-[80px] ${
                                [
                                  "pending",
                                  "issued",
                                  "sent",
                                  "received",
                                  "paid",
                                ].includes(item.status)
                                  ? "text-amber-600"
                                  : "text-slate-400"
                              }`}
                            >
                              <div
                                className={`w-3 h-3 rounded-full border-2 ${
                                  [
                                    "pending",
                                    "issued",
                                    "sent",
                                    "received",
                                    "paid",
                                  ].includes(item.status)
                                    ? "bg-amber-500 border-amber-600 shadow-lg shadow-amber-500/50"
                                    : "bg-slate-300 border-slate-400"
                                }`}
                              ></div>
                              <span className="font-medium text-center">
                                Đã phát hành
                              </span>
                            </div>
                            <div
                              className={`flex-1 h-0.5 ${
                                ["sent", "received", "paid"].includes(
                                  item.status
                                )
                                  ? "bg-gradient-to-r from-amber-500 to-cyan-500"
                                  : "bg-slate-200"
                              }`}
                            ></div>
                            <div
                              className={`flex flex-col items-center gap-1 min-w-[80px] ${
                                ["sent", "received", "paid"].includes(
                                  item.status
                                )
                                  ? "text-cyan-600"
                                  : "text-slate-400"
                              }`}
                            >
                              <div
                                className={`w-3 h-3 rounded-full border-2 ${
                                  ["sent", "received", "paid"].includes(
                                    item.status
                                  )
                                    ? "bg-cyan-500 border-cyan-600 shadow-lg shadow-cyan-500/50"
                                    : "bg-slate-300 border-slate-400"
                                }`}
                              ></div>
                              <span className="font-medium text-center">
                                Đã gửi
                              </span>
                            </div>
                            <div
                              className={`flex-1 h-0.5 ${
                                ["received", "paid"].includes(item.status)
                                  ? "bg-gradient-to-r from-cyan-500 to-blue-500"
                                  : "bg-slate-200"
                              }`}
                            ></div>
                            <div
                              className={`flex flex-col items-center gap-1 min-w-[80px] ${
                                ["received", "paid"].includes(item.status)
                                  ? "text-blue-600"
                                  : "text-slate-400"
                              }`}
                            >
                              <div
                                className={`w-3 h-3 rounded-full border-2 ${
                                  ["received", "paid"].includes(item.status)
                                    ? "bg-blue-500 border-blue-600 shadow-lg shadow-blue-500/50"
                                    : "bg-slate-300 border-slate-400"
                                }`}
                              ></div>
                              <span className="font-medium text-center">
                                Đã nhận
                              </span>
                            </div>
                            <div
                              className={`flex-1 h-0.5 ${
                                item.status === "paid"
                                  ? "bg-gradient-to-r from-blue-500 to-emerald-500"
                                  : "bg-slate-200"
                              }`}
                            ></div>
                            <div
                              className={`flex flex-col items-center gap-1 min-w-[80px] ${
                                item.status === "paid"
                                  ? "text-emerald-600"
                                  : "text-slate-400"
                              }`}
                            >
                              <div
                                className={`w-3 h-3 rounded-full border-2 ${
                                  item.status === "paid"
                                    ? "bg-emerald-500 border-emerald-600 shadow-lg shadow-emerald-500/50"
                                    : "bg-slate-300 border-slate-400"
                                }`}
                              ></div>
                              <span className="font-medium text-center">
                                Đã thanh toán
                              </span>
                            </div>
                          </div>
                        </div>
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
