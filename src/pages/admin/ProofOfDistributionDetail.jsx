import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardLayout from "../../components/DashboardLayout";
import { getDistributionById } from "../../services/admin/proofOfDistributionService";

export default function AdminProofOfDistributionDetail() {
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
        path: "/admin/proof-of-distribution",
        label: "Proof of Distribution",
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
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await getDistributionById(id);
        setData(data?.data || data);
      } catch (e) {
        setError(e?.response?.data?.message || "Không tải được dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const fadeUp = {
    hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const item = data;
  const nft = item?.nftInfo;

  return (
    <DashboardLayout navigationItems={navigationItems}>
      {/* 🌈 Banner */}
      <motion.section
        className="relative overflow-hidden rounded-2xl mb-4 border border-[#90e0ef33] shadow-[0_10px_30px_rgba(0,0,0,0.06)] bg-gradient-to-tr from-[#00b4d8] via-[#48cae4] to-[#90e0ef]"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.25),transparent_55%)]" />
        <div className="relative px-6 py-8 md:px-10 md:py-12 text-white">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight drop-shadow-sm">
            Chi tiết Proof of Distribution
          </h1>
          <p className="text-white/90 mt-1">
            Minh chứng phân phối thuốc – minh bạch và đáng tin cậy.
          </p>
        </div>
      </motion.section>

      {/* 🔙 Back link */}
      <div className="mb-3">
        <Link
          to="/admin/proof-of-distribution"
          className="inline-flex items-center gap-2 text-cyan-700 hover:text-cyan-800"
        >
          <span>←</span>
          <span>Quay lại danh sách</span>
        </Link>
      </div>

      <motion.div
        className="rounded-2xl bg-white/90 backdrop-blur-xl border border-[#90e0ef55] shadow-[0_10px_24px_rgba(0,0,0,0.06)] p-6"
        variants={fadeUp}
        initial="hidden"
        animate="show"
      >
        {loading ? (
          <div className="text-gray-500">Đang tải dữ liệu...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : item ? (
          <div className="space-y-8">
            {/* 🔹 Thông tin chính */}
            <section>
              <h2 className="text-lg font-semibold text-[#003544] mb-2">
                Thông tin phân phối
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[15px]">
                <div><strong>Số lượng phân phối:</strong> {item.distributedQuantity}</div>
                <div><strong>Trạng thái:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium border ${
                    item.status === "delivered"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-yellow-50 text-yellow-800 border-yellow-200"
                  }`}>
                    {item.status}
                  </span>
                </div>
                <div><strong>Ngày phân phối:</strong> {new Date(item.distributionDate).toLocaleDateString()}</div>
                <div><strong>Mã xác minh:</strong> {item.verificationCode}</div>
                <div><strong>Ghi chú:</strong> {item.notes || "—"}</div>
              </div>
            </section>

            {/* 🔹 Nhà phân phối */}
            <section>
              <h2 className="text-lg font-semibold text-[#003544] mb-2">Nhà phân phối</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[15px]">
                <div><strong>Tên:</strong> {item.toDistributor?.fullName}</div>
                <div><strong>Email:</strong> {item.toDistributor?.email}</div>
                <div><strong>Tên đăng nhập:</strong> {item.toDistributor?.username}</div>
              </div>
            </section>

            {/* 🔹 Địa chỉ giao hàng */}
            {item.deliveryAddress && (
              <section>
                <h2 className="text-lg font-semibold text-[#003544] mb-2">Địa chỉ giao hàng</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[15px]">
                  <div><strong>Đường:</strong> {item.deliveryAddress.street}</div>
                  <div><strong>Thành phố:</strong> {item.deliveryAddress.city}</div>
                  <div><strong>Tỉnh:</strong> {item.deliveryAddress.state}</div>
                  <div><strong>Mã bưu điện:</strong> {item.deliveryAddress.postalCode}</div>
                  <div><strong>Quốc gia:</strong> {item.deliveryAddress.country}</div>
                </div>
              </section>
            )}

            {/* 🔹 Vận chuyển */}
            {item.shippingInfo && (
              <section>
                <h2 className="text-lg font-semibold text-[#003544] mb-2">Thông tin vận chuyển</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[15px]">
                  <div><strong>Đơn vị vận chuyển:</strong> {item.shippingInfo.carrier}</div>
                  <div><strong>Mã theo dõi:</strong> {item.shippingInfo.trackingNumber}</div>
                  <div><strong>Dự kiến giao:</strong> {new Date(item.shippingInfo.estimatedDelivery).toLocaleDateString()}</div>
                </div>
              </section>
            )}

            {/* 🔹 Blockchain / NFT */}
            {nft && (
              <section>
                <h2 className="text-lg font-semibold text-[#003544] mb-2">Blockchain / NFT</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[15px]">
                  <div><strong>Token ID:</strong> {nft.tokenId}</div>
                  <div><strong>Contract:</strong> {nft.contractAddress}</div>
                  <div><strong>Tx Hash:</strong> 
                    <a
                      href={`https://zeroscan.org//tx/${nft.chainTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#00b4d8] hover:underline ml-1"
                    >
                      {nft.chainTxHash.slice(0, 10)}...
                    </a>
                  </div>
                  <div><strong>Trạng thái NFT:</strong> {nft.status}</div>
                  <div><strong>IPFS:</strong> 
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
    </DashboardLayout>
  );
}
