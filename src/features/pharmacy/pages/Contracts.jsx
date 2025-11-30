import { motion } from "framer-motion";
import DashboardLayout from "../../shared/components/DashboardLayout";
import TruckLoader from "../../shared/components/TruckLoader";
import { navigationItems } from "../constants/constant";
import { contractStatusLabel } from "../hooks/useContracts";
import { useContractsPage } from "../hooks/useContractsPage";
import { Search } from "../../shared/components/ui/search";

export default function PharmacyContracts() {
  const {
    // State
    currentPage,
    setCurrentPage,
    selectedContract,
    showDetailDialog,
    showConfirmDialog,
    isConfirming,

    // Data
    loading,
    loadingProgress,
    filteredContracts,
    searchText,
    contractDetail,
    confirmContractDetail,
    loadingDetail,
    loadingConfirmDetail,

    // Pagination
    totalItems,
    totalPages,
    startIndex,
    endIndex,
    paginatedContracts,

    // Handlers
    handleSearch,
    handleClearSearch,
    handleConfirmContract,
    openDetailDialog,
    closeDetailDialog,
    openConfirmDialog,
    closeConfirmDialog,
    handleRowClick,
    handleConfirmFromDetail,
    setSearchText,
  } = useContractsPage();

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
    <DashboardLayout navigationItems={navigationItems}>
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="w-full max-w-2xl">
            <TruckLoader height={72} progress={loadingProgress} showTrack />
          </div>
          <div className="text-lg text-slate-600 mt-6">Đang tải dữ liệu...</div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Banner */}
          <motion.section
            className="relative overflow-hidden rounded-2xl mb-6 border border-[#90e0ef33] shadow-[0_10px_30px_rgba(0,0,0,0.06)] bg-gradient-to-r from-primary to-secondary"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative px-6 py-8 md:px-10 md:py-12 !text-white">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight drop-shadow-sm mb-2">
                Hợp đồng với Nhà phân phối
              </h1>
              <p className="!text-white/90">
                Xem và xác nhận các hợp đồng từ nhà phân phối
              </p>
            </div>
          </motion.section>

          {/* Search */}
          <motion.div
            className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            <div className="flex flex-col md:flex-row gap-3 md:items-end">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Tìm kiếm
                </label>
                <Search
                  searchInput={searchText}
                  setSearchInput={setSearchText}
                  handleSearch={handleSearch}
                  handleClearSearch={handleClearSearch}
                  placeholder="Tìm kiếm theo mã hợp đồng, tên file..."
                  data={filteredContracts}
                  getSearchText={(item) =>
                    item.id || item.contractFileName || ""
                  }
                  matchFunction={(item, searchLower) => {
                    const id = (item.id || "").toLowerCase();
                    const fileName = (
                      item.contractFileName || ""
                    ).toLowerCase();
                    return (
                      id.includes(searchLower) || fileName.includes(searchLower)
                    );
                  }}
                  getDisplayText={(item) => item.contractFileName || item.id}
                  enableAutoSearch={false}
                />
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden"
          >
            {filteredContracts.length === 0 ? (
              <div className="p-16 flex flex-col items-center justify-center">
                <div className="p-4 bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-16 h-16 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">
                  {searchText ? "Không tìm thấy kết quả" : "Chưa có hợp đồng"}
                </h3>
                <p className="text-slate-500 text-sm">
                  {searchText
                    ? "Không có hợp đồng nào phù hợp với từ khóa tìm kiếm của bạn"
                    : "Các hợp đồng từ nhà phân phối sẽ hiển thị ở đây"}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wide">
                          Mã hợp đồng
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wide">
                          Tên file
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wide">
                          URL hợp đồng
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wide">
                          Trạng thái
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wide">
                          Ngày tạo
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-bold text-slate-700 uppercase tracking-wide">
                          Thao tác
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {paginatedContracts.map((contract) => (
                        <tr
                          key={contract.id}
                          className="hover:bg-gradient-to-r hover:from-slate-50/50 hover:to-white transition-all duration-200 cursor-pointer group"
                          onClick={() => handleRowClick(contract)}
                        >
                          <td className="px-6 py-4">
                            <span
                              className="font-mono text-sm font-semibold text-slate-800 group-hover:text-primary transition-colors"
                              title={contract.id}
                            >
                              {contract.id?.substring(0, 8)}...
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-slate-700 font-medium">
                              {contract.contractFileName || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {contract.contractFileUrl ? (
                              <a
                                href={contract.contractFileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-primary hover:text-secondary font-medium transition-colors group/link"
                              >
                                <svg
                                  className="w-4 h-4 group-hover/link:translate-x-0.5 transition-transform"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                  />
                                </svg>
                                Xem file
                              </a>
                            ) : (
                              <span className="text-slate-400">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${
                                contract.status === "pending"
                                  ? "bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 border border-orange-200"
                                  : contract.status === "approved" ||
                                    contract.status === "confirmed"
                                  ? "bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border border-blue-200"
                                  : contract.status === "signed"
                                  ? "bg-gradient-to-r from-primary/10 to-secondary/10 text-primary border border-primary/20"
                                  : contract.status === "rejected"
                                  ? "bg-gradient-to-r from-rose-50 to-red-50 text-rose-700 border border-rose-200"
                                  : "bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border border-gray-200"
                              }`}
                            >
                              {contractStatusLabel(contract.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-slate-600">
                              {contract.createdAt
                                ? new Date(
                                    contract.createdAt
                                  ).toLocaleDateString("vi-VN")
                                : "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {contract.status === "pending" ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openConfirmDialog(contract);
                                }}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                Xác nhận
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRowClick(contract);
                                }}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-slate-700 bg-gradient-to-r from-slate-50 to-gray-50 hover:from-slate-100 hover:to-gray-100 border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-200"
                              >
                                <svg
                                  className="w-4 h-4"
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
                                Chi tiết
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-5 border-t-2 border-slate-200 bg-gradient-to-r from-slate-50/50 to-white">
                    <div className="text-sm font-medium text-slate-600">
                      Hiển thị{" "}
                      <span className="font-bold text-slate-800">
                        {startIndex + 1}
                      </span>{" "}
                      -{" "}
                      <span className="font-bold text-slate-800">
                        {Math.min(endIndex, totalItems)}
                      </span>{" "}
                      của{" "}
                      <span className="font-bold text-slate-800">
                        {totalItems}
                      </span>{" "}
                      hợp đồng
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        disabled={currentPage <= 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          currentPage <= 1
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : "bg-white border-2 border-slate-200 hover:border-primary hover:bg-primary/5 text-slate-700 hover:text-primary shadow-sm hover:shadow-md"
                        }`}
                      >
                        Trước
                      </button>
                      <span className="text-sm font-semibold text-slate-700 px-4">
                        Trang {currentPage} / {totalPages}
                      </span>
                      <button
                        disabled={currentPage >= totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          currentPage >= totalPages
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                        }`}
                      >
                        Sau
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>

          {/* Detail Dialog */}
          {showDetailDialog && selectedContract && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              onClick={closeDetailDialog}
            >
              <div
                className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto custom-scroll"
                onClick={(e) => e.stopPropagation()}
              >
                <style>{`
                  .custom-scroll { scrollbar-width: none; -ms-overflow-style: none; }
                  .custom-scroll::-webkit-scrollbar { width: 0; height: 0; }
                `}</style>
                <div className="bg-gradient-to-r from-primary to-secondary px-8 py-6 rounded-t-3xl flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold !text-white">
                      Chi tiết hợp đồng
                    </h2>
                    <p className="text-gray-100 text-sm">
                      Mã: {selectedContract.id}
                    </p>
                  </div>
                  <button
                    onClick={closeDetailDialog}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center !text-white text-xl transition"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-8 space-y-6">
                  {loadingDetail ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-gray-200 rounded-full" />
                        <div className="w-12 h-12 border-4 border-[#4BADD1] rounded-full border-t-transparent animate-spin absolute" />
                        <p className="text-sm text-gray-600 mt-16">
                          Đang tải chi tiết hợp đồng...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-200">
                          Thông tin Hợp đồng
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Mã hợp đồng
                            </label>
                            <div className="font-mono text-sm text-gray-800 bg-gray-50 rounded-lg p-3 border border-gray-200">
                              {contractDetail?.id ||
                                contractDetail?._id ||
                                selectedContract.id}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Trạng thái
                            </label>
                            <div>
                              <span
                                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${
                                  contractDetail?.status === "pending"
                                    ? "bg-orange-50 text-orange-600 border border-orange-100"
                                    : contractDetail?.status === "approved" ||
                                      contractDetail?.status === "confirmed"
                                    ? "bg-blue-50 text-blue-600 border border-blue-100"
                                    : contractDetail?.status === "signed"
                                    ? "bg-primary/10 text-primary border border-primary/20"
                                    : contractDetail?.status === "rejected"
                                    ? "bg-rose-50 text-rose-600 border border-rose-100"
                                    : "bg-gray-50 text-gray-600 border border-gray-100"
                                }`}
                              >
                                {contractStatusLabel(
                                  contractDetail?.status ||
                                    selectedContract.status
                                )}
                              </span>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Tên file
                            </label>
                            <div className="text-gray-800 bg-gray-50 rounded-lg p-3 border border-gray-200">
                              {contractDetail?.contractFileName ||
                                selectedContract.contractFileName ||
                                "N/A"}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              File hợp đồng
                            </label>
                            <div className="text-gray-800 bg-gray-50 rounded-lg p-3 border border-gray-200">
                              {contractDetail?.contractFileUrl ||
                              selectedContract.contractFileUrl ? (
                                <a
                                  href={
                                    contractDetail?.contractFileUrl ||
                                    selectedContract.contractFileUrl
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  Xem file hợp đồng
                                </a>
                              ) : (
                                "N/A"
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Nhà phân phối
                            </label>
                            <div className="text-gray-800 bg-gray-50 rounded-lg p-3 border border-gray-200">
                              {contractDetail?.distributor?.businessName ||
                                contractDetail?.distributor?.name ||
                                contractDetail?.distributorId ||
                                "N/A"}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Wallet Distributor
                            </label>
                            <div className="font-mono text-xs text-gray-800 bg-gray-50 rounded-lg p-3 border border-gray-200 break-all">
                              {contractDetail?.distributorWalletAddress ||
                                contractDetail?.distributorAddress ||
                                "-"}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Wallet Pharmacy
                            </label>
                            <div className="font-mono text-xs text-gray-800 bg-gray-50 rounded-lg p-3 border border-gray-200 break-all">
                              {contractDetail?.pharmacyWalletAddress ||
                                contractDetail?.pharmacyAddress ||
                                "-"}
                            </div>
                          </div>

                          {contractDetail?.tokenId && (
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Token ID
                              </label>
                              <div className="font-mono font-bold text-primary bg-gray-50 rounded-lg p-3 border border-gray-200">
                                #{contractDetail.tokenId}
                              </div>
                            </div>
                          )}

                          {contractDetail?.blockchainTxHash && (
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Transaction Hash
                              </label>
                              <div className="text-gray-800 bg-gray-50 rounded-lg p-3 border border-gray-200">
                                <a
                                  href={`https://etherscan.io/tx/${contractDetail.blockchainTxHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline font-mono text-xs break-all"
                                >
                                  {contractDetail.blockchainTxHash}
                                </a>
                              </div>
                            </div>
                          )}

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Ký bởi Distributor
                            </label>
                            <div className="text-gray-800 bg-gray-50 rounded-lg p-3 border border-gray-200">
                              {contractDetail?.distributorSignedAt ||
                              selectedContract.distributorSignedAt
                                ? new Date(
                                    contractDetail?.distributorSignedAt ||
                                      selectedContract.distributorSignedAt
                                  ).toLocaleString("vi-VN")
                                : "Chưa ký"}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Ký bởi Pharmacy
                            </label>
                            <div className="text-gray-800 bg-gray-50 rounded-lg p-3 border border-gray-200">
                              {contractDetail?.pharmacySignedAt ||
                              selectedContract.pharmacySignedAt
                                ? new Date(
                                    contractDetail?.pharmacySignedAt ||
                                      selectedContract.pharmacySignedAt
                                  ).toLocaleString("vi-VN")
                                : "Chưa ký"}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Ngày tạo
                            </label>
                            <div className="text-gray-800 bg-gray-50 rounded-lg p-3 border border-gray-200">
                              {contractDetail?.createdAt ||
                              selectedContract.createdAt
                                ? new Date(
                                    contractDetail?.createdAt ||
                                      selectedContract.createdAt
                                  ).toLocaleString("vi-VN")
                                : "N/A"}
                            </div>
                          </div>

                          {contractDetail?.updatedAt && (
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Ngày cập nhật
                              </label>
                              <div className="text-gray-800 bg-gray-50 rounded-lg p-3 border border-gray-200">
                                {new Date(
                                  contractDetail.updatedAt
                                ).toLocaleString("vi-VN")}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-white rounded-b-3xl flex justify-end gap-3">
                  <button
                    onClick={closeDetailDialog}
                    className="px-6 py-3 rounded-xl bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-semibold shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    Đóng
                  </button>
                  {selectedContract.status === "pending" && (
                    <button
                      onClick={handleConfirmFromDetail}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    >
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
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Xác nhận hợp đồng
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          {/* Confirm Contract Dialog */}
          {showConfirmDialog && selectedContract && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              onClick={closeConfirmDialog}
            >
              <div
                className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto custom-scroll border border-gray-100"
                onClick={(e) => e.stopPropagation()}
              >
                <style>{`
                  .custom-scroll { scrollbar-width: none; -ms-overflow-style: none; }
                  .custom-scroll::-webkit-scrollbar { width: 0; height: 0; }
                `}</style>

                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-secondary px-8 py-6 rounded-t-3xl flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold !text-white">
                      Xác nhận hợp đồng
                    </h2>
                    <p className="text-gray-100 text-sm">
                      Mã: {selectedContract.id}
                    </p>
                  </div>

                  <button
                    onClick={closeConfirmDialog}
                    disabled={isConfirming}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center !text-white text-xl transition disabled:opacity-50"
                  >
                    ✕
                  </button>
                </div>

                {/* Body */}
                <div className="p-8 space-y-6 max-h-[65vh] overflow-auto custom-scroll">
                  {/* Info Box */}
                  <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-primary mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>

                      <div className="text-sm text-primary">
                        <p className="font-semibold mb-1">
                          Lưu ý khi xác nhận:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-primary/90">
                          <li>Bạn cần kết nối MetaMask để ký hợp đồng</li>
                          <li>Giao dịch sẽ được ghi nhận trên blockchain</li>
                          <li>
                            Hợp đồng sẽ chuyển sang trạng thái &quot;Đã xác
                            nhận&quot;
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Loading */}
                  {loadingConfirmDetail ? (
                    <div className="flex items-center justify-center py-6">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-gray-200 rounded-full" />
                        <div className="w-10 h-10 border-4 border-[#4BADD1] rounded-full border-t-transparent animate-spin absolute" />
                        <p className="text-sm text-gray-600 mt-12">
                          Đang tải thông tin...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Mã hợp đồng */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Mã hợp đồng
                        </label>
                        <div className="font-mono text-sm text-gray-800 bg-gray-50 rounded-lg p-3 border border-gray-200">
                          {confirmContractDetail?.id ||
                            confirmContractDetail?._id ||
                            selectedContract.id}
                        </div>
                      </div>

                      {/* Tên file */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Tên file
                        </label>
                        <div className="text-gray-800 bg-gray-50 rounded-lg p-3 border border-gray-200">
                          {confirmContractDetail?.contractFileName ||
                            selectedContract.contractFileName ||
                            "N/A"}
                        </div>
                      </div>

                      {/* File hợp đồng */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          File hợp đồng
                        </label>
                        <div className="text-gray-800 bg-gray-50 rounded-lg p-3 border border-gray-200 break-all">
                          {confirmContractDetail?.contractFileUrl ||
                          selectedContract.contractFileUrl ? (
                            <a
                              href={
                                confirmContractDetail?.contractFileUrl ||
                                selectedContract.contractFileUrl
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {confirmContractDetail?.contractFileUrl ||
                                selectedContract.contractFileUrl}
                            </a>
                          ) : (
                            "N/A"
                          )}
                        </div>
                      </div>

                      {/* Nhà phân phối */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Nhà phân phối
                        </label>
                        <div className="text-gray-800 bg-gray-50 rounded-lg p-3 border border-gray-200">
                          {confirmContractDetail?.distributor?.businessName ||
                            confirmContractDetail?.distributor?.name ||
                            confirmContractDetail?.distributorId ||
                            "N/A"}
                        </div>
                      </div>

                      {/* Wallet Distributor */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Wallet Distributor
                        </label>
                        <div className="font-mono text-xs text-gray-800 bg-gray-50 rounded-lg p-3 border border-gray-200 break-all">
                          {confirmContractDetail?.distributorWalletAddress ||
                            confirmContractDetail?.distributorAddress ||
                            confirmContractDetail?.distributor?.walletAddress ||
                            "-"}
                        </div>
                      </div>

                      {/* Ngày tạo */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Ngày tạo
                        </label>
                        <div className="text-gray-800 bg-gray-50 rounded-lg p-3 border border-gray-200">
                          {confirmContractDetail?.createdAt ||
                          selectedContract.createdAt
                            ? new Date(
                                confirmContractDetail?.createdAt ||
                                  selectedContract.createdAt
                              ).toLocaleString("vi-VN")
                            : "N/A"}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="pt-6 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-white rounded-b-3xl flex justify-end gap-3 mt-2">
                    <button
                      onClick={closeConfirmDialog}
                      disabled={isConfirming}
                      className="px-6 py-3 rounded-xl bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-semibold shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Hủy
                    </button>

                    <button
                      onClick={handleConfirmContract}
                      disabled={isConfirming}
                      className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-primary via-secondary to-primary hover:from-secondary hover:via-primary hover:to-secondary shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 relative overflow-hidden group"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                      {isConfirming ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          <span className="relative z-10">
                            Đang xác nhận...
                          </span>
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-5 h-5 relative z-10"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                            />
                          </svg>
                          <span className="relative z-10">Xác nhận & Ký</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
