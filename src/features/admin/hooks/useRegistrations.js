/* eslint-disable no-undef */
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAdminRetryRegistrationBlockchain } from "../apis/mutations/adminMutation";
import api from "../../utils/api";
import { toast } from "sonner";

export const useRegistrations = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [retryingIds, setRetryingIds] = useState(new Set());
  const progressIntervalRef = useRef(null);
  const loadFunctionRef = useRef(null);
  const retryMutation = useAdminRetryRegistrationBlockchain();

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = 10;
  const role = searchParams.get("role") || "";
  const status = searchParams.get("status") || "pending";

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
          api.get("/registration/requests", {
            params: {
              page,
              limit,
              role: role || undefined,
              status,
            },
          }),
          api.get("/admin/registration/statistics"),
        ]);

        // Xử lý response: { success: true, data: [...] }
        const listData = listResponse?.data;
        let items = [];
        
        if (listData?.success && Array.isArray(listData?.data)) {
          // Response có format: { success: true, data: [...] }
          items = listData.data;
        } else if (Array.isArray(listData?.data)) {
          items = listData.data;
        } else if (listData?.data?.registrations) {
          items = listData.data.registrations;
        } else if (listData?.registrations) {
          items = listData.registrations;
        } else if (Array.isArray(listData)) {
          items = listData;
        }

        setItems(items);

        const statsRes = statsResponse?.data?.data || statsResponse?.data;
        let statsData = null;
        if (statsRes?.success && statsRes?.data) {
          statsData = statsRes.data;
        } else if (statsRes?.data) {
          statsData = statsRes.data;
        } else if (statsRes?.byStatus) {
          statsData = statsRes;
        }
        setStats(statsData);
      } catch (e) {
        const status = e?.response?.status;
        if (status !== 401 && status !== 403) {
          setError(e?.response?.data?.message || "Không thể tải dữ liệu");
        }
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
      if (v === "" || v === undefined || v === null) {
        nextParams.delete(k);
      } else {
        nextParams.set(k, String(v));
      }
    });
    setSearchParams(nextParams);
  };

  const handleRetryBlockchain = async (requestId) => {
    if (retryingIds.has(requestId)) {
      return;
    }

    try {
      setRetryingIds((prev) => new Set(prev).add(requestId));
      toast.loading("Đang retry blockchain...", { id: `retry-${requestId}` });

      await retryMutation.mutateAsync(requestId);

      toast.success("Retry blockchain thành công!", {
        id: `retry-${requestId}`,
      });

      if (loadFunctionRef.current) {
        await loadFunctionRef.current();
      }
    } catch (error) {
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

  return {
    items,
    loading,
    error,
    stats,
    loadingProgress,
    retryingIds,
    updateFilter,
    handleRetryBlockchain,
    translateRole,
    translateStatus,
  };
};
