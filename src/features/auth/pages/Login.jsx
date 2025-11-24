import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLogin } from "../hooks/useLogin";
import ErrorMessage from "../components/error";

export default function Login() {
  const {
    email,
    password,
    error,
    loading,
    showPassword,
    setShowPassword,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
    handleConnectMetaMask,
    isConnected,
    account,
  } = useLogin();

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-linear-to-br from-[#4BADD1]/5 via-white to-slate-50/50 px-4 pt-16 sm:pt-20 md:pt-24 pb-8 sm:pb-12 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-10 sm:top-20 left-10 w-48 sm:w-72 h-48 sm:h-72 rounded-full"
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
          className="absolute bottom-10 sm:bottom-20 right-10 w-64 sm:w-96 h-64 sm:h-96 rounded-full"
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
        className="max-w-md w-full relative z-10"
        initial="hidden"
        animate="show"
        variants={fadeUp}
      >
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-2 sm:mb-3 font-text-primary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Đăng nhập
          </motion.h1>
          <motion.p
            className="text-sm sm:text-base md:text-lg text-slate-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Hệ thống truy xuất nguồn gốc thuốc
          </motion.p>
        </div>

        {/* Form Card */}
        <motion.div
          className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-[#4BADD1]/20 p-6 sm:p-8 relative overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {/* Decorative linear line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-secondary via-cyan-500 to-[#2F9AC4]"></div>

          {error && <ErrorMessage error={error} />}

          {/* MetaMask Connection Status */}
          {isConnected && account && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 sm:p-4 mb-4">
              <div className="flex items-center gap-2 text-green-700">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-semibold">MetaMask đã kết nối</p>
                  <p className="text-xs text-green-600 mt-0.5">
                    {account.slice(0, 6)}...{account.slice(-4)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {!isConnected && (
            <div className="mb-5">
              <button
                type="button"
                onClick={handleConnectMetaMask}
                className="w-full  py-2.5 sm:py-3 bg-orange-500 hover:bg-orange-600 !text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 text-sm sm:text-base mb-4"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 40 40"
                  fill="currentColor"
                >
                  <path d="M32.7 24.5l-4.5-1.5-2.3 3.5-1.5-0.5 2.3-3.5-4.5-1.5 1-3 4.5 1.5 1.5-2.3 1.5 0.5-1.5 2.3 4.5 1.5-1 3zm-20-8l-4.5-1.5-2.3 3.5-1.5-0.5 2.3-3.5-4.5-1.5 1-3 4.5 1.5 1.5-2.3 1.5 0.5-1.5 2.3 4.5 1.5-1 3z" />
                </svg>
                Kết nối MetaMask
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                onInput={handleEmailChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:border-[#4BADD1] transition text-sm sm:text-base"
                style={{ "--tw-ring-color": "#4BADD1" }}
                placeholder="your@email.com"
                required
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  onInput={handlePasswordChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:border-[#4BADD1] transition pr-10 text-sm sm:text-base"
                  style={{ "--tw-ring-color": "#4BADD1" }}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition text-xs sm:text-sm"
                >
                  {showPassword ? "Ẩn" : "Hiện"}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                to="/forgot-password-business"
                className="text-xs sm:text-sm font-medium hover:underline"
                style={{ color: "#4BADD1" }}
              >
                Quên mật khẩu?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 sm:py-3.5 !text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition transform hover:scale-[1.02] active:scale-[0.98] bg-secondary text-sm sm:text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Đang đăng nhập...
                </span>
              ) : (
                "Đăng nhập"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5 sm:my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs sm:text-sm">
              <span className="px-3 sm:px-4 bg-white text-slate-500">
                Chưa có tài khoản?
              </span>
            </div>
          </div>

          {/* Register Links */}
          <div className="grid grid-cols-1 gap-2 sm:gap-3">
            <Link
              to="/register-business"
              className="py-2 sm:py-2.5 px-3 sm:px-4 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-center transition text-xs sm:text-sm"
              style={{ backgroundColor: "#E8F6FB" }}
            >
              Doanh nghiệp
            </Link>
          </div>
        </motion.div>

        {/* Back to Home */}
        <div className="text-center mt-4 sm:mt-6">
          <Link
            to="/"
            className="text-xs sm:text-sm text-slate-600 hover:text-slate-800 font-medium hover:underline"
          >
            ← Về trang chủ
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
