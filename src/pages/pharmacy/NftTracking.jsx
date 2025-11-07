import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "../../components/DashboardLayout";
import pharmacyService from "../../services/pharmacy/pharmacyService";
import TruckLoader from "../../components/TruckLoader";

export default function PharmacyNFTTracking() {
  const [nftId, setNftId] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [pageProgress, setPageProgress] = useState(0);
  const pageIntervalRef = useRef(null);

  const navigationItems = [
    { path: "/pharmacy", label: "Tổng quan", active: false },
    { path: "/pharmacy/invoices", label: "Đơn từ NPP", active: false },
    {
      path: "/pharmacy/distribution-history",
      label: "Lịch sử phân phối",
      active: false,
    },
    { path: "/pharmacy/drugs", label: "Quản lý thuốc", active: false },
    { path: "/pharmacy/nft-tracking", label: "Tra cứu NFT", active: true },
    { path: "/pharmacy/profile", label: "Hồ sơ", active: false },
  ];

  // Loading trang giống Dashboard: xe chạy khi vào trang
  useEffect(() => {
    setPageLoading(true);
    setPageProgress(0);
    if (pageIntervalRef.current) {
      clearInterval(pageIntervalRef.current);
      pageIntervalRef.current = null;
    }
    pageIntervalRef.current = setInterval(() => {
      setPageProgress((prev) =>
        prev < 0.9 ? Math.min(prev + 0.02, 0.9) : prev
      );
    }, 50);
    const complete = async () => {
      if (pageIntervalRef.current) {
        clearInterval(pageIntervalRef.current);
        pageIntervalRef.current = null;
      }
      let current = 0;
      setPageProgress((p) => {
        current = p;
        return p;
      });
      if (current < 0.9) {
        await new Promise((resolve) => {
          const su = setInterval(() => {
            setPageProgress((prev) => {
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
            setPageProgress(1);
            resolve();
          }, 500);
        });
      } else {
        setPageProgress(1);
        await new Promise((r) => setTimeout(r, 200));
      }
      await new Promise((r) => setTimeout(r, 100));
      setPageLoading(false);
      setTimeout(() => setPageProgress(0), 500);
    };
    complete();
    return () => {
      if (pageIntervalRef.current) {
        clearInterval(pageIntervalRef.current);
        pageIntervalRef.current = null;
      }
    };
  }, []);

  const handleSearch = async () => {
    if (!nftId.trim()) {
      setError("Vui lòng nhập NFT ID");
      return;
    }
    setLoading(true);
    setError("");
    setData(null);
    try {
      const response = await pharmacyService.trackDrugByNFTId(nftId.trim());
      if (response.data && response.data.success) {
        setData(response.data.data || response.data);
      } else {
        setError(response.data?.message || "Không tìm thấy NFT này");
      }
    } catch (e2) {
      setError(e2?.response?.data?.message || "Không thể tra cứu NFT");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return "N/A";
    const date = new Date(d);
    return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString("vi-VN");
  };

  const short = (s) => {
    if (!s || typeof s !== "string") return "N/A";
    if (s.length <= 12) return s;
    return `${s.slice(0, 8)}...${s.slice(-4)}`;
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
      {pageLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="w-full max-w-2xl">
            <TruckLoader height={72} progress={pageProgress} showTrack />
          </div>
          <div className="text-lg text-slate-600 mt-6">Đang tra cứu...</div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-card-primary shadow-sm p-5 mb-6">
            <h1 className="text-xl font-semibold text-[#007b91]">
              Tra cứu NFT
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Theo dõi hành trình thuốc qua NFT ID
            </p>
          </div>

          <motion.div
            className="rounded-2xl bg-white/85 backdrop-blur-xl border border-card-primary shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-8 mb-5"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            <div className="max-w-3xl mx-auto">
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
                  value={nftId}
                  onChange={(e) => setNftId(e.target.value)}
                  placeholder="Nhập NFT ID..."
                  className="w-full h-12 pl-11 pr-40 rounded-full border border-gray-200 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#48cae4] transition"
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />

                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="absolute right-1 top-1 bottom-1 px-6 rounded-full bg-secondary hover:bg-primary !text-white font-medium transition disabled:opacity-50"
                >
                  {loading ? "Đang tra cứu..." : "Tìm Kiếm"}
                </button>
              </div>
              {error && (
                <div className="mt-6 bg-white rounded-2xl border border-card-primary shadow-sm p-10 text-center">
                  <h3 className="text-lg font-semibold text-[#007b91] mb-2">
                    Không tìm thấy kết quả
                  </h3>
                  <p className="text-slate-500 text-sm mb-1">
                    Không có dữ liệu nào khớp với NFT ID bạn đã nhập.
                  </p>
                  <p className="text-slate-400 text-sm mb-5">
                    Vui lòng kiểm tra lại hoặc thử với mã khác.
                  </p>
                  <button
                    onClick={() => {
                      setError("");
                      setData(null);
                      setNftId("");
                    }}
                    className="px-6 py-2.5 rounded-full bg-[#3db6d9] hover:bg-[#2fa2c5] text-white font-medium transition"
                  >
                    Thử lại
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {data && (
            <motion.div
              className="space-y-5"
              variants={fadeUp}
              initial="hidden"
              animate="show"
            >
              <div className="bg-white rounded-2xl border border-card-primary shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-cyan-500 text-white flex items-center justify-center"></div>
                  <h2 className="text-lg font-semibold text-[#007b91]">
                    Thông tin chi tiết thuốc
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div className="space-y-2">
                    <div className="text-slate-500">NFT ID</div>
                    <div className="font-mono text-cyan-700">
                      {short(data?.nft?.tokenId || data?.tokenId || nftId)}
                    </div>
                    <div className="text-slate-500 mt-4">Nhà sản xuất</div>
                    <div className="font-medium">
                      {data?.manufacturer?.name ||
                        data?.drug?.manufacturer ||
                        "N/A"}
                    </div>
                    <div className="text-slate-500 mt-4">Ngày sản xuất</div>
                    <div className="font-medium">
                      {formatDate(data?.drug?.manufacturingDate)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-slate-500">Tên thuốc</div>
                    <div className="font-medium">
                      {data?.drug?.tradeName ||
                        data?.drug?.commercialName ||
                        "N/A"}
                    </div>
                    <div className="text-slate-500 mt-4">Nhà phân phối</div>
                    <div className="font-medium">
                      {data?.distributor?.name || "N/A"}
                    </div>
                    <div className="text-slate-500 mt-4">Hạn sử dụng</div>
                    <div className="font-medium">
                      {formatDate(data?.drug?.expiryDate)}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  {data?.explorerUrl ? (
                    <a
                      href={data.explorerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-6 py-2.5 rounded-full bg-[#3db6d9] hover:bg-[#2fa2c5] text-white font-medium transition"
                    >
                      Xem trên Blockchain →
                    </a>
                  ) : null}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
