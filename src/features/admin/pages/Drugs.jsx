import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardLayout from "../../shared/components/DashboardLayout";
import TruckLoader from "../../shared/components/TruckLoader";
import { useAdminDrugs } from "../hooks/useAdminDrugs";

export default function AdminDrugs() {
  const {
    items,
    loading,
    error,
    stats,
    pagination,
    loadingProgress,
    navigationItems,
    handleSearch,
    handleClearSearch,
    updateFilter,
    searchInput,
    setSearchInput,
    status,
    page,
    translateStatus,
  } = useAdminDrugs();
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
            <TruckLoader height={48} progress={loadingProgress} showTrack />
          </div>
          <div className="text-lg text-slate-600 mt-6">Đang tải dữ liệu...</div>
        </div>
      ) : (
        <>
          {/* Banner */}
          <div className="bg-white rounded-2xl border border-card-primary shadow-sm p-6 mb-6">
            <h1 className="text-xl md:text-2xl font-semibold text-[#007b91]">
              Quản lý thuốc
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Xem thông tin thuốc và tìm kiếm theo tên thương mại, tên hoạt
              chất, mã ATC
            </p>
          </div>

          {/* Search */}
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1">
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
                  setSearchInput(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
                placeholder="Tìm theo tên thương mại, tên hoạt chất, mã ATC..."
                className="w-full h-12 pl-11 pr-40 rounded-full border border-gray-200 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#48cae4] transition"
              />
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
                Tìm kiếm
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                updateFilter({
                  search: "",
                  status: "",
                  manufacturerId: "",
                  page: 1,
                });
              }}
              className="px-4 py-2.5 rounded-full border border-gray-300 text-slate-700 hover:bg-gray-50 transition"
            >
              Reset
            </button>
            <div>
              <select
                value={status}
                onChange={(e) =>
                  updateFilter({ status: e.target.value, page: 1 })
                }
                className="h-12 rounded-full border border-gray-200 bg-white text-gray-700 px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-[#48cae4] transition"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
                <option value="recalled">Thu hồi</option>
              </select>
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
              variants={fadeUp}
              initial="hidden"
              animate="show"
            >
              <div className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[5px] bg-linear-to-r from-blue-400 to-cyan-400 rounded-t-2xl" />
                <div className="p-5 pt-7 text-center">
                  <div className="text-sm text-slate-600 mb-1">Tổng thuốc</div>
                  <div className="text-3xl font-bold text-blue-600">
                    {stats.drugs?.total || 0}
                  </div>
                  <div className="text-xs text-slate-500 mt-2">
                    Trong hệ thống
                  </div>
                </div>
              </div>

              <div className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[5px] bg-linear-to-r from- to-green-400 rounded-t-2xl" />
                <div className="p-5 pt-7 text-center">
                  <div className="text-sm text-slate-600 mb-1">Hoạt động</div>
                  <div className="text-3xl font-bold text-emerald-600">
                    {stats.drugs?.byStatus?.active || 0}
                  </div>
                  <div className="text-xs text-slate-500 mt-2">
                    Đang hoạt động
                  </div>
                </div>
              </div>

              <div className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[5px] bg-linear-to-r from-slate-400 to-gray-400 rounded-t-2xl" />
                <div className="p-5 pt-7 text-center">
                  <div className="text-sm text-slate-600 mb-1">
                    Không hoạt động
                  </div>
                  <div className="text-3xl font-bold text-slate-600">
                    {stats.drugs?.byStatus?.inactive || 0}
                  </div>
                  <div className="text-xs text-slate-500 mt-2">
                    Ngừng hoạt động
                  </div>
                </div>
              </div>

              <div className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[5px] bg-linear-to-r from-rose-400 to-red-400 rounded-t-2xl" />
                <div className="p-5 pt-7 text-center">
                  <div className="text-sm text-slate-600 mb-1">Thu hồi</div>
                  <div className="text-3xl font-bold text-red-600">
                    {stats.drugs?.byStatus?.recalled || 0}
                  </div>
                  <div className="text-xs text-slate-500 mt-2">Đã thu hồi</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Top manufacturers */}
          {stats?.drugs?.byManufacturer &&
            stats.drugs.byManufacturer.length > 0 && (
              <motion.div
                className="bg-white/90 backdrop-blur-xl rounded-2xl border border-card-primary shadow-[0_10px_24px_rgba(0,0,0,0.05)] p-5 mb-5"
                variants={fadeUp}
                initial="hidden"
                animate="show"
              >
                <h3 className="font-semibold mb-3 text-slate-800">
                  Top nhà sản xuất
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {stats.drugs.byManufacturer.slice(0, 6).map((item) => (
                    <div
                      key={
                        item._id || item.manufacturerId || item.manufacturerName
                      }
                      className="flex justify-between items-center p-3 bg-[#f5fcff] rounded-lg border border-[#90e0ef55]"
                    >
                      <span className="text-sm text-slate-700 truncate">
                        {item.manufacturerName || "N/A"}
                      </span>
                      <span className="text-lg font-bold text-[#00b4d8] ml-2">
                        {item.count || 0}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

          {/* Table */}
          <div className="bg-white rounded-2xl border border-card-primary shadow-sm overflow-hidden mb-6">
            {error ? (
              <div className="p-6 text-red-600">{error}</div>
            ) : items.length === 0 ? (
              <div className="p-16 flex flex-col items-center justify-center text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-12 h-12 mb-3 opacity-60"
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
                <p className="text-gray-500 text-sm">Không có dữ liệu</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border-card-primary">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Tên thương mại
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Tên hoạt chất
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Mã ATC
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Nhà sản xuất
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {items.map((d) => (
                      <tr
                        key={d._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium text-gray-800">
                          {d.tradeName}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {d.genericName || "-"}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-cyan-50 text-cyan-700 border border-cyan-100">
                            {d.atcCode}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {d.manufacturer?.name || "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                              d.status === "active"
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                : d.status === "inactive"
                                ? "bg-slate-50 text-slate-600 border border-slate-100"
                                : "bg-red-50 text-red-600 border border-red-100"
                            }`}
                          >
                            {translateStatus(d.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            to={`/admin/drugs/${d._id}`}
                            className="inline-flex items-center px-4 py-2 border-2 border-[#3db6d9] rounded-full font-semibold !text-[#3db6d9] hover:!text-white hover:bg-[#3db6d9] transition-all duration-200"
                          >
                            Chi tiết
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-slate-600">
              Hiển thị {items.length} / {pagination?.total || 0} thuốc
            </div>
            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                disabled={page <= 1}
                onClick={() => updateFilter({ page: page - 1 })}
                className={`px-3 py-2 rounded-xl ${
                  page <= 1
                    ? "bg-slate-200 text-slate-400"
                    : "bg-white border !border-primary hover:bg-[#f5fcff]"
                }`}
              >
                Trước
              </button>
              <span className="text-sm text-slate-700">Trang {page}</span>
              <button
                onClick={() => updateFilter({ page: page + 1 })}
                className="px-3 py-2 rounded-xl !text-white bg-linear-to-r from-secondary to-primary shadow-[0_10px_24px_rgba(0,180,216,0.30)] hover:shadow-[0_14px_36px_rgba(0,180,216,0.40)]"
              >
                Sau
              </button>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
