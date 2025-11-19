/* eslint-disable no-undef */
import { useEffect, useState } from "react";
import { useAuth } from "../../shared/context/AuthContext";
import { toast } from "sonner";

export const useManufactorProductionList = () => {
  const { user } = useAuth();
  const [proofs, setProofs] = useState([]);
  const [loadingProofs, setLoadingProofs] = useState(false);
  const [pagination, setPagination] = useState(null);

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
      _id: "1",
      batchNumber: "BATCH-001",
      drug: { tradeName: "Paracetamol 500mg", genericName: "Paracetamol" },
      mfgDate: "2024-01-15",
      expDate: "2026-01-15",
      quantity: 10000,
      status: "signed",
      createdAt: "2024-01-15T10:00:00Z",
    },
    {
      _id: "2",
      batchNumber: "BATCH-002",
      drug: { tradeName: "Amoxicillin 250mg", genericName: "Amoxicillin" },
      mfgDate: "2024-02-20",
      expDate: "2026-02-20",
      quantity: 5000,
      status: "pending",
      createdAt: "2024-02-20T14:30:00Z",
    },
    {
      _id: "3",
      batchNumber: "BATCH-003",
      drug: { tradeName: "Aspirin 100mg", genericName: "Aspirin" },
      mfgDate: "2024-03-10",
      expDate: "2026-03-10",
      quantity: 8000,
      status: "completed",
      createdAt: "2024-03-10T09:15:00Z",
    },
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
          totalItems: mockProofs.length,
        });
        setLoadingProofs(false);
      }, 500);
    } catch (error) {
      console.error("Error loading proofs:", error);
      setProofs([]);
      setLoadingProofs(false);
    }
  };

  useEffect(() => {
    loadProofs(1);
  }, [user]);

  const handleViewDetails = (proofId) => {
    // TODO: Navigate to detail page or open modal
    console.log("View details for proof:", proofId);
    toast.success(`Xem chi tiết proof: ${proofId}`);
  };

  const handleUpdateStatus = (proof) => {
    // TODO: Open status update dialog
    console.log("Update status for proof:", proof);
    toast.success(`Cập nhật trạng thái cho proof: ${proof.batchNumber}`);
  };

  return {
    proofs,
    loadingProofs,
    pagination,
    getStatusBadge,
    handleViewDetails,
    handleUpdateStatus,
    loadProofs,
  };
};
