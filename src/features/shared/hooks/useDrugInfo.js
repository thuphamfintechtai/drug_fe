import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import api from "../../utils/api";

export const useDrugInfo = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [searchType, setSearchType] = useState(
    searchParams.get("type") || "name"
  ); // 'name' or 'atc'
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(null);
  const [requiresAuth, setRequiresAuth] = useState(false);

  useEffect(() => {
    if (searchTerm) {
      handleSearch();
    }
  }, []);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error("Vui lòng nhập tên thuốc hoặc mã ATC");
      return;
    }

    setLoading(true);
    setSearched(true);
    setError(null);
    setRequiresAuth(false);

    try {
      let response;
      response = await api.get(`/public/drugs/search`, {
        params: { atcCode: searchTerm.trim() },
      });

      const data = response.data?.data || response.data;
      console.log("Drug search response:", data);

      if (data.success || data.drug || data.drugs) {
        let drugsData = data.data || data.drug || data.drugs || data;

        // Xử lý nhiều trường hợp response
        if (Array.isArray(drugsData)) {
          setDrugs(drugsData);
        } else if (drugsData?.drugs && Array.isArray(drugsData.drugs)) {
          setDrugs(drugsData.drugs);
        } else if (drugsData?.drug && typeof drugsData.drug === "object") {
          setDrugs([drugsData.drug]);
        } else if (
          drugsData &&
          typeof drugsData === "object" &&
          !Array.isArray(drugsData)
        ) {
          if (
            drugsData.tradeName ||
            drugsData.atcCode ||
            drugsData.genericName
          ) {
            setDrugs([drugsData]);
          } else {
            setDrugs([]);
          }
        } else {
          setDrugs([]);
        }

        setSearchParams({ search: searchTerm.trim(), type: searchType });
      } else {
        setDrugs([]);
        setError(data.message || response.data?.message || "Không tìm thấy thông tin thuốc");
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm thuốc:", error);
      setDrugs([]);

      if (error.response?.status === 401 || error.response?.status === 403) {
        setRequiresAuth(true);
        setError(
          "Một số thông tin thuốc yêu cầu đăng nhập để xem. Vui lòng đăng nhập để xem đầy đủ thông tin."
        );
      } else {
        setError(
          error.response?.data?.message ||
            error.message ||
            "Không thể tra cứu thông tin thuốc."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    searchType,
    handleSearch,
    drugs,
    loading,
    searched,
    error,
    isAuthenticated,
    user,
    requiresAuth,
  };
};
