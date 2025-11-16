import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useRegisterBusiness } from "../hooks/useRegisterBusiness";
import { businessTypes } from "../constants/businessTypes";

export default function RegisterBusiness() {
  const {
    businessType,
    formData,
    error,
    loading,
    showPassword,
    handleChange,
    handleSubmit,
    setBusinessType,
  } = useRegisterBusiness();

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-gradient-to-br from-[#4BADD1]/5 via-white to-slate-50/50 px-4 pt-24 pb-12 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 rounded-full"
          style={{ backgroundColor: "#4BADD1", opacity: 0.1 }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 rounded-full"
          style={{ backgroundColor: "#4BADD1", opacity: 0.08 }}
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
      <motion.div
        className="max-w-4xl w-full relative z-10"
        initial="hidden"
        animate="show"
        variants={fadeUp}
      >
        {/* Header */}
        <div className="text-center mb-10">
          <motion.h1
            className="text-5xl font-extrabold mb-3 text-[#4BADD1]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Đăng ký doanh nghiệp
          </motion.h1>
          <motion.p
            className="text-slate-600 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Tham gia hệ thống truy xuất nguồn gốc thuốc
          </motion.p>
        </div>

        {/* Business Type Selector */}
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {businessTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setBusinessType(type.value)}
                className={`p-4 rounded-2xl border-2 transition flex flex-col items-center ${
                  businessType === type.value
                    ? "border-[#4BADD1] bg-[#4BADD1]/10 shadow-lg scale-105"
                    : "border-slate-200 bg-white hover:border-[#4BADD1]/50"
                }`}
              >
                <div
                  className={`mb-2 ${
                    businessType === type.value
                      ? "text-[#4BADD1]"
                      : "text-slate-800"
                  }`}
                >
                  {type.icon}
                </div>
                <div
                  className={`font-semibold text-center ${
                    businessType === type.value
                      ? "text-[#4BADD1]"
                      : "text-slate-800"
                  }`}
                >
                  {type.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <motion.div
          className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-[#4BADD1]/20 p-8 relative overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {/* Decorative gradient line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#4BADD1] via-cyan-400 to-[#4BADD1]"></div>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-2"
            >
              <svg
                className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section: Thông tin tài khoản */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-slate-800"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Thông tin tài khoản
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Tên đăng nhập *
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Mật khẩu *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition pr-12"
                      required
                      minLength={6}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? (
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
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      ) : (
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
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Xác nhận mật khẩu *
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Section: Thông tin doanh nghiệp */}
            <div className="pt-6 border-t border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-slate-800"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                Thông tin doanh nghiệp
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Tên doanh nghiệp *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Mã số thuế *
                  </label>
                  <input
                    type="text"
                    name="taxCode"
                    value={formData.taxCode}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Số giấy phép
                  </label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    disabled={loading}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Địa chỉ *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email doanh nghiệp
                  </label>
                  <input
                    type="email"
                    name="companyEmail"
                    value={formData.companyEmail}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    SĐT doanh nghiệp
                  </label>
                  <input
                    type="tel"
                    name="companyPhone"
                    value={formData.companyPhone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Địa chỉ ví (Wallet)
                  </label>
                  <input
                    type="text"
                    name="walletAddress"
                    value={formData.walletAddress}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    placeholder="0x..."
                    disabled={loading}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Mô tả
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    rows="3"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#4BADD1] !text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:bg-[#3a9db8] disabled:opacity-50 disabled:cursor-not-allowed transition transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Đang gửi đăng ký...
                </span>
              ) : (
                "Gửi đăng ký"
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-slate-600">
              Đã có tài khoản?{" "}
              <Link
                to="/login"
                className="text-[#4BADD1] hover:text-[#3a9db8] font-semibold hover:underline"
              >
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 rounded-2xl border border-blue-200 p-4">
          <p className="text-sm text-blue-800 flex items-start gap-2">
            <svg
              className="w-5 h-5 text-blue-800 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              <strong>Lưu ý:</strong> Sau khi gửi đăng ký, tài khoản của bạn cần
              được Admin phê duyệt. Bạn sẽ nhận được thông báo qua email khi tài
              khoản được kích hoạt.
            </span>
          </p>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-sm text-slate-600 hover:text-slate-800 font-medium hover:underline"
          >
            ← Về trang chủ
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
