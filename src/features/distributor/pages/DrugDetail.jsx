import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../shared/components/DashboardLayout";
import TruckLoader from "../../shared/components/TruckLoader";
import { CardUI } from "../../shared/components/ui/cardUI";
import { useDrugDetail } from "../hooks/useDrugDetail";
import { navigationItems } from "../constants/navigationItems";

export default function DrugDetail() {
  const { drugData, loading, error, loadingProgress, translateStatus, id } =
    useDrugDetail();
  const navigate = useNavigate();
  const [copiedField, setCopiedField] = useState(null);

  const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  const copyToClipboard = async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const CopyButton = ({ text, fieldName }) => {
    const isCopied = copiedField === fieldName;
    return (
      <button
        onClick={() => copyToClipboard(text, fieldName)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
          isCopied
            ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
            : "bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-300"
        }`}
        title={isCopied ? "Đã sao chép!" : "Sao chép"}
      >
        {isCopied ? (
          <>
            <svg
              className="w-3.5 h-3.5"
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
            <span>Đã sao chép</span>
          </>
        ) : (
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        )}
      </button>
    );
  };

  if (!id) {
    return null;
  }

  return (
    <DashboardLayout navigationItems={navigationItems}>
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
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <svg
              className="w-5 h-5 text-red-600 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </motion.div>
      ) : drugData?.drug ? (
        <div className="space-y-6">
          {/* Header với CardUI */}
          <CardUI
            title="Chi tiết thuốc"
            subtitle="Thông tin đầy đủ về thuốc và chuỗi cung ứng"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-[#00a3c4]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                />
              </svg>
            }
          />

          {/* Thông tin cơ bản */}
          <motion.div
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            <h2 className="text-lg font-semibold text-slate-800 mb-6">
              Thông tin cơ bản
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {drugData.drug.tradeName && (
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Tên thương mại
                  </label>
                  <div className="font-semibold text-gray-800 text-lg">
                    {drugData.drug.tradeName}
                  </div>
                </div>
              )}
              {drugData.drug.genericName && (
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Tên hoạt chất
                  </label>
                  <div className="text-gray-800 font-medium">
                    {drugData.drug.genericName}
                  </div>
                </div>
              )}
              {drugData.drug.atcCode && (
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Mã ATC
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="font-mono font-semibold text-gray-800 text-lg">
                      {drugData.drug.atcCode}
                    </code>
                    <CopyButton
                      text={drugData.drug.atcCode}
                      fieldName="atcCode"
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Trạng thái
                </label>
                <span
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${
                    drugData.drug.status === "active"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : drugData.drug.status === "inactive"
                      ? "bg-gray-50 text-gray-700 border border-gray-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {translateStatus(drugData.drug.status)}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Nhà sản xuất */}
          {drugData.drug.manufacturer && (
            <motion.div
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
              variants={fadeUp}
              initial="hidden"
              animate="show"
            >
              <h2 className="text-lg font-semibold text-slate-800 mb-6">
                Nhà sản xuất
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {drugData.drug.manufacturer.name && (
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Tên công ty
                    </label>
                    <div className="text-gray-800 font-medium">
                      {drugData.drug.manufacturer.name}
                    </div>
                  </div>
                )}
                {drugData.drug.manufacturer.licenseNo && (
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Số giấy phép
                    </label>
                    <div className="text-gray-800">
                      {drugData.drug.manufacturer.licenseNo}
                    </div>
                  </div>
                )}
                {drugData.drug.manufacturer.taxCode && (
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Mã số thuế
                    </label>
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-gray-800">
                        {drugData.drug.manufacturer.taxCode}
                      </code>
                      <CopyButton
                        text={drugData.drug.manufacturer.taxCode}
                        fieldName="taxCode"
                      />
                    </div>
                  </div>
                )}
                {drugData.drug.manufacturer.country && (
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Quốc gia
                    </label>
                    <div className="text-gray-800">
                      {drugData.drug.manufacturer.country}
                    </div>
                  </div>
                )}
                {drugData.drug.manufacturer.address && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Địa chỉ
                    </label>
                    <div className="text-gray-800">
                      {drugData.drug.manufacturer.address}
                    </div>
                  </div>
                )}
                {drugData.drug.manufacturer.contactEmail && (
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Email
                    </label>
                    <div className="flex items-center gap-2">
                      <a
                        href={`mailto:${drugData.drug.manufacturer.contactEmail}`}
                        className="text-gray-800 font-medium hover:text-primary hover:underline"
                      >
                        {drugData.drug.manufacturer.contactEmail}
                      </a>
                      <CopyButton
                        text={drugData.drug.manufacturer.contactEmail}
                        fieldName="manufacturerEmail"
                      />
                    </div>
                  </div>
                )}
                {drugData.drug.manufacturer.contactPhone && (
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Số điện thoại
                    </label>
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${drugData.drug.manufacturer.contactPhone}`}
                        className="text-gray-800 font-medium hover:text-primary hover:underline"
                      >
                        {drugData.drug.manufacturer.contactPhone}
                      </a>
                      <CopyButton
                        text={drugData.drug.manufacturer.contactPhone}
                        fieldName="manufacturerPhone"
                      />
                    </div>
                  </div>
                )}
                {drugData.drug.manufacturer.walletAddress && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Wallet Address
                    </label>
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="text-xs font-mono text-gray-600 break-all bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                        {drugData.drug.manufacturer.walletAddress}
                      </code>
                      <CopyButton
                        text={drugData.drug.manufacturer.walletAddress}
                        fieldName="manufacturerWallet"
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Thông tin bào chế */}
          {(drugData.drug.dosageForm ||
            drugData.drug.strength ||
            drugData.drug.route ||
            drugData.drug.packaging) && (
            <motion.div
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
              variants={fadeUp}
              initial="hidden"
              animate="show"
            >
              <h2 className="text-lg font-semibold text-slate-800 mb-6">
                Thông tin bào chế
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {drugData.drug.dosageForm && (
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Dạng bào chế
                    </label>
                    <div className="text-gray-800">
                      {drugData.drug.dosageForm}
                    </div>
                  </div>
                )}
                {drugData.drug.strength && (
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Hàm lượng
                    </label>
                    <div className="text-gray-800">
                      {drugData.drug.strength}
                    </div>
                  </div>
                )}
                {drugData.drug.route && (
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Cách dùng
                    </label>
                    <div className="text-gray-800">{drugData.drug.route}</div>
                  </div>
                )}
                {drugData.drug.packaging && (
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Quy cách đóng gói
                    </label>
                    <div className="text-gray-800">
                      {drugData.drug.packaging}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Thông tin bảo quản và cảnh báo */}
          {(drugData.drug.storage || drugData.drug.warnings) && (
            <motion.div
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
              variants={fadeUp}
              initial="hidden"
              animate="show"
            >
              <h2 className="text-lg font-semibold text-slate-800 mb-6">
                Thông tin quan trọng
              </h2>
              <div className="space-y-6">
                {drugData.drug.storage && (
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Bảo quản
                    </label>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-gray-800 leading-relaxed">
                        {drugData.drug.storage}
                      </p>
                    </div>
                  </div>
                )}
                {drugData.drug.warnings && (
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Cảnh báo
                    </label>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <p className="text-gray-800 leading-relaxed">
                        {drugData.drug.warnings}
                      </p>
                    </div>
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
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
                variants={fadeUp}
                initial="hidden"
                animate="show"
              >
                <h2 className="text-lg font-semibold text-slate-800 mb-4">
                  Thành phần hoạt chất
                </h2>
                <div className="flex flex-wrap gap-2">
                  {drugData.drug.activeIngredients.map((ingredient, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-cyan-50 text-cyan-700 rounded-lg font-medium text-sm border border-cyan-200"
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

          {/* Thông tin hệ thống */}
          <motion.div
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            <h2 className="text-lg font-semibold text-slate-800 mb-6">
              Thông tin hệ thống
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {drugData.drug.createdAt && (
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Ngày tạo
                  </label>
                  <div className="text-gray-800">
                    {new Date(drugData.drug.createdAt).toLocaleString("vi-VN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              )}
              {drugData.drug.updatedAt && (
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Cập nhật lần cuối
                  </label>
                  <div className="text-gray-800">
                    {new Date(drugData.drug.updatedAt).toLocaleString("vi-VN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              )}
              {drugData.drug._id && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    ID
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    <code className="text-xs font-mono text-gray-600 break-all bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                      {drugData.drug._id}
                    </code>
                    <CopyButton text={drugData.drug._id} fieldName="drugId" />
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Nút quay lại */}
          <div className="flex justify-end">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2 rounded-full border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition"
            >
              Quay lại
            </button>
          </div>
        </div>
      ) : null}
    </DashboardLayout>
  );
}
