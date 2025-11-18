import { motion } from "framer-motion";
import DashboardLayout from "../../shared/components/DashboardLayout";
import TruckLoader from "../../shared/components/TruckLoader";
import { CardUI } from "../../shared/components/ui/cardUI";
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
          <CardUI
            title="Lịch sử phân phối"
            subtitle="Theo dõi toàn bộ lịch sử nhận hàng và phân phối"
          />
          <motion.div
            className="rounded-2xl bg-white border border-card-primary shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-4 mb-5"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            <div className="flex flex-col md:flex-row gap-3 md:items-end">
              <Search
                searchInput={searchInput}
                setSearchInput={setSearchInput}
                handleSearch={handleSearch}
                handleClearSearch={handleClearSearch}
                placeholder="Tìm theo đơn hàng"
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
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="transferred">Transferred</option>
                </select>
              </div>
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
                  Lịch sử nhận hàng từ nhà sản xuất sẽ hiển thị ở đây
                </p>
              </div>
            ) : (
              items.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-card-primary shadow-sm overflow-hidden hover:shadow-lg transition"
                >
                  {/* Header */}
                  <div className="p-5 flex items-start justify-between">
                    <div>
                      <div className="text-sm text-slate-600">Từ</div>
                      <h3 className="text-lg font-semibold text-[#003544]">
                        {item.fromManufacturer?.fullName ||
                          item.fromManufacturer?.username ||
                          "N/A"}
                      </h3>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
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

                  {/* Summary Chips */}
                  <div className="px-5 pb-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">Đơn hàng:</span>
                      <span className="font-mono text-slate-800">
                        {item.manufacturerInvoice?.invoiceNumber || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">Số lượng:</span>
                      <span className="font-semibold text-slate-800">
                        {item.distributedQuantity} NFT
                      </span>
                    </div>
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
                            }${item.deliveryAddress.city || ""}`.trim() ||
                            "Chưa có"
                          : item.deliveryAddress || "Chưa có"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">Ngày nhận:</span>
                      <span className="text-slate-800">
                        {item.distributionDate
                          ? new Date(item.distributionDate).toLocaleDateString(
                              "vi-VN"
                            )
                          : "Chưa có"}
                      </span>
                    </div>
                  </div>

                  {/* Information Panels */}
                  <div className="px-5 pb-5 space-y-3">
                    {item.fromManufacturer && (
                      <div className="rounded-xl p-4 border border-slate-200 bg-slate-50">
                        <div className="font-semibold text-slate-800 mb-1">
                          Thông tin nhà sản xuất
                        </div>
                        <div className="text-sm text-slate-700">
                          Tên:{" "}
                          <span className="font-medium">
                            {item.fromManufacturer.fullName ||
                              item.fromManufacturer.username ||
                              "N/A"}
                          </span>
                        </div>
                        <div className="text-sm text-slate-700 mt-1">
                          Username:{" "}
                          <span className="font-mono">
                            {item.fromManufacturer.username || "N/A"}
                          </span>
                        </div>
                        <div className="text-sm text-slate-700 mt-1">
                          Email:{" "}
                          <span className="font-medium">
                            {item.fromManufacturer.email || "N/A"}
                          </span>
                        </div>
                      </div>
                    )}

                    {item.manufacturerInvoice && (
                      <div className="rounded-xl p-4 border border-slate-200 bg-slate-50">
                        <div className="font-semibold text-slate-800 mb-1">
                          Thông tin hóa đơn
                        </div>
                        <div className="text-sm text-slate-700">
                          Số hóa đơn:{" "}
                          <span className="font-mono font-medium">
                            {item.manufacturerInvoice.invoiceNumber}
                          </span>
                        </div>
                        <div className="text-sm text-slate-700 mt-1">
                          Ngày hóa đơn:{" "}
                          <span className="font-medium">
                            {item.manufacturerInvoice.invoiceDate
                              ? new Date(
                                  item.manufacturerInvoice.invoiceDate
                                ).toLocaleDateString("vi-VN")
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="rounded-xl p-4 border border-slate-200 bg-slate-50">
                      <div className="font-semibold text-slate-800 mb-1">
                        Ghi chú
                      </div>
                      <div className="text-sm text-slate-700">
                        {item.notes || "—"}
                      </div>
                    </div>
                  </div>
                </div>
              ))
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
                    : "!text-white bg-gradient-to-r from-[#00b4d8] via-[#48cae4] to-[#90e0ef] shadow-[0_10px_24px_rgba(0,180,216,0.30)] hover:shadow-[0_14px_36px_rgba(0,180,216,0.40)]"
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
