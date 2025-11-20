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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <motion.section
          className="relative overflow-hidden rounded-2xl mb-8 border border-[#90e0ef33] shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
          style={{
            background: "linear-gradient(135deg, #4BADD1 0%, #2176FF 100%)",
          }}
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
              className="flex-1 border-2 border-slate-300 bg-white rounded-xl px-5 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#4BADD1] focus:border-[#4BADD1] transition"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-8 py-3 rounded-xl !text-white font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 transition"
              style={{ backgroundColor: "#4BADD1" }}
            >
              {loading ? "⏳ Đang tìm..." : "🔍 Tìm kiếm"}
            </button>
          </div>

          {error && (
            <div
              className={`mt-4 p-4 rounded-lg text-sm ${
                requiresAuth
                  ? "bg-blue-50 border border-blue-200 text-blue-800"
                  : "bg-amber-50 border border-amber-200 text-amber-800"
              }`}
            >
              {requiresAuth ? (
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
              ) : (
                <span>⚠️ {error}</span>
              )}
            </div>
          )}

          {isAuthenticated && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm flex items-center gap-2">
              <span>✅</span>
              <span>
                Bạn đã đăng nhập với tư cách{" "}
                <strong>
                  {user?.role === "system_admin"
                    ? "Quản trị viên"
                    : user?.role === "pharma_company"
                    ? "Nhà sản xuất"
                    : user?.role === "distributor"
                    ? "Nhà phân phối"
                    : user?.role === "pharmacy"
                    ? "Nhà thuốc"
                    : "Người dùng"}
                </strong>
                . Bạn có thể xem đầy đủ thông tin.
              </span>
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
            className="bg-white rounded-2xl border border-red-300 p-10 text-center"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-2xl font-bold text-red-600 mb-2">
              Không tìm thấy
            </h3>
            <p className="text-slate-600">
              Không tìm thấy thông tin thuốc phù hợp. Vui lòng thử lại với từ
              khóa khác.
            </p>
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
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-3">
                      {drug.tradeName || drug.genericName || "N/A"}
                    </h3>
                    {drug.genericName && drug.tradeName && (
                      <p className="text-slate-600 mb-2">
                        <span className="font-semibold">Tên hoạt chất:</span>{" "}
                        {drug.genericName}
                      </p>
                    )}
                    {drug.atcCode && (
                      <p className="text-slate-600 mb-2">
                        <span className="font-semibold">Mã ATC:</span>{" "}
                        <span className="font-mono">{drug.atcCode}</span>
                      </p>
                    )}
                    {!isAuthenticated && (
                      <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
                        🔒 Một số thông tin chi tiết chỉ hiển thị khi đăng nhập
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {drug.dosageForm && (
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="text-sm text-slate-500">
                          Dạng bào chế
                        </div>
                        <div className="font-semibold text-slate-800">
                          {drug.dosageForm}
                        </div>
                      </div>
                    )}
                    {drug.strength && (
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="text-sm text-slate-500">Hàm lượng</div>
                        <div className="font-semibold text-slate-800">
                          {drug.strength}
                        </div>
                      </div>
                    )}
                    {drug.packaging && (
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="text-sm text-slate-500">
                          Quy cách đóng gói
                        </div>
                        <div className="font-semibold text-slate-800">
                          {drug.packaging}
                        </div>
                      </div>
                    )}
                    {drug.manufacturer && (
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="text-sm text-slate-500">
                          Nhà sản xuất
                        </div>
                        <div className="font-semibold text-slate-800">
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

                {/* Thông tin chi tiết chỉ hiển thị khi đã đăng nhập */}
                {isAuthenticated && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <h4 className="font-semibold text-slate-800 mb-3">
                      Thông tin chi tiết
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {drug.route && (
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                          <div className="text-sm text-blue-700">Cách dùng</div>
                          <div className="font-semibold text-blue-900">
                            {drug.route}
                          </div>
                        </div>
                      )}
                      {drug.storage && (
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                          <div className="text-sm text-blue-700">Bảo quản</div>
                          <div className="font-semibold text-blue-900">
                            {drug.storage}
                          </div>
                        </div>
                      )}
                      {drug.activeIngredients &&
                        Array.isArray(drug.activeIngredients) &&
                        drug.activeIngredients.length > 0 && (
                          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 md:col-span-2">
                            <div className="text-sm text-blue-700 mb-1">
                              Thành phần hoạt chất
                            </div>
                            <div className="font-semibold text-blue-900">
                              {drug.activeIngredients.join(", ")}
                            </div>
                          </div>
                        )}
                      {drug.warnings && (
                        <div className="bg-amber-50 rounded-lg p-3 border border-amber-200 md:col-span-2">
                          <div className="text-sm text-amber-700 mb-1">
                            ⚠️ Cảnh báo
                          </div>
                          <div className="text-sm text-amber-900">
                            {drug.warnings}
                          </div>
                        </div>
                      )}
                      {drug.indications && (
                        <div className="bg-green-50 rounded-lg p-3 border border-green-200 md:col-span-2">
                          <div className="text-sm text-green-700 mb-1">
                            📋 Chỉ định
                          </div>
                          <div className="text-sm text-green-900">
                            {drug.indications}
                          </div>
                        </div>
                      )}
                      {drug.contraindications && (
                        <div className="bg-red-50 rounded-lg p-3 border border-red-200 md:col-span-2">
                          <div className="text-sm text-red-700 mb-1">
                            🚫 Chống chỉ định
                          </div>
                          <div className="text-sm text-red-900">
                            {drug.contraindications}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
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
    </div>
  );
}
