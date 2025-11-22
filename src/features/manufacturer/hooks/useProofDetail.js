import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../../utils/api";
import { toast } from "sonner";

export const useProofDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [proof, setProof] = useState(null);
  const [nftInfo, setNftInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProofDetail();
  }, [id]);

  const loadProofDetail = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/proof-of-production/${id}`);
      const data = response.data;

      if (data.success) {
        setProof(data.data?.proof || data.proof);
        setNftInfo(data.data?.nftInfo || data.nftInfo);
      }
    } catch (error) {
      console.error("Error loading proof detail:", error);
      toast.error("Không thể tải thông tin proof");
      navigate("/manufacturer/proofs");
    } finally {
      setLoading(false);
    }
  };

  return {
    proof,
    nftInfo,
    loading,
    loadProofDetail,
  };
};
