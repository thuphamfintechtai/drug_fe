import { useState, useEffect } from "react";
import { drugAPIs } from "../apis/drugAPIs";

export const useManufactorDrugCodesModal = ({ isOpen, onClose }) => {
  const [codes, setCodes] = useState([]);
  const [filteredCodes, setFilteredCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadDrugCodes();
    }
  }, [isOpen]);

  useEffect(() => {
    filterCodes();
  }, [searchTerm, codes]);

  const loadDrugCodes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await drugAPIs.getDrugCodes();
      if (response.success) {
        setCodes(response.data || []);
      } else {
        setError(response.message || "Không thể tải danh sách mã ATC");
      }
    } catch (err) {
      setError(err.message || "Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  const filterCodes = () => {
    if (!searchTerm.trim()) {
      return setFilteredCodes(codes);
    }
    const filtered = codes.filter(
      (code) =>
        code.atcCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        code.tradeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        code.genericName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCodes(filtered);
  };

  const formatATCCode = (atcCode) => {
    if (!atcCode) {
      return "N/A";
    }
    if (atcCode.length >= 7) {
      return `${atcCode.substring(0, 3)}.${atcCode.substring(
        3,
        5
      )}.${atcCode.substring(5)}`;
    }
    return atcCode;
  };
  return {
    codes,
    filteredCodes,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    formatATCCode,
    loadDrugCodes,
  };
};
