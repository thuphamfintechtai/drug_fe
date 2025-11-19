import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { proofAPIs } from "../apis/proofAPIs";
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
      const response = await proofAPIs.getProofById(id);

      if (response.success) {
        setProof(response.data.proof);
        setNftInfo(response.data.nftInfo);
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
