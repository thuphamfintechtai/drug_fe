import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../shared/components/DashboardLayout";
import { getManufacturerNavigationItems } from "../components/manufacturerNavigation";
import { useProofList } from "../hooks/useProofList";

export default function ProofList() {
  const { proofs, loading, pagination, currentPage, loadProofs } =
    useProofList();
  const navigate = useNavigate();
  const navigationItems = getManufacturerNavigationItems();

  return (
    <DashboardLayout navigationItems={navigationItems}>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">📦</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Proof of Production
                </h1>
                <p className="text-sm text-gray-500">
                  Danh sách chứng nhận sản xuất
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/manufacturer/proofs/create")}
              className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 !text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              <span>Tạo Proof mới</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 flex flex-col items-center">
              <div className="h-10 w-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Đang tải danh sách...</p>
            </div>
          ) : proofs.length === 0 ? (
            <div className="p-12 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-5xl">📦</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Chưa có Proof nào
              </h3>
              <p className="text-gray-600 mb-4">
                Hãy tạo Proof of Production đầu tiên
              </p>
              <button
                onClick={() => navigate("/manufacturer/proofs/create")}
                className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 !text-white rounded-xl font-semibold shadow-lg"
              >
                + Tạo Proof mới
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-cyan-600 to-teal-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold !text-white uppercase">
                      Mã lô
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold !text-white uppercase">
                      Tên thuốc
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold !text-white uppercase">
                      Số lượng
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold !text-white uppercase">
                      Ngày sản xuất
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold !text-white uppercase">
                      Ngày hết hạn
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold !text-white uppercase">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold !text-white uppercase">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {proofs.map((proof, index) => (
                    <tr
                      key={proof._id || index}
                      className="hover:bg-gradient-to-r hover:from-cyan-50 hover:to-teal-50 transition-all duration-200 group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-mono font-semibold bg-cyan-100 text-cyan-800 group-hover:bg-cyan-200">
                          {proof.batchNumber || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-800 group-hover:text-cyan-700">
                            {proof.drug?.tradeName || proof.drugName || "N/A"}
                          </span>
                          {proof.drug?.genericName && (
                            <span className="text-sm text-gray-500 mt-1">
                              {proof.drug.genericName}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-bold text-gray-800">
                          {proof.quantity?.toLocaleString() || 0}
                        </span>
                        <span className="text-sm text-gray-500 ml-2">viên</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">
                          {proof.mfgDate
                            ? new Date(proof.mfgDate).toLocaleDateString(
                                "vi-VN"
                              )
                            : "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">
                          {proof.expDate
                            ? new Date(proof.expDate).toLocaleDateString(
                                "vi-VN"
                              )
                            : "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-700">
                            {proof.createdAt
                              ? new Date(proof.createdAt).toLocaleDateString(
                                  "vi-VN"
                                )
                              : "N/A"}
                          </span>
                          {proof.createdAt && (
                            <span className="text-xs text-gray-500">
                              {new Date(proof.createdAt).toLocaleTimeString(
                                "vi-VN"
                              )}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() =>
                            navigate(`/manufacturer/proofs/${proof._id}`)
                          }
                          className="px-4 py-2 text-sm font-medium !text-white bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 rounded-lg shadow-md hover:shadow-lg transition-all"
                        >
                          <span className="mr-1">👁️</span>
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => loadProofs(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className={`px-5 py-2.5 rounded-xl border font-semibold transition-all ${
                    currentPage <= 1
                      ? "text-gray-400 border-gray-200 cursor-not-allowed"
                      : "text-cyan-700 border-cyan-400 bg-white hover:bg-cyan-50"
                  }`}
                >
                  ← Trước
                </button>

                <div className="text-gray-700">
                  Trang{" "}
                  <span className="font-bold text-cyan-600">{currentPage}</span>{" "}
                  / {pagination.pages}
                  {" • "}
                  Tổng: <span className="font-bold">{pagination.total}</span>
                </div>

                <button
                  onClick={() => loadProofs(currentPage + 1)}
                  disabled={currentPage >= pagination.pages}
                  className={`px-5 py-2.5 rounded-xl border font-semibold transition-all ${
                    currentPage >= pagination.pages
                      ? "text-gray-400 border-gray-200 cursor-not-allowed"
                      : "text-cyan-700 border-cyan-400 bg-white hover:bg-cyan-50"
                  }`}
                >
                  Sau →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
