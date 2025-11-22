/* eslint-disable no-undef */
import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../shared/context/AuthContext";
import { manufacturerAPIs } from "../apis/manufacturerAPIs";
import { toast } from "sonner";
import {
  transferNFTToDistributor,
  transferBatchNFTToDistributor,
  getCurrentWalletAddress,
} from "../../utils/web3Helper";
export const useTransferHistory = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [allItems, setAllItems] = useState([]); // Store all items for client-side filtering
  const [loadingProgress, setLoadingProgress] = useState(0);
  const progressIntervalRef = useRef(null);
  const [retryingId, setRetryingId] = useState(null);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [searchInput, setSearchInput] = useState("");
  const searchTimeoutRef = useRef(null);
  const retryAbortControllerRef = useRef(null); // FIX: Abort controller for retry

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const page = parseInt(searchParams.get("page") || "1", 10);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";

  // React Query hooks
  const params = useMemo(() => {
    const p = { page: 1, limit: 1000 }; // Load all items for client-side filtering
    if (status) {
      p.status = status;
    }
    return p;
  }, [status]);

  const {
    data: transferHistoryData,
    isLoading: loading,
    error: transferHistoryError,
    refetch: refetchTransferHistory,
  } = manufacturerAPIs.getTransferHistory(params);

  const saveTransferTransactionMutation =
    manufacturerAPIs.saveTransferTransaction();

  // FIX: Sync searchInput with URL search param on mount/change
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Initialize search input from URL params
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Update items when data changes
  useEffect(() => {
    if (transferHistoryData?.success) {
      const invoices =
        transferHistoryData.data?.invoices ||
        transferHistoryData.data?.transfers ||
        [];
      const paginationData = transferHistoryData.data?.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
      };

      const mappedItems = normalizeInvoices(invoices);
      setAllItems(mappedItems);
      setPagination(paginationData);
    } else if (transferHistoryError) {
      setItems([]);
      setAllItems([]);
      if (transferHistoryError?.response?.status === 401) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else if (transferHistoryError?.response?.status >= 500) {
        toast.error("Lỗi server. Vui lòng thử lại sau.");
      }
    }
  }, [transferHistoryData, transferHistoryError]);

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

  // Client-side filtering when search changes
  useEffect(() => {
    if (search && search.trim()) {
      const searchTerm = search.toLowerCase().trim();
      const filtered = allItems.filter((item) => {
        const distributorName = (
          item.distributor?.fullName ||
          item.distributor?.name ||
          ""
        ).toLowerCase();
        const invoiceNumber = (item.invoiceNumber || "").toLowerCase();
        const batchNumber = (item.production?.batchNumber || "").toLowerCase();
        const email = (item.distributor?.email || "").toLowerCase();

        return (
          distributorName.includes(searchTerm) ||
          invoiceNumber.includes(searchTerm) ||
          batchNumber.includes(searchTerm) ||
          email.includes(searchTerm)
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

  // FIX: Helper function to normalize invoices
  const normalizeInvoices = (invoices) => {
    if (!Array.isArray(invoices)) {
      return [];
    }

    return invoices.map((invoice) => ({
      ...invoice,
      distributor: invoice.toDistributor || invoice.distributor,
      transactionHash: invoice.chainTxHash || invoice.transactionHash,
      tokenIds: invoice.tokenIds || invoice.invoice?.tokenIds || [],
      amounts: invoice.amounts || invoice.invoice?.amounts || [],
      invoice: {
        _id: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.invoiceDate,
        tokenIds: invoice.tokenIds || invoice.invoice?.tokenIds || [],
      },
    }));
  };

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
      pending: "bg-amber-100 text-amber-700 border-amber-200",
      sent: "bg-cyan-100 text-cyan-700 border-cyan-200",
      received: "bg-blue-100 text-blue-700 border-blue-200",
      paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
      cancelled: "bg-red-100 text-red-700 border-red-200",
    };
    return colors[status] || "bg-slate-100 text-slate-600 border-slate-200";
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: "Pending",
      sent: "Sent",
      received: "Received",
      paid: "Paid",
      cancelled: "Cancelled",
    };
    return labels[status] || status;
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

  // FIX: Better error handling and validation
  // FIX: Safe token ID parsing
  const safeParseTokenId = (id) => {
    if (!id && id !== 0) {
      return BigInt(0);
    }

    try {
      const str = String(id).trim();
      const cleanStr = str.startsWith("0x") ? str.slice(2) : str;

      // Validate hex string
      if (!/^[0-9a-fA-F]+$/.test(cleanStr)) {
        console.warn(`Invalid token ID format: ${id}`);
        return BigInt(0);
      }

      return BigInt(`0x${cleanStr}`);
    } catch (e) {
      console.error(`Error parsing token ID ${id}:`, e);
      return BigInt(0);
    }
  };

  // FIX: Better error handling and validation in retry
  const handleRetry = async (item) => {
    if (retryingId === item._id) {
      return;
    } // Prevent double-click

    if (!item.invoice?._id || !item.distributor?.walletAddress) {
      toast.error(
        "Thiếu thông tin cần thiết để retry. Vui lòng kiểm tra lại invoice và distributor address."
      );
      return;
    }

    const tokenIds = (item.tokenIds || item.invoice?.tokenIds || []).filter(
      (id) => id
    );
    const amounts = (item.amounts || item.invoice?.amounts || []).filter(
      (amt) => amt
    );

    if (tokenIds.length === 0) {
      toast.error("Không tìm thấy token IDs để chuyển giao.");
      return;
    }

    // FIX: Cancel previous request if exists
    if (retryAbortControllerRef.current) {
      retryAbortControllerRef.current.abort();
    }

    retryAbortControllerRef.current = new AbortController();
    setRetryingId(item._id);

    try {
      // Verify wallet
      const currentWallet = await getCurrentWalletAddress();
      if (
        user?.walletAddress &&
        currentWallet.toLowerCase() !== user.walletAddress.toLowerCase()
      ) {
        toast.error(
          "Ví đang kết nối không khớp với ví của manufacturer.\nVui lòng chuyển sang: " +
            user.walletAddress
        );
        return;
      }

      // FIX: Better amount validation
      let onchain;
      if (
        amounts.length === tokenIds.length &&
        amounts.length > 0 &&
        amounts.every((amt) => amt)
      ) {
        // Batch transfer with amounts
        const normalizedAmounts = amounts.map((amt) =>
          BigInt(String(amt).trim())
        );
        const normalizedTokenIds = tokenIds.map(safeParseTokenId);

        onchain = await transferBatchNFTToDistributor(
          normalizedTokenIds,
          normalizedAmounts,
          item.distributor.walletAddress,
          retryAbortControllerRef.current.signal
        );
      } else {
        // Single transfer
        if (amounts.length !== tokenIds.length && amounts.length > 0) {
          console.warn(
            `Amount count (${amounts.length}) does not match token count (${tokenIds.length}). Using single transfer.`
          );
        }

        onchain = await transferNFTToDistributor(
          tokenIds,
          item.distributor.walletAddress,
          retryAbortControllerRef.current.signal
        );
      }

      // Save to backend
      await saveTransferTransactionMutation.mutateAsync({
        invoiceId: item.invoice._id,
        transactionHash: onchain.transactionHash,
        tokenIds,
      });

      toast.success(" Đã chuyển NFT on-chain và lưu transaction thành công!");
      refetchTransferHistory();
    } catch (error) {
      // FIX: Handle abort gracefully
      if (error.name === "AbortError") {
        console.log("Transfer cancelled by user");
        return;
      }

      console.error("Lỗi khi retry transfer:", error);
      toast.error(error?.message || "Giao dịch on-chain thất bại hoặc bị hủy.");
    } finally {
      setRetryingId(null);
      retryAbortControllerRef.current = null;
    }
  };

  return {
    items,
    loading,
    loadingProgress,
    searchInput,
    status,
    expandedItems,
    retryingId,
    pagination,
    allItems,
    setRetryingId,
    toggleItem,
    setSearchInput,
    handleSearch,
    handleClearSearch,
    updateFilter,
  };
};
