import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "../../components/DashboardLayout";
import api from "../../utils/api";
import TruckLoader from "../../components/TruckLoader";
import toast from "react-hot-toast";

export default function PharmacyNFTTracking() {
  const [tokenId, setTokenId] = useState("");
  const [journey, setJourney] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageProgress, setPageProgress] = useState(0);
  const pageIntervalRef = useRef(null);

  const navigationItems = [
    { path: "/pharmacy", label: "Tổng quan", active: true, icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0 7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
      </svg>
    ) },
    { path: "/pharmacy/invoices", label: "Đơn từ NPP", active: false, icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2H7a2 2 0 01-2-2V7a2 2 0 012-2h7l4 4v6a2 2 0 01-2 2h-2v2m-5 0h5"/>
      </svg>
    ) },
    {
      path: "/pharmacy/distribution-history",
      label: "Lịch sử phân phối",
      active: false,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      ),
    },
    { path: "/pharmacy/drugs", label: "Quản lý thuốc", active: false, icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
      </svg>
    ) },
    { path: "/pharmacy/nft-tracking", label: "Tra cứu NFT", active: false, icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4-4m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
    ) },
    { path: "/pharmacy/profile", label: "Hồ sơ", active: false, icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
      </svg>
    ) },
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
    if (!tokenId.trim()) {
      toast.error("Vui lòng nhập NFT ID");
      setError("Vui lòng nhập NFT ID");
      return;
    }

    setLoading(true);
    setSearched(true);
    setError("");
    setJourney(null);
    try {
      // Gọi endpoint public giống như NFTTracking.jsx
      const response = await api.get(`/publicRoute/Tracking/${tokenId.trim()}`);
      console.log("Public Tracking response:", response);
      if (response.data.success) {
        setJourney(response.data.data);
        toast.success("Tra cứu thành công!");
      } else {
        setJourney(null);
        const errorMsg = response.data.message || "Không tìm thấy NFT này";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Lỗi:", error);
      console.error("Error response:", error.response);
      setJourney(null);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể tra cứu NFT. Vui lòng kiểm tra lại Token ID.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
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
            className="rounded-2xl bg-white border border-card-primary shadow-sm p-6 mb-6"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
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
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Nhập NFT Token ID (ví dụ: 12345)..."
                className="w-full h-12 pl-11 pr-32 rounded-full border border-gray-200 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#48cae4] transition"
              />

              <button
                onClick={handleSearch}
                disabled={loading}
                className="absolute right-1 top-1 bottom-1 px-6 rounded-full bg-secondary hover:bg-primary !text-white font-medium transition disabled:opacity-50"
              >
                {loading ? "Đang tra cứu..." : "Tìm Kiếm"}
              </button>
            </div>
            <div className="mt-3 text-sm text-slate-600">
              <strong>Mẹo:</strong> NFT ID thường được in trên bao bì thuốc
              hoặc trong hóa đơn mua hàng
            </div>
          </motion.div>

          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
              <div className="text-xl text-slate-600">
                Đang tra cứu hành trình...
              </div>
            </div>
          ) : !searched ? (
            <motion.div
              className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 p-10 text-center"
              variants={fadeUp}
              initial="hidden"
              animate="show"
            >
              <div className="flex justify-center mb-4">
                <svg
                  className="w-16 h-16 sm:w-20 sm:h-20 text-slate-400"
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
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                Bắt đầu tra cứu
              </h3>
              <p className="text-slate-600 max-w-md mx-auto">
                Nhập NFT Token ID vào ô tìm kiếm phía trên để xem hành trình thuốc
                từ nhà sản xuất đến nhà thuốc
              </p>
            </motion.div>
          ) : !journey ? (
            <motion.div
              className="bg-white rounded-2xl border border-red-300 p-10 text-center"
              variants={fadeUp}
              initial="hidden"
              animate="show"
            >
              <h3 className="text-2xl font-bold text-red-600 mb-2">
                Không tìm thấy NFT
              </h3>
              <p className="text-slate-600">
                Vui lòng kiểm tra lại Token ID hoặc NFT này chưa được tạo trong hệ
                thống
              </p>
            </motion.div>
          ) : (
            <motion.div
              className="space-y-6"
              variants={fadeUp}
              initial="hidden"
              animate="show"
            >
              {/* Thông tin NFT */}
              <div className="bg-gradient-to-br from-[#4BADD1]/10 to-[#3aaad8]/10 rounded-2xl border border-[#4BADD1]/30 p-6">
                <h2 className="text-xl font-bold text-[#077ca3] mb-4 flex items-center gap-2">
                  Thông tin thuốc
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4 border border-[#4BADD1]/50">
                    <div className="text-sm text-[#4BADD1] mb-1">Token ID</div>
                    <div className="text-lg font-bold text-[#077ca3]">
                      {journey.nft?.tokenId || tokenId}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-[#4BADD1]/50">
                    <div className="text-sm text-[#4BADD1] mb-1">Số Serial</div>
                    <div className="text-lg font-bold text-[#077ca3]">
                      {journey.nft?.serialNumber || "N/A"}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-[#4BADD1]/50">
                    <div className="text-sm text-[#4BADD1] mb-1">Tên thuốc</div>
                    <div className="text-lg font-bold text-[#077ca3]">
                      {journey.nft?.drug?.tradeName ||
                        journey.nft?.drug?.genericName ||
                        "N/A"}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-[#4BADD1]/50">
                    <div className="text-sm text-[#4BADD1] mb-1">Số lô</div>
                    <div className="text-lg font-bold text-[#077ca3]">
                      {journey.nft?.batchNumber || "N/A"}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-[#4BADD1]/50">
                    <div className="text-sm text-[#4BADD1] mb-1">
                      Chủ sở hữu hiện tại
                    </div>
                    <div className="text-sm font-mono text-[#077ca3] truncate">
                      {typeof journey.nft?.currentOwner === "object"
                        ? journey.nft.currentOwner.fullName ||
                          journey.nft.currentOwner.username ||
                          journey.nft.currentOwner.name ||
                          "N/A"
                        : journey.nft?.currentOwner || "N/A"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  Hành trình phân phối
                </h2>

                {journey.journey &&
                Array.isArray(journey.journey) &&
                journey.journey.length > 0 ? (
                  <div className="relative space-y-6">
                    {journey.journey.map((step, idx) => (
                      <div key={idx} className="relative">
                        <div className="rounded-xl border border-[#4BADD1]/30 bg-gradient-to-br from-[#4BADD1] via-[#3aaad8] to-[#2f9ac4] p-5 shadow-sm hover:shadow-md transition">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-lg font-bold text-white">
                                {step.description || step.stage || "N/A"}
                              </h3>
                              <div className="text-sm text-white/80 mt-1">
                                {step.date
                                  ? new Date(step.date).toLocaleString("vi-VN")
                                  : "N/A"}
                              </div>
                            </div>
                            {step.stage && (
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white border border-white/30 capitalize">
                                {step.stage}
                              </span>
                            )}
                          </div>

                          <div className="space-y-2 text-sm text-white/85">
                            {step.manufacturer && (
                              <div className="flex items-center gap-2">
                                <span className="text-white/70">Nhà sản xuất:</span>
                                <span className="font-medium text-white">
                                  {typeof step.manufacturer === "object"
                                    ? step.manufacturer.fullName ||
                                      step.manufacturer.username ||
                                      step.manufacturer.name ||
                                      JSON.stringify(step.manufacturer)
                                    : step.manufacturer}
                                </span>
                              </div>
                            )}
                            {step.details && (
                              <>
                                {step.details.quantity && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-white/70">Số lượng:</span>
                                    <span className="font-bold text-white">
                                      {step.details.quantity}
                                    </span>
                                  </div>
                                )}
                                {step.details.mfgDate && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-white/70">Ngày sản xuất:</span>
                                    <span className="font-medium text-white">
                                      {new Date(
                                        step.details.mfgDate
                                      ).toLocaleDateString("vi-VN")}
                                    </span>
                                  </div>
                                )}
                              </>
                            )}
                            {step.quantity && !step.details?.quantity && (
                              <div className="flex items-center gap-2">
                                <span className="text-white/70">Số lượng:</span>
                                <span className="font-bold text-white">
                                  {step.quantity}
                                </span>
                              </div>
                            )}
                            {step.from && (
                              <div className="flex items-center gap-2">
                                <span className="text-white/70">Từ:</span>
                                <span className="font-medium text-white">
                                  {typeof step.from === "object"
                                    ? step.from.fullName ||
                                      step.from.username ||
                                      step.from.name ||
                                      JSON.stringify(step.from)
                                    : step.from}
                                </span>
                              </div>
                            )}
                            {step.to && (
                              <div className="flex items-center gap-2">
                                <span className="text-white/70">Đến:</span>
                                <span className="font-medium text-white">
                                  {typeof step.to === "object"
                                    ? step.to.fullName ||
                                      step.to.username ||
                                      step.to.name ||
                                      JSON.stringify(step.to)
                                    : step.to}
                                </span>
                              </div>
                            )}
                            {step.transactionHash && (
                              <div className="flex items-center gap-2">
                                <span className="text-white/70">Mã giao dịch</span>
                                <span className="font-mono text-xs text-white truncate">
                                  {step.transactionHash}
                                </span>
                              </div>
                            )}
                            {step.notes && (
                              <div className="mt-2 p-3 bg-white/15 rounded-lg border border-white/20">
                                <span className="text-white text-xs">
                                  {step.notes}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-slate-500">
                    <div>Chưa có lịch sử phân phối</div>
                  </div>
                )}
              </div>

              {/* Thông tin thuốc chi tiết */}
              {journey.nft?.drug && (
                <div className="bg-gradient-to-br from-[#4BADD1]/10 to-[#3aaad8]/10 rounded-2xl border border-[#4BADD1]/30 p-6">
                  <h2 className="text-xl font-bold text-[#077ca3] mb-4 flex items-center gap-2">
                    Thông tin chi tiết
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {journey.nft.drug.genericName && (
                      <div className="bg-white rounded-lg p-3 border border-[#4BADD1]/50">
                        <div className="text-sm text-[#4BADD1]">Tên hoạt chất</div>
                        <div className="font-semibold text-[#077ca3]">
                          {journey.nft.drug.genericName}
                        </div>
                      </div>
                    )}
                    {journey.nft.drug.atcCode && (
                      <div className="bg-white rounded-lg p-3 border border-[#4BADD1]/50">
                        <div className="text-sm text-[#4BADD1]">Mã ATC</div>
                        <div className="font-mono font-semibold text-[#077ca3]">
                          {journey.nft.drug.atcCode}
                        </div>
                      </div>
                    )}
                    {journey.nft.drug.dosageForm && (
                      <div className="bg-white rounded-lg p-3 border border-[#4BADD1]/50">
                        <div className="text-sm text-[#4BADD1]">Dạng bào chế</div>
                        <div className="font-semibold text-[#077ca3]">
                          {journey.nft.drug.dosageForm}
                        </div>
                      </div>
                    )}
                    {journey.nft.drug.strength && (
                      <div className="bg-white rounded-lg p-3 border border-[#4BADD1]/50">
                        <div className="text-sm text-[#4BADD1]">Hàm lượng</div>
                        <div className="font-semibold text-[#077ca3]">
                          {journey.nft.drug.strength}
                        </div>
                      </div>
                    )}
                    {journey.nft.drug.packaging && (
                      <div className="bg-white rounded-lg p-3 border border-[#4BADD1]/50">
                        <div className="text-sm text-[#4BADD1]">
                          Quy cách đóng gói
                        </div>
                        <div className="font-semibold text-[#077ca3]">
                          {journey.nft.drug.packaging}
                        </div>
                      </div>
                    )}
                    {journey.nft.mfgDate && (
                      <div className="bg-white rounded-lg p-3 border border-[#4BADD1]/50">
                        <div className="text-sm text-[#4BADD1]">Ngày sản xuất</div>
                        <div className="font-semibold text-[#077ca3]">
                          {new Date(journey.nft.mfgDate).toLocaleDateString(
                            "vi-VN"
                          )}
                        </div>
                      </div>
                    )}
                    {journey.nft.expDate && (
                      <div className="bg-white rounded-lg p-3 border border-[#4BADD1]/50">
                        <div className="text-sm text-[#4BADD1]">Hạn sử dụng</div>
                        <div className="font-semibold text-[#077ca3]">
                          {new Date(journey.nft.expDate).toLocaleDateString(
                            "vi-VN"
                          )}
                        </div>
                      </div>
                    )}
                    {journey.nft.drug.manufacturer && (
                      <div className="bg-white rounded-lg p-3 border border-[#4BADD1]/50">
                        <div className="text-sm text-[#4BADD1]">Nhà sản xuất</div>
                        <div className="font-semibold text-[#077ca3]">
                          {typeof journey.nft.drug.manufacturer === "object"
                            ? journey.nft.drug.manufacturer.name ||
                              journey.nft.drug.manufacturer.fullName ||
                              JSON.stringify(journey.nft.drug.manufacturer)
                            : journey.nft.drug.manufacturer}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
