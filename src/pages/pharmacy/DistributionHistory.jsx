import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardLayout from "../../components/DashboardLayout";
import pharmacyService from "../../services/pharmacy/pharmacyService";
import TruckLoader from "../../components/TruckLoader";

export default function DistributionHistory() {
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

  // Sync searchInput with URL search param on mount/change (only from URL changes, not user input)
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const navigationItems = [
    { path: "/pharmacy", label: "Tổng quan", active: false },
    { path: "/pharmacy/invoices", label: "Đơn từ NPP", active: false },
    {
      path: "/pharmacy/distribution-history",
      label: "Lịch sử phân phối",
      active: true,
    },
    { path: "/pharmacy/drugs", label: "Quản lý thuốc", active: false },
    { path: "/pharmacy/nft-tracking", label: "Tra cứu NFT", active: false },
    { path: "/pharmacy/profile", label: "Hồ sơ", active: false },
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
      setLoading(true);
      setLoadingProgress(0);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      // Tăng dần tiến trình đến 90% trong lúc chờ API
      progressIntervalRef.current = setInterval(() => {
        setLoadingProgress((prev) =>
          prev < 0.9 ? Math.min(prev + 0.02, 0.9) : prev
        );
      }, 50);

      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (status) params.status = status;

      const response = await pharmacyService.getDistributionHistory(params);

      console.log("Distribution History Response:", response);
      console.log("Response data:", response.data);

      if (response.data && response.data.success) {
        const responseData = response.data.data || {};

        // Thử nhiều cách truy cập dữ liệu
        const history =
          responseData.history ||
          responseData.distributions ||
          responseData.items ||
          (Array.isArray(responseData) ? responseData : []);

        console.log("Extracted history:", history);
        console.log("First item structure:", history[0]);

        setItems(Array.isArray(history) ? history : []);
        setPagination(
          responseData.pagination || { page: 1, limit: 10, total: 0, pages: 0 }
        );
      } else {
        console.warn(
          "Response không thành công hoặc không có success field:",
          response.data
        );
        setItems([]);
        setPagination({ page: 1, limit: 10, total: 0, pages: 0 });
      }
    } catch (error) {
      console.error("Lỗi khi tải lịch sử:", error);
      console.error("Error details:", error.response?.data || error.message);
      setItems([]);
      setPagination({ page: 1, limit: 10, total: 0, pages: 0 });
    } finally {
      // Đưa tiến trình tới 100% và dừng interval trước khi hiển thị
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
    if (!entity) return fallback;
    if (typeof entity === "string" || typeof entity === "number") {
      return entity;
    }
    if (Array.isArray(entity)) {
      return entity.length > 0
        ? entity
            .map((item) =>
              extractName(item, "")
                .toString()
                .trim()
            )
            .filter(Boolean)
            .join(", ") || fallback
        : fallback;
    }
    if (typeof entity === "object") {
      const {
        fullName,
        name,
        username,
        email,
        contactName,
        phoneNumber,
        _id,
      } = entity;
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
    if (!value) return "—";
    if (typeof value === "string") return value;
    if (typeof value === "number") return String(value);
    try {
      return JSON.stringify(value, null, 2);
    } catch (error) {
      return "—";
    }
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
          <div className="bg-white rounded-xl border border-card-primary shadow-sm p-5 mb-6">
            <h1 className="text-xl font-semibold text-[#007b91]">
              Lịch sử phân phối
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Theo dõi toàn bộ lịch sử nhận hàng và phân phối
            </p>
          </div>

          <motion.div
            className="rounded-2xl bg-white border border-card-primary shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-4 mb-5"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            <div className="flex flex-col md:flex-row gap-3 md:items-end">
              <div className="flex-1">
                <label className="block text-sm text-[#003544]/70 mb-1">
                  Tìm kiếm
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
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
                  </span>
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => {
                      // Chỉ cập nhật state, không trigger search
                      setSearchInput(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      // Chỉ search khi nhấn Enter
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSearch();
                      }
                    }}
                    placeholder="Tìm theo tên thuốc, mã..."
                    className="w-full h-12 pl-11 pr-40 rounded-full border border-gray-200 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#48cae4] transition"
                  />
                  {/* Clear button */}
                  {searchInput && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute right-24 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                      title="Xóa tìm kiếm"
                    >
                      ✕
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSearch}
                    className="absolute right-1 top-1 bottom-1 px-6 rounded-full bg-secondary hover:bg-primary !text-white font-medium transition"
                  >
                    Tìm Kiếm
                  </button>
                </div>
              </div>
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
                  <option value="pending">Đang chờ</option>
                  <option value="received">Đã nhận</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="sold">Đã bán</option>
                  <option value="in_stock">Tồn kho</option>
                  <option value="expired">Hết hạn</option>
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
                  Lịch sử nhận hàng sẽ hiển thị ở đây
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
                        {item.fromDistributor?.fullName ||
                          item.fromDistributor?.name ||
                          item.fromDistributor?.username ||
                          "Không có"}
                      </h3>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {translateStatus(item.status)}
                    </span>
                  </div>

                  {/* Summary Chips */}
                  <div className="px-5 pb-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">Thuốc:</span>
                      <span className="font-medium text-slate-800">
                        {item.drug?.tradeName ||
                          item.drug?.commercialName ||
                          item.drugInfo?.commercialName ||
                          item.drugInfo?.tradeName ||
                          item.drugName ||
                          item.drug?.name ||
                          "Không có"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">Số lượng:</span>
                      <span className="font-semibold text-slate-800">
                        {item.quantity || item.receivedQuantity || 0} NFT
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
                        {item.receivedDate
                          ? new Date(item.receivedDate).toLocaleDateString(
                              "vi-VN"
                            )
                          : item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString("vi-VN")
                          : "Chưa có"}
                      </span>
                    </div>
                  </div>

                  {/* Information Panels */}
                  <div className="px-5 pb-5 space-y-3">
                    {item.fromDistributor && (
                      <div className="rounded-xl p-4 border border-slate-200 bg-slate-50">
                        <div className="font-semibold text-slate-800 mb-1">
                          Thông tin nhà phân phối
                        </div>
                        <div className="text-sm text-slate-700">
                          Tên:{" "}
                          <span className="font-medium">
                            {item.fromDistributor.fullName ||
                              item.fromDistributor.name ||
                              item.fromDistributor.username ||
                              "Không có"}
                          </span>
                        </div>
                        {item.fromDistributor.username && (
                          <div className="text-sm text-slate-700 mt-1">
                            Tên đăng nhập:{" "}
                            <span className="font-mono">
                              {item.fromDistributor.username}
                            </span>
                          </div>
                        )}
                        {item.fromDistributor.email && (
                          <div className="text-sm text-slate-700 mt-1">
                            Email:{" "}
                            <span className="font-medium">
                              {item.fromDistributor.email}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {item.receivedBy && (
                      <div className="rounded-xl p-4 border border-slate-200 bg-slate-50">
                        <div className="font-semibold text-slate-800 mb-1">
                          Người nhận
                        </div>
                        <div className="text-sm text-slate-700">
                          {extractName(item.receivedBy, "—")}
                        </div>
                      </div>
                    )}

                    {(item.transactionHash ||
                      item.chainTxHash ||
                      item.receiptTxHash) && (
                      <div className="rounded-xl p-4 border border-slate-200 bg-slate-50">
                        <div className="font-semibold text-slate-800 mb-1">
                          Mã giao dịch
                        </div>
                        <div className="text-sm text-slate-700 font-mono break-all">
                          {item.transactionHash ||
                            item.chainTxHash ||
                            item.receiptTxHash}
                        </div>
                      </div>
                    )}

                    <div className="rounded-xl p-4 border border-slate-200 bg-slate-50">
                      <div className="font-semibold text-slate-800 mb-1">
                        Ghi chú
                      </div>
                      <div className="text-sm text-slate-700">
                        {formatNotes(item.notes)}
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
                    : "!text-white bg-secondary hover:bg-primary !text-white font-medium transition"
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
