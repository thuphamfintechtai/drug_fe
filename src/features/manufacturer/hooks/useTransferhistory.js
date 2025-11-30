/* eslint-disable no-undef */
import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../shared/context/AuthContext";
import {
  useManufacturerTransferHistory,
  useSaveTransferTransaction,
} from "../apis/manufacturerAPIs";
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
  const [loading, setLoading] = useState(true);
  const progressIntervalRef = useRef(null);
  const [retryingId, setRetryingId] = useState(null);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [searchInput, setSearchInput] = useState("");
  const searchTimeoutRef = useRef(null);
  const retryAbortControllerRef = useRef(null); // FIX: Abort controller for retry
  const isInitialLoadRef = useRef(true);
  const prevStatusRef = useRef("");

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
    isLoading: queryLoading,
    isFetching,
    error: transferHistoryError,
    refetch: refetchTransferHistory,
  } = useManufacturerTransferHistory(params);

  // Show loading when: initial load OR status filter changes
  const shouldShowLoading =
    isInitialLoadRef.current ||
    (isFetching && prevStatusRef.current !== status);

  // Start loading progress animation
  useEffect(() => {
    if (shouldShowLoading && (queryLoading || isFetching)) {
      setLoading(true);
      setLoadingProgress(0);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      progressIntervalRef.current = setInterval(() => {
        setLoadingProgress((prev) =>
          prev < 0.9 ? Math.min(prev + 0.02, 0.9) : prev
        );
      }, 50);
    }
  }, [queryLoading, isFetching, shouldShowLoading]);

  // Complete loading animation when data is ready
  useEffect(() => {
    const completeLoading = async () => {
      if (!queryLoading && !isFetching && loading) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }

        // Animate to 100%
        let currentProgress = 0;
        setLoadingProgress((prev) => {
          currentProgress = prev;
          return prev;
        });

        if (currentProgress < 1) {
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
        }

        await new Promise((r) => setTimeout(r, 200));
        setLoading(false);
        isInitialLoadRef.current = false;
        prevStatusRef.current = status;
        setTimeout(() => setLoadingProgress(0), 500);
      }
    };

    completeLoading();
  }, [queryLoading, isFetching, loading, status]);

  const saveTransferTransactionMutation = useSaveTransferTransaction();

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
      // Handle multiple response structures:
      // 1. data is array directly: { success: true, data: [...] }
      // 2. data.invoices: { success: true, data: { invoices: [...] } }
      // 3. data.transfers: { success: true, data: { transfers: [...] } }
      let invoices = [];
      if (Array.isArray(transferHistoryData.data)) {
        invoices = transferHistoryData.data;
      } else if (transferHistoryData.data?.invoices) {
        invoices = transferHistoryData.data.invoices;
      } else if (transferHistoryData.data?.transfers) {
        invoices = transferHistoryData.data.transfers;
      }

      // Handle pagination from count field or pagination object
      const total =
        transferHistoryData.count ||
        transferHistoryData.data?.pagination?.total ||
        invoices.length;
      const paginationData = transferHistoryData.data?.pagination || {
        page: 1,
        limit: 10,
        total: total,
        pages: Math.ceil(total / 10) || 1,
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

  // Helper function to parse JSON string safely
  const safeParseJSON = (str) => {
    if (!str || typeof str !== "string") {
      return null;
    }
    try {
      // Handle MongoDB ObjectId string format
      if (str.includes("ObjectId(") || str.includes("new ObjectId")) {
        // Step 1: Replace ObjectId patterns with quoted strings
        let cleaned = str
          .replace(/ObjectId\(['"]([^'"]+)['"]\)/g, '"$1"')
          .replace(/new ObjectId\(['"]([^'"]+)['"]\)/g, '"$1"');

        // Step 2: Replace newlines with spaces
        cleaned = cleaned.replace(/\n/g, " ");

        // Step 3: Replace single quotes with double quotes (but preserve escaped quotes)
        cleaned = cleaned.replace(/(?<!\\)'/g, '"');

        // Step 4: Fix unquoted keys (e.g., _id: -> "_id":)
        cleaned = cleaned.replace(
          /([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g,
          '$1"$2":'
        );

        // Step 5: Fix null values
        cleaned = cleaned.replace(/:\s*null/g, ": null");

        // Step 6: Remove extra spaces
        cleaned = cleaned.replace(/\s+/g, " ").trim();

        try {
          const parsed = JSON.parse(cleaned);
          console.log("✅ Successfully parsed:", {
            email: parsed.email,
            username: parsed.username,
          });
          return parsed;
        } catch (parseError) {
          console.warn(
            "⚠️ Failed to parse after cleaning, trying regex extraction..."
          );
          // Fallback: Extract fields using regex from original string
          const extractField = (fieldName) => {
            const regex = new RegExp(
              `${fieldName}\\s*:\\s*['"]([^'"]+)['"]`,
              "i"
            );
            const match = str.match(regex);
            return match ? match[1] : null;
          };

          const email = extractField("email");
          const username = extractField("username");
          const walletAddress = extractField("walletAddress");
          const phone = extractField("phone");
          const fullName = extractField("fullName");

          if (email || username || walletAddress) {
            const extracted = {
              email: email || "",
              username: username || "",
              walletAddress: walletAddress || "",
              phone: phone || "",
              fullName: fullName || "",
            };
            console.log("✅ Extracted fields:", extracted);
            return extracted;
          }

          console.warn(
            "❌ Could not extract any fields from:",
            str.substring(0, 200)
          );
          return null;
        }
      }
      // Try direct JSON parse
      return JSON.parse(str);
    } catch (e) {
      console.warn("❌ Failed to parse JSON string:", str.substring(0, 100), e);
      return null;
    }
  };

  // FIX: Helper function to normalize invoices
  const normalizeInvoices = (invoices) => {
    if (!Array.isArray(invoices)) {
      return [];
    }

    console.log(
      "📦 [normalizeInvoices] Processing",
      invoices.length,
      "invoices"
    );

    return invoices.map((invoice, index) => {
      console.log(`📄 [normalizeInvoices] Invoice ${index + 1}:`, {
        id: invoice.id || invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        distributorId: invoice.distributorId
          ? typeof invoice.distributorId === "string"
            ? invoice.distributorId.substring(0, 50) + "..."
            : "object"
          : "null",
        hasDistributor: !!invoice.distributor,
        hasToDistributor: !!invoice.toDistributor,
      });
      // Parse distributorId and drugId
      // Priority: toDistributor > distributor > distributorName > distributorId (object) > distributorId (string parse)
      let distributor = invoice.toDistributor || invoice.distributor;
      let drug = invoice.drug;

      // If backend returns distributorName directly (new format)
      if (!distributor && invoice.distributorName) {
        distributor = {
          _id: invoice.distributorId, // Store the ID if available
          name: invoice.distributorName,
          fullName: invoice.distributorName,
          username: invoice.distributorName, // Often distributorName is email/username
          email: invoice.distributorEmail || invoice.distributorName, // Use distributorName as email if it looks like email
          ...(invoice.distributorEmail && { email: invoice.distributorEmail }),
          ...(invoice.distributorWallet && {
            walletAddress: invoice.distributorWallet,
          }),
          ...(invoice.distributorPhone && { phone: invoice.distributorPhone }),
          ...(invoice.distributorAddress && {
            address: invoice.distributorAddress,
          }),
        };
        console.log(
          "✅ Created distributor from distributorName:",
          distributor
        );
      }

      // Parse distributorId if it's a JSON string (old format)
      if (!distributor && invoice.distributorId) {
        if (typeof invoice.distributorId === "string") {
          // Check if it's a JSON string (old format) or just an ID (new format)
          if (
            invoice.distributorId.trim().startsWith("{") ||
            invoice.distributorId.includes("ObjectId")
          ) {
            const parsedDistributor = safeParseJSON(invoice.distributorId);
            if (parsedDistributor) {
              distributor = parsedDistributor;
              console.log(
                "✅ Parsed distributor from JSON string:",
                distributor
              );
            } else {
              console.warn(
                "⚠️ Failed to parse distributorId JSON:",
                invoice.distributorId?.substring(0, 100)
              );
            }
          } else {
            // It's just an ID string, not JSON - skip parsing
            console.log(
              "ℹ️ distributorId is just an ID, not JSON:",
              invoice.distributorId
            );
          }
        } else if (typeof invoice.distributorId === "object") {
          // Already an object, use directly
          distributor = invoice.distributorId;
          console.log("✅ Using distributorId as object:", distributor);
        }
      }

      // Log final distributor
      if (distributor) {
        console.log("✅ Final distributor:", {
          name:
            distributor.name || distributor.fullName || distributor.username,
          email: distributor.email,
          hasWallet: !!distributor.walletAddress,
        });
      } else {
        console.warn(
          "⚠️ No distributor found for invoice:",
          invoice.invoiceNumber
        );
      }

      // Parse drugId
      if (invoice.drugId) {
        if (typeof invoice.drugId === "string") {
          const parsedDrug = safeParseJSON(invoice.drugId);
          if (parsedDrug) {
            drug = parsedDrug;
            console.log("✅ Parsed drug:", drug);
          } else {
            console.warn(
              "⚠️ Failed to parse drugId:",
              invoice.drugId?.substring(0, 100)
            );
          }
        } else if (typeof invoice.drugId === "object") {
          // Already an object, use directly
          drug = invoice.drugId;
        }
      }

      return {
        ...invoice,
        _id: invoice._id || invoice.id,
        distributor: distributor,
        drug: drug,
        transactionHash: invoice.chainTxHash || invoice.transactionHash,
        tokenIds: invoice.tokenIds || invoice.invoice?.tokenIds || [],
        amounts: invoice.amounts || invoice.invoice?.amounts || [],
        invoice: {
          _id: invoice._id || invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          invoiceDate: invoice.invoiceDate,
          tokenIds: invoice.tokenIds || invoice.invoice?.tokenIds || [],
        },
      };
    });
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
      issued: "bg-amber-100 text-amber-700 border-amber-200", // Map "issued" to pending style
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
      issued: "issued",
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

    if (!item._id || !item.distributor?.walletAddress) {
      toast.error(
        "Thiếu thông tin cần thiết để retry. Vui lòng kiểm tra lại invoice ID và distributor address."
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
        invoiceId: item._id || item.invoice?._id,
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
    getStatusColor,
    getStatusLabel,
    handleRetry,
    page,
  };
};
