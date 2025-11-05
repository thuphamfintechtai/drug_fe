import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';

export default function ManufactorProductionList() {
  const { user } = useAuth();
  const [proofs, setProofs] = useState([]);
  const [loadingProofs, setLoadingProofs] = useState(false);
  const [pagination, setPagination] = useState(null);

  const navigationItems = [
    { path: '/manufacturer', label: 'Tổng quan', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>), active: false },
    { path: '/manufacturer/drugs', label: 'Quản lý thuốc', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>), active: false },
    { path: '/manufacturer/production', label: 'Sản xuất thuốc', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>), active: false },
    { path: '/manufacturer/transfer', label: 'Chuyển giao', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>), active: false },
    { path: '/manufacturer/production-history', label: 'Lịch sử sản xuất', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>), active: false },
    { path: '/manufacturer/transfer-history', label: 'Lịch sử chuyển giao', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>), active: false },
    { path: '/manufacturer/profile', label: 'Hồ sơ', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>), active: false },
  ];

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
      signed: "bg-blue-100 text-blue-700 border-blue-300",
      verified: "bg-indigo-100 text-indigo-700 border-indigo-300",
      completed: "bg-green-100 text-green-700 border-green-300",
      rejected: "bg-red-100 text-red-700 border-red-300",
      distributed: "bg-purple-100 text-purple-700 border-purple-300",
    };

    const labels = {
      pending: "Chờ ký",
      signed: "Đã ký",
      verified: "Đã xác minh",
      completed: "Hoàn thành",
      rejected: "Từ chối",
      distributed: "Đã phân phối",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full border ${
          styles[status] || styles.pending
        }`}
      >
        {labels[status] || status}
      </span>
    );
  };

  // Mock data - replace with actual API call
  const mockProofs = [
    {
      _id: '1',
      batchNumber: 'BATCH-001',
      drug: { tradeName: 'Paracetamol 500mg', genericName: 'Paracetamol' },
      mfgDate: '2024-01-15',
      expDate: '2026-01-15',
      quantity: 10000,
      status: 'signed',
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      _id: '2',
      batchNumber: 'BATCH-002',
      drug: { tradeName: 'Amoxicillin 250mg', genericName: 'Amoxicillin' },
      mfgDate: '2024-02-20',
      expDate: '2026-02-20',
      quantity: 5000,
      status: 'pending',
      createdAt: '2024-02-20T14:30:00Z'
    },
    {
      _id: '3',
      batchNumber: 'BATCH-003',
      drug: { tradeName: 'Aspirin 100mg', genericName: 'Aspirin' },
      mfgDate: '2024-03-10',
      expDate: '2026-03-10',
      quantity: 8000,
      status: 'completed',
      createdAt: '2024-03-10T09:15:00Z'
    }
  ];

  const loadProofs = async (page = 1) => {
    setLoadingProofs(true);
    try {
      // TODO: Replace with actual API call
      // const response = await getProofOfProductionsByManufacturerId(user._id, page);
      // setProofs(response.data.proofs || []);
      // setPagination(response.data.pagination || null);
      
      // Using mock data for now
      setTimeout(() => {
        setProofs(mockProofs);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: mockProofs.length
        });
        setLoadingProofs(false);
      }, 500);
    } catch (error) {
      console.error('Error loading proofs:', error);
      setProofs([]);
      setLoadingProofs(false);
    }
  };

  useEffect(() => {
    loadProofs(1);
  }, [user]);

  const handleViewDetails = (proofId) => {
    // TODO: Navigate to detail page or open modal
    console.log('View details for proof:', proofId);
    alert(`Xem chi tiết proof: ${proofId}`);
  };

  const handleUpdateStatus = (proof) => {
    // TODO: Open status update dialog
    console.log('Update status for proof:', proof);
    alert(`Cập nhật trạng thái cho proof: ${proof.batchNumber}`);
  };

  const ListContent = () => {
    if (loadingProofs) {
      return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 flex flex-col items-center">
            <div className="h-10 w-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 text-base font-medium">Đang tải danh sách...</p>
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
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white rounded-xl text-base font-semibold transition-all shadow-md hover:shadow-lg"
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
                <i className="fas fa-boxes text-white text-lg"></i>
              </div>
              Danh sách Proof of Production
            </h2>
            <button
              onClick={() => loadProofs(1)}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white rounded-xl text-base font-semibold transition-all shadow-md hover:shadow-lg"
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
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                    Mã lô
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                    Tên thuốc
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                    Số lượng sản xuất
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                    Ngày sản xuất
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
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
                          {proof.drug?.tradeName || proof.drugName || "Không rõ"}
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
                            ? new Date(proof.mfgDate || proof.productionDate).toLocaleDateString("vi-VN")
                            : "N/A"}
                        </span>
                        {proof.expDate && (
                          <span className="text-xs text-gray-500 mt-1">
                            HSD: {new Date(proof.expDate).toLocaleDateString("vi-VN")}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(proof.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700">
                          {proof.createdAt
                            ? new Date(proof.createdAt).toLocaleDateString("vi-VN")
                            : "N/A"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {proof.createdAt
                            ? new Date(proof.createdAt).toLocaleTimeString("vi-VN")
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
                          className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 rounded-lg shadow-md hover:shadow-lg transition-all"
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
