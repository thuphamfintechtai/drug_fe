import { useState, useEffect } from "react";
import { drugAPIs } from "../apis/drugAPIs";

export const useManufactorDrugDetailModal = ({ isOpen, drugId }) => {
  const [drug, setDrug] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && drugId) {
      loadDrugDetails();
    }
  }, [isOpen, drugId]);

  const loadDrugDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await drugAPIs.getDrugById(drugId);
      if (response.success) {
        setDrug(response.data);
      } else {
        setError(response.message || "Không thể tải thông tin thuốc");
      }
    } catch (err) {
      setError(err.message || "Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };
  return {
    drug,
    loading,
    error,
    loadDrugDetails,
  };
};
