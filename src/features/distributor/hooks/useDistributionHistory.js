/* eslint-disable no-undef */
import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { distributorQueries } from "../apis/distributor";

export const useDistributionHistory = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [loadingProgress, setLoadingProgress] = useState(0);
  const progressIntervalRef = useRef(null);
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
    distributorQueries.getDistributionHistory(queryParams, {
      enabled: false,
      keepPreviousData: true,
    });

  const prevSearchRef = useRef(search);
  useEffect(() => {
    if (prevSearchRef.current !== search) {
      setSearchInput(search);
      prevSearchRef.current = search;
    }
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
    const shouldShowLoader =
      filtersChanged || (items.length === 0 && isInitialLoad);
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

      if (shouldShowLoader && progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      if (response?.success) {
        setItems(response.data?.distributions || []);
        setPagination(
          response.data?.pagination || {
            page: 1,
            limit: 10,
            total: 0,
            pages: 0,
          }
        );
      } else {
        setItems([]);
      }

      // Chỉ chạy progress animation khi initial load
      if (isInitialLoad) {
        let currentProgress = 0;
        setLoadingProgress((prev) => {
          currentProgress = prev;
          return prev;
        });
        if (currentProgress < 0.9) {
          await new Promise((resolve) => {
            const speedUp = setInterval(() => {
              setLoadingProgress((prev) => {
                if (prev < 1) {
                  const np = Math.min(prev + 0.15, 1);
                  if (np >= 1) {
                    clearInterval(speedUp);
                    resolve();
                  }
                  return np;
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
      }
      setIsInitialLoad(false);
    } catch (error) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      console.error("Lỗi khi tải lịch sử:", error);
      setItems([]);
      if (isInitialLoad) {
        setLoadingProgress(0);
      }
      setIsInitialLoad(false);
    } finally {
      if (shouldShowLoader) {
        setLoading(false);
        setTimeout(() => setLoadingProgress(0), 500);
      }
      filtersRef.current = { page, search, status };
    }
  };

  // Handle search - only trigger on Enter or button click
  const handleSearch = (searchValue = null, resetPage = true) => {
    const valueToSearch = searchValue !== null ? searchValue : searchInput;
    // Update searchInput state if a value is provided
    if (searchValue !== null) {
      setSearchInput(searchValue);
    }
    // Only reset page to 1 when actually searching (not when just changing page)
    if (resetPage) {
      updateFilter({ search: valueToSearch, page: 1 });
    } else {
      updateFilter({ search: valueToSearch });
    }
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
      confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200",
      transferred: "bg-purple-100 text-purple-700 border-purple-200",
    };
    return colors[status] || "bg-slate-100 text-slate-600 border-slate-200";
  };

  return {
    items,
    loading,
    loadingProgress,
    pagination,
    searchInput,
    setSearchInput,
    handleSearch,
    handleClearSearch,
    updateFilter,
    getStatusColor,
  };
};
