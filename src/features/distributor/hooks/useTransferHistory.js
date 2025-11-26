/* eslint-disable no-undef */
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { distributorQueries } from "../apis/distributor";

export const useTransferHistory = () => {
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

  const {
    data: transferHistoryData,
    isLoading: queryLoading,
    refetch: fetchTransferHistory,
  } = distributorQueries.getTransferToPharmacyHistory({
    page,
    limit: 10,
    ...(search && { search }),
    ...(status && { status }),
  });

  const prevSearchRef = useRef(search);
  useEffect(() => {
    if (prevSearchRef.current !== search) {
      setSearchInput(search);
      prevSearchRef.current = search;
    }
  }, [search]);

  const unwrap = (payload) => payload?.data ?? payload;

  useEffect(() => {
    const response = unwrap(transferHistoryData);
    if (response) {
      processData(response);
    } else if (response === null || response === undefined) {
      setItems([]);
      setPagination({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
      });
    }
  }, [transferHistoryData]);

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (queryLoading && isInitialLoad && items.length === 0) {
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
    } else if (!queryLoading && isInitialLoad) {
      finishProgress();
      setIsInitialLoad(false);
      setLoading(false);
    }
  }, [queryLoading, isInitialLoad, items.length]);

  const processData = (responseData) => {
    const successFlag =
      responseData?.success !== false ||
      Array.isArray(responseData?.data) ||
      Array.isArray(responseData);

    if (successFlag) {
      const payload =
        responseData?.data ||
        responseData?.payload ||
        responseData ||
        {};

      const normalized =
        payload?.data && !Array.isArray(payload?.data?.invoices)
          ? payload.data
          : payload;

      const invoices = Array.isArray(normalized?.invoices)
        ? normalized.invoices
        : Array.isArray(normalized)
        ? normalized
        : [];

      const distributions = Array.isArray(normalized?.distributions)
        ? normalized.distributions
        : [];

      const source =
        invoices.length > 0
          ? invoices
          : distributions.length > 0
          ? distributions
          : Array.isArray(normalized)
          ? normalized
          : [];

      const mapped = source.map((row) => {
        // Xử lý pharmacy - có thể là object hoặc string ID
        let pharmacy = null;
        if (row.toPharmacy) {
          if (typeof row.toPharmacy === "object" && row.toPharmacy !== null) {
            pharmacy = row.toPharmacy;
          } else if (typeof row.toPharmacy === "string") {
            // Nếu là string ID, có thể lấy từ commercialInvoice hoặc để null
            pharmacy = row.commercialInvoice?.toPharmacy || null;
          }
        }
        pharmacy =
          pharmacy ||
          row.pharmacy ||
          row.commercialInvoice?.toPharmacy ||
          (row.pharmacyId
            ? {
                _id: row.pharmacyId,
                id: row.pharmacyId,
                name: row.pharmacyName || row.pharmacyId,
                fullName: row.pharmacyName || row.pharmacyId,
                walletAddress: row.pharmacyWalletAddress,
              }
            : null);

        // Lấy thông tin từ commercialInvoice nếu có
        const commercialInvoice = row.commercialInvoice || {};

        // Lấy transaction hash
        const transactionHash =
          row.chainTxHash ||
          row.receiptTxHash ||
          commercialInvoice.chainTxHash ||
          null;

        // Lấy quantity - ưu tiên receivedQuantity từ distribution, sau đó từ commercialInvoice
        const quantity =
          row.receivedQuantity ??
          row.quantity ??
          commercialInvoice.quantity ??
          (Array.isArray(row.tokenIds) ? row.tokenIds.length : 0);

        // Lấy dates
        const createdAt = row.createdAt || commercialInvoice.createdAt;
        const invoiceDate = row.invoiceDate || commercialInvoice.invoiceDate;

        // Lấy invoice number
        const invoiceNumber =
          row.invoiceNumber ||
          commercialInvoice.invoiceNumber ||
          row.invoiceCode ||
          row.invoiceId ||
          row.id;

        // Lấy status - ưu tiên status từ distribution
        const statusRow =
          row.status || commercialInvoice.status || row.invoiceStatus || "pending";

        return {
          _id: row._id || row.id,
          pharmacy,
          drug: row.drug,
          invoiceNumber,
          invoiceDate,
          quantity,
          status: statusRow,
          createdAt,
          transactionHash,
          chainTxHash: transactionHash,
          fromDistributor: row.fromDistributor || null,
        };
      });

      setItems(mapped);
      setPagination(
        normalized?.pagination ||
          payload?.pagination || {
            page: 1,
            limit: 10,
            total: mapped.length,
            pages: mapped.length ? Math.ceil(mapped.length / 10) : 1,
          }
      );
    } else {
      setItems([]);
      setPagination({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
      });
    }
  };

  const finishProgress = async () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
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
  };

  const handleSearch = (searchValue = null, resetPage = true) => {
    const valueToSearch = searchValue !== null ? searchValue : searchInput;
    if (searchValue !== null) {
      setSearchInput(searchValue);
    }
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
      sent: "bg-cyan-100 text-cyan-700 border-cyan-200",
      received: "bg-blue-100 text-blue-700 border-blue-200",
      paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
    };
    return colors[status] || "bg-slate-100 text-slate-600 border-slate-200";
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: "Đang chờ",
      sent: "Đã gửi",
      received: "Đã nhận",
      paid: "Đã thanh toán",
    };
    return labels[status] || status;
  };

  const loadingState = queryLoading || loading;

  return {
    searchParams,
    setSearchParams,
    items,
    setItems,
    loading: loadingState,
    setLoading,
    isInitialLoad,
    setIsInitialLoad,
    loadingProgress,
    searchInput,
    setSearchInput,
    handleSearch,
    handleClearSearch,
    updateFilter,
    getStatusColor,
    getStatusLabel,
    pagination,
    page,
    status,
  };
};
