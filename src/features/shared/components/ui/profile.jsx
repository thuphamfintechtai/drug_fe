import React from "react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export function Profile({ title, subtitle, user, company, roleLabel }) {
  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-card-primary shadow-sm p-5 mb-6">
        <h1 className="text-xl font-semibold text-[#007b91]">{title}</h1>
        <p className="text-slate-500 text-sm mt-1">{subtitle}</p>
      </div>
      <div className="space-y-5">
        {/* User Info */}
        <motion.div
          className="bg-white rounded-2xl border border-cyan-100 shadow-sm overflow-hidden"
          variants={fadeUp}
          initial="hidden"
          animate="show"
        >
          <div className="px-6 py-4 bg-secondary">
            <h2 className="text-xl font-bold !text-white">
              Thông tin tài khoản
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="text-xs text-slate-500 mb-1">Tên đầy đủ</div>
                <div className="font-semibold text-slate-800">
                  {user.fullName || user.username || "N/A"}
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="text-xs text-slate-500 mb-1">Email</div>
                <div className="font-semibold text-slate-800">
                  {user.email || "N/A"}
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="text-xs text-slate-500 mb-1">Vai trò</div>
                <div className="font-semibold text-slate-800">
                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">
                    {roleLabel || "N/A"}
                  </span>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="text-xs text-slate-500 mb-1">Trạng thái</div>
                <div className="font-semibold text-slate-800">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      user.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {user.status || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-200">
              <div className="text-xs text-cyan-700 mb-1">Wallet Address</div>
              <div className="font-mono text-sm text-cyan-800 break-all">
                {user.walletAddress || "Chưa có"}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Company Info */}
        {company && (
          <motion.div
            className="bg-white rounded-2xl border border-cyan-100 shadow-sm overflow-hidden"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            <div className="px-6 py-4 bg-linear-to-r from-[#00b4d8] to-[#48cae4]">
              <h2 className="text-xl font-bold !text-white">
                Thông tin công ty
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-200">
                  <div className="text-xs text-cyan-700 mb-1">Tên công ty</div>
                  <div className="font-bold text-cyan-900 text-lg">
                    {company.name || "N/A"}
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="text-xs text-slate-500 mb-1">Mã số thuế</div>
                  <div className="font-mono font-semibold text-slate-800">
                    {company.taxCode || "N/A"}
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="text-xs text-slate-500 mb-1">
                    Giấy phép kinh doanh
                  </div>
                  <div className="font-mono font-semibold text-slate-800">
                    {company.licenseNo || "N/A"}
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="text-xs text-slate-500 mb-1">Trạng thái</div>
                  <div className="font-semibold text-slate-800">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        company.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {company.status || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <div className="text-xs text-slate-500 mb-1">Địa chỉ</div>
                <div className="font-medium text-slate-800">
                  {company.address || "N/A"}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="text-xs text-slate-500 mb-1">
                    Số điện thoại
                  </div>
                  <div className="font-medium text-slate-800">
                    {company.phone || "N/A"}
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="text-xs text-slate-500 mb-1">Website</div>
                  <div className="font-medium text-slate-800">
                    {company.website || "N/A"}
                  </div>
                </div>
              </div>

              {company.contractAddress && (
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                  <div className="text-xs text-emerald-700 mb-1">
                    Contract Address
                  </div>
                  <div className="font-mono text-sm text-emerald-800 break-all">
                    {company.contractAddress}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Notice */}
        <motion.div
          className="bg-yellow-50 rounded-2xl border border-yellow-200 p-5"
          variants={fadeUp}
          initial="hidden"
          animate="show"
        >
          <div className="flex items-start gap-3">
            <div>
              <div className="font-semibold text-yellow-800 mb-1">
                Lưu ý quan trọng
              </div>
              <div className="text-sm text-yellow-700">
                Thông tin này chỉ được xem và{" "}
                <strong>không thể chỉnh sửa</strong>. Nếu cần thay đổi thông tin
                công ty, vui lòng liên hệ với quản trị viên hệ thống.
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
