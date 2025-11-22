import api from "../../utils/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Individual hooks - must be called at top level of component/hook
// ============ QUẢN LÝ THUỐC ============
export const useManufacturerDrugs = (params = {}) => {
  return useQuery({
    queryKey: ["getDrugs", params],
    queryFn: async () => {
      const response = await api.get("/drugs", { params });
      return response.data;
    },
  });
};

export const useManufacturerDrugById = (id) => {
  return useQuery({
    queryKey: ["getDrugById", id],
    queryFn: async () => {
      const response = await api.get(`/drugs/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useManufacturerSearchDrugByATC = (atcCode) => {
  return useQuery({
    queryKey: ["searchDrugByATC", atcCode],
    queryFn: async () => {
      const response = await api.get(`/drugs/search/atc`, {
        params: { atcCode },
      });
      return response.data;
    },
    enabled: !!atcCode,
  });
};

export const useManufacturerAddDrug = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post("/drugs", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Thêm thuốc thành công");
      queryClient.invalidateQueries({ queryKey: ["getDrugs"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message);
    },
  });
};

export const useManufacturerUpdateDrug = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ drugId, data }) => {
      const response = await api.put(`/drugs/${drugId}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Cập nhật thuốc thành công");
      queryClient.invalidateQueries({ queryKey: ["getDrugs"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message);
    },
  });
};

export const useManufacturerDeleteDrug = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (drugId) => {
      const response = await api.delete(`/drugs/${drugId}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Xóa thuốc thành công");
      queryClient.invalidateQueries({ queryKey: ["getDrugs"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message);
    },
  });
};

// ============ QUẢN LÝ SẢN XUẤT VÀ PHÂN PHỐI ============
export const useUploadToIPFS = () => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post("/production/upload-ipfs", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Upload lên IPFS thành công");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message);
    },
  });
};

export const useSaveMintedNFTs = () => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post("/production/save-minted", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Lưu NFT thành công");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message);
    },
  });
};

export const useCreateTransferToDistributor = () => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post("/production/transfer", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Tạo chuyển giao thành công");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message);
    },
  });
};

export const useSaveTransferTransaction = () => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post("/production/save-transfer", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Lưu transaction hash thành công");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message);
    },
  });
};

export const useManufacturerProductionHistory = (params = {}) => {
  return useQuery({
    queryKey: ["getProductionHistory", params],
    queryFn: async () => {
      const response = await api.get("/production/history", {
        params,
      });
      return response.data;
    },
  });
};

export const useManufacturerAvailableTokensForProduction = (productionId) => {
  return useQuery({
    queryKey: ["getAvailableTokensForProduction", productionId],
    queryFn: async () => {
      const response = await api.get(
        `/production/${productionId}/available-tokens`
      );
      return response.data;
    },
    enabled: !!productionId,
  });
};

export const useManufacturerTransferHistory = (params = {}) => {
  return useQuery({
    queryKey: ["getTransferHistory", params],
    queryFn: async () => {
      const response = await api.get("/production/transfer/history", {
        params,
      });
      return response.data;
    },
  });
};

// Thống kê
export const useManufacturerStatistics = () => {
  return useQuery({
    queryKey: ["getStatistics"],
    queryFn: async () => {
      const response = await api.get("/production/statistics");
      return response.data;
    },
  });
};

export const useManufacturerDashboardStats = () => {
  return useQuery({
    queryKey: ["getDashboardStats"],
    queryFn: async () => {
      const response = await api.get("/statistics/manufacturer/dashboard");
      return response.data;
    },
  });
};

// Chart APIs
export const useManufacturerChartOneWeek = () => {
  return useQuery({
    queryKey: ["getChartOneWeek"],
    queryFn: async () => {
      const response = await api.get("/production/chart/one-week");
      return response.data;
    },
  });
};

export const useManufacturerChartTodayYesterday = () => {
  return useQuery({
    queryKey: ["getChartTodayYesterday"],
    queryFn: async () => {
      const response = await api.get("/production/chart/today-yesterday");
      return response.data;
    },
  });
};

export const useManufacturerChartProductionsByDateRange = (
  startDate,
  endDate
) => {
  return useQuery({
    queryKey: ["getChartProductionsByDateRange", startDate, endDate],
    queryFn: async () => {
      const response = await api.get(
        "/production/chart/productions-by-date-range",
        { params: { startDate, endDate } }
      );
      return response.data;
    },
    enabled: !!startDate && !!endDate,
  });
};

export const useManufacturerChartDistributionsByDateRange = (
  startDate,
  endDate
) => {
  return useQuery({
    queryKey: ["getChartDistributionsByDateRange", startDate, endDate],
    queryFn: async () => {
      const response = await api.get(
        "/production/chart/distributions-by-date-range",
        { params: { startDate, endDate } }
      );
      return response.data;
    },
    enabled: !!startDate && !!endDate,
  });
};

export const useManufacturerChartTransfersByDateRange = (
  startDate,
  endDate
) => {
  return useQuery({
    queryKey: ["getChartTransfersByDateRange", startDate, endDate],
    queryFn: async () => {
      const response = await api.get(
        "/production/chart/transfers-by-date-range",
        { params: { startDate, endDate } }
      );
      return response.data;
    },
    enabled: !!startDate && !!endDate,
  });
};

export const useManufacturerMonthlyTrends = (months = 6) => {
  return useQuery({
    queryKey: ["getMonthlyTrends", months],
    queryFn: async () => {
      const response = await api.get("/statistics/monthly-trends", {
        params: { months },
      });
      return response.data;
    },
  });
};

export const useManufacturerPerformanceMetrics = (startDate, endDate) => {
  return useQuery({
    queryKey: ["getPerformanceMetrics", startDate, endDate],
    queryFn: async () => {
      const response = await api.get("/statistics/performance", {
        params: { startDate, endDate },
      });
      return response.data;
    },
    enabled: !!startDate && !!endDate,
  });
};

export const useManufacturerComplianceStats = () => {
  return useQuery({
    queryKey: ["getComplianceStats"],
    queryFn: async () => {
      const response = await api.get("/statistics/compliance");
      return response.data;
    },
  });
};

export const useManufacturerBlockchainStats = () => {
  return useQuery({
    queryKey: ["getBlockchainStats"],
    queryFn: async () => {
      const response = await api.get("/statistics/blockchain");
      return response.data;
    },
  });
};

export const useManufacturerAlertsStats = () => {
  return useQuery({
    queryKey: ["getAlertsStats"],
    queryFn: async () => {
      const response = await api.get("/statistics/alerts");
      return response.data;
    },
  });
};

export const useManufacturerProductAnalytics = () => {
  return useQuery({
    queryKey: ["getProductAnalytics"],
    queryFn: async () => {
      const response = await api.get("/statistics/manufacturer/products");
      return response.data;
    },
  });
};

export const useManufacturerSupplyChainStats = () => {
  return useQuery({
    queryKey: ["getSupplyChainStats"],
    queryFn: async () => {
      const response = await api.get("/statistics/manufacturer/supply-chain");
      return response.data;
    },
  });
};

export const useManufacturerIPFSStatus = () => {
  return useQuery({
    queryKey: ["getManufactureIPFSStatus"],
    queryFn: async () => {
      const response = await api.get("/production/ipfs-status");
      return response.data;
    },
  });
};

export const useManufacturerDistributors = (params = {}) => {
  return useQuery({
    queryKey: ["getDistributors", params],
    queryFn: async () => {
      const response = await api.get("/production/distributors", {
        params,
      });
      return response.data;
    },
  });
};

// Legacy exports for backward compatibility (deprecated - use individual hooks above)
export const manufacturerAPIs = {
  getDrugs: useManufacturerDrugs,
  getDrugById: useManufacturerDrugById,
  searchDrugByATC: useManufacturerSearchDrugByATC,
  addDrug: useManufacturerAddDrug,
  updateDrug: useManufacturerUpdateDrug,
  deleteDrug: useManufacturerDeleteDrug,
  uploadToIPFS: useUploadToIPFS,
  saveMintedNFTs: useSaveMintedNFTs,
  createTransferToDistributor: useCreateTransferToDistributor,
  saveTransferTransaction: useSaveTransferTransaction,
  getProductionHistory: useManufacturerProductionHistory,
  getAvailableTokensForProduction: useManufacturerAvailableTokensForProduction,
  getTransferHistory: useManufacturerTransferHistory,
  getStatistics: useManufacturerStatistics,
  getDashboardStats: useManufacturerDashboardStats,
  getChartOneWeek: useManufacturerChartOneWeek,
  getChartTodayYesterday: useManufacturerChartTodayYesterday,
  getChartProductionsByDateRange: useManufacturerChartProductionsByDateRange,
  getChartDistributionsByDateRange:
    useManufacturerChartDistributionsByDateRange,
  getChartTransfersByDateRange: useManufacturerChartTransfersByDateRange,
  getMonthlyTrends: useManufacturerMonthlyTrends,
  getPerformanceMetrics: useManufacturerPerformanceMetrics,
  getComplianceStats: useManufacturerComplianceStats,
  getBlockchainStats: useManufacturerBlockchainStats,
  getAlertsStats: useManufacturerAlertsStats,
  getProductAnalytics: useManufacturerProductAnalytics,
  getSupplyChainStats: useManufacturerSupplyChainStats,
  getManufactureIPFSStatus: useManufacturerIPFSStatus,
  getDistributors: useManufacturerDistributors,
};
