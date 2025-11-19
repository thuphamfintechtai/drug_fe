import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../utils/api";
import Navbar from "../components/Navbar";
import toast from "sonner";

export default function PublicNFTTracking() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tokenId, setTokenId] = useState(searchParams.get("tokenId") || "");
  const [journey, setJourney] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (tokenId) {
      handleSearch();
    }
  }, []);

  const handleSearch = async () => {
    if (!tokenId.trim()) {
      toast.error("Vui lòng nhập NFT ID");
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      // Gọi endpoint public mới
      const response = await api.get(`/publicRoute/Tracking/${tokenId.trim()}`);
      console.log("Public Tracking response:", response);
      if (response.data.success) {
        setJourney(response.data.data);
        setSearchParams({ tokenId: tokenId.trim() });
        toast.success("Tra cứu thành công!");
      } else {
        setJourney(null);
        toast.error(response.data.message || "Không tìm thấy NFT này");
      }
    } catch (error) {
      console.error("Lỗi:", error);
      console.error("Error response:", error.response);
      setJourney(null);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể tra cứu NFT. Vui lòng kiểm tra lại Token ID.";
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
    <div className="min-h-screen bg-gradient-to-br mt-16 from-slate-50 via-white to-slate-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <motion.section
          className="relative overflow-hidden rounded-2xl mb-8 border border-[#90e0ef33] shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
          style={{
            backgroundColor: "#077ca3",
          }}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative px-6 py-8 md:px-10 md:py-12 !text-white">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight drop-shadow-sm mb-2">
              Tra cứu hành trình thuốc
            </h1>
            <p className="!text-white/90 text-lg">
              Nhập NFT ID để xem toàn bộ hành trình từ sản xuất đến phân phối
            </p>
          </div>
        </motion.section>

        <motion.div
          className="rounded-2xl bg-white border border-slate-200 shadow-lg p-6 mb-6"
          variants={fadeUp}
          initial="hidden"
          animate="show"
        >
          <div className="flex gap-3">
            <input
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Nhập NFT Token ID (ví dụ: 12345)..."
              className="flex-1 border-2 border-slate-300 bg-white rounded-xl px-5 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#4BADD1] focus:border-[#4BADD1] transition"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-8 py-3 rounded-xl !text-white font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 transition flex items-center justify-center gap-2"
              style={{ backgroundColor: "#4BADD1" }}
            >
              {loading ? (
                "Đang tìm..."
              ) : (
                <>
                  <svg
                    className="w-4 sm:w-5 h-4 sm:h-5 !text-white"
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
                  Tra cứu
                </>
              )}
            </button>
          </div>
          <div className="mt-3 text-sm text-slate-600">
            <strong>Mẹo:</strong> NFT ID thường được in trên bao bì thuốc hoặc
            trong hóa đơn mua hàng
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
                              <span className="text-white/70">
                                Nhà sản xuất:
                              </span>
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
                                  <span className="text-white/70">
                                    Số lượng:
                                  </span>
                                  <span className="font-bold text-white">
                                    {step.details.quantity}
                                  </span>
                                </div>
                              )}
                              {step.details.mfgDate && (
                                <div className="flex items-center gap-2">
                                  <span className="text-white/70">
                                    Ngày sản xuất:
                                  </span>
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
                              <span className="text-white/70">
                                Mã giao dịch
                              </span>
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
                      <div className="text-sm text-[#4BADD1]">
                        Tên hoạt chất
                      </div>
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
                      <div className="text-sm text-[#4BADD1]">
                        Ngày sản xuất
                      </div>
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

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link
            to="/"
            className="text-sm text-slate-600 hover:text-slate-800 font-medium hover:underline"
          >
            ← Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
