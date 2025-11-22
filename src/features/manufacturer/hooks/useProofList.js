import { useAuth } from "../../shared/context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../utils/api";
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
      const response = await api.get(
        `/proof-of-production/manufacturer/my-proofs?page=${page}&limit=10`
      );
      const data = response.data;
      setProofs(data.data?.proofs || data.proofs || []);
      setPagination(data.data?.pagination || data.pagination || null);
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
