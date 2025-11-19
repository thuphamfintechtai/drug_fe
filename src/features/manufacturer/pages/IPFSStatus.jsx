/* eslint-disable no-undef */
import DashboardLayout from "../../shared/components/DashboardLayout";
import TruckLoader from "../../shared/components/TruckLoader";
import { navigationItems } from "../constants/navigationIPF";
import { useIPFStatus } from "../hooks/useIPFStatus";

export default function ManufacturerIPFSStatus() {
  const {
    items,
    loading,
    loadingProgress,
    loadStatus,
    getStatusBadge,
    formatDate,
    pageItems,
    pageSize,
    total,
    totalPages,
    currentPage,
    start,
    navigate,
  } = useIPFStatus();
  return (
    <DashboardLayout navigationItems={navigationItems}>
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="w-full max-w-2xl">
            <TruckLoader height={72} progress={loadingProgress} showTrack />
          </div>
          <div className="text-lg text-slate-600 mt-6">
            Đang tải lịch sử IPFS...
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-card-primary shadow-sm p-6 flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-[#007b91]">
                Lịch sử IPFS (Manufacturer)
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Danh sách các lần upload metadata lên IPFS/Pinata
              </p>
            </div>
            <button
              onClick={loadStatus}
              className="px-4 py-2.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 transition"
            >
              Làm mới
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-card-primary shadow-sm overflow-hidden">
            {items.length === 0 ? (
              <div className="p-16 text-center text-slate-500">
                Không có dữ liệu
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Thời gian
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        IPFS
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Số lượng
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Ghi chú
                      </th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pageItems.map((item, idx) => {
                      const badge = getStatusBadge(item.status || item.state);
                      return (
                        <tr
                          key={idx}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 text-gray-700">
                            {formatDate(
                              item.createdAt || item.timestamp || item.time
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {item.ipfsUrl ? (
                              <a
                                href={item.ipfsUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-cyan-50 text-cyan-700 border border-cyan-100 hover:bg-cyan-100"
                                title={item.ipfsUrl}
                              >
                                {(item.ipfsHash || "—").toString().slice(0, 16)}
                                ...
                              </a>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-slate-50 text-slate-700 border border-slate-200">
                                {(item.ipfsHash || item.cid || item.hash || "—")
                                  .toString()
                                  .slice(0, 16)}
                                ...
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {item.quantity || item.amount || item.total || "—"}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.cls}`}
                            >
                              {badge.text}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {item.note || item.message || item.error || "—"}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {(String(item.status || "")
                              .toLowerCase()
                              .includes("pending") ||
                              String(item.status || "")
                                .toLowerCase()
                                .includes("process")) && (
                              <button
                                onClick={() => {
                                  const q = new URLSearchParams();
                                  if (item.ipfsUrl) {
                                    q.set("ipfsUrl", item.ipfsUrl);
                                  }
                                  if (item.quantity) {
                                    q.set("quantity", String(item.quantity));
                                  }
                                  navigate(
                                    `/manufacturer/production?${q.toString()}`
                                  );
                                }}
                                className="px-4 py-2 border-2 border-secondary rounded-full font-semibold !text-white bg-secondary hover:!text-white hover:bg-secondary transition-all duration-200"
                              >
                                Mint NFT
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-sm text-slate-600">
                Hiển thị {start + 1}-{Math.min(start + pageSize, total)} trên{" "}
                {total}
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(parseInt(e.target.value, 10));
                    setPage(1);
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  {[10, 20, 50].map((s) => (
                    <option key={s} value={s}>
                      {s}/trang
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-2 border rounded-lg text-sm disabled:opacity-50"
                    disabled={currentPage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    ← Trước
                  </button>
                  <div className="text-sm">
                    Trang {currentPage}/{totalPages}
                  </div>
                  <button
                    className="px-3 py-2 border rounded-lg text-sm disabled:opacity-50"
                    disabled={currentPage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Sau →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
