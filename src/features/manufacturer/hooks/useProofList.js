import { useAuth } from "../../shared/context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { proofAPIs } from "../apis/proofAPIs";
import { toast } from "sonner";

export const useProofList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const loadProofs = async (page = 1) => {
    setLoading(true);
    try {
      const response = await proofAPIs.getMyProofs(page, 10);
      setProofs(response.data.proofs || []);
      setPagination(response.data.pagination || null);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error loading proofs:", error);
      toast.error("Không thể tải danh sách proofs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProofs(1);
  }, []);

  return {
    proofs,
    loading,
    pagination,
    currentPage,
    loadProofs,
    location
  };
};
