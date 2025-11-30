import DashboardLayout from "../../shared/components/DashboardLayout";
import TruckLoader from "../../shared/components/TruckLoader";
import { CardUI } from "../../shared/components/ui/cardUI";
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
          <CardUI
            title="Lịch sử chuyển cho nhà thuốc"
            subtitle="Theo dõi tất cả đơn chuyển giao NFT cho pharmacy"
          />

          {/* Filters */}
          <div className="rounded-2xl bg-white border border-card-primary shadow-sm p-4">
            <div className="flex flex-col md:flex-row gap-3 md:items-end">
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
                  // Ưu tiên hiển thị invoice number nếu match
                  if (invoiceNumber.includes(searchLower)) {
                    return item.invoiceNumber || "";
                  }
                  // Nếu không match invoice number thì hiển thị tên nhà thuốc nếu match
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
                  // Fallback: trả về invoice number hoặc tên nhà thuốc
                  return (
                    item.invoiceNumber ||
                    item.pharmacy?.name ||
                    item.pharmacy?.fullName ||
                    (typeof item.pharmacy === "string" ? item.pharmacy : "") ||
                    ""
                  );
                }}
              />
              <div>
                <label className="block text-sm text-slate-600 mb-1">
                  Trạng thái
                </label>
                <div className="relative">
                  <select
                    value={status}
                    onChange={(e) =>
                      updateFilter({ status: e.target.value, page: 1 })
                    }
                    className="h-12 w-full rounded-full appearance-none border border-gray-200 bg-white text-gray-700 px-4 pr-12 shadow-sm hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400 transition"
                  >
                    <option value="">Tất cả</option>
                    <option value="pending">Đang chờ</option>
                    <option value="sent">Đã gửi</option>
                    <option value="received">Đã nhận</option>
                    <option value="paid">Đã thanh toán</option>
                  </select>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
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
          </div>

          {/* List */}
          <div className="space-y-4">
            {items.length === 0 ? (
              <div className="bg-white rounded-2xl border border-card-primary p-10 text-center">
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  Chưa có lịch sử chuyển giao
                </h3>
                <p className="text-slate-600">
                  Các đơn chuyển cho nhà thuốc sẽ hiển thị ở đây
                </p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-2xl border border-card-primary shadow-sm overflow-hidden hover:shadow-lg transition"
                >
                  {/* Header */}
                  <div className="p-5 flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-[#003544]">
                      {item.pharmacy?.name ||
                        item.pharmacy?.fullName ||
                        (typeof item.pharmacy === "string"
                          ? item.pharmacy
                          : "N/A")}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {getStatusLabel(item.status)}
                    </span>
                  </div>

                  {/* Summary Boxes */}
                  <div className="px-5 pb-3 space-y-3">
                    {/* Box 1: Invoice & Quantity */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="font-semibold text-slate-800">
                            Số hóa đơn:
                          </span>
                          <span className="ml-2 font-mono text-slate-800">
                            {item.invoiceNumber || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-800">
                            Số lượng:
                          </span>
                          <span className="ml-2 font-semibold text-slate-800">
                            {item.quantity || 0} NFT
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Box 2: Dates */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="font-semibold text-slate-800">
                            Ngày tạo:
                          </span>
                          <span className="ml-2 text-slate-800">
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleString("vi-VN")
                              : "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-800">
                            Ngày hóa đơn:
                          </span>
                          <span className="ml-2 text-slate-800">
                            {item.invoiceDate
                              ? new Date(item.invoiceDate).toLocaleString(
                                  "vi-VN"
                                )
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Box 3: Pharmacy */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                      <div className="font-semibold text-slate-800 mb-1">
                        Nhà thuốc:
                      </div>
                      <div className="text-slate-800">
                        {item.pharmacy?.name ||
                          item.pharmacy?.fullName ||
                          (typeof item.pharmacy === "string"
                            ? item.pharmacy
                            : "N/A")}
                      </div>
                    </div>
                  </div>

                  {/* Progress Tracker */}
                  <div className="px-5 pb-5 pt-3 border-t border-slate-200">
                    <div className="flex items-center gap-2 text-xs">
                      <div
                        className={`flex items-center gap-1 ${
                          item.status === "pending"
                            ? "text-cyan-600"
                            : ["sent", "received", "paid"].includes(item.status)
                            ? "text-slate-700"
                            : "text-slate-400"
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            item.status === "pending"
                              ? "bg-cyan-500"
                              : ["sent", "received", "paid"].includes(
                                  item.status
                                )
                              ? "bg-slate-700"
                              : "bg-slate-300"
                          }`}
                        ></div>
                        <span>Pending</span>
                      </div>
                      <div
                        className={`flex-1 h-px ${
                          ["sent", "received", "paid"].includes(item.status)
                            ? "bg-slate-700"
                            : "bg-slate-200"
                        }`}
                      ></div>
                      <div
                        className={`flex items-center gap-1 ${
                          item.status === "sent"
                            ? "text-cyan-600"
                            : ["received", "paid"].includes(item.status)
                            ? "text-slate-700"
                            : "text-slate-400"
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            item.status === "sent"
                              ? "bg-cyan-500"
                              : ["received", "paid"].includes(item.status)
                              ? "bg-slate-700"
                              : "bg-slate-300"
                          }`}
                        ></div>
                        <span>Sent</span>
                      </div>
                      <div
                        className={`flex-1 h-px ${
                          ["received", "paid"].includes(item.status)
                            ? "bg-slate-700"
                            : "bg-slate-200"
                        }`}
                      ></div>
                      <div
                        className={`flex items-center gap-1 ${
                          item.status === "received"
                            ? "text-cyan-600"
                            : item.status === "paid"
                            ? "text-slate-700"
                            : "text-slate-400"
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            item.status === "received"
                              ? "bg-cyan-500"
                              : item.status === "paid"
                              ? "bg-slate-700"
                              : "bg-slate-300"
                          }`}
                        ></div>
                        <span>Received</span>
                      </div>
                      <div
                        className={`flex-1 h-px ${
                          item.status === "paid"
                            ? "bg-slate-700"
                            : "bg-slate-200"
                        }`}
                      ></div>
                      <div
                        className={`flex items-center gap-1 ${
                          item.status === "paid"
                            ? "text-cyan-600"
                            : "text-slate-400"
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            item.status === "paid"
                              ? "bg-cyan-500"
                              : "bg-slate-300"
                          }`}
                        ></div>
                        <span>Paid</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-5">
            <div className="text-sm text-slate-600">
              Hiển thị {items.length} / {pagination?.total || 0} đơn chuyển giao
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
                    : "bg-gradient-to-r from-[#00b4d8] to-[#48cae4] !text-white hover:shadow-lg"
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
