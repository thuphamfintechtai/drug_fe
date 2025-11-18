import { motion } from "framer-motion";
import DashboardLayout from "../../shared/components/DashboardLayout";
import TruckLoader from "../../shared/components/TruckLoader";
import { useDrugFrom } from "../hooks/usrDrugFrom";
import { useNavigate } from "react-router-dom";

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
      <div className="bg-white rounded-xl border border-cyan-200 shadow-sm p-5 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#007b91]">
              Chi tiết thuốc
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Thông tin đầy đủ về thuốc và chuỗi cung ứng
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/drugs")}
            className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
          >
            ← Quay lại
          </button>
        </div>
      </div>

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
            className="bg-white rounded-2xl border border-cyan-100 shadow-sm p-6"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Thông tin cơ bản
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-600 font-medium">
                  Tên thương mại
                </label>
                <p className="mt-1 text-slate-900 font-semibold text-lg">
                  {drugData.drug.tradeName || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm text-slate-600 font-medium">
                  Tên hoạt chất
                </label>
                <p className="mt-1 text-slate-900 font-semibold">
                  {drugData.drug.genericName || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm text-slate-600 font-medium">
                  Mã ATC
                </label>
                <p className="mt-1">
                  <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-mono font-semibold bg-cyan-100 text-cyan-700 border border-cyan-200">
                    {drugData.drug.atcCode || "N/A"}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm text-slate-600 font-medium">
                  Trạng thái
                </label>
                <p className="mt-1">
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
                </p>
              </div>
            </div>
          </motion.div>

          {/* Nhà sản xuất */}
          {drugData.drug.manufacturer && (
            <motion.div
              className="bg-white rounded-2xl border border-cyan-100 shadow-sm p-6"
              variants={fadeUp}
              initial="hidden"
              animate="show"
            >
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Nhà sản xuất
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-600 font-medium">
                    Tên công ty
                  </label>
                  <p className="mt-1 text-slate-900 font-semibold">
                    {drugData.drug.manufacturer.name || "N/A"}
                  </p>
                </div>
                {drugData.drug.manufacturer.licenseNo && (
                  <div>
                    <label className="text-sm text-slate-600 font-medium">
                      Số giấy phép
                    </label>
                    <p className="mt-1 text-slate-900">
                      {drugData.drug.manufacturer.licenseNo}
                    </p>
                  </div>
                )}
                {drugData.drug.manufacturer.taxCode && (
                  <div>
                    <label className="text-sm text-slate-600 font-medium">
                      Mã số thuế
                    </label>
                    <p className="mt-1 text-slate-900 font-mono">
                      {drugData.drug.manufacturer.taxCode}
                    </p>
                  </div>
                )}
                {drugData.drug.manufacturer.country && (
                  <div>
                    <label className="text-sm text-slate-600 font-medium">
                      Quốc gia
                    </label>
                    <p className="mt-1 text-slate-900">
                      {drugData.drug.manufacturer.country}
                    </p>
                  </div>
                )}
                {drugData.drug.manufacturer.address && (
                  <div className="md:col-span-2">
                    <label className="text-sm text-slate-600 font-medium">
                      Địa chỉ
                    </label>
                    <p className="mt-1 text-slate-900">
                      {drugData.drug.manufacturer.address}
                    </p>
                  </div>
                )}
                {drugData.drug.manufacturer.contactEmail && (
                  <div>
                    <label className="text-sm text-slate-600 font-medium">
                      Email
                    </label>
                    <p className="mt-1 text-slate-900">
                      {drugData.drug.manufacturer.contactEmail}
                    </p>
                  </div>
                )}
                {drugData.drug.manufacturer.contactPhone && (
                  <div>
                    <label className="text-sm text-slate-600 font-medium">
                      Số điện thoại
                    </label>
                    <p className="mt-1 text-slate-900">
                      {drugData.drug.manufacturer.contactPhone}
                    </p>
                  </div>
                )}
                {drugData.drug.manufacturer.walletAddress && (
                  <div className="md:col-span-2">
                    <label className="text-sm text-slate-600 font-medium">
                      Wallet Address
                    </label>
                    <p className="mt-1 text-slate-900 font-mono text-xs break-all bg-slate-50 p-2 rounded">
                      {drugData.drug.manufacturer.walletAddress}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Thông tin bào chế */}
          <motion.div
            className="bg-white rounded-2xl border border-cyan-100 shadow-sm p-6"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Thông tin bào chế
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {drugData.drug.dosageForm && (
                <div>
                  <label className="text-sm text-slate-600 font-medium">
                    Dạng bào chế
                  </label>
                  <p className="mt-1 text-slate-900">
                    {drugData.drug.dosageForm}
                  </p>
                </div>
              )}
              {drugData.drug.strength && (
                <div>
                  <label className="text-sm text-slate-600 font-medium">
                    Hàm lượng
                  </label>
                  <p className="mt-1 text-slate-900 font-semibold">
                    {drugData.drug.strength}
                  </p>
                </div>
              )}
              {drugData.drug.route && (
                <div className="md:col-span-2">
                  <label className="text-sm text-slate-600 font-medium">
                    Cách dùng
                  </label>
                  <p className="mt-1 text-slate-900">{drugData.drug.route}</p>
                </div>
              )}
              {drugData.drug.packaging && (
                <div className="md:col-span-2">
                  <label className="text-sm text-slate-600 font-medium">
                    Quy cách đóng gói
                  </label>
                  <p className="mt-1 text-slate-900">
                    {drugData.drug.packaging}
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Thông tin bảo quản và cảnh báo */}
          {(drugData.drug.storage || drugData.drug.warnings) && (
            <motion.div
              className="bg-white rounded-2xl border border-cyan-100 shadow-sm p-6"
              variants={fadeUp}
              initial="hidden"
              animate="show"
            >
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Thông tin quan trọng
              </h3>
              <div className="space-y-4">
                {drugData.drug.storage && (
                  <div>
                    <label className="text-sm text-slate-600 font-medium">
                      Bảo quản
                    </label>
                    <p className="mt-1 text-slate-900 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      {drugData.drug.storage}
                    </p>
                  </div>
                )}
                {drugData.drug.warnings && (
                  <div>
                    <label className="text-sm text-slate-600 font-medium">
                      Cảnh báo
                    </label>
                    <p className="mt-1 text-slate-900 bg-amber-50 border border-amber-200 rounded-lg p-3">
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
                className="bg-white rounded-2xl border border-cyan-100 shadow-sm p-6"
                variants={fadeUp}
                initial="hidden"
                animate="show"
              >
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  Thành phần hoạt chất
                </h3>
                <div className="flex flex-wrap gap-2">
                  {drugData.drug.activeIngredients.map((ingredient, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-cyan-50 text-cyan-700 border border-cyan-200 rounded-full text-sm font-medium"
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

          {/* Thống kê */}
          {drugData.statistics && (
            <motion.div
              className="bg-white rounded-2xl border border-cyan-100 shadow-sm p-6"
              variants={fadeUp}
              initial="hidden"
              animate="show"
            >
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Thống kê
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                  <label className="text-xs text-slate-600 font-medium">
                    Tổng sản xuất
                  </label>
                  <p className="mt-1 text-2xl font-bold text-blue-600">
                    {drugData.statistics.totalProduced || 0}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                  <label className="text-xs text-slate-600 font-medium">
                    Tổng NFT
                  </label>
                  <p className="mt-1 text-2xl font-bold text-purple-600">
                    {drugData.statistics.totalNFTs || 0}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                  <label className="text-xs text-slate-600 font-medium">
                    Hóa đơn NPP
                  </label>
                  <p className="mt-1 text-2xl font-bold text-green-600">
                    {drugData.statistics.totalManufacturerInvoices || 0}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-4 border border-orange-200">
                  <label className="text-xs text-slate-600 font-medium">
                    Hóa đơn thương mại
                  </label>
                  <p className="mt-1 text-2xl font-bold text-orange-600">
                    {drugData.statistics.totalCommercialInvoices || 0}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* NFT Stats */}
          {drugData.nftStats && (
            <motion.div
              className="bg-white rounded-2xl border border-cyan-100 shadow-sm p-6"
              variants={fadeUp}
              initial="hidden"
              animate="show"
            >
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Thống kê NFT
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <label className="text-xs text-slate-600 font-medium">
                    Tổng số
                  </label>
                  <p className="mt-1 text-xl font-bold text-slate-700">
                    {drugData.nftStats.total || 0}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <label className="text-xs text-slate-600 font-medium">
                    Đã đúc
                  </label>
                  <p className="mt-1 text-xl font-bold text-blue-600">
                    {drugData.nftStats.byStatus?.minted || 0}
                  </p>
                </div>
                <div className="bg-cyan-50 rounded-lg p-3 border border-cyan-200">
                  <label className="text-xs text-slate-600 font-medium">
                    Đã chuyển
                  </label>
                  <p className="mt-1 text-xl font-bold text-cyan-600">
                    {drugData.nftStats.byStatus?.transferred || 0}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <label className="text-xs text-slate-600 font-medium">
                    Đã bán
                  </label>
                  <p className="mt-1 text-xl font-bold text-green-600">
                    {drugData.nftStats.byStatus?.sold || 0}
                  </p>
                </div>
                <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                  <label className="text-xs text-slate-600 font-medium">
                    Hết hạn
                  </label>
                  <p className="mt-1 text-xl font-bold text-red-600">
                    {drugData.nftStats.byStatus?.expired || 0}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Production History */}
          {drugData.productionHistory &&
            Array.isArray(drugData.productionHistory) &&
            drugData.productionHistory.length > 0 && (
              <motion.div
                className="bg-white rounded-2xl border border-cyan-100 shadow-sm p-6"
                variants={fadeUp}
                initial="hidden"
                animate="show"
              >
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  Lịch sử sản xuất
                </h3>
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
                            {new Date(prod.mfgDate).toLocaleDateString("vi-VN")}
                          </td>
                          <td className="px-4 py-3">
                            {new Date(prod.expDate).toLocaleDateString("vi-VN")}
                          </td>
                          <td className="px-4 py-3">{prod.quantity}</td>
                          <td className="px-4 py-3">
                            {prod.chainTxHash ? (
                              <a
                                href={`https://etherscan.io/tx/${prod.chainTxHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cyan-600 hover:text-cyan-700 font-mono text-xs break-all"
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
              </motion.div>
            )}

          {/* NFTs List */}
          {drugData.nfts &&
            Array.isArray(drugData.nfts) &&
            drugData.nfts.length > 0 && (
              <motion.div
                className="bg-white rounded-2xl border border-cyan-100 shadow-sm p-6"
                variants={fadeUp}
                initial="hidden"
                animate="show"
              >
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  Danh sách NFT ({drugData.nfts.length})
                </h3>
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
                            {new Date(nft.mfgDate).toLocaleDateString("vi-VN")}
                          </td>
                          <td className="px-4 py-3">
                            {new Date(nft.expDate).toLocaleDateString("vi-VN")}
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
              </motion.div>
            )}

          {/* Commercial Invoices */}
          {drugData.commercialInvoices &&
            Array.isArray(drugData.commercialInvoices) &&
            drugData.commercialInvoices.length > 0 && (
              <motion.div
                className="bg-white rounded-2xl border border-cyan-100 shadow-sm p-6"
                variants={fadeUp}
                initial="hidden"
                animate="show"
              >
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  Hóa đơn thương mại ({drugData.commercialInvoices.length})
                </h3>
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
                              {new Date(invoice.invoiceDate).toLocaleDateString(
                                "vi-VN"
                              )}
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
              </motion.div>
            )}

          {/* Thông tin hệ thống */}
          <motion.div
            className="bg-slate-50 rounded-2xl border border-slate-200 shadow-sm p-6"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Thông tin hệ thống
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {drugData.drug.createdAt && (
                <div>
                  <label className="text-slate-600 font-medium">Ngày tạo</label>
                  <p className="mt-1 text-slate-900">
                    {new Date(drugData.drug.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>
              )}
              {drugData.drug.updatedAt && (
                <div>
                  <label className="text-slate-600 font-medium">
                    Cập nhật lần cuối
                  </label>
                  <p className="mt-1 text-slate-900">
                    {new Date(drugData.drug.updatedAt).toLocaleString("vi-VN")}
                  </p>
                </div>
              )}
              {drugData.drug._id && (
                <div className="md:col-span-2">
                  <label className="text-slate-600 font-medium">ID</label>
                  <p className="mt-1 text-slate-900 font-mono text-xs break-all bg-white p-2 rounded border border-slate-200">
                    {drugData.drug._id}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      ) : null}
    </DashboardLayout>
  );
}
