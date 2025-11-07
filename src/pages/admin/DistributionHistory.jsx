import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardLayout from "../../components/DashboardLayout";
import { getDistributionHistory } from "../../services/admin/adminService";
import TruckLoader from "../../components/TruckLoader";

export default function DistributionHistory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [loadingProgress, setLoadingProgress] = useState(0);
  const progressIntervalRef = useRef(null);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const distributorId = searchParams.get("distributorId") || "";
  const pharmacyId = searchParams.get("pharmacyId") || "";
  const drugId = searchParams.get("drugId") || "";
  const status = searchParams.get("status") || "";

  const navigationItems = useMemo(
    () => [
      { path: "/admin", label: "Tổng quan", icon: null, active: false },
      {
        path: "/admin/distribution",
        label: "Lịch sử phân phối",
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
      const params = { page, limit: 20 };
      if (distributorId) params.distributorId = distributorId;
      if (pharmacyId) params.pharmacyId = pharmacyId;
      if (drugId) params.drugId = drugId;
      if (status) params.status = status;

      const response = await getDistributionHistory(params);

      if (response.data.success) {
        setItems(response.data.data.distributionHistory || []);
        setPagination(
          response.data.data.pagination || {
            page: 1,
            limit: 20,
            total: 0,
            pages: 0,
          }
        );
      }
    } catch (e) {
      setError(e?.response?.data?.message || "Không thể tải dữ liệu");
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
  }, [page, distributorId, pharmacyId, drugId, status]);

  const updateFilter = (next) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([k, v]) => {
      if (v === "" || v === undefined || v === null) nextParams.delete(k);
      else nextParams.set(k, String(v));
    });
    setSearchParams(nextParams);
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
        <>
          {/* Banner */}
          <div className="bg-white rounded-xl border border-card-primary shadow-sm p-5 mb-4">
            <h2 className="text-xl font-semibold text-[#007b91]">
              Lịch sử phân phối thuốc
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Theo dõi việc chuyển giao thuốc từ nhà phân phối đến nhà thuốc
            </p>
          </div>

          {/* Filters */}
          <motion.div
            className="rounded-2xl bg-white border border-card-primary shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-4 mb-4"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-sm text-[#003544]/70 mb-1">
                  Mã NPP
                </label>
                <input
                  value={distributorId}
                  onChange={(e) =>
                    updateFilter({ distributorId: e.target.value, page: 1 })
                  }
                  placeholder="Lọc theo NPP"
                  className="w-full h-12 rounded-full border border-gray-200 bg-white text-gray-700 px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-[#48cae4] transition"
                />
              </div>

              <div>
                <label className="block text-sm text-[#003544]/70 mb-1">
                  Mã nhà thuốc
                </label>
                <input
                  value={pharmacyId}
                  onChange={(e) =>
                    updateFilter({ pharmacyId: e.target.value, page: 1 })
                  }
                  placeholder="Lọc theo Nhà thuốc"
                  className="w-full h-12 rounded-full border border-gray-200 bg-white text-gray-700 px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-[#48cae4] transition"
                />
              </div>

              <div>
                <label className="block text-sm text-[#003544]/70 mb-1">
                  Mã thuốc
                </label>
                <input
                  value={drugId}
                  onChange={(e) =>
                    updateFilter({ drugId: e.target.value, page: 1 })
                  }
                  placeholder="Lọc theo thuốc"
                  className="w-full h-12 rounded-full border border-gray-200 bg-white text-gray-700 px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-[#48cae4] transition"
                />
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
                  className="w-full h-12 rounded-full border border-gray-200 bg-white text-gray-700 px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-[#48cae4] transition"
                >
                  <option value="">Tất cả</option>
                  <option value="pending">Đang chờ</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="confirmed">Đã xác nhận</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* List */}
          <motion.div
            className="bg-white rounded-2xl border border-card-primary shadow-sm p-6"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            {error ? (
              <div className="p-6 text-red-600">{error}</div>
            ) : items.length === 0 ? (
              <div className="p-6 text-slate-600">Không có dữ liệu</div>
            ) : (
              <div className="space-y-4">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-[#003544]">
                          {item.type === "full_record"
                            ? "Giao dịch phân phối"
                            : "Xác nhận nhận hàng"}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1">
                          {new Date(
                            item.invoice?.createdAt || item.proof?.createdAt
                          ).toLocaleString("vi-VN")}
                        </p>
                      </div>

                      {(item.invoice?.status || item.proof?.status) && (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            item.invoice?.status === "completed" ||
                            item.proof?.status === "confirmed"
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                              : item.invoice?.status === "pending" ||
                                item.proof?.status === "pending"
                              ? "bg-amber-100 text-amber-700 border border-amber-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {item.invoice?.status === "pending"
                            ? "Đang chờ"
                            : item.invoice?.status === "completed"
                            ? "Hoàn thành"
                            : item.proof?.status === "confirmed"
                            ? "Đã xác nhận"
                            : item.invoice?.status || item.proof?.status}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Invoice info */}
                      {item.invoice && (
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                          <h4 className="font-semibold text-slate-800 mb-3">
                            Hóa đơn
                          </h4>
                          <div className="space-y-2 text-sm">
                            {item.invoice.invoiceNumber && (
                              <div>
                                <span className="text-slate-600">
                                  Số hóa đơn:
                                </span>
                                <span className="ml-2 font-mono text-xs bg-white px-2 py-1 rounded text-slate-700">
                                  {item.invoice.invoiceNumber}
                                </span>
                              </div>
                            )}

                            {item.invoice.fromDistributor && (
                              <div>
                                <span className="text-slate-600">Từ NPP:</span>
                                <span className="ml-2 font-medium text-slate-800">
                                  {item.invoice.fromDistributor.fullName ||
                                    item.invoice.fromDistributor.username}
                                </span>
                              </div>
                            )}

                            {item.invoice.toPharmacy && (
                              <div>
                                <span className="text-slate-600">
                                  Đến nhà thuốc:
                                </span>
                                <span className="ml-2 font-medium text-slate-800">
                                  {item.invoice.toPharmacy.fullName ||
                                    item.invoice.toPharmacy.username}
                                </span>
                              </div>
                            )}

                            {item.invoice.drug && (
                              <div>
                                <span className="text-slate-600">Thuốc:</span>
                                <span className="ml-2 font-medium text-slate-800">
                                  {item.invoice.drug.tradeName} (
                                  {item.invoice.drug.atcCode})
                                </span>
                              </div>
                            )}

                            {item.invoice.quantity && (
                              <div>
                                <span className="text-slate-600">
                                  Số lượng:
                                </span>
                                <span className="ml-2 font-semibold text-slate-800">
                                  {item.invoice.quantity}
                                </span>
                              </div>
                            )}

                            {item.invoice.chainTxHash && (
                              <div>
                                <span className="text-slate-600">TX Hash:</span>
                                <a
                                  href={`https://sepolia.etherscan.io/tx/${item.invoice.chainTxHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-2 font-mono text-xs text-cyan-600 hover:text-cyan-700 hover:underline"
                                >
                                  {item.invoice.chainTxHash.slice(0, 10)}...
                                  {item.invoice.chainTxHash.slice(-8)}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Proof info */}
                      {item.proof && (
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                          <h4 className="font-semibold text-slate-800 mb-3">
                            Xác nhận nhận hàng
                          </h4>
                          <div className="space-y-2 text-sm">
                            {item.proof.fromDistributor && (
                              <div>
                                <span className="text-slate-600">Từ NPP:</span>
                                <span className="ml-2 font-medium text-slate-800">
                                  {item.proof.fromDistributor.fullName ||
                                    item.proof.fromDistributor.username}
                                </span>
                              </div>
                            )}

                            {item.proof.toPharmacy && (
                              <div>
                                <span className="text-slate-600">
                                  Nhà thuốc:
                                </span>
                                <span className="ml-2 font-medium text-slate-800">
                                  {item.proof.toPharmacy.fullName ||
                                    item.proof.toPharmacy.username}
                                </span>
                              </div>
                            )}

                            {item.proof.drug && (
                              <div>
                                <span className="text-slate-600">Thuốc:</span>
                                <span className="ml-2 font-medium text-slate-800">
                                  {item.proof.drug.tradeName} (
                                  {item.proof.drug.atcCode})
                                </span>
                              </div>
                            )}

                            {item.proof.receivedQuantity && (
                              <div>
                                <span className="text-slate-600">
                                  Số lượng nhận:
                                </span>
                                <span className="ml-2 font-semibold text-slate-800">
                                  {item.proof.receivedQuantity}
                                </span>
                              </div>
                            )}

                            {item.proof.receiptDate && (
                              <div>
                                <span className="text-slate-600">
                                  Ngày nhận:
                                </span>
                                <span className="ml-2 text-slate-800">
                                  {new Date(
                                    item.proof.receiptDate
                                  ).toLocaleDateString("vi-VN")}
                                </span>
                              </div>
                            )}

                            {item.proof.receiptTxHash && (
                              <div>
                                <span className="text-slate-600">TX Hash:</span>
                                <a
                                  href={`https://sepolia.etherscan.io/tx/${item.proof.receiptTxHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-2 font-mono text-xs text-cyan-600 hover:text-cyan-700 hover:underline"
                                >
                                  {item.proof.receiptTxHash.slice(0, 10)}...
                                  {item.proof.receiptTxHash.slice(-8)}
                                </a>
                              </div>
                            )}

                            {item.proof.supplyChainCompleted !== undefined && (
                              <div>
                                <span className="text-slate-600">
                                  Supply chain hoàn tất:
                                </span>
                                <span
                                  className={`ml-2 px-2 py-0.5 rounded text-xs ${
                                    item.proof.supplyChainCompleted
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-amber-100 text-amber-700"
                                  }`}
                                >
                                  {item.proof.supplyChainCompleted
                                    ? "Hoàn tất"
                                    : "Chưa hoàn tất"}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Pagination */}
          <div className="flex items-center justify-end gap-2 mt-4">
            <button
              disabled={page <= 1}
              onClick={() => updateFilter({ page: page - 1 })}
              className={`px-3 py-2 rounded-xl ${
                page <= 1
                  ? "bg-slate-200 text-slate-400"
                  : "bg-white border border-cyan-200 hover:bg-[#f5fcff]"
              }`}
            >
              Trước
            </button>
            <span className="text-sm text-slate-700">Trang {page}</span>
            <button
              onClick={() => updateFilter({ page: page + 1 })}
              className="px-3 py-2 rounded-xl !text-white bg-secondary shadow-[0_10px_24px_rgba(0,180,216,0.30)] hover:shadow-[0_14px_36px_rgba(0,180,216,0.40)]"
            >
              Sau
            </button>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
