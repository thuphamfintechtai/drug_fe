/* eslint-disable no-undef */
import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useManufacturerProductionHistory } from "../apis/manufacturerAPIs";

export const useProductionHistory = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const progressIntervalRef = useRef(null);
  const [expandedItems, setExpandedItems] = useState(new Set());

  const [searchInput, setSearchInput] = useState("");

  const searchTimeoutRef = useRef(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const page = parseInt(searchParams.get("page") || "1", 10);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";

  const params = useMemo(() => {
    const p = { page: 1, limit: 1000 };
    if (status) {
      p.status = status;
    }
    return p;
  }, [status]);

  const {
    data: productionHistoryData,
    isLoading: loading,
    error: productionHistoryError,
  } = useManufacturerProductionHistory(params);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Initialize search input from URL params
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Update items when data changes
  useEffect(() => {
    if (productionHistoryData?.success) {
      // Handle multiple response structures:
      // 1. data is array directly: { success: true, data: [...] }
      // 2. data.productions: { success: true, data: { productions: [...] } }
      let productions = [];
      if (Array.isArray(productionHistoryData.data)) {
        productions = productionHistoryData.data;
        console.log('✅ [useProductionHistory] Data is array directly:', productions.length);
      } else if (productionHistoryData.data?.productions) {
        productions = productionHistoryData.data.productions;
        console.log('✅ [useProductionHistory] Data has productions field:', productions.length);
      } else if (productionHistoryData.data?.data) {
        // Nested data.data
        if (Array.isArray(productionHistoryData.data.data)) {
          productions = productionHistoryData.data.data;
          console.log('✅ [useProductionHistory] Data.data is array:', productions.length);
        } else if (productionHistoryData.data.data?.productions) {
          productions = productionHistoryData.data.data.productions;
          console.log('✅ [useProductionHistory] Data.data has productions:', productions.length);
        }
      }
      
      // Handle pagination from count field or pagination object
      const total = productionHistoryData.count || 
                    productionHistoryData.data?.pagination?.total || 
                    productionHistoryData.data?.total ||
                    productions.length;
      const paginationData = productionHistoryData.data?.pagination || {
        page: 1,
        limit: 10,
        total: total,
        pages: Math.ceil(total / 10) || 1,
      };
      
      console.log('📦 [useProductionHistory] Setting items:', {
        productionsCount: productions.length,
        total: total,
        pagination: paginationData,
      });
      
      setAllItems(productions);
      setPagination(paginationData);
    } else if (productionHistoryError) {
      setItems([]);
      setAllItems([]);
      console.error("❌ [useProductionHistory] Lỗi khi tải lịch sử sản xuất:", productionHistoryError);
    } else {
      // No data and no error - might be loading or empty
      console.log('ℹ️ [useProductionHistory] No data yet:', {
        hasData: !!productionHistoryData,
        hasError: !!productionHistoryError,
        data: productionHistoryData,
      });
    }
  }, [productionHistoryData, productionHistoryError]);

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (search && search.trim()) {
      const searchTerm = search.toLowerCase().trim();
      const filtered = allItems.filter((item) => {
        const tradeName = (item.drug?.tradeName || "").toLowerCase();
        const genericName = (item.drug?.genericName || "").toLowerCase();
        const atcCode = (item.drug?.atcCode || "").toLowerCase();
        const batchNumber = (item.batchNumber || "").toLowerCase();

        return (
          tradeName.includes(searchTerm) ||
          genericName.includes(searchTerm) ||
          atcCode.includes(searchTerm) ||
          batchNumber.includes(searchTerm)
        );
      });
      setItems(filtered);
      // Update pagination to reflect filtered results
      setPagination((prev) => ({
        ...prev,
        total: filtered.length,
        pages: Math.ceil(filtered.length / 10) || 1,
      }));
    } else {
      setItems(allItems);
      // Reset pagination to show all items
      setPagination((prev) => ({
        ...prev,
        total: allItems.length,
        pages: Math.ceil(allItems.length / 10) || 1,
      }));
    }
  }, [search, allItems]);

  // Clear search button
  const handleClearSearch = () => {
    setSearchInput("");
    updateFilter({ search: "", page: 1 });
  };

  // Handle search
  const handleSearch = (searchTerm = null) => {
    const term = searchTerm || searchInput;
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    updateFilter({ search: term, page: 1 });
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
      minted: "bg-cyan-100 text-cyan-700 border-cyan-200",
      transferred: "bg-purple-100 text-purple-700 border-purple-200",
      sold: "bg-emerald-100 text-emerald-700 border-emerald-200",
      expired: "bg-red-100 text-red-700 border-red-200",
      recalled: "bg-orange-100 text-orange-700 border-orange-200",
      none: "bg-slate-100 text-slate-600 border-slate-200",
      pending: "bg-amber-100 text-amber-700 border-amber-200",
    };
    return colors[status] || "bg-slate-100 text-slate-600 border-slate-200";
  };

  const getStatusLabel = (status) => {
    const labels = {
      minted: "Đã Mint",
      transferred: "Đã chuyển",
      sold: "Đã bán",
      expired: "Hết hạn",
      recalled: "Thu hồi",
      none: "Chưa chuyển",
      pending: "Đang chờ",
    };
    return labels[status] || status;
  };

  const getTransferStatusColor = (transferStatus) => {
    const colors = {
      none: "bg-slate-100 text-slate-700 border-slate-200",
      pending: "bg-amber-100 text-amber-700 border-amber-200",
      transferred: "bg-emerald-100 text-emerald-700 border-emerald-200",
    };
    return (
      colors[transferStatus] || "bg-slate-100 text-slate-600 border-slate-200"
    );
  };

  const getTransferStatusLabel = (transferStatus) => {
    const labels = {
      none: "Chưa chuyển",
      pending: "Đang chờ chuyển",
      transferred: "Đã chuyển",
    };
    return labels[transferStatus] || transferStatus;
  };

  const toggleItem = (itemId) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
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
    getStatusLabel,
    getTransferStatusColor,
    getTransferStatusLabel,
    toggleItem,
    expandedItems,
    setExpandedItems,
    productionHistoryData,
    productionHistoryError,
    params,
    searchParams,
    setSearchParams,
    setItems,
    setAllItems,
    setLoadingProgress,
    progressIntervalRef,
    searchTimeoutRef,
    setPagination,
    page,
    search,
    status,
  };
};
