import DashboardLayout from "../../shared/components/DashboardLayout";
import { navigationItems } from "../constants/navigationManufactorProductionList";
import { useManufactorProductionList } from "../hooks/useManufactorProductionList";

export default function ManufactorProductionList() {
  const {
    proofs,
    loadingProofs,
    pagination,
    getStatusBadge,
    handleViewDetails,
    handleUpdateStatus,
    loadProofs,
  } = useManufactorProductionList();

  const ListContent = () => {
    if (loadingProofs) {
      return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 flex flex-col items-center">
          <div className="h-10 w-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 text-base font-medium">
            Đang tải danh sách...
          </p>
        </div>
      );
    }

    if (!proofs || proofs.length === 0) {
      return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <i className="fas fa-boxes text-cyan-600"></i>
              Danh sách Proof of Production
            </h2>
            <button
              onClick={() => loadProofs(1)}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 !text-white rounded-xl text-base font-semibold transition-all shadow-md hover:shadow-lg"
            >
              <i className="fas fa-sync-alt mr-2"></i>
              Làm mới
            </button>
          </div>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-2xl flex items-center justify-center mb-6">
              <span className="text-5xl">📦</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Chưa có Proof of Production nào
            </h3>
            <p className="text-base text-gray-600 max-w-md">
              Hãy tạo Proof mới để bắt đầu quản lý quy trình sản xuất thuốc.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <i className="fas fa-boxes !text-white text-lg"></i>
              </div>
              Danh sách Proof of Production
            </h2>
            <button
              onClick={() => loadProofs(1)}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 !text-white rounded-xl text-base font-semibold transition-all shadow-md hover:shadow-lg"
            >
              <i className="fas fa-sync-alt mr-2"></i>
              Làm mới
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-cyan-600 to-teal-600">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold !text-white uppercase tracking-wider">
                    Mã lô
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold !text-white uppercase tracking-wider">
                    Tên thuốc
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold !text-white uppercase tracking-wider">
                    Số lượng sản xuất
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold !text-white uppercase tracking-wider">
                    Ngày sản xuất
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold !text-white uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold !text-white uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold !text-white uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {proofs.map((proof) => (
                  <tr
                    key={proof._id}
                    className="hover:bg-gradient-to-r hover:from-cyan-50 hover:to-teal-50 transition-all duration-200 group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-mono font-semibold bg-cyan-100 text-cyan-800 group-hover:bg-cyan-200 transition-colors">
                        {proof.batchNumber || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-base font-semibold text-gray-800 group-hover:text-cyan-700 transition-colors">
                          {proof.drug?.tradeName ||
                            proof.drugName ||
                            "Không rõ"}
                        </span>
                        {proof.drug?.genericName && (
                          <span className="text-sm text-gray-500 mt-1">
                            {proof.drug.genericName}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-base font-bold text-gray-800">
                          {proof.quantity?.toLocaleString() || 0}
                        </span>
                        <span className="text-sm text-gray-500 ml-2">viên</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700">
                          {proof.mfgDate || proof.productionDate
                            ? new Date(
                                proof.mfgDate || proof.productionDate
                              ).toLocaleDateString("vi-VN")
                            : "N/A"}
                        </span>
                        {proof.expDate && (
                          <span className="text-xs text-gray-500 mt-1">
                            HSD:{" "}
                            {new Date(proof.expDate).toLocaleDateString(
                              "vi-VN"
                            )}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(proof.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700">
                          {proof.createdAt
                            ? new Date(proof.createdAt).toLocaleDateString(
                                "vi-VN"
                              )
                            : "N/A"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {proof.createdAt
                            ? new Date(proof.createdAt).toLocaleTimeString(
                                "vi-VN"
                              )
                            : ""}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetails(proof._id)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-cyan-400 hover:text-cyan-700 transition-all"
                        >
                          <i className="fas fa-eye mr-1"></i>
                          Xem
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(proof)}
                          className="px-4 py-2 text-sm font-medium !text-white bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 rounded-lg shadow-md hover:shadow-lg transition-all"
                        >
                          <i className="fas fa-edit mr-1"></i>
                          Cập nhật
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => loadProofs(pagination.currentPage - 1)}
                  disabled={pagination.currentPage <= 1}
                  className={`px-5 py-2.5 rounded-xl border text-base font-semibold transition-all ${
                    pagination.currentPage <= 1
                      ? "text-gray-400 border-gray-200 cursor-not-allowed bg-gray-50"
                      : "text-cyan-700 border-cyan-400 bg-white hover:bg-cyan-50 hover:shadow-md"
                  }`}
                >
                  <i className="fas fa-chevron-left mr-2"></i>
                  Trước
                </button>

                <div className="text-base text-gray-700 text-center">
                  Trang{" "}
                  <span className="font-bold text-cyan-600">
                    {pagination.currentPage}
                  </span>{" "}
                  / {pagination.totalPages} • Tổng:{" "}
                  <span className="font-bold text-gray-800">
                    {pagination.totalItems}
                  </span>{" "}
                  mục
                </div>

                <button
                  onClick={() => loadProofs(pagination.currentPage + 1)}
                  disabled={pagination.currentPage >= pagination.totalPages}
                  className={`px-5 py-2.5 rounded-xl border text-base font-semibold transition-all ${
                    pagination.currentPage >= pagination.totalPages
                      ? "text-gray-400 border-gray-200 cursor-not-allowed bg-gray-50"
                      : "text-cyan-700 border-cyan-400 bg-white hover:bg-cyan-50 hover:shadow-md"
                  }`}
                >
                  Sau
                  <i className="fas fa-chevron-right ml-2"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout navigationItems={navigationItems}>
      <ListContent />
    </DashboardLayout>
  );
}
