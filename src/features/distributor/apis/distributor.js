import { useQuery, useMutation } from "@tanstack/react-query";
import api from "../../utils/api";

// Individual hooks - must be called at top level of component/hook
export const useDistributorStatistics = () => {
  return useQuery({
    queryKey: ["distributorStatistics"],
    queryFn: async () => {
      const response = await api.get("/distributor/statistics");
      return response.data;
    },
  });
};

export const useDistributorDashboardStats = () => {
  return useQuery({
    queryKey: ["distributorDashboardStats"],
    queryFn: async () => {
      const response = await api.get("/distributor/dashboard/stats");
      return response.data;
    },
  });
};

export const useDistributorChartOneWeek = () => {
  return useQuery({
    queryKey: ["distributorChartOneWeek"],
    queryFn: async () => {
      const response = await api.get("/distributor/chart/one-week");
      return response.data;
    },
  });
};

export const useDistributorChartTodayYesterday = () => {
  return useQuery({
    queryKey: ["distributorChartTodayYesterday"],
    queryFn: async () => {
      const response = await api.get("/distributor/chart/today-yesterday");
      return response.data;
    },
  });
};

export const useDistributorMonthlyTrends = (months = 6) => {
  return useQuery({
    queryKey: ["distributorMonthlyTrends", months],
    queryFn: async () => {
      const response = await api.get("/distributor/chart/monthly-trends", {
        params: { months },
      });
      return response.data;
    },
  });
};

export const useDistributorInvoicesFromManufacturer = (params = {}) => {
  return useQuery({
    queryKey: ["getInvoicesFromManufacturer", params],
    queryFn: async () => {
      const response = await api.get("/distributor/invoices", { params });
      return response.data;
    },
  });
};

export const useDistributorMyInvoices = (params = {}) => {
  return useQuery({
    queryKey: ["getMyInvoices", params],
    queryFn: async () => {
      const response = await api.get("/distributor/invoices", { params });
      return response.data;
    },
  });
};

export const useDistributorInvoiceDetail = (invoiceId) => {
  return useQuery({
    queryKey: ["getInvoiceDetail", invoiceId],
    queryFn: async () => {
      const response = await api.get(`/distributor/invoices/${invoiceId}/detail`);
      return response.data;
    },
    enabled: !!invoiceId,
  });
};

export const useDistributorDistributionHistory = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ["getDistributionHistory", params],
    queryFn: async () => {
      const response = await api.get("/distributor/distribution/history", {
        params,
      });
      return response.data;
    },
    ...options,
  });
};

export const useDistributorTransferToPharmacyHistory = (params = {}) => {
  return useQuery({
    queryKey: ["getTransferToPharmacyHistory", params],
    queryFn: async () => {
      const response = await api.get("/distributor/transfer/history", {
        params,
      });
      return response.data;
    },
  });
};

export const useDistributorPharmacies = (params = {}) => {
  return useQuery({
    queryKey: ["getPharmacies", params],
    queryFn: async () => {
      const response = await api.get("/distributor/pharmacies", { params });
      return response.data;
    },
  });
};

export const useDistributorDistributions = (params = {}) => {
  return useQuery({
    queryKey: ["getDistributions", params],
    queryFn: async () => {
      const response = await api.get("/distributor/invoices", {
        params,
      });
      return response.data;
    },
  });
};

export const useDistributorDistributionDetail = (id) => {
  return useQuery({
    queryKey: ["getDistributionDetail", id],
    queryFn: async () => {
      const response = await api.get(`/distributor/distributions/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useDistributorDistributionStats = () => {
  return useQuery({
    queryKey: ["getDistributionStats"],
    queryFn: async () => {
      const response = await api.get("/distributor/distributions/stats");
      return response.data;
    },
  });
};

export const useDistributorDrugs = (params = {}) => {
  return useQuery({
    queryKey: ["distributorDrugs", params],
    queryFn: async () => {
      const response = await api.get("/distributor/drugs", { params });
      return response.data;
    },
  });
};

export const useDistributorDeliveriesToPharmacy = (params = {}) => {
  return useQuery({
    queryKey: ["getDeliveriesToPharmacy", params],
    queryFn: async () => {
      const response = await api.get("/distributor/deliveries", { params });
      return response.data;
    },
  });
};

// Mutations
export const useConfirmDistribution = () => {
  return useMutation({
    mutationFn: async (id) => {
      const response = await api.post(
        `/distributor/distributions/${id}/confirm-receipt`
      );
      return response.data;
    },
  });
};

export const useUpdateDistributionStatus = () => {
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(
        `/proof-of-distribution/${id}/status`,
        data
      );
      return response.data;
    },
  });
};

export const useTrackDrugByNFT = () => {
  return useMutation({
    mutationFn: async (tokenId) => {
      const response = await api.get(`/distributor/nft/${tokenId}/track`);
      return response.data;
    },
  });
};

export const useUpdatePharmacyDeliveryStatus = () => {
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(
        `/distributor/deliveries/${id}/status`,
        data
      );
      return response.data;
    },
  });
};

export const useCreateProofToPharmacy = () => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post("/distributor/proof-to-pharmacy", data);
      return response.data;
    },
  });
};

export const useTransferToPharmacy = () => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post(
        "/distributor/transfer-to-pharmacy",
        data
      );
      return response.data;
    },
  });
};

export const useSaveTransferTransaction = () => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post(
        "/distributor/transfer/transaction",
        data
      );
      return response.data;
    },
  });
};

export const useConfirmReceipt = () => {
  return useMutation({
    mutationFn: async (payload) => {
      const response = await api.post(
        `/distributor/invoices/${payload.invoiceId}/confirm-receipt`,
        payload
      );
      return response.data;
    },
  });
};

export const useCreateInvoice = () => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post("/invoice", data);
      return response.data;
    },
  });
};

export const useUpdateInvoiceStatus = () => {
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/distributor/invoices/${id}/status`, data);
      return response.data;
    },
  });
};

// Legacy exports for backward compatibility (deprecated - use individual hooks above)
export const distributorQueries = {
  getInvoicesFromManufacturer: useDistributorInvoicesFromManufacturer,
  getMyInvoices: useDistributorMyInvoices,
  getInvoiceDetail: useDistributorInvoiceDetail,
  getDistributionHistory: useDistributorDistributionHistory,
  getTransferToPharmacyHistory: useDistributorTransferToPharmacyHistory,
  getPharmacies: useDistributorPharmacies,
  getDistributions: useDistributorDistributions,
  getDistributionDetail: useDistributorDistributionDetail,
  getDistributionStats: useDistributorDistributionStats,
  confirmDistribution: useConfirmDistribution,
  updateDistributionStatus: useUpdateDistributionStatus,
  getStatistics: useDistributorStatistics,
  getDashboardStats: useDistributorDashboardStats,
  getChartOneWeek: useDistributorChartOneWeek,
  getChartTodayYesterday: useDistributorChartTodayYesterday,
  getMonthlyTrends: useDistributorMonthlyTrends,
  getDrugs: useDistributorDrugs,
  trackDrugByNFT: useTrackDrugByNFT,
  getDeliveriesToPharmacy: useDistributorDeliveriesToPharmacy,
  updatePharmacyDeliveryStatus: useUpdatePharmacyDeliveryStatus,
  createProofToPharmacy: useCreateProofToPharmacy,
  transferToPharmacy: useTransferToPharmacy,
  saveTransferTransaction: useSaveTransferTransaction,
  confirmReceipt: useConfirmReceipt,
  createInvoice: useCreateInvoice,
  updateInvoiceStatus: useUpdateInvoiceStatus,
};
