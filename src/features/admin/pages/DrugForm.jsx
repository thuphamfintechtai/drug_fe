import { motion } from "framer-motion";
import DashboardLayout from "../../shared/components/DashboardLayout";
import TruckLoader from "../../shared/components/TruckLoader";
import { useDrugFrom } from "../hooks/usrDrugFrom";
import { Link, useNavigate } from "react-router-dom";

export default function DrugForm() {
  const {
    drugData,
    loading,
    error,
    loadingProgress,
    navigationItems,
    translateStatus,
    translateNFTStatus,
    id,
  } = useDrugFrom();
  const navigate = useNavigate();
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
            <Link
              to="/admin/drugs"
              className="px-6 py-3 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 text-white font-medium transition backdrop-blur-sm"
            >
              ← Quay lại
            </Link>
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
                  <div className="text-base font-bold text-slate-800 flex-1">
                    {drugData.drug.tradeName || "N/A"}
                  </div>
                </div>
                {drugData.drug.genericName && (
                  <div className="flex flex-col sm:flex-row sm:items-center py-4">
                    <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0">
                      Tên hoạt chất
                    </div>
                    <div className="text-base font-semibold text-slate-800 flex-1">
                      {drugData.drug.genericName}
                    </div>
                  </div>
                )}
                {drugData.drug.atcCode && (
                  <div className="flex flex-col sm:flex-row sm:items-center py-4">
                    <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0">
                      Mã ATC
                    </div>
                    <div className="text-base font-semibold text-slate-800 font-mono flex-1">
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
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
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
                    <div className="text-base font-bold text-slate-800 flex-1">
                      {drugData.drug.manufacturer.name || "N/A"}
                    </div>
                  </div>
                  {drugData.drug.manufacturer.licenseNo && (
                    <div className="flex flex-col sm:flex-row sm:items-center py-4">
                      <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0">
                        Số giấy phép
                      </div>
                      <div className="text-base font-semibold text-slate-800 flex-1">
                        {drugData.drug.manufacturer.licenseNo}
                      </div>
                    </div>
                  )}
                  {drugData.drug.manufacturer.taxCode && (
                    <div className="flex flex-col sm:flex-row sm:items-center py-4">
                      <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0">
                        Mã số thuế
                      </div>
                      <div className="text-base font-semibold text-slate-800 font-mono flex-1">
                        {drugData.drug.manufacturer.taxCode}
                      </div>
                    </div>
                  )}
                  {drugData.drug.manufacturer.country && (
                    <div className="flex flex-col sm:flex-row sm:items-center py-4">
                      <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0">
                        Quốc gia
                      </div>
                      <div className="text-base font-semibold text-slate-800 flex-1">
                        {drugData.drug.manufacturer.country}
                      </div>
                    </div>
                  )}
                  {drugData.drug.manufacturer.address && (
                    <div className="flex flex-col sm:flex-row sm:items-start py-4">
                      <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0 sm:pt-1">
                        Địa chỉ
                      </div>
                      <div className="text-base font-semibold text-slate-800 flex-1">
                        {drugData.drug.manufacturer.address}
                      </div>
                    </div>
                  )}
                  {drugData.drug.manufacturer.contactEmail && (
                    <div className="flex flex-col sm:flex-row sm:items-center py-4">
                      <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0">
                        Email
                      </div>
                      <div className="text-base font-semibold text-slate-800 flex-1">
                        {drugData.drug.manufacturer.contactEmail}
                      </div>
                    </div>
                  )}
                  {drugData.drug.manufacturer.contactPhone && (
                    <div className="flex flex-col sm:flex-row sm:items-center py-4">
                      <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0">
                        Số điện thoại
                      </div>
                      <div className="text-base font-semibold text-slate-800 flex-1">
                        {drugData.drug.manufacturer.contactPhone}
                      </div>
                    </div>
                  )}
                  {drugData.drug.manufacturer.walletAddress && (
                    <div className="flex flex-col sm:flex-row sm:items-start py-4 last:pb-0">
                      <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0 sm:pt-1">
                        Wallet Address
                      </div>
                      <div className="text-base font-semibold text-slate-800 flex-1">
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
                    <div className="text-base font-semibold text-slate-800 flex-1">
                      {drugData.drug.dosageForm}
                    </div>
                  </div>
                )}
                {drugData.drug.strength && (
                  <div className="flex flex-col sm:flex-row sm:items-center py-4">
                    <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0">
                      Hàm lượng
                    </div>
                    <div className="text-base font-semibold text-slate-800 flex-1">
                      {drugData.drug.strength}
                    </div>
                  </div>
                )}
                {drugData.drug.route && (
                  <div className="flex flex-col sm:flex-row sm:items-center py-4">
                    <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0">
                      Cách dùng
                    </div>
                    <div className="text-base font-semibold text-slate-800 flex-1">
                      {drugData.drug.route}
                    </div>
                  </div>
                )}
                {drugData.drug.packaging && (
                  <div className="flex flex-col sm:flex-row sm:items-center py-4 last:pb-0">
                    <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-48 shrink-0 mb-1 sm:mb-0">
                      Quy cách đóng gói
                    </div>
                    <div className="text-base font-semibold text-slate-800 flex-1">
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
                        className="px-4 py-2 bg-gradient-to-br from-primary to-secondary text-primary border border-primary/20 rounded-xl text-sm font-semibold"
                      >
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

          {/* Thống kê */}
          {drugData.statistics && (
            <motion.div
              className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden"
              variants={fadeUp}
              initial="hidden"
              animate="show"
            >
              <div className="bg-gradient-to-r from-primary to-secondary border-b border-primary/20 px-6 py-4">
                <h3 className="text-lg font-semibold text-white">Thống kê</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                    <label className="text-xs text-slate-600 font-medium uppercase tracking-wide">
                      Tổng sản xuất
                    </label>
                    <p className="mt-2 text-2xl font-bold text-blue-600">
                      {drugData.statistics.totalProduced || 0}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                    <label className="text-xs text-slate-600 font-medium uppercase tracking-wide">
                      Tổng NFT
                    </label>
                    <p className="mt-2 text-2xl font-bold text-purple-600">
                      {drugData.statistics.totalNFTs || 0}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                    <label className="text-xs text-slate-600 font-medium uppercase tracking-wide">
                      Hóa đơn NPP
                    </label>
                    <p className="mt-2 text-2xl font-bold text-green-600">
                      {drugData.statistics.totalManufacturerInvoices || 0}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
                    <label className="text-xs text-slate-600 font-medium uppercase tracking-wide">
                      Hóa đơn thương mại
                    </label>
                    <p className="mt-2 text-2xl font-bold text-orange-600">
                      {drugData.statistics.totalCommercialInvoices || 0}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* NFT Stats */}
          {drugData.nftStats && (
            <motion.div
              className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden"
              variants={fadeUp}
              initial="hidden"
              animate="show"
            >
              <div className="bg-gradient-to-r from-primary to-secondary border-b border-primary/20 px-6 py-4">
                <h3 className="text-lg font-semibold text-white">
                  Thống kê NFT
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <label className="text-xs text-slate-600 font-medium uppercase tracking-wide">
                      Tổng số
                    </label>
                    <p className="mt-2 text-xl font-bold text-slate-700">
                      {drugData.nftStats.total || 0}
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <label className="text-xs text-slate-600 font-medium uppercase tracking-wide">
                      Đã đúc
                    </label>
                    <p className="mt-2 text-xl font-bold text-blue-600">
                      {drugData.nftStats.byStatus?.minted || 0}
                    </p>
                  </div>
                  <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-200">
                    <label className="text-xs text-slate-600 font-medium uppercase tracking-wide">
                      Đã chuyển
                    </label>
                    <p className="mt-2 text-xl font-bold text-cyan-600">
                      {drugData.nftStats.byStatus?.transferred || 0}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <label className="text-xs text-slate-600 font-medium uppercase tracking-wide">
                      Đã bán
                    </label>
                    <p className="mt-2 text-xl font-bold text-green-600">
                      {drugData.nftStats.byStatus?.sold || 0}
                    </p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                    <label className="text-xs text-slate-600 font-medium uppercase tracking-wide">
                      Hết hạn
                    </label>
                    <p className="mt-2 text-xl font-bold text-red-600">
                      {drugData.nftStats.byStatus?.expired || 0}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Production History */}
          {drugData.productionHistory &&
            Array.isArray(drugData.productionHistory) &&
            drugData.productionHistory.length > 0 && (
              <motion.div
                className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden"
                variants={fadeUp}
                initial="hidden"
                animate="show"
              >
                <div className="bg-gradient-to-r from-primary to-secondary border-b border-primary/20 px-6 py-4">
                  <h3 className="text-lg font-semibold text-white">
                    Lịch sử sản xuất
                  </h3>
                </div>
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-slate-700">
                            Batch Number
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-700">
                            Ngày SX
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-700">
                            Ngày HH
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-700">
                            Số lượng
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-700">
                            Transaction Hash
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {drugData.productionHistory.map((prod) => (
                          <tr key={prod._id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-medium">
                              {prod.batchNumber}
                            </td>
                            <td className="px-4 py-3">
                              {new Date(prod.mfgDate).toLocaleDateString(
                                "vi-VN"
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {new Date(prod.expDate).toLocaleDateString(
                                "vi-VN"
                              )}
                            </td>
                            <td className="px-4 py-3">{prod.quantity}</td>
                            <td className="px-4 py-3">
                              {prod.chainTxHash ? (
                                <a
                                  href={`https://etherscan.io/tx/${prod.chainTxHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:text-secondary font-mono text-xs break-all"
                                >
                                  {prod.chainTxHash.slice(0, 10)}...
                                </a>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

          {/* NFTs List */}
          {drugData.nfts &&
            Array.isArray(drugData.nfts) &&
            drugData.nfts.length > 0 && (
              <motion.div
                className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden"
                variants={fadeUp}
                initial="hidden"
                animate="show"
              >
                <div className="bg-gradient-to-r from-primary to-secondary border-b border-primary/20 px-6 py-4">
                  <h3 className="text-lg font-semibold text-white">
                    Danh sách NFT ({drugData.nfts.length})
                  </h3>
                </div>
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-slate-700">
                            Token ID
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-700">
                            Serial Number
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-700">
                            Batch
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-700">
                            Ngày SX
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-700">
                            Ngày HH
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-700">
                            Chủ sở hữu
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-700">
                            Trạng thái
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {drugData.nfts.slice(0, 10).map((nft) => (
                          <tr key={nft._id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-medium">
                              {nft.tokenId}
                            </td>
                            <td className="px-4 py-3 font-mono text-xs">
                              {nft.serialNumber}
                            </td>
                            <td className="px-4 py-3">{nft.batchNumber}</td>
                            <td className="px-4 py-3">
                              {new Date(nft.mfgDate).toLocaleDateString(
                                "vi-VN"
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {new Date(nft.expDate).toLocaleDateString(
                                "vi-VN"
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-xs">
                                <div className="font-medium">
                                  {nft.owner?.fullName || "N/A"}
                                </div>
                                <div className="text-slate-500">
                                  {nft.owner?.email || ""}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                                  nft.status === "minted"
                                    ? "bg-blue-50 text-blue-600"
                                    : nft.status === "sold"
                                    ? "bg-green-50 text-green-600"
                                    : "bg-slate-50 text-slate-600"
                                }`}
                              >
                                {translateNFTStatus(nft.status)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {drugData.nfts.length > 10 && (
                      <div className="mt-4 text-center text-sm text-slate-600">
                        Hiển thị 10/{drugData.nfts.length} NFT
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

          {/* Commercial Invoices */}
          {drugData.commercialInvoices &&
            Array.isArray(drugData.commercialInvoices) &&
            drugData.commercialInvoices.length > 0 && (
              <motion.div
                className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden"
                variants={fadeUp}
                initial="hidden"
                animate="show"
              >
                <div className="bg-gradient-to-r from-primary to-secondary border-b border-primary/20 px-6 py-4">
                  <h3 className="text-lg font-semibold text-white">
                    Hóa đơn thương mại ({drugData.commercialInvoices.length})
                  </h3>
                </div>
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-slate-700">
                            Số HĐ
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-700">
                            Ngày
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-700">
                            Từ NPP
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-700">
                            Đến nhà thuốc
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-700">
                            Số lượng
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-700">
                            Trạng thái
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {drugData.commercialInvoices
                          .slice(0, 10)
                          .map((invoice) => (
                            <tr key={invoice._id} className="hover:bg-slate-50">
                              <td className="px-4 py-3 font-medium">
                                {invoice.invoiceNumber}
                              </td>
                              <td className="px-4 py-3">
                                {new Date(
                                  invoice.invoiceDate
                                ).toLocaleDateString("vi-VN")}
                              </td>
                              <td className="px-4 py-3">
                                {invoice.fromDistributor?.fullName || "N/A"}
                              </td>
                              <td className="px-4 py-3">
                                {invoice.toPharmacy?.fullName || "N/A"}
                              </td>
                              <td className="px-4 py-3">{invoice.quantity}</td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                                    invoice.status === "sent"
                                      ? "bg-green-50 text-green-600"
                                      : invoice.status === "draft"
                                      ? "bg-slate-50 text-slate-600"
                                      : "bg-blue-50 text-blue-600"
                                  }`}
                                >
                                  {invoice.status === "sent"
                                    ? "Đã gửi"
                                    : invoice.status === "draft"
                                    ? "Nháp"
                                    : invoice.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                    {drugData.commercialInvoices.length > 10 && (
                      <div className="mt-4 text-center text-sm text-slate-600">
                        Hiển thị 10/{drugData.commercialInvoices.length} hóa đơn
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

          {/* Thông tin hệ thống */}
          <motion.div
            className="bg-white rounded-2xl border border-cyan-100 shadow-sm "
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
                    <div className="text-base font-semibold text-slate-800 flex-1">
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
                    <div className="text-base font-semibold text-slate-800 flex-1">
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
                    <div className="text-base font-semibold text-slate-800 flex-1">
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
