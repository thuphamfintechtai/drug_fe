import api from "../../utils/api";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const manufacturerAPIs = {
  // ============ QUẢN LÝ THUỐC ============
  getDrugs: (params = {}) => {
    return useQuery({
      queryKey: ["getDrugs", params],
      queryFn: async () => {
        const response = await api.get("/pharma-company/drugs", { params });
        return response.data;
      },
    });
  },

  getDrugById: (id) => {
    return useQuery({
      queryKey: ["getDrugById", id],
      queryFn: async () => {
        const response = await api.get(`/pharma-company/drugs/${id}`);
        return response.data;
      },
    });
  },

  searchDrugByATC: (atcCode) => {
    return useQuery({
      queryKey: ["searchDrugByATC", atcCode],
      queryFn: async () => {
        const response = await api.get(`/pharma-company/drugs/search`, {
          params: { atcCode },
        });
        return response.data;
      },
    });
  },

  addDrug: (data) => {
    return useMutation({
      mutationFn: async () => {
        const response = await api.post("/pharma-company/drugs", data);
        return response.data;
      },
      onSuccess: () => {
        toast.success("Thêm thuốc thành công");
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || error.message);
      },
    });
  },

  updateDrug: (id, data) => {
    return useMutation({
      mutationFn: async () => {
        const response = await api.put(`/pharma-company/drugs/${id}`, data);
        return response.data;
      },
      onSuccess: () => {
        toast.success("Cập nhật thuốc thành công");
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || error.message);
      },
    });
  },

  deleteDrug: (id) => {
    return useMutation({
      mutationFn: async () => {
        const response = await api.delete(`/pharma-company/drugs/${id}`);
        return response.data;
      },
      onSuccess: () => {
        toast.success("Xóa thuốc thành công");
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || error.message);
      },
    });
  },

  // ============ QUẢN LÝ SẢN XUẤT VÀ PHÂN PHỐI ============
  // Bước 1: Upload lên IPFS
  uploadToIPFS: (data) => {
    return useMutation({
      mutationFn: async () => {
        const response = await api.post(
          "/pharma-company/production/upload-ipfs",
          data
        );
        return response.data;
      },
      onSuccess: () => {
        toast.success("Upload lên IPFS thành công");
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || error.message);
      },
    });
  },

  saveMintedNFTs: (data) => {
    return useMutation({
      mutationFn: async () => {
        const response = await api.post(
          "/pharma-company/production/save-minted",
          data
        );
        return response.data;
      },
      onSuccess: () => {
        toast.success("Lưu NFT thành công");
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || error.message);
      },
    });
  },

  createTransferToDistributor: (data) => {
    return useMutation({
      mutationFn: async () => {
        const response = await api.post(
          "/pharma-company/production/transfer",
          data
        );
        return response.data;
      },
      onSuccess: () => {
        toast.success("Tạo chuyển giao thành công");
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || error.message);
      },
    });
  },

  saveTransferTransaction: (data) => {
    return useMutation({
      mutationFn: async () => {
        const response = await api.post(
          "/pharma-company/production/save-transfer",
          data
        );
        return response.data;
      },
      onSuccess: () => {
        toast.success("Lưu transaction hash thành công");
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || error.message);
      },
    });
  },

  getProductionHistory: (params = {}) => {
    return useQuery({
      queryKey: ["getProductionHistory", params],
      queryFn: async () => {
        const response = await api.get("/pharma-company/production/history", {
          params,
        });
        return response.data;
      },
    });
  },

  getAvailableTokensForProduction: (productionId) => {
    return useQuery({
      queryKey: ["getAvailableTokensForProduction", productionId],
      queryFn: async () => {
        const response = await api.get(
          `/pharma-company/production/${productionId}/available-tokens`
        );
        return response.data;
      },
    });
  },

  getTransferHistory: (params = {}) => {
    return useQuery({
      queryKey: ["getTransferHistory", params],
      queryFn: async () => {
        const response = await api.get("/pharma-company/transfer/history", {
          params,
        });
        return response.data;
      },
    });
  },

  // Thống kê
  getStatistics: () => {
    return useQuery({
      queryKey: ["getStatistics"],
      queryFn: async () => {
        const response = await api.get("/pharma-company/statistics");
        return response;
      },
    });
  },

  getDashboardStats: () => {
    return useQuery({
      queryKey: ["getDashboardStats"],
      queryFn: async () => {
        const response = await api.get("/statistics/manufacturer/dashboard");
        return response.data;
      },
    });
  },

  // Chart APIs
  getChartOneWeek: () => {
    return useQuery({
      queryKey: ["getChartOneWeek"],
      queryFn: async () => {
        const response = await api.get("/pharma-company/chart/one-week");
        return response.data;
      },
    });
  },

  getChartTodayYesterday: () => {
    return useQuery({
      queryKey: ["getChartTodayYesterday"],
      queryFn: async () => {
        const response = await api.get("/pharma-company/chart/today-yesterday");
        return response.data;
      },
    });
  },

  getChartProductionsByDateRange: (startDate, endDate) => {
    return useQuery({
      queryKey: ["getChartProductionsByDateRange", startDate, endDate],
      queryFn: async () => {
        const response = await api.get(
          "/pharma-company/chart/productions-by-date-range",
          { params: { startDate, endDate } }
        );
        return response.data;
      },
    });
  },

  getChartDistributionsByDateRange: (startDate, endDate) => {
    return useQuery({
      queryKey: ["getChartDistributionsByDateRange", startDate, endDate],
      queryFn: async () => {
        const response = await api.get(
          "/pharma-company/chart/distributions-by-date-range",
          { params: { startDate, endDate } }
        );
        return response.data;
      },
    });
  },

  getChartTransfersByDateRange: (startDate, endDate) => {
    return useQuery({
      queryKey: ["getChartTransfersByDateRange", startDate, endDate],
      queryFn: async () => {
        const response = await api.get(
          "/pharma-company/chart/transfers-by-date-range",
          { params: { startDate, endDate } }
        );
        return response.data;
      },
    });
  },

  getMonthlyTrends: (months = 6) => {
    return useQuery({
      queryKey: ["getMonthlyTrends", months],
      queryFn: async () => {
        const response = await api.get("/statistics/trends/monthly", {
          params: { months },
        });
        return response.data;
      },
    });
  },

  getPerformanceMetrics: (startDate, endDate) => {
    return useQuery({
      queryKey: ["getPerformanceMetrics", startDate, endDate],
      queryFn: async () => {
        const response = await api.get("/statistics/performance", {
          params: { startDate, endDate },
        });
        return response.data;
      },
    });
  },

  getComplianceStats: () => {
    return useQuery({
      queryKey: ["getComplianceStats"],
      queryFn: async () => {
        const response = await api.get("/statistics/compliance");
        return response.data;
      },
    });
  },

  getBlockchainStats: () => {
    return useQuery({
      queryKey: ["getBlockchainStats"],
      queryFn: async () => {
        const response = await api.get("/statistics/blockchain");
        return response.data;
      },
    });
  },

  getAlertsStats: () => {
    return useQuery({
      queryKey: ["getAlertsStats"],
      queryFn: async () => {
        const response = await api.get("/statistics/alerts");
        return response.data;
      },
    });
  },

  getProductAnalytics: () => {
    return useQuery({
      queryKey: ["getProductAnalytics"],
      queryFn: async () => {
        const response = await api.get("/statistics/manufacturer/products");
        return response.data;
      },
    });
  },

  getSupplyChainStats: () => {
    return useQuery({
      queryKey: ["getSupplyChainStats"],
      queryFn: async () => {
        const response = await api.get("/statistics/manufacturer/supply-chain");
        return response.data;
      },
    });
  },

  getManufactureIPFSStatus: () => {
    return useQuery({
      queryKey: ["getManufactureIPFSStatus"],
      queryFn: async () => {
        const response = await api.get("/pharma-company/ipfs-status");
        return response.data;
      },
    });
  },

  getDistributors: (params = {}) => {
    return useQuery({
      queryKey: ["getDistributors", params],
      queryFn: async () => {
        const response = await api.get("/pharma-company/distributors", {
          params,
        });
        return response.data;
      },
    });
  },
};
