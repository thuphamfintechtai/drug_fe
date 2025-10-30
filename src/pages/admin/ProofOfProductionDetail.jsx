import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { getProofById } from "../../services/admin/proofOfProductionService";

export default function AdminProofOfProductionDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigationItems = useMemo(
    () => [
      {
        path: "/admin",
        label: "Trang chủ",
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
        path: "/admin/proof-of-production",
        label: "Proof of Production",
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v12a2 2 0 01-2 2z"
            />
          </svg>
        ),
        active: true,
      },
    ],
    []
  );

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await getProofById(id);
        setData(data?.data || data);
      } catch (err) {
        setError(err?.response?.data?.message || "Không tải được dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const proof = data?.proof;
  const nft = data?.nftInfo;

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
      {/* Banner */}
      <motion.section
        className="relative overflow-hidden rounded-2xl mb-4 border border-[#90e0ef33] shadow-[0_10px_30px_rgba(0,0,0,0.06)] bg-gradient-to-tr from-[#00b4d8] via-[#48cae4] to-[#90e0ef]"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.25),transparent_55%)]" />
        <div className="relative px-6 py-8 md:px-10 md:py-12 text-white">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight drop-shadow-sm">Chi tiết Proof of Production</h1>
          <p className="text-white/90 mt-1">Thông tin sản xuất – minh bạch, chuẩn y tế.</p>
        </div>
      </motion.section>

      {/* Back link */}
      <div className="mb-3">
        <Link to="/admin/proof-of-production" className="inline-flex items-center gap-2 text-cyan-700 hover:text-cyan-800">
          <span>←</span>
          <span>Quay lại danh sách</span>
        </Link>
      </div>

      <motion.div
        className="rounded-2xl bg-white/90 backdrop-blur-xl p-6 border border-[#90e0ef55] shadow-[0_10px_24px_rgba(0,0,0,0.06)]"
        variants={fadeUp}
        initial="hidden"
        animate="show"
      >
        {loading ? (
          <div className="text-gray-500">Đang tải dữ liệu...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : proof ? (
          <div className="space-y-6">
            {/* 🔹 Thông tin chính */}
            <section>
              <h2 className="text-lg font-semibold text-[#003544] mb-2">
                Thông tin sản xuất
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[15px]">
                <div><strong>Batch:</strong> {proof.batchNumber}</div>
                <div><strong>Serial:</strong> {proof.serialNumber}</div>
                <div><strong>Số lượng viên thuốc:</strong> {proof.quantity}</div>
                <div><strong>Ngày sản xuất:</strong> {new Date(proof.mfgDate).toLocaleDateString()}</div>
                <div><strong>Ngày hết hạn:</strong> {new Date(proof.expDate).toLocaleDateString()}</div>
                <div><strong>Trạng thái:</strong>
                  <span
                    className={`ml-2 px-2 py-1 rounded-full text-xs font-medium border ${
                      proof.status === "pending"
                        ? "bg-yellow-50 text-yellow-800 border-yellow-200"
                        : proof.status === "approved"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-50 text-slate-600 border-slate-200"
                    }`}
                  >
                    {proof.status}
                  </span>
                </div>
              </div>
            </section>

            {/* 🔹 Thông tin thuốc */}
            <section>
              <h2 className="text-lg font-semibold text-[#003544] mb-2">
                Thông tin thuốc
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[15px]">
                <div><strong>Tên thương mại:</strong> {proof.drug?.tradeName || proof.drugName}</div>
                <div><strong>Tên hoạt chất:</strong> {proof.genericName}</div>
                <div><strong>Dạng bào chế:</strong> {proof.drug?.dosageForm}</div>
                <div><strong>Hàm lượng:</strong> {proof.drug?.strength}</div>
                <div><strong>Quy cách đóng gói:</strong> {proof.drug?.packaging}</div>
                <div><strong>Mã ATC:</strong> {proof.drug?.atcCode}</div>
              </div>
            </section>

            {/* 🔹 Nhà sản xuất */}
            <section>
              <h2 className="text-lg font-semibold text-[#003544] mb-2">
                Nhà sản xuất
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[15px]">
                <div><strong>Tên:</strong> {proof.manufacturer?.name}</div>
                <div><strong>Địa chỉ:</strong> {proof.manufacturer?.address}</div>
                <div><strong>Email liên hệ:</strong> {proof.manufacturer?.contactEmail}</div>
                <div><strong>Số điện thoại:</strong> {proof.manufacturer?.contactPhone}</div>
              </div>
            </section>

            {/* 🔹 QA Report */}
            {proof.qaReportUri && (
              <section>
                <h2 className="text-lg font-semibold text-[#003544] mb-2">QA Report</h2>
                <a
                  href={proof.qaReportUri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00b4d8] hover:underline text-sm"
                >
                  📄 Tải báo cáo QA
                </a>
              </section>
            )}

            {/* 🔹 Blockchain / NFT */}
            {nft && (
              <section>
                <h2 className="text-lg font-semibold text-[#003544] mb-2">
                  Blockchain / NFT
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div><strong>Token ID:</strong> {nft.tokenId}</div>
                  <div><strong>Địa chỉ hợp đồng:</strong> {nft.contractAddress}</div>
                  <div><strong>Tx Hash:</strong>
                    <a
                      href={`https://zeroscan.org/tx/${nft.chainTxHash}`}
                      className="text-[#00b4d8] hover:underline ml-1"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {nft.chainTxHash.slice(0, 10)}...
                    </a>
                  </div>
                  <div><strong>Trạng thái NFT:</strong> {nft.status}</div>
                  <div><strong>IPFS Metadata:</strong>
                    <a
                      href={nft.ipfsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#00b4d8] hover:underline ml-1"
                    >
                      {nft.ipfsUrl}
                    </a>
                  </div>
                </div>
              </section>
            )}
          </div>
        ) : (
          <div className="text-gray-500">Không có dữ liệu</div>
        )}
      </motion.div>
      <style>{`
        @keyframes float-slow { 0%,100% { transform: translateY(0) } 50% { transform: translateY(10px) } }
      `}</style>
    </DashboardLayout>
  );
}
