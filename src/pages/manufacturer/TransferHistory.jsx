import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import TruckLoader from "../../components/TruckLoader";
import {
  getTransferHistory,
  saveTransferTransaction,
} from "../../services/manufacturer/manufacturerService";
import {
  transferNFTToDistributor,
  transferBatchNFTToDistributor,
  getCurrentWalletAddress,
} from "../../utils/web3Helper";
import { useAuth } from "../../context/AuthContext";

export default function TransferHistory() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [allItems, setAllItems] = useState([]); // Store all items for client-side filtering
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const progressIntervalRef = useRef(null);
  const [retryingId, setRetryingId] = useState(null);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
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

  // FIX: Sync searchInput with URL search param on mount/change
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const navigationItems = [
    {
      path: "/manufacturer",
      label: "Tổng quan",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      active: true,
    },
    {
      path: "/manufacturer/drugs",
      label: "Quản lý thuốc",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
          />
        </svg>
      ),
      active: false,
    },
    {
      path: "/manufacturer/production",
      label: "Sản xuất thuốc",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
      active: false,
    },
    {
      path: "/manufacturer/transfer",
      label: "Chuyển giao",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
      ),
      active: false,
    },
    {
      path: "/manufacturer/production-history",
      label: "Lịch sử sản xuất",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
      active: false,
    },
    {
      path: "/manufacturer/transfer-history",
      label: "Lịch sử chuyển giao",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      active: false,
    },
    {
      path: "/manufacturer/profile",
      label: "Hồ sơ",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      active: false,
    },
  ];

  // Initialize search input from URL params
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    loadData();

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [page, search, status]);

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

  // Debounce search input
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Only show searching indicator if input is different from current search
    if (searchInput !== search) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(() => {
        updateFilter({ search: searchInput, page: 1 });
        setIsSearching(false);
      }, 1500);
    } else {
      setIsSearching(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  // FIX: Simplified loading logic
  const loadData = async () => {
    try {
      setLoading(true);
      setLoadingProgress(0);

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }

      progressIntervalRef.current = setInterval(() => {
        setLoadingProgress((prev) => Math.min(prev + 0.02, 0.9));
      }, 50);

      const params = { page: 1, limit: 1000 }; // Load all items for client-side filtering
      // Don't send search to backend - we'll filter client-side
      // Only send status filter to backend
      if (status) params.status = status;

      const response = await getTransferHistory(params);

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      if (response?.data?.success) {
        const invoices =
          response.data.data?.invoices || response.data.data?.transfers || [];
        const paginationData = response.data.data?.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0,
        };

        // FIX: Simplify mapping with helper function
        const mappedItems = normalizeInvoices(invoices);

        setAllItems(mappedItems);
        // Client-side filtering will be handled by useEffect
        setPagination(paginationData);
      } else {
        setItems([]);
        setAllItems([]);
      }

      setLoadingProgress(1);
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (error) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      console.error("Lỗi khi tải lịch sử chuyển giao:", error);
      setItems([]);
      setAllItems([]);

      if (error?.response?.status === 401) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else if (error?.response?.status >= 500) {
        alert("Lỗi server. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
      setTimeout(() => setLoadingProgress(0), 500);
    }
  };

  // FIX: Helper function to normalize invoices
  const normalizeInvoices = (invoices) => {
    if (!Array.isArray(invoices)) return [];

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
      if (v === "" || v === undefined || v === null) nextParams.delete(k);
      else nextParams.set(k, String(v));
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
    if (!id && id !== 0) return BigInt(0);

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
    if (retryingId === item._id) return; // Prevent double-click

    if (!item.invoice?._id || !item.distributor?.walletAddress) {
      alert(
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
      alert("Không tìm thấy token IDs để chuyển giao.");
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
        alert(
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
      await saveTransferTransaction({
        invoiceId: item.invoice._id,
        transactionHash: onchain.transactionHash,
        tokenIds,
      });

      alert("✅ Đã chuyển NFT on-chain và lưu transaction thành công!");
      loadData();
    } catch (error) {
      // FIX: Handle abort gracefully
      if (error.name === "AbortError") {
        console.log("Transfer cancelled by user");
        return;
      }

      console.error("Lỗi khi retry transfer:", error);
      alert(error?.message || "Giao dịch on-chain thất bại hoặc bị hủy.");
    } finally {
      setRetryingId(null);
      retryAbortControllerRef.current = null;
    }
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
        <div className="space-y-6">
          {/* Banner */}
          <div className="bg-white rounded-xl border border-card-primary shadow-sm p-5">
            <h1 className="text-xl font-semibold text-[#007b91] flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7h18M5 10h14M4 14h16M6 18h12"
                />
              </svg>
              Lịch sử chuyển giao
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Theo dõi tất cả các đơn chuyển giao NFT cho nhà phân phối
            </p>
          </div>

          {/* Filters */}
          <div className="rounded-2xl bg-white border border-card-primary shadow-sm p-4">
            <div className="flex flex-col md:flex-row gap-3 md:items-end">
              <div className="flex-1">
                <label className="block text-sm text-slate-600 mb-1">
                  Tìm kiếm
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    {isSearching ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5 animate-spin text-cyan-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
                        />
                      </svg>
                    )}
                  </span>
                  <input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (searchTimeoutRef.current) {
                          clearTimeout(searchTimeoutRef.current);
                        }
                        updateFilter({ search: searchInput, page: 1 });
                        setIsSearching(false);
                      }
                    }}
                    placeholder="Tìm theo tên nhà phân phối, số lô..."
                    className="w-full h-12 pl-11 pr-32 rounded-full border border-gray-200 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                  />
                  {/* Clear button */}
                  {searchInput && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute right-16 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      title="Xóa tìm kiếm"
                    >
                      ✕
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (searchTimeoutRef.current) {
                        clearTimeout(searchTimeoutRef.current);
                      }
                      updateFilter({ search: searchInput, page: 1 });
                      setIsSearching(false);
                    }}
                    className="absolute right-1 top-1 bottom-1 px-6 rounded-full bg-secondary !text-white hover:shadow-lg font-medium transition"
                  >
                    Tìm kiếm
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">
                  Trạng thái
                </label>
                <select
                  value={status}
                  onChange={(e) =>
                    updateFilter({ status: e.target.value, page: 1 })
                  }
                  className="h-12 w-full rounded-full appearance-none border border-gray-200 bg-white text-gray-700 px-4 pr-12 shadow-sm hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400 transition"
                >
                  <option value="">Tất cả</option>
                  <option value="pending">Pending</option>
                  <option value="sent">Sent</option>
                  <option value="received">Received</option>
                  <option value="paid">Paid</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* List */}
          <div className="space-y-4">
            {items.length === 0 ? (
              <div className="bg-white rounded-2xl border border-cyan-200 p-10 text-center">
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  Chưa có lịch sử chuyển giao
                </h3>
                <p className="text-slate-600">
                  Các đơn chuyển giao của bạn sẽ hiển thị ở đây
                </p>
              </div>
            ) : (
              items.map((item) => {
                const itemId = item._id;
                const isExpanded = expandedItems.has(itemId);
                return (
                  <div
                    key={itemId}
                    className="bg-white rounded-2xl border border-card-primary shadow-sm overflow-hidden hover:shadow-md transition"
                  >
                    {/* Clickable Header */}
                    <div
                      className="p-5 cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => toggleItem(itemId)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div
                            className={`transform transition-transform duration-300 ${
                              isExpanded ? "rotate-180" : "rotate-0"
                            }`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-5 h-5 text-slate-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-slate-800">
                              {item.distributor?.fullName ||
                                item.distributor?.name ||
                                "N/A"}
                            </h3>
                            <div className="text-sm text-slate-600 mt-1">
                              Số hóa đơn:{" "}
                              <span className="font-mono font-medium">
                                {item.invoiceNumber || "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            item.status
                          )}`}
                        >
                          {getStatusLabel(item.status)}
                        </span>
                      </div>
                    </div>

                    {/* Expandable Content */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isExpanded
                          ? "max-h-[2000px] opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="px-5 pb-5 border-t border-slate-200">
                        {/* Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-sm mt-4">
                          {item.production?.batchNumber && (
                            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                              <div className="text-slate-600">
                                Số lô:{" "}
                                <span className="font-mono font-medium text-slate-800">
                                  {item.production.batchNumber}
                                </span>
                              </div>
                            </div>
                          )}
                          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                            <div className="text-slate-600">
                              Số lượng:{" "}
                              <span className="font-semibold text-slate-800">
                                {item.quantity} NFT
                              </span>
                            </div>
                            <div className="mt-1 text-slate-600">
                              Ngày tạo:{" "}
                              <span className="font-medium">
                                {new Date(item.createdAt).toLocaleString(
                                  "vi-VN"
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Distributor Panel */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                            <div className="text-xs text-slate-500 mb-1">
                              Nhà phân phối
                            </div>
                            <div className="font-semibold text-slate-800">
                              {item.distributor?.fullName ||
                                item.distributor?.name ||
                                "N/A"}
                            </div>
                            {item.distributor?.email && (
                              <div className="text-xs text-slate-500 mt-1">
                                {item.distributor.email}
                              </div>
                            )}
                            {item.distributor?.address && (
                              <div className="text-xs text-slate-500 mt-1">
                                {item.distributor.address}
                              </div>
                            )}
                          </div>
                          {item.distributor?.walletAddress && (
                            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                              <div className="text-xs text-slate-500 mb-1">
                                Wallet Address
                              </div>
                              <div className="font-mono text-xs text-slate-800 break-all">
                                {item.distributor.walletAddress}
                              </div>
                            </div>
                          )}
                        </div>

                        {item.transactionHash && (
                          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-sm mb-3">
                            <div className="font-semibold text-slate-800 mb-1">
                              Transaction Hash (Blockchain)
                            </div>
                            <div className="font-mono text-xs text-slate-700 break-all">
                              {item.transactionHash}
                            </div>
                            <a
                              href={`https://zeroscan.org/tx/${item.transactionHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-slate-600 hover:text-slate-800 underline mt-1 inline-block"
                            >
                              Xem trên ZeroScan →
                            </a>
                          </div>
                        )}

                        {/* Retry button */}
                        {["pending", "sent"].includes(item.status) &&
                          !item.transactionHash &&
                          item.distributor?.walletAddress && (
                            <div className="mt-4 pt-4 border-t border-slate-200">
                              <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 text-sm text-amber-800 mb-3">
                                {item.status === "sent"
                                  ? "Distributor đã xác nhận. Vui lòng chuyển quyền sở hữu NFT on-chain."
                                  : "Chưa chuyển NFT on-chain. Vui lòng xác nhận chuyển quyền sở hữu NFT."}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRetry(item);
                                }}
                                disabled={retryingId === item._id}
                                className="w-full px-4 py-2.5 rounded-xl !text-white bg-gradient-to-r from-[#00b4d8] to-[#48cae4] hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all font-semibold"
                              >
                                {retryingId === item._id
                                  ? "Đang xử lý..."
                                  : item.status === "sent"
                                  ? "Xác nhận chuyển NFT"
                                  : "Thử lại chuyển giao"}
                              </button>
                            </div>
                          )}

                        {/* Status Timeline */}
                        <div className="mt-4 pt-4 border-t border-slate-200">
                          <div className="flex items-center gap-2 text-xs">
                            <div
                              className={`flex items-center gap-1 ${
                                [
                                  "pending",
                                  "sent",
                                  "received",
                                  "paid",
                                ].includes(item.status)
                                  ? "text-amber-600"
                                  : "text-slate-400"
                              }`}
                            >
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  [
                                    "pending",
                                    "sent",
                                    "received",
                                    "paid",
                                  ].includes(item.status)
                                    ? "bg-amber-500"
                                    : "bg-slate-300"
                                }`}
                              ></div>
                              <span>Pending</span>
                            </div>
                            <div className="flex-1 h-px bg-slate-200"></div>
                            <div
                              className={`flex items-center gap-1 ${
                                ["sent", "received", "paid"].includes(
                                  item.status
                                )
                                  ? "text-cyan-600"
                                  : "text-slate-400"
                              }`}
                            >
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  ["sent", "received", "paid"].includes(
                                    item.status
                                  )
                                    ? "bg-cyan-500"
                                    : "bg-slate-300"
                                }`}
                              ></div>
                              <span>Sent</span>
                            </div>
                            <div className="flex-1 h-px bg-slate-200"></div>
                            <div
                              className={`flex items-center gap-1 ${
                                ["received", "paid"].includes(item.status)
                                  ? "text-blue-600"
                                  : "text-slate-400"
                              }`}
                            >
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  ["received", "paid"].includes(item.status)
                                    ? "bg-blue-500"
                                    : "bg-slate-300"
                                }`}
                              ></div>
                              <span>Received</span>
                            </div>
                            <div className="flex-1 h-px bg-slate-200"></div>
                            <div
                              className={`flex items-center gap-1 ${
                                item.status === "paid"
                                  ? "text-emerald-600"
                                  : "text-slate-400"
                              }`}
                            >
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  item.status === "paid"
                                    ? "bg-emerald-500"
                                    : "bg-slate-300"
                                }`}
                              ></div>
                              <span>Paid</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-5">
            <div className="text-sm text-slate-600">
              Hiển thị {items.length} / {pagination.total} đơn chuyển giao
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => updateFilter({ page: page - 1 })}
                className={`px-3 py-2 rounded-xl ${
                  page <= 1
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-white border border-cyan-300 hover:bg-cyan-50"
                }`}
              >
                Trước
              </button>
              <span className="text-sm text-slate-700">
                Trang {page} / {pagination.pages || 1}
              </span>
              <button
                disabled={page >= pagination.pages}
                onClick={() => updateFilter({ page: page + 1 })}
                className={`px-3 py-2 rounded-xl ${
                  page >= pagination.pages
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-secondary !text-white hover:shadow-lg"
                }`}
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
