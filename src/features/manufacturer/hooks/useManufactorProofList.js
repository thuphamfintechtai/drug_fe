/* eslint-disable no-undef */
import { useEffect, useState } from "react";
import { useMyProofs } from "../apis/proofAPIs";

export const useManufactorProofList = ({ manufactorId }) => {
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { data } = useMyProofs();

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
        setProofs(data.proofs || []);
        setLoading(false);
      }, 500);
    } catch (err) {
      setError("Lỗi khi tải danh sách proofs");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (manufactorId) {
      loadProofs();
    }
  }, [manufactorId]);

  return {
    proofs,
    loading,
    error,
    loadProofs,
  };
};
