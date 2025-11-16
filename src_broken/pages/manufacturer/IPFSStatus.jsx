import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import TruckLoader from "../../components/TruckLoader";
import { getManufactureIPFSStatus } from "../../services/manufacturer/manufacturerService";
import { toast } from "sonner";

export default function ManufacturerIPFSStatus() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const progressIntervalRef = useRef(null);
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    loadStatus();
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const loadStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      setLoadingProgress(0);

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      progressIntervalRef.current = setInterval(() => {
        setLoadingProgress((prev) =>
          prev < 0.9 ? Math.min(prev + 0.02, 0.9) : prev
        );
      }, 50);

      const res = await getManufactureIPFSStatus();

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      const raw = res?.data?.data || res?.data?.items || res?.data || {};
      const list = Array.isArray(raw)
        ? raw
        : raw.ManufactureIPFSStatus || raw.records || [];

      // Chuẩn hóa dữ liệu để hiển thị nhất quán
      const normalized = (Array.isArray(list) ? list : []).map((it) => {
        const url = it.IPFSUrl || it.ipfsUrl || it.url || "";
        const cidMatch = url.match(/\/ipfs\/([^/?#]+)/i);
        const cid = cidMatch ? cidMatch[1] : "";
        const ts = it.timespan || it.timestamp || it.time || it.createdAt;
        const timeValue =
          typeof ts === "string" && /^\d+$/.test(ts)
            ? new Date(parseInt(ts, 10))
            : new Date(ts);
        return {
          id: it._id || it.id,
          createdAt: timeValue,
          ipfsHash: cid || it.cid || it.hash,
          ipfsUrl: url,
          quantity: it.quantity || it.amount || it.total,
          status: it.status || it.state,
          note: it.message || it.note || it.error,
        };
      });

      setItems(normalized);

      setLoadingProgress(1);
      await new Promise((r) => setTimeout(r, 300));
    } catch (e) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      console.error("Lỗi tải lịch sử IPFS:", e);
      setError(
        e.response?.data?.message || e.message || "Không thể tải dữ liệu"
      );
      toast.error("Không thể tải lịch sử IPFS", { position: "top-right" });
      setLoadingProgress(0);
    } finally {
      setLoading(false);
      setTimeout(() => setLoadingProgress(0), 500);
    }
  };

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);
  const navigationItems = [
    {
      path: "/manufacturer",
      label: "Tổng quan",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      active: true,
    },
    {
      path: "/manufacturer/drugs",
      label: "Quản lý thuốc",
      icon: (
        <svg
          className="w-5 h-5"
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
      ),
      active: false,
    },
    {
      path: "/manufacturer/production",
      label: "Sản xuất thuốc",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
      active: false,
    },
    {
      path: "/manufacturer/transfer",
      label: "Chuyển giao",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
      ),
      active: false,
    },
    {
      path: "/manufacturer/production-history",
      label: "Lịch sử sản xuất",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
      active: false,
    },
    {
      path: "/manufacturer/transfer-history",
      label: "Lịch sử chuyển giao",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      active: false,
    },
    {
      path: "/manufacturer/ipfs-status",
      label: "Lịch sử IPFS",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 17v-6l-2 2m0 0l-2-2m2 2l2-2m8 6v-6l-2 2m0 0l-2-2m2 2l2-2"
          />
        </svg>
      ),
      active: true,
    },
    {
      path: "/manufacturer/profile",
      label: "Hồ sơ",
      icon: (
        <svg
          className="w-5 h-5"
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
      ),
      active: false,
    },
  ];

  const formatDate = (value) => {
    if (!value) return "—";
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString("vi-VN");
  };

  const getStatusBadge = (status) => {
    const s = (status || "").toString().toLowerCase();
    if (s.includes("success") || s === "done") {
      return {
        text: "Thành công",
        cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    }
    if (s.includes("pending") || s.includes("processing")) {
      return {
        text: "Đang xử lý",
        cls: "bg-amber-50 text-amber-700 border-amber-200",
      };
    }
    if (s.includes("fail") || s.includes("error")) {
      return { text: "Lỗi", cls: "bg-rose-50 text-rose-700 border-rose-200" };
    }
    return {
      text: status || "Không rõ",
      cls: "bg-slate-50 text-slate-700 border-slate-200",
    };
  };

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
                                  if (item.ipfsUrl)
                                    q.set("ipfsUrl", item.ipfsUrl);
                                  if (item.quantity)
                                    q.set("quantity", String(item.quantity));
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
