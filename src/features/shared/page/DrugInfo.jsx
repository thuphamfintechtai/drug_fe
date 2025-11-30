import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import { toast } from "sonner";
import { useDrugInfo } from "../hooks/useDrugInfo";

export default function PublicDrugInfo() {
  const {
    searchTerm,
    setSearchTerm,
    searchType,
    handleSearch,
    drugs,
    loading,
    searched,
    error,
    isAuthenticated,
    user,
    requiresAuth,
  } = useDrugInfo();
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
    <div className="min-h-screen mt-16 bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <motion.section
          className="relative overflow-hidden rounded-2xl mb-8 border border-[#90e0ef33] shadow-[0_10px_30px_rgba(0,0,0,0.06)] bg-gradient-to-r from-primary to-secondary"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative px-6 py-8 md:px-10 md:py-12 !text-white">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight drop-shadow-sm mb-2">
              Tra cứu thông tin thuốc
            </h1>
            <p className="!text-white/90 text-lg">
              Tìm kiếm thông tin thuốc theo tên hoặc mã ATC
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder={
                searchType === "atc"
                  ? "Nhập mã ATC (ví dụ: A01AA01)..."
                  : "Nhập tên thuốc..."
              }
              className="flex-1 border-2 border-slate-300 bg-white rounded-xl px-5 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-8 py-3 rounded-xl !text-white font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 transition bg-gradient-to-r from-primary to-secondary"
              style={{ backgroundColor: "#4BADD1" }}
            >
              {loading ? "⏳ Đang tìm..." : "Tìm kiếm"}
            </button>
          </div>

          {error && (
            <div
              className={`${
                requiresAuth &&
                "bg-blue-50 border border-blue-200 text-blue-800"
              }`}
            >
              {requiresAuth && (
                <div>
                  <div className="flex items-start gap-2 mb-2">
                    <span>🔒</span>
                    <div className="flex-1">
                      <p className="font-semibold mb-1">{error}</p>
                      <p className="text-sm text-blue-700 mb-3">
                        Đăng nhập để xem đầy đủ thông tin thuốc bao gồm: thành
                        phần chi tiết, hướng dẫn sử dụng, tương tác thuốc, và
                        thông tin nhà sản xuất.
                      </p>
                      <div className="flex gap-2">
                        <Link
                          to="/register-business"
                          className="px-4 py-2 bg-[#4BADD1] !text-white rounded-lg font-medium hover:opacity-90 transition text-sm"
                        >
                          Đăng ký tài khoản
                        </Link>
                        <button
                          onClick={() => {
                            toast.info(
                              "Vui lòng liên hệ quản trị viên để được cấp tài khoản đăng nhập"
                            );
                          }}
                          className="px-4 py-2 bg-white border-2 border-[#4BADD1] text-[#4BADD1] rounded-lg font-medium hover:bg-[#4BADD1] hover:!text-white transition text-sm"
                        >
                          Liên hệ đăng nhập
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
            <div className="text-xl text-slate-600">
              Đang tìm kiếm thông tin thuốc...
            </div>
          </div>
        ) : !searched ? (
          <motion.div
            className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 p-10 text-center"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            <div className="text-6xl mb-4">💊</div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">
              Bắt đầu tra cứu
            </h3>
            <p className="text-slate-600 max-w-md mx-auto">
              Nhập tên thuốc hoặc mã ATC vào ô tìm kiếm phía trên để xem thông
              tin chi tiết
            </p>
          </motion.div>
        ) : drugs.length === 0 ? (
          <motion.div
            className="relative overflow-hidden rounded-2xl border border-[#90e0ef33] shadow-[0_10px_30px_rgba(0,0,0,0.06)]  p-10 text-center"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            <div className="absolute inset-0" />
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full  blur-xl animate-float-slow" />
              <div className="absolute top-8 right-6 w-16 h-8 rounded-fullblur-md rotate-6 animate-float-slower" />
            </div>
            <div className="relative">
              <div className="text-7xl mb-6 animate-bounce-slow">🔍</div>
              <h3 className="text-3xl font-bold text-slate-800 mb-3 drop-shadow-sm">
                Không tìm thấy
              </h3>
              <p className="text-slate-600 text-lg max-w-md mx-auto leading-relaxed">
                Không tìm thấy thông tin thuốc phù hợp với từ khóa của bạn. Vui
                lòng thử lại với từ khóa khác hoặc kiểm tra lại chính tả.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center items-center">
                <button
                  onClick={() => {
                    setSearchTerm("");
                    handleSearch();
                  }}
                  className="px-6 py-3 rounded-xl !text-white font-semibold shadow-lg hover:shadow-xl transition bg-gradient-to-r from-[#007b91] to-secondary"
                >
                  🔄 Thử lại
                </button>
                <Link
                  to="/"
                  className="px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition bg-white border-2 border-slate-300 text-slate-700 hover:border-[#48cae4] hover:text-[#48cae4]"
                >
                  ← Về trang chủ
                </Link>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-4"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            {drugs.map((drug, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-secondary border-b border-primary px-6 py-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {drug.tradeName || drug.genericName || "N/A"}
                    </h3>
                    {drug.genericName && drug.tradeName && (
                      <p className="text-sm text-white mt-1">{drug.atcCode}</p>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-0 divide-y divide-slate-200">
                    {drug.genericName && (
                      <div className="flex flex-col sm:flex-row sm:items-center py-4 first:pt-0">
                        <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 flex-shrink-0 mb-1 sm:mb-0">
                          Tên hoạt chất
                        </div>
                        <div className="text-base font-semibold text-slate-800 flex-1">
                          {drug.genericName}
                        </div>
                      </div>
                    )}
                    {drug.atcCode && (
                      <div className="flex flex-col sm:flex-row sm:items-center py-4">
                        <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 flex-shrink-0 mb-1 sm:mb-0">
                          Mã ATC
                        </div>
                        <div className="text-base font-semibold text-slate-800 font-mono flex-1">
                          {drug.atcCode}
                        </div>
                      </div>
                    )}
                    {drug.dosageForm && (
                      <div className="flex flex-col sm:flex-row sm:items-center py-4">
                        <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 flex-shrink-0 mb-1 sm:mb-0">
                          Dạng bào chế
                        </div>
                        <div className="text-base font-semibold text-slate-800 flex-1">
                          {drug.dosageForm}
                        </div>
                      </div>
                    )}
                    {drug.strength && (
                      <div className="flex flex-col sm:flex-row sm:items-center py-4">
                        <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 flex-shrink-0 mb-1 sm:mb-0">
                          Hàm lượng
                        </div>
                        <div className="text-base font-semibold text-slate-800 flex-1">
                          {drug.strength}
                        </div>
                      </div>
                    )}
                    {drug.packaging && (
                      <div className="flex flex-col sm:flex-row sm:items-center py-4">
                        <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 flex-shrink-0 mb-1 sm:mb-0">
                          Quy cách đóng gói
                        </div>
                        <div className="text-base font-semibold text-slate-800 flex-1">
                          {drug.packaging}
                        </div>
                      </div>
                    )}
                    {drug.manufacturer && (
                      <div className="flex flex-col sm:flex-row sm:items-center py-4 last:pb-0">
                        <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 flex-shrink-0 mb-1 sm:mb-0">
                          Nhà sản xuất
                        </div>
                        <div className="text-base font-semibold text-slate-800 flex-1">
                          {typeof drug.manufacturer === "object"
                            ? drug.manufacturer.name ||
                              drug.manufacturer.fullName ||
                              "N/A"
                            : drug.manufacturer}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
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

      <style>{`
        @keyframes float-slow { 0%,100% { transform: translateY(0) } 50% { transform: translateY(10px) } }
        @keyframes float-slower { 0%,100% { transform: translateY(0) } 50% { transform: translateY(6px) } }
        @keyframes bounce-slow { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-8px) } }
        .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 3s ease-in-out infinite; }
        .animate-float-slower { animation: float-slower 4s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
