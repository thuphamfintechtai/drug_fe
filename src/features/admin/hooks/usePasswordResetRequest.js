/* eslint-disable no-undef */
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../utils/api";

export default function usePasswordResetRequest() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [loadingProgress, setLoadingProgress] = useState(0);
  const progressIntervalRef = useRef(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const status = searchParams.get("status") || "pending";

  const navigationItems = useMemo(
    () => [
      { path: "/admin", label: "Tổng quan", icon: null, active: false },
      {
        path: "/admin/password-reset-requests",
        label: "Reset mật khẩu",
        icon: null,
        active: true,
      },
    ],
    []
  );

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
      const params = { page, limit: 10, status };

      const response = await api.get("/auth/password-reset-requests", {
        params,
      });
      const data = response.data?.data || response.data;
      const items = data.requests || data.data?.requests || [];
      setItems(items);
      setPagination(pagination);
    } catch (e) {
      setError(e?.response?.data?.message || "Không thể tải dữ liệu");
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

  useEffect(() => {
    load();
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [page, status]);

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

  const handleApprove = async (resetRequestId) => {
    if (
      !confirm(
        "Bạn có chắc chắn muốn duyệt yêu cầu này? Mật khẩu mới sẽ được gửi đến email người dùng."
      )
    ) {
      return;
    }

    setActionLoading(true);
    setError("");
    try {
      const response = await api.post(
        `/auth/password-reset-requests/${resetRequestId}/approve`
      );
      if (response.data.success) {
        alert(
          "Duyệt yêu cầu thành công! Mật khẩu mới đã được gửi đến email người dùng."
        );
        setShowDetailModal(false);
        load();
      }
    } catch (e) {
      alert(e?.response?.data?.message || "Không thể duyệt yêu cầu");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (resetRequestId) => {
    if (!rejectReason.trim()) {
      alert("Vui lòng nhập lý do từ chối");
      return;
    }

    if (!confirm("Bạn có chắc chắn muốn từ chối yêu cầu này?")) {
      return;
    }

    setActionLoading(true);
    setError("");
    try {
      const response = await api.post(
        `/auth/password-reset-requests/${resetRequestId}/reject`,
        {
          rejectionReason: rejectReason,
        }
      );
      if (response.data.success) {
        alert("Từ chối yêu cầu thành công!");
        setShowDetailModal(false);
        setRejectReason("");
        load();
      }
    } catch (e) {
      alert(e?.response?.data?.message || "Không thể từ chối yêu cầu");
    } finally {
      setActionLoading(false);
    }
  };

  const openDetailModal = (item) => {
    setSelectedItem(item);
    setShowDetailModal(true);
    setRejectReason("");
  };

  const getRoleName = (role) => {
    const roles = {
      pharma_company: "Nhà sản xuất",
      distributor: "Nhà phân phối",
      pharmacy: "Nhà thuốc",
      user: "Người dùng",
    };
    return roles[role] || role;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-amber-100 text-amber-700 border-amber-200",
      approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
      rejected: "bg-red-100 text-red-700 border-red-200",
    };
    return colors[status] || "bg-slate-100 text-slate-600 border-slate-200";
  };

  return {
    items,
    loading,
    error,
    pagination,
    loadingProgress,
    selectedItem,
    showDetailModal,
    actionLoading,
    rejectReason,
    navigationItems,
    updateFilter,
    handleApprove,
    handleReject,
    openDetailModal,
    getRoleName,
    getStatusColor,
  };
}
