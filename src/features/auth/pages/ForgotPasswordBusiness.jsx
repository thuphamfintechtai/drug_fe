import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useForgotPassword } from "../hooks/useForgotPassword";
import ErrorMessage from "../components/error";
import { roles } from "../constants/roles";

export default function ForgotPasswordBusiness() {
  const {
    formData,
    error,
    loading,
    success,
    handleChange,
    handleSubmit,
    role,
    setRole,
  } = useForgotPassword();

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#4BADD1]/5 via-white to-slate-50/50 px-4">
        <motion.div
          className="max-w-md w-full"
          initial="hidden"
          animate="show"
          variants={fadeUp}
        >
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#4BADD1]/10 mb-6">
              <svg
                className="w-10 h-10 text-[#4BADD1]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              Yêu cầu đã được gửi!
            </h2>
            <p className="text-slate-600 mb-6">
              Yêu cầu đặt lại mật khẩu của bạn đã được gửi đến Admin. Sau khi
              Admin phê duyệt, bạn sẽ nhận được email với mật khẩu mới.
            </p>
            <div className="space-y-3">
              <Link
                to="/login"
                className="block w-full py-3 bg-[#4BADD1] !text-white font-semibold rounded-xl hover:bg-[#3a9db8] hover:shadow-lg transition"
              >
                Quay lại đăng nhập
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-10 flex items-center justify-center bg-gradient-to-br from-[#4BADD1]/5 via-white to-slate-50/50 px-4 py-12">
      <motion.div
        className="max-w-2xl w-full"
        initial="hidden"
        animate="show"
        variants={fadeUp}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">
            Quên mật khẩu doanh nghiệp
          </h1>
          <p className="text-slate-600">
            Gửi yêu cầu đặt lại mật khẩu (cần Admin phê duyệt)
          </p>
        </div>

        {/* Role Selector */}
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roles.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={`p-4 rounded-2xl border-2 transition flex flex-col items-center ${
                  role === r.value
                    ? "border-[#4BADD1] bg-[#4BADD1]/10 shadow-lg scale-105"
                    : "border-slate-200 bg-white hover:border-[#4BADD1]/50"
                }`}
              >
                <div
                  className={`mb-2 ${
                    role === r.value ? "text-[#4BADD1]" : "text-slate-800"
                  }`}
                >
                  {r.icon}
                </div>
                <div
                  className={`font-semibold text-center ${
                    role === r.value ? "text-[#4BADD1]" : "text-slate-800"
                  }`}
                >
                  {r.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 p-8">
          {error && <ErrorMessage error={error} />}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4BADD1] focus:border-[#4BADD1] transition"
                  placeholder="email@company.com"
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
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4BADD1] focus:border-[#4BADD1] transition"
                  placeholder="username"
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
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4BADD1] focus:border-[#4BADD1] transition"
                  placeholder="0123456789"
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
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4BADD1] focus:border-[#4BADD1] transition"
                  placeholder="0987654321"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#4BADD1] !text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:bg-[#3a9db8] disabled:opacity-50 disabled:cursor-not-allowed transition transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Đang gửi yêu cầu...
                </span>
              ) : (
                "Gửi yêu cầu đặt lại mật khẩu"
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm text-[#4BADD1] hover:text-[#3a9db8] font-semibold hover:underline"
            >
              ← Quay lại đăng nhập
            </Link>
          </div>
        </div>

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
              <strong>Lưu ý:</strong> Yêu cầu của bạn sẽ được gửi đến Admin để
              xác minh thông tin. Sau khi được phê duyệt, bạn sẽ nhận được email
              chứa mật khẩu mới tạm thời. Bạn có thể đăng nhập và đổi mật khẩu
              sau đó.
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
