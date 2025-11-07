import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardLayout from "../../components/DashboardLayout";
import {
  getRegistrationById,
  approveRegistration,
  rejectRegistration,
  retryRegistrationBlockchain,
} from "../../services/admin/adminService";

export default function AdminRegistrationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

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
        path: "/admin/registrations",
        label: "Duyệt đăng ký",
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
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
        const { data } = await getRegistrationById(id);
        setItem(data?.data);
      } catch (e) {
        setError(e?.response?.data?.message || "Không thể tải dữ liệu");
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

  const handleApprove = async () => {
    setActionLoading(true);
    setError("");
    try {
      await approveRegistration(id);
      navigate("/admin/registrations");
    } catch (e) {
      setError(e?.response?.data?.message || "Không thể duyệt đơn");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setError("Vui lòng nhập lý do từ chối");
      return;
    }
    setActionLoading(true);
    setError("");
    try {
      await rejectRegistration(id, rejectReason);
      navigate("/admin/registrations");
    } catch (e) {
      setError(e?.response?.data?.message || "Không thể từ chối đơn");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRetry = async () => {
    setActionLoading(true);
    setError("");
    try {
      await retryRegistrationBlockchain(id);
      const { data } = await getRegistrationById(id);
      setItem(data?.data);
    } catch (e) {
      setError(e?.response?.data?.message || "Retry blockchain thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <DashboardLayout navigationItems={navigationItems}>
      {/* Banner */}
      <motion.section
        className="relative overflow-hidden rounded-2xl mb-4 border border-[#90e0ef33] shadow-[0_10px_30px_rgba(0,0,0,0.06)] bg-gradient-to-tr from-secondary to-primary"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.25),transparent_55%)]" />
        <div className="relative px-6 py-8 md:px-10 md:py-12 text-white">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight drop-shadow-sm">
            Chi tiết đơn đăng ký
          </h1>
          <p className="text-white/90 mt-1">
            Quản trị phê duyệt – minh bạch, chuẩn y tế.
          </p>
        </div>
      </motion.section>

      {/* Back link */}
      <div className="mb-3">
        <Link
          to="/admin/registrations"
          className="inline-flex items-center gap-2 text-cyan-700 hover:text-cyan-800"
        >
          <span>←</span>
          <span>Quay lại danh sách</span>
        </Link>
      </div>

      {/* Detail card */}
      <motion.div
        className="rounded-2xl bg-white/90 backdrop-blur-xl border border-[#90e0ef55] shadow-[0_10px_24px_rgba(0,0,0,0.05)] p-5"
        variants={fadeUp}
        initial="hidden"
        animate="show"
      >
        {loading ? (
          <div>Đang tải...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : item ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-800">
                  Đơn đăng ký
                </h2>
                <p className="text-sm text-[#003544]/70">ID: {item._id}</p>
              </div>
              <span
                className="px-3 py-1 rounded-full text-sm border"
                style={{
                  background:
                    item.status === "pending"
                      ? "rgba(251,191,36,0.1)"
                      : item.status === "approved"
                      ? "rgba(16,185,129,0.1)"
                      : item.status === "rejected"
                      ? "rgba(239,68,68,0.1)"
                      : "rgba(100,116,139,0.08)",
                  color:
                    item.status === "pending"
                      ? "#a16207"
                      : item.status === "approved"
                      ? "#065f46"
                      : item.status === "rejected"
                      ? "#991b1b"
                      : "#334155",
                  borderColor:
                    item.status === "pending"
                      ? "#f59e0b33"
                      : item.status === "approved"
                      ? "#10b98133"
                      : item.status === "rejected"
                      ? "#ef444433"
                      : "#94a3b833",
                }}
              >
                {item.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-[#90e0ef55] bg-white/60 rounded-xl">
                <h3 className="font-medium mb-2 text-[#003544]">Người dùng</h3>
                <div className="text-sm text-[#003544]">
                  {item.user?.fullName || item.user?.username}
                </div>
                <div className="text-sm text-[#003544]/70">
                  {item.user?.email}
                </div>
                <div className="text-sm text-[#003544]/70">
                  {item.user?.walletAddress}
                </div>
              </div>
              <div className="p-4 border border-[#90e0ef55] bg-white/60 rounded-xl">
                <h3 className="font-medium mb-2 text-[#003544]">
                  Thông tin doanh nghiệp
                </h3>
                <div className="text-sm text-[#003544]">
                  Tên: {item.companyInfo?.name}
                </div>
                <div className="text-sm text-[#003544]">
                  Vai trò: {item.role}
                </div>
                <div className="text-sm text-[#003544]">
                  Giấy phép: {item.companyInfo?.licenseNo}
                </div>
                <div className="text-sm text-[#003544]">
                  Mã số thuế: {item.companyInfo?.taxCode}
                </div>
                {item.role === "pharma_company" && (
                  <div className="text-sm text-[#003544]">
                    GMP: {item.companyInfo?.gmpCertNo}
                  </div>
                )}
                <div className="text-sm text-[#003544]">
                  Wallet: {item.companyInfo?.walletAddress}
                </div>
              </div>
            </div>

            {(item.transactionHash || item.contractAddress) && (
              <div className="p-4 border border-slate-200 rounded-xl">
                <h3 className="font-medium mb-2 text-slate-800">Blockchain</h3>
                {item.transactionHash && (
                  <div className="text-sm text-slate-800">
                    TX: {item.transactionHash}
                  </div>
                )}
                {item.contractAddress && (
                  <div className="text-sm text-slate-800">
                    Contract: {item.contractAddress}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center gap-3">
              {item.status === "pending" && (
                <>
                  <button
                    disabled={actionLoading}
                    onClick={handleApprove}
                    className="px-4 py-2.5 rounded-xl text-white bg-gradient-to-r from-emerald-500 to-green-600 shadow hover:shadow-emerald-200/60 disabled:opacity-60"
                  >
                    Duyệt
                  </button>
                  <div className="flex items-center gap-2">
                    <input
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Lý do từ chối"
                      className="border border-[#90e0ef55] bg-white/60 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#48cae4] focus:border-[#48cae4]"
                    />
                    <button
                      disabled={actionLoading}
                      onClick={handleReject}
                      className="px-4 py-2.5 rounded-xl text-white bg-gradient-to-r from-rose-500 to-red-600 shadow hover:shadow-rose-200/60 disabled:opacity-60"
                    >
                      Từ chối
                    </button>
                  </div>
                </>
              )}
              {item.status === "blockchain_failed" && (
                <button
                  disabled={actionLoading}
                  onClick={handleRetry}
                  className="px-4 py-2.5 rounded-xl text-white bg-gradient-to-r from-[#00b4d8] via-[#48cae4] to-[#90e0ef] shadow-[0_10px_24px_rgba(0,180,216,0.30)] hover:shadow-[0_14px_36px_rgba(0,180,216,0.40)] disabled:opacity-60"
                >
                  Retry blockchain
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-slate-600">Không tìm thấy dữ liệu</div>
        )}
      </motion.div>
      <style>{`
        @keyframes float-slow { 0%,100% { transform: translateY(0) } 50% { transform: translateY(10px) } }
      `}</style>
    </DashboardLayout>
  );
}
