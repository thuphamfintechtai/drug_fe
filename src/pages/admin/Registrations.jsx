import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardLayout from "../../components/DashboardLayout";
import {
  getPendingRegistrations,
  retryRegistrationBlockchain,
} from "../../services/admin/adminService";
import { getRegistrationStats } from "../../services/admin/statsService";
import TruckLoader from "../../components/TruckLoader";
import toast from "react-hot-toast";

export default function AdminRegistrations() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [retryingIds, setRetryingIds] = useState(new Set());
  const progressIntervalRef = useRef(null);
  const loadFunctionRef = useRef(null);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = 10;
  const role = searchParams.get("role") || "";
  const status = searchParams.get("status") || "pending";

  const navigationItems = useMemo(
    () => [
      { path: "/admin", label: "Trang chủ", icon: null, active: false },
      {
        path: "/admin/registrations",
        label: "Duyệt đăng ký",
        icon: null,
        active: true,
      },
    ],
    []
  );

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      setLoadingProgress(0);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      progressIntervalRef.current = setInterval(() => {
        setLoadingProgress((prev) =>
          prev < 0.9 ? Math.min(prev + 0.02, 0.9) : prev
        );
      }, 50);
      try {
        const [listResponse, statsResponse] = await Promise.all([
          getPendingRegistrations({
            page,
            limit,
            role: role || undefined,
            status,
          }),
          getRegistrationStats(),
        ]);

        // Debug: Log response để kiểm tra cấu trúc
        console.log("📥 Registration response:", listResponse);
        console.log("📥 Response data:", listResponse?.data);

        // Xử lý response - kiểm tra nhiều cấu trúc có thể có
        const listRes = listResponse?.data;
        const items =
          listRes?.data?.registrations ||
          listRes?.registrations ||
          (Array.isArray(listRes?.data) ? listRes.data : []) ||
          (Array.isArray(listRes) ? listRes : []) ||
          [];

        console.log("📋 Parsed items:", items);

        setItems(items);

        // Xử lý stats response - cấu trúc: { success: true, data: { total, byStatus, byRole, recentRequests } }
        const statsRes = statsResponse?.data;
        let statsData = null;
        if (statsRes?.success && statsRes?.data) {
          statsData = statsRes.data;
        } else if (statsRes?.data) {
          statsData = statsRes.data;
        } else if (statsRes?.byStatus) {
          statsData = statsRes;
        }
        console.log("📊 Parsed stats:", statsData);
        setStats(statsData);
      } catch (e) {
        const status = e?.response?.status;
        // Don't log 401/403 errors as they're expected authentication/authorization failures
        // The API interceptor already handles clearing tokens for these cases
        if (status !== 401 && status !== 403) {
          console.error("❌ Error loading registrations:", e);
          console.error("❌ Error response:", e?.response);
          console.error("❌ Error status:", status);
          console.error("❌ Error data:", e?.response?.data);
        }

        // Hiển thị lỗi chi tiết hơn
        let errorMsg = "Không thể tải dữ liệu";
        if (status === 500) {
          errorMsg =
            "Lỗi server (500): Vui lòng kiểm tra backend hoặc thử lại sau.";
        } else if (status === 401) {
          errorMsg = "Bạn chưa đăng nhập hoặc token đã hết hạn.";
        } else if (status === 403) {
          errorMsg = "Bạn không có quyền truy cập trang này.";
        } else if (e?.response?.data?.message) {
          errorMsg = e.response.data.message;
        } else if (e?.message) {
          errorMsg = e.message;
        }

        setError(errorMsg);
      } finally {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        let current = 0;
        setLoadingProgress((p) => {
          current = p;
          return p;
        });
        if (current < 0.9) {
          await new Promise((resolve) => {
            const su = setInterval(() => {
              setLoadingProgress((prev) => {
                if (prev < 1) {
                  const np = Math.min(prev + 0.15, 1);
                  if (np >= 1) {
                    clearInterval(su);
                    resolve();
                  }
                  return np;
                }
                clearInterval(su);
                resolve();
                return 1;
              });
            }, 30);
            setTimeout(() => {
              clearInterval(su);
              setLoadingProgress(1);
              resolve();
            }, 500);
          });
        } else {
          setLoadingProgress(1);
          await new Promise((r) => setTimeout(r, 200));
        }
        await new Promise((r) => setTimeout(r, 100));
        setLoading(false);
        setTimeout(() => setLoadingProgress(0), 500);
      }
    };
    loadFunctionRef.current = load;
    load();
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [page, role, status]);

  const updateFilter = (next) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([k, v]) => {
      if (v === "" || v === undefined || v === null) nextParams.delete(k);
      else nextParams.set(k, String(v));
    });
    setSearchParams(nextParams);
  };

  const handleRetryBlockchain = async (requestId) => {
    if (retryingIds.has(requestId)) return;

    try {
      setRetryingIds((prev) => new Set(prev).add(requestId));
      toast.loading("Đang retry blockchain...", { id: `retry-${requestId}` });

      await retryRegistrationBlockchain(requestId);

      toast.success("Retry blockchain thành công!", {
        id: `retry-${requestId}`,
      });

      // Reload data
      if (loadFunctionRef.current) {
        await loadFunctionRef.current();
      }
    } catch (error) {
      console.error("❌ Error retrying blockchain:", error);
      const errorMsg =
        error?.response?.data?.message ||
        "Không thể retry blockchain. Vui lòng thử lại.";
      toast.error(errorMsg, { id: `retry-${requestId}` });
    } finally {
      setRetryingIds((prev) => {
        const next = new Set(prev);
        next.delete(requestId);
        return next;
      });
    }
  };

  const translateRole = (role) => {
    const roleMap = {
      pharma_company: "Nhà sản xuất",
      distributor: "Nhà phân phối",
      pharmacy: "Nhà thuốc",
    };
    return roleMap[role] || role;
  };

  const translateStatus = (status) => {
    const statusMap = {
      pending: "Đang chờ",
      approved_pending_blockchain: "Đã duyệt - Chờ blockchain",
      approved: "Đã duyệt",
      blockchain_failed: "Lỗi blockchain",
      rejected: "Từ chối",
    };
    return statusMap[status] || status;
  };

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
        <>
          {/* Banner */}
          <div className="bg-white rounded-xl border border-card-primary shadow-sm p-5 mb-4">
            <h2 className="text-xl font-semibold text-[#007b91]">
              Duyệt đăng ký
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Lọc theo vai trò và trạng thái – xử lý nhanh, chính xác.
            </p>
          </div>

          {/* Filters */}
          <motion.div
            className="rounded-2xl bg-white border border-card-primary shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-4 mb-4"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            <div className="flex flex-col md:flex-row gap-3 md:items-end">
              <div className="flex-1 max-w-xs">
                <label className="block text-sm text-[#003544]/70 mb-1">
                  Vai trò
                </label>
                <select
                  className="w-full h-12 rounded-full border border-gray-200 bg-white text-gray-700 px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-[#48cae4] transition"
                  value={role}
                  onChange={(e) =>
                    updateFilter({ role: e.target.value, page: 1 })
                  }
                >
                  <option value="">Tất cả</option>
                  <option value="pharma_company">Nhà sản xuất</option>
                  <option value="distributor">Nhà phân phối</option>
                  <option value="pharmacy">Nhà thuốc</option>
                </select>
              </div>
              <div className="flex-1 max-w-xs">
                <label className="block text-sm text-[#003544]/70 mb-1">
                  Trạng thái
                </label>
                <select
                  className="w-full h-12 rounded-full border border-gray-200 bg-white text-gray-700 px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-[#48cae4] transition"
                  value={status}
                  onChange={(e) =>
                    updateFilter({ status: e.target.value, page: 1 })
                  }
                >
                  <option value="pending">Đang chờ</option>
                  <option value="approved_pending_blockchain">
                    Đã duyệt - Chờ blockchain
                  </option>
                  <option value="approved">Đã duyệt</option>
                  <option value="blockchain_failed">Lỗi blockchain</option>
                  <option value="rejected">Từ chối</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          {stats && (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4"
              variants={fadeUp}
              initial="hidden"
              animate="show"
            >
              <div className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-cyan-400 to-blue-400 rounded-t-2xl" />
                <div className="p-5 pt-7 text-center">
                  <div className="text-sm text-slate-600">Tổng số</div>
                  <div className="text-2xl font-bold text-cyan-600">
                    {stats.total || 0}
                  </div>
                </div>
              </div>
              <div className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-amber-400 to-yellow-400 rounded-t-2xl" />
                <div className="p-5 pt-7 text-center">
                  <div className="text-sm text-slate-600">Đang chờ</div>
                  <div className="text-2xl font-bold text-amber-600">
                    {stats.byStatus?.pending || 0}
                  </div>
                </div>
              </div>
              <div className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-emerald-400 to-green-400 rounded-t-2xl" />
                <div className="p-5 pt-7 text-center">
                  <div className="text-sm text-slate-600">Đã duyệt</div>
                  <div className="text-2xl font-bold text-emerald-600">
                    {(stats.byStatus?.approved || 0) +
                      (stats.byStatus?.approved_pending_blockchain || 0)}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    ({stats.byStatus?.approved || 0} hoàn tất,{" "}
                    {stats.byStatus?.approved_pending_blockchain || 0} chờ
                    blockchain)
                  </div>
                </div>
              </div>
              <div className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-rose-400 to-red-400 rounded-t-2xl" />
                <div className="p-5 pt-7 text-center">
                  <div className="text-sm text-slate-600">Lỗi blockchain</div>
                  <div className="text-2xl font-bold text-rose-600">
                    {stats.byStatus?.blockchain_failed || 0}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Table */}
          <motion.div
            className="bg-white rounded-2xl border border-card-primary shadow-sm overflow-x-auto"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            {error ? (
              <div className="p-6 text-red-600">{error}</div>
            ) : (
              <table className="min-w-full border-collapse">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr className="text-left text-gray-700">
                    <th className="px-4 py-3">Người dùng</th>
                    <th className="px-4 py-3">Vai trò</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Ngày tạo</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((r) => (
                    <tr
                      key={r._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-[#003544]">
                          {r?.user?.fullName || r?.user?.username}
                        </div>
                        <div className="text-sm text-[#003544]/70">
                          {r?.user?.email}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#003544]/80">
                        {translateRole(r.role)}
                      </td>
                      <td className="px-4 py-3 text-[#003544]/80">
                        {translateStatus(r.status)}
                      </td>
                      <td className="px-4 py-3 text-[#003544]/80">
                        {new Date(r.createdAt).toLocaleString("vi-VN")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/registrations/${r._id}`}
                            className="inline-flex items-center px-3 py-2 rounded-full border border-cyan-200 text-[#003544] hover:bg-[#90e0ef22] transition"
                          >
                            Chi tiết
                          </Link>
                          {r.status === "blockchain_failed" && (
                            <button
                              onClick={() => handleRetryBlockchain(r._id)}
                              disabled={retryingIds.has(r._id)}
                              className="px-4 py-2 border-2 border-[#3db6d9] bg-white !text-[#3db6d9] rounded-full font-semibold hover:bg-[#3db6d9] hover:!text-white hover:shadow-md hover:shadow-[#3db6d9]/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {retryingIds.has(r._id)
                                ? "Đang xử lý..."
                                : "Retry Blockchain"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td className="px-4 py-4 text-slate-600" colSpan={5}>
                        Không có dữ liệu
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </motion.div>

          {/* Pagination */}
          <div className="flex items-center justify-end gap-2 mt-4">
            <button
              disabled={page <= 1}
              onClick={() => updateFilter({ page: page - 1 })}
              className={`px-3 py-2 rounded-xl ${
                page <= 1
                  ? "bg-slate-200 text-slate-400"
                  : "bg-white border border-cyan-200 hover:bg-[#f5fcff]"
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
        </>
      )}
    </DashboardLayout>
  );
}
