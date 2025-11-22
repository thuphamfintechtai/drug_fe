/* eslint-disable no-undef */
import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { usePharmacyDistributionHistory } from "../apis/pharmacyQueries";

export const useDistributionHistory = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const progressIntervalRef = useRef(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  // Separate search input state from URL param
  const [searchInput, setSearchInput] = useState("");

  const page = parseInt(searchParams.get("page") || "1", 10);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const filtersRef = useRef({ page, search, status });

  const queryParams = useMemo(() => {
    const params = { page, limit: 10 };
    if (search) {
      params.search = search;
    }
    if (status) {
      params.status = status;
    }
    return params;
  }, [page, search, status]);

  const { refetch: refetchDistributionHistory } =
    usePharmacyDistributionHistory(queryParams, {
      enabled: false,
      keepPreviousData: true,
    });

  // Sync searchInput with URL search param on mount/change (only from URL changes, not user input)
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    loadData();
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [page, search, status]);

  const loadData = async () => {
    const filtersChanged =
      filtersRef.current.page !== page ||
      filtersRef.current.search !== search ||
      filtersRef.current.status !== status;

    const shouldShowLoader = filtersChanged || items.length === 0;

    try {
      if (shouldShowLoader) {
        setLoading(true);
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
      }

      const { data: response } = await refetchDistributionHistory();

      if (response?.success) {
        const responseData = response.data || {};
        const history =
          responseData.history ||
          responseData.distributions ||
          responseData.items ||
          (Array.isArray(responseData) ? responseData : []);
        setItems(Array.isArray(history) ? history : []);
        setPagination(
          responseData.pagination || { page: 1, limit: 10, total: 0, pages: 0 }
        );
      } else {
        setItems([]);
        setPagination({ page: 1, limit: 10, total: 0, pages: 0 });
      }
    } catch (error) {
      console.error("Lỗi khi tải lịch sử:", error);
      console.error("Error details:", error.response?.data || error.message);
      setItems([]);
      setPagination({ page: 1, limit: 10, total: 0, pages: 0 });
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
          const speedUp = setInterval(() => {
            setLoadingProgress((prev) => {
              if (prev < 1) {
                const next = Math.min(prev + 0.15, 1);
                if (next >= 1) {
                  clearInterval(speedUp);
                  resolve();
                }
                return next;
              }
              clearInterval(speedUp);
              resolve();
              return 1;
            });
          }, 30);
          setTimeout(() => {
            clearInterval(speedUp);
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
      filtersRef.current = { page, search, status };
    }
  };

  // Handle search - only trigger on Enter or button click
  const handleSearch = () => {
    updateFilter({ search: searchInput, page: 1 });
  };

  // Clear search button
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

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-amber-100 text-amber-700 border-amber-200",
      sent: "bg-cyan-100 text-cyan-700 border-cyan-200",
      received: "bg-blue-100 text-blue-700 border-blue-200",
      confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200",
      paid: "bg-green-100 text-green-700 border-green-200",
      sold: "bg-purple-100 text-purple-700 border-purple-200",
      in_stock: "bg-blue-100 text-blue-700 border-blue-200",
      expired: "bg-red-100 text-red-700 border-red-200",
    };
    return colors[status] || "bg-slate-100 text-slate-600 border-slate-200";
  };

  const translateStatus = (status) => {
    const statusMap = {
      pending: "Đang chờ",
      received: "Đã nhận",
      confirmed: "Đã xác nhận",
      sold: "Đã bán",
      in_stock: "Tồn kho",
      expired: "Hết hạn",
      sent: "Đã gửi",
      paid: "Đã thanh toán",
    };
    return statusMap[status] || status;
  };

  const extractName = (entity, fallback = "Không có") => {
    if (!entity) {
      return fallback;
    }
    if (typeof entity === "string" || typeof entity === "number") {
      return entity;
    }
    if (Array.isArray(entity)) {
      return entity.length > 0
        ? entity
            .map((item) => extractName(item, "").toString().trim())
            .filter(Boolean)
            .join(", ") || fallback
        : fallback;
    }
    if (typeof entity === "object") {
      const { fullName, name, username, email, contactName, phoneNumber, _id } =
        entity;
      return (
        fullName ||
        name ||
        username ||
        email ||
        contactName ||
        phoneNumber ||
        _id ||
        fallback
      );
    }
    return fallback;
  };

  const formatNotes = (value) => {
    if (!value) {
      return "—";
    }
    if (typeof value === "string") {
      return value;
    }
    if (typeof value === "number") {
      return String(value);
    }
    try {
      return JSON.stringify(value, null, 2);
    } catch (error) {
      return "—";
    }
  };

  return {
    items,
    loading,
    loadingProgress,
    pagination,
    searchParams,
    setSearchParams,
    searchInput,
    setSearchInput,
    handleSearch,
    handleClearSearch,
    updateFilter,
    getStatusColor,
    translateStatus,
    extractName,
    formatNotes,
  };
};
