/* eslint-disable no-undef */
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../utils/api";

export const useAdminDrugs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [loadingProgress, setLoadingProgress] = useState(0);
  const progressIntervalRef = useRef(null);
  const [searchInput, setSearchInput] = useState("");

  const page = parseInt(searchParams.get("page") || "1", 10);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const manufacturerId = searchParams.get("manufacturerId") || "";

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const navigationItems = useMemo(
    () => [
      { path: "/admin", label: "Tổng quan", icon: null, active: false },
      {
        path: "/admin/drugs",
        label: "Quản lý thuốc",
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
      const params = { page, limit: 10 };
      if (search) {
        params.search = search;
      }
      if (status) {
        params.status = status;
      }
      if (manufacturerId) {
        params.manufacturerId = manufacturerId;
      }

      const [drugsRes, statsRes] = await Promise.all([
        api.get("/admin/drugs", { params }),
        api.get("/admin/drugs/statistics"),
      ]);

      const drugsData = drugsRes.data?.data || drugsRes.data;
      const items = Array.isArray(drugsData.drugs) ? drugsData.drugs : [];
      const paginationData = drugsData.pagination;

      setItems(items);
      setPagination(paginationData);

      const statsData = statsRes.data?.data || statsRes.data;
      setStats(statsData);
    } catch (e) {
      setError(e?.response?.data?.message || "Không tải được dữ liệu");
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
  }, [page, search, status, manufacturerId]);

  const handleSearch = () => {
    updateFilter({ search: searchInput, page: 1 });
  };

  const handleClearSearch = () => {
    setSearchInput("");
    updateFilter({ search: "", page: 1 });
  };

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

  const translateStatus = (status) => {
    const statusMap = {
      active: "Hoạt động",
      inactive: "Không hoạt động",
      recalled: "Thu hồi",
    };
    return statusMap[status] || status;
  };

  return {
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
  };
};
