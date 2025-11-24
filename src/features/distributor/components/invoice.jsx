import React from "react";
import { motion } from "framer-motion";

export function InvoiceComponent({
  items,
  page,
  pagination,
  updateFilter,
  getStatusColor,
  getStatusLabel,
  handleOpenConfirm,
  isConfirming,
}) {
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
    <div>
      <motion.div
        className="space-y-4"
        variants={fadeUp}
        initial="hidden"
        animate="show"
      >
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-cyan-200 p-10 text-center">
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              Chưa có đơn hàng nào
            </h3>
            <p className="text-slate-600">
              Đơn hàng từ nhà sản xuất sẽ hiển thị ở đây
            </p>
          </div>
        ) : (
          items.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-card-primary shadow-sm overflow-hidden hover:shadow-lg transition"
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-[#003544]">
                        Đơn: {item.invoiceNumber || "N/A"}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          item.status
                        )}`}
                      >
                        {getStatusLabel(item.status)}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-slate-600">
                      <div>
                        Từ:{" "}
                        <span className="font-medium text-slate-800">
                          {item.fromManufacturer?.fullName ||
                            item.fromManufacturer?.username ||
                            "N/A"}
                        </span>
                      </div>
                      <div>
                        Số lượng:{" "}
                        <span className="font-bold text-blue-700">
                          {(() => {
                            const quantity =
                              item.totalQuantity ??
                              item.quantity ??
                              item.nftQuantity ??
                              (Array.isArray(item.nfts)
                                ? item.nfts.length
                                : Array.isArray(item.items)
                                ? item.items.length
                                : null);
                            return quantity !== null && quantity !== undefined
                              ? `${quantity} NFT`
                              : "N/A";
                          })()}
                        </span>
                      </div>
                      <div>
                        Ngày tạo:{" "}
                        <span className="font-medium">
                          {new Date(item.createdAt).toLocaleString("vi-VN")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {item?.status?.toLowerCase() === "sent" && (
                    <button
                      onClick={() => handleOpenConfirm(item)}
                      disabled={isConfirming}
                      className="px-6 py-3 rounded-full bg-secondary hover:bg-primary !text-white font-semibold shadow-md hover:shadow-lg transition disabled:opacity-50"
                    >
                      Xác nhận nhận hàng
                    </button>
                  )}
                </div>

                {item.notes && (
                  <div className="bg-slate-50 rounded-xl p-3 text-sm mb-3">
                    <div className="font-semibold text-slate-700 mb-1">
                      Ghi chú:
                    </div>
                    <div className="text-slate-600">{item.notes}</div>
                  </div>
                )}

                {item.proofOfProduction && (
                  <div className="bg-purple-50 rounded-xl p-3 border border-purple-200 text-sm">
                    <div className="font-semibold text-purple-800 mb-2">
                      Thông tin sản xuất:
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        Số lô:{" "}
                        <span className="font-mono">
                          {item.proofOfProduction.batchNumber}
                        </span>
                      </div>
                      <div>
                        NSX:{" "}
                        {new Date(
                          item.proofOfProduction.manufacturingDate
                        ).toLocaleDateString("vi-VN")}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </motion.div>
      {/* Pagination */}
      <div className="flex items-center justify-between mt-5">
        <div className="text-sm text-slate-600">
          Hiển thị {items.length} / {pagination.total} đơn hàng
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => {
              const prevPage = page - 1;
              if (prevPage >= 1) {
                updateFilter({ page: prevPage });
              }
            }}
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
            disabled={!pagination?.pages || page >= pagination.pages}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const nextPage = Number(page) + 1;
              if (nextPage <= (pagination?.pages || 1)) {
                updateFilter({ page: nextPage });
              }
            }}
            className={`px-3 py-2 rounded-xl ${
              !pagination?.pages || page >= pagination.pages
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "!text-white bg-linear-to-r from-primary  to-secondary shadow-[0_10px_24px_rgba(0,180,216,0.30)] hover:shadow-[0_14px_36px_rgba(0,180,216,0.40)]"
            }`}
          >
            Sau
          </button>
        </div>
      </div>
    </div>
  );
}
