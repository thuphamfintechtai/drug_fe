import React, { useEffect, useState } from "react";

const ManufactorProofList = ({ manufactorId }) => {
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mock data
  const mockProofs = [
    {
      _id: "1",
      batchNumber: "BATCH-001",
      drug: { tradeName: "Paracetamol 500mg", genericName: "Paracetamol" },
      mfgDate: "2024-01-15",
      expDate: "2026-01-15",
      quantity: 10000,
    },
    {
      _id: "2",
      batchNumber: "BATCH-002",
      drug: { tradeName: "Amoxicillin 250mg", genericName: "Amoxicillin" },
      mfgDate: "2024-02-20",
      expDate: "2026-02-20",
      quantity: 5000,
    },
    {
      _id: "3",
      batchNumber: "BATCH-003",
      drug: { tradeName: "Aspirin 100mg", genericName: "Aspirin" },
      mfgDate: "2024-03-10",
      expDate: "2026-03-10",
      quantity: 8000,
    },
  ];

  const loadProofs = async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      // const res = await getProofOfProductionsByManufactorId(manufactorId);
      // if (res.success) {
      //   setProofs(res.data.proofs || []);
      // } else {
      //   setError('Không thể tải danh sách proofs');
      // }

      // Using mock data for now
      setTimeout(() => {
        setProofs(mockProofs);
        setLoading(false);
      }, 500);
    } catch (err) {
      setError("Lỗi khi tải danh sách proofs");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (manufactorId) loadProofs();
  }, [manufactorId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <i className="fas fa-file-prescription !text-white text-xl"></i>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Danh sách Proofs của Manufacturer
                </h1>
                <p className="text-sm text-gray-500">
                  Quản lý chứng từ sản xuất thuốc
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-semibold">
                <i className="fas fa-list mr-2"></i>
                Tổng: {proofs.length}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
              <div className="flex items-center">
                <i className="fas fa-exclamation-circle text-red-600 mr-2"></i>
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Loading State */}
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600 font-medium">Đang tải dữ liệu...</p>
            </div>
          ) : proofs.length === 0 ? (
            /* Empty State */
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-inbox text-gray-400 text-3xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Không có dữ liệu
              </h3>
              <p className="text-gray-500">
                Chưa có chứng từ nào được tìm thấy
              </p>
            </div>
          ) : (
            /* Table with Data */
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-500 to-purple-600 !text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                      <i className="fas fa-barcode mr-2"></i>
                      Mã lô
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                      <i className="fas fa-pills mr-2"></i>
                      Tên thuốc
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                      <i className="fas fa-calendar-check mr-2"></i>
                      Ngày sản xuất
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                      <i className="fas fa-calendar-times mr-2"></i>
                      Ngày hết hạn
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">
                      <i className="fas fa-boxes mr-2"></i>
                      Số lượng
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {proofs.map((p, index) => (
                    <tr
                      key={p._id}
                      className="transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:shadow-md group cursor-pointer"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 group-hover:bg-blue-200 transition-colors">
                            {p.batchNumber}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          {p.drug?.tradeName || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-700">
                          <i className="fas fa-calendar-alt mr-2 text-gray-400 group-hover:text-green-500 transition-colors"></i>
                          <span className="font-medium">
                            {new Date(p.mfgDate).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-700">
                          <i className="fas fa-calendar-times mr-2 text-gray-400 group-hover:text-red-500 transition-colors"></i>
                          <span className="font-medium">
                            {new Date(p.expDate).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-purple-100 text-purple-800 group-hover:bg-purple-200 transition-colors">
                            <i className="fas fa-boxes mr-1"></i>
                            {p.quantity}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManufactorProofList;
