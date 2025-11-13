import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardLayout from "../../components/DashboardLayout";
import TruckLoader from "../../components/TruckLoader";
import { getDistributionHistory } from "../../services/distributor/distributorService";
import { Card } from "../../components/ui/card";
import { Search } from "../../components/ui/search";

export default function DistributionHistory() {
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

  const prevSearchRef = useRef(search);
  useEffect(() => {
    if (prevSearchRef.current !== search) {
      setSearchInput(search);
      prevSearchRef.current = search;
    }
  }, [search]);

  const navigationItems = [
    {
      path: "/distributor",
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
      active: false,
    },
    {
      path: "/distributor/invoices",
      label: "Đơn từ nhà SX",
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      active: false,
    },
    {
      path: "/distributor/transfer-pharmacy",
      label: "Chuyển cho NT",
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
      path: "/distributor/distribution-history",
      label: "Lịch sử phân phối",
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
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
      active: true,
    },
    {
      path: "/distributor/transfer-history",
      label: "Lịch sử chuyển NT",
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
      path: "/distributor/drugs",
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
      path: "/distributor/nft-tracking",
      label: "Tra cứu NFT",
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
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      ),
      active: false,
    },
    {
      path: "/distributor/profile",
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
    try {
      if (isInitialLoad) {
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

      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (status) params.status = status;

      const response = await getDistributionHistory(params);

      if (isInitialLoad && progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      if (response.data.success) {
        setItems(response.data.data.distributions || []);
        setPagination(
          response.data.data.pagination || {
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
      if (isInitialLoad) {
        setLoading(false);
        setTimeout(() => setLoadingProgress(0), 500);
      }
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
      if (v === "" || v === undefined || v === null) nextParams.delete(k);
      else nextParams.set(k, String(v));
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

  const fadeUp = {
    hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
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
          <Card
            title="Lịch sử phân phối"
            subtitle="Theo dõi toàn bộ lịch sử nhận hàng và phân phối"
          />
          <motion.div
            className="rounded-2xl bg-white border border-card-primary shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-4 mb-5"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            <div className="flex flex-col md:flex-row gap-3 md:items-end">
              <Search
                searchInput={searchInput}
                setSearchInput={setSearchInput}
                handleSearch={handleSearch}
                handleClearSearch={handleClearSearch}
                placeholder="Tìm theo đơn hàng"
                data={items}
                getSearchText={(item) => {
                  const invoiceNumber =
                    item.manufacturerInvoice?.invoiceNumber || "";
                  const fromName =
                    item.fromManufacturer?.fullName ||
                    item.fromManufacturer?.username ||
                    "";
                  return invoiceNumber || fromName;
                }}
                matchFunction={(item, searchLower) => {
                  const invoiceNumber = (
                    item.manufacturerInvoice?.invoiceNumber || ""
                  ).toLowerCase();
                  const fromName = (
                    item.fromManufacturer?.fullName ||
                    item.fromManufacturer?.username ||
                    ""
                  ).toLowerCase();
                  return (
                    invoiceNumber.includes(searchLower) ||
                    fromName.includes(searchLower)
                  );
                }}
                getDisplayText={(item, searchLower) => {
                  const invoiceNumber = (
                    item.manufacturerInvoice?.invoiceNumber || ""
                  ).toLowerCase();
                  const fromName = (
                    item.fromManufacturer?.fullName ||
                    item.fromManufacturer?.username ||
                    ""
                  ).toLowerCase();
                  if (invoiceNumber.includes(searchLower)) {
                    return item.manufacturerInvoice?.invoiceNumber || "";
                  }
                  if (fromName.includes(searchLower)) {
                    return (
                      item.fromManufacturer?.fullName ||
                      item.fromManufacturer?.username ||
                      ""
                    );
                  }
                  return (
                    item.manufacturerInvoice?.invoiceNumber ||
                    item.fromManufacturer?.fullName ||
                    item.fromManufacturer?.username ||
                    ""
                  );
                }}
              />
              <div>
                <label className="block text-sm text-[#003544]/70 mb-1">
                  Trạng thái
                </label>
                <select
                  value={status}
                  onChange={(e) =>
                    updateFilter({ status: e.target.value, page: 1 })
                  }
                  className="h-12 rounded-full border border-gray-200 bg-white text-gray-700 px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-[#48cae4] transition"
                >
                  <option value="">Tất cả</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="transferred">Transferred</option>
                </select>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="space-y-4"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            {items.length === 0 ? (
              <div className="bg-white rounded-2xl border border-card-primary p-10 text-center">
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  Chưa có lịch sử phân phối
                </h3>
                <p className="text-slate-600">
                  Lịch sử nhận hàng từ nhà sản xuất sẽ hiển thị ở đây
                </p>
              </div>
            ) : (
              items.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-card-primary shadow-sm overflow-hidden hover:shadow-lg transition"
                >
                  {/* Header */}
                  <div className="p-5 flex items-start justify-between">
                    <div>
                      <div className="text-sm text-slate-600">Từ</div>
                      <h3 className="text-lg font-semibold text-[#003544]">
                        {item.fromManufacturer?.fullName ||
                          item.fromManufacturer?.username ||
                          "N/A"}
                      </h3>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {item.status === "confirmed"
                        ? "Confirmed"
                        : item.status === "pending"
                        ? "Pending"
                        : item.status === "transferred"
                        ? "Transferred"
                        : item.status}
                    </span>
                  </div>

                  {/* Summary Chips */}
                  <div className="px-5 pb-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">Đơn hàng:</span>
                      <span className="font-mono text-slate-800">
                        {item.manufacturerInvoice?.invoiceNumber || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">Số lượng:</span>
                      <span className="font-semibold text-slate-800">
                        {item.distributedQuantity} NFT
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">Địa chỉ:</span>
                      <span className="text-slate-800">
                        {typeof item.deliveryAddress === "object" &&
                        item.deliveryAddress !== null
                          ? `${item.deliveryAddress.street || ""}${
                              item.deliveryAddress.street &&
                              item.deliveryAddress.city
                                ? ", "
                                : ""
                            }${item.deliveryAddress.city || ""}`.trim() ||
                            "Chưa có"
                          : item.deliveryAddress || "Chưa có"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">Ngày nhận:</span>
                      <span className="text-slate-800">
                        {item.distributionDate
                          ? new Date(item.distributionDate).toLocaleDateString(
                              "vi-VN"
                            )
                          : "Chưa có"}
                      </span>
                    </div>
                  </div>

                  {/* Information Panels */}
                  <div className="px-5 pb-5 space-y-3">
                    {item.fromManufacturer && (
                      <div className="rounded-xl p-4 border border-slate-200 bg-slate-50">
                        <div className="font-semibold text-slate-800 mb-1">
                          Thông tin nhà sản xuất
                        </div>
                        <div className="text-sm text-slate-700">
                          Tên:{" "}
                          <span className="font-medium">
                            {item.fromManufacturer.fullName ||
                              item.fromManufacturer.username ||
                              "N/A"}
                          </span>
                        </div>
                        <div className="text-sm text-slate-700 mt-1">
                          Username:{" "}
                          <span className="font-mono">
                            {item.fromManufacturer.username || "N/A"}
                          </span>
                        </div>
                        <div className="text-sm text-slate-700 mt-1">
                          Email:{" "}
                          <span className="font-medium">
                            {item.fromManufacturer.email || "N/A"}
                          </span>
                        </div>
                      </div>
                    )}

                    {item.manufacturerInvoice && (
                      <div className="rounded-xl p-4 border border-slate-200 bg-slate-50">
                        <div className="font-semibold text-slate-800 mb-1">
                          Thông tin hóa đơn
                        </div>
                        <div className="text-sm text-slate-700">
                          Số hóa đơn:{" "}
                          <span className="font-mono font-medium">
                            {item.manufacturerInvoice.invoiceNumber}
                          </span>
                        </div>
                        <div className="text-sm text-slate-700 mt-1">
                          Ngày hóa đơn:{" "}
                          <span className="font-medium">
                            {item.manufacturerInvoice.invoiceDate
                              ? new Date(
                                  item.manufacturerInvoice.invoiceDate
                                ).toLocaleDateString("vi-VN")
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="rounded-xl p-4 border border-slate-200 bg-slate-50">
                      <div className="font-semibold text-slate-800 mb-1">
                        Ghi chú
                      </div>
                      <div className="text-sm text-slate-700">
                        {item.notes || "—"}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </motion.div>

          <div className="flex items-center justify-between mt-5">
            <div className="text-sm text-slate-600">
              Hiển thị {items.length} / {pagination.total} lô phân phối
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => updateFilter({ page: page - 1 })}
                className={`px-3 py-2 rounded-xl ${
                  page <= 1
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-white/90 border border-[#90e0ef55] hover:bg-[#f5fcff]"
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
                    : "!text-white bg-gradient-to-r from-[#00b4d8] via-[#48cae4] to-[#90e0ef] shadow-[0_10px_24px_rgba(0,180,216,0.30)] hover:shadow-[0_14px_36px_rgba(0,180,216,0.40)]"
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
