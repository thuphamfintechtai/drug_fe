import { motion } from "framer-motion";
import DashboardLayout from "../../shared/components/DashboardLayout";
import TruckLoader from "../../shared/components/TruckLoader";
import { useDrugDetail } from "../hooks/useDrugDetail";
import { navigationItems } from "../constants/navigationItems";

export default function DrugDetail() {
  const { drugData, loading, error, loadingProgress, translateStatus, id } =
    useDrugDetail();

  const fadeUp = {
    hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  if (!id) {
    return null;
  }

  return (
    <DashboardLayout navigationItems={navigationItems}>
      {/* Banner */}
      <motion.section
        className="relative overflow-hidden rounded-2xl mb-6 border border-[#90e0ef33] shadow-[0_10px_30px_rgba(0,0,0,0.06)] bg-gradient-to-r from-primary to-secondary"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative px-6 py-8 md:px-10 md:py-12 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight drop-shadow-sm mb-2">
                Chi tiết thuốc
              </h2>
              <p className="text-white/90">
                Thông tin đầy đủ về thuốc và chuỗi cung ứng
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="w-full max-w-2xl">
            <TruckLoader height={72} progress={loadingProgress} showTrack />
          </div>
          <div className="text-lg text-slate-600 mt-6">Đang tải dữ liệu...</div>
        </div>
      ) : error ? (
        <motion.div
          className="rounded-2xl bg-white border border-red-200 shadow-sm p-6"
          variants={fadeUp}
          initial="hidden"
          animate="show"
        >
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        </motion.div>
      ) : drugData?.drug ? (
        <div className="space-y-6">
          {/* Thông tin cơ bản */}
          <motion.div
            className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-secondary border-b border-primary/20 px-6 py-4">
              <h3 className="text-lg font-semibold text-white">
                Thông tin cơ bản
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-0 divide-y divide-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center py-4 first:pt-0">
                  <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0">
                    Tên thương mại
                  </div>
                  <div className="text-base text-slate-800 flex-1">
                    {drugData.drug.tradeName || "N/A"}
                  </div>
                </div>
                {drugData.drug.genericName && (
                  <div className="flex flex-col sm:flex-row sm:items-center py-4">
                    <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0">
                      Tên hoạt chất
                    </div>
                    <div className="text-base text-slate-800 flex-1">
                      {drugData.drug.genericName}
                    </div>
                  </div>
                )}
                {drugData.drug.atcCode && (
                  <div className="flex flex-col sm:flex-row sm:items-center py-4">
                    <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0">
                      Mã ATC
                    </div>
                    <div className="text-base text-slate-800 font-mono flex-1">
                      {drugData.drug.atcCode}
                    </div>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row sm:items-center py-4 last:pb-0">
                  <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0">
                    Trạng thái
                  </div>
                  <div className="flex-1">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                        drugData.drug.status === "active"
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                          : drugData.drug.status === "inactive"
                          ? "bg-slate-50 text-slate-600 border border-slate-200"
                          : "bg-red-50 text-red-600 border border-red-200"
                      }`}
                    >
                      {translateStatus(drugData.drug.status)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Nhà sản xuất */}
          {drugData.drug.manufacturer && (
            <motion.div
              className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden"
              variants={fadeUp}
              initial="hidden"
              animate="show"
            >
              <div className="bg-gradient-to-r from-primary to-secondary border-b border-primary/20 px-6 py-4">
                <h3 className="text-lg font-semibold text-white">
                  Nhà sản xuất
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-0 divide-y divide-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center py-4 first:pt-0">
                    <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0">
                      Tên công ty
                    </div>
                    <div className="text-base text-slate-800 flex-1">
                      {drugData.drug.manufacturer.name || "N/A"}
                    </div>
                  </div>
                  {drugData.drug.manufacturer.licenseNo && (
                    <div className="flex flex-col sm:flex-row sm:items-center py-4">
                      <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0">
                        Số giấy phép
                      </div>
                      <div className="text-base text-slate-800 flex-1">
                        {drugData.drug.manufacturer.licenseNo}
                      </div>
                    </div>
                  )}
                  {drugData.drug.manufacturer.taxCode && (
                    <div className="flex flex-col sm:flex-row sm:items-center py-4">
                      <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0">
                        Mã số thuế
                      </div>
                      <div className="text-base text-slate-800 font-mono flex-1">
                        {drugData.drug.manufacturer.taxCode}
                      </div>
                    </div>
                  )}
                  {drugData.drug.manufacturer.country && (
                    <div className="flex flex-col sm:flex-row sm:items-center py-4">
                      <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0">
                        Quốc gia
                      </div>
                      <div className="text-base text-slate-800 flex-1">
                        {drugData.drug.manufacturer.country}
                      </div>
                    </div>
                  )}
                  {drugData.drug.manufacturer.address && (
                    <div className="flex flex-col sm:flex-row sm:items-start py-4">
                      <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0 sm:pt-1">
                        Địa chỉ
                      </div>
                      <div className="text-base text-slate-800 flex-1">
                        {drugData.drug.manufacturer.address}
                      </div>
                    </div>
                  )}
                  {drugData.drug.manufacturer.contactEmail && (
                    <div className="flex flex-col sm:flex-row sm:items-center py-4">
                      <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0">
                        Email
                      </div>
                      <div className="text-base text-slate-800 flex-1">
                        {drugData.drug.manufacturer.contactEmail}
                      </div>
                    </div>
                  )}
                  {drugData.drug.manufacturer.contactPhone && (
                    <div className="flex flex-col sm:flex-row sm:items-center py-4">
                      <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0">
                        Số điện thoại
                      </div>
                      <div className="text-base text-slate-800 flex-1">
                        {drugData.drug.manufacturer.contactPhone}
                      </div>
                    </div>
                  )}
                  {drugData.drug.manufacturer.walletAddress && (
                    <div className="flex flex-col sm:flex-row sm:items-start py-4 last:pb-0">
                      <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0 sm:pt-1">
                        Wallet Address
                      </div>
                      <div className="text-base text-slate-800 flex-1">
                        {drugData.drug.manufacturer.walletAddress}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Thông tin bào chế */}
          <motion.div
            className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            <div className="bg-gradient-to-r from-primary to-secondary border-b border-primary/20 px-6 py-4">
              <h3 className="text-lg font-semibold text-white">
                Thông tin bào chế
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-0 divide-y divide-slate-200">
                {drugData.drug.dosageForm && (
                  <div className="flex flex-col sm:flex-row sm:items-center py-4 first:pt-0">
                    <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0">
                      Dạng bào chế
                    </div>
                    <div className="text-base text-slate-800 flex-1">
                      {drugData.drug.dosageForm}
                    </div>
                  </div>
                )}
                {drugData.drug.strength && (
                  <div className="flex flex-col sm:flex-row sm:items-center py-4">
                    <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0">
                      Hàm lượng
                    </div>
                    <div className="text-base text-slate-800 flex-1">
                      {drugData.drug.strength}
                    </div>
                  </div>
                )}
                {drugData.drug.route && (
                  <div className="flex flex-col sm:flex-row sm:items-center py-4">
                    <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0">
                      Cách dùng
                    </div>
                    <div className="text-base text-slate-800 flex-1">
                      {drugData.drug.route}
                    </div>
                  </div>
                )}
                {drugData.drug.packaging && (
                  <div className="flex flex-col sm:flex-row sm:items-center py-4 last:pb-0">
                    <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0">
                      Quy cách đóng gói
                    </div>
                    <div className="text-base text-slate-800 flex-1">
                      {drugData.drug.packaging}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Thông tin bảo quản và cảnh báo */}
          {(drugData.drug.storage || drugData.drug.warnings) && (
            <motion.div
              className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden"
              variants={fadeUp}
              initial="hidden"
              animate="show"
            >
              <div className="bg-gradient-to-r from-primary to-secondary border-b border-primary/20 px-6 py-4">
                <h3 className="text-lg font-semibold text-white">
                  Thông tin quan trọng
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {drugData.drug.storage && (
                  <div>
                    <label className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
                      Bảo quản
                    </label>
                    <p className="text-slate-900 bg-blue-50 border border-blue-200 rounded-xl p-4">
                      {drugData.drug.storage}
                    </p>
                  </div>
                )}
                {drugData.drug.warnings && (
                  <div>
                    <label className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
                      Cảnh báo
                    </label>
                    <p className="text-slate-900 bg-amber-50 border border-amber-200 rounded-xl p-4">
                      {drugData.drug.warnings}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Thành phần hoạt chất */}
          {drugData.drug.activeIngredients &&
            Array.isArray(drugData.drug.activeIngredients) &&
            drugData.drug.activeIngredients.length > 0 && (
              <motion.div
                className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden"
                variants={fadeUp}
                initial="hidden"
                animate="show"
              >
                <div className="bg-gradient-to-r from-primary to-secondary border-b border-primary/20 px-6 py-4">
                  <h3 className="text-lg font-semibold text-white">
                    Thành phần hoạt chất
                  </h3>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-2">
                    {drugData.drug.activeIngredients.map((ingredient, idx) => (
                      <span
                        key={idx}
                        className="px-4 py-2 bg-cyan-50 text-cyan-700 border border-cyan-200 rounded-xl text-sm font-semibold"
                      >
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

          {/* Thông tin hệ thống */}
          <motion.div
            className="bg-white rounded-2xl border border-cyan-100 shadow-sm"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            <div className="bg-gradient-to-r from-primary to-secondary border-b border-slate-200 px-6 py-4 rounded-t-2xl">
              <h3 className="text-lg font-semibold text-white">
                Thông tin hệ thống
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-0 divide-y divide-slate-200">
                {drugData.drug.createdAt && (
                  <div className="flex flex-col sm:flex-row sm:items-center py-4 first:pt-0">
                    <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0">
                      Ngày tạo
                    </div>
                    <div className="text-base text-slate-800 flex-1">
                      {new Date(drugData.drug.createdAt).toLocaleString(
                        "vi-VN"
                      )}
                    </div>
                  </div>
                )}
                {drugData.drug.updatedAt && (
                  <div className="flex flex-col sm:flex-row sm:items-center py-4">
                    <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0">
                      Cập nhật lần cuối
                    </div>
                    <div className="text-base text-slate-800 flex-1">
                      {new Date(drugData.drug.updatedAt).toLocaleString(
                        "vi-VN"
                      )}
                    </div>
                  </div>
                )}
                {drugData.drug._id && (
                  <div className="flex flex-col sm:flex-row sm:items-start py-4 last:pb-0">
                    <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0 sm:pt-1">
                      ID
                    </div>
                    <div className="text-base text-slate-800 flex-1">
                      {drugData.drug._id}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </DashboardLayout>
  );
}
