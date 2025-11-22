/* eslint-disable react-hooks/rules-of-hooks */
import { useQuery, useMutation } from "@tanstack/react-query";

import api from "../../utils/api";

// These functions return React hooks and should only be called from within React components or custom hooks
export const distributorQueries = {
  getInvoicesFromManufacturer: (params = {}) => {
    return useQuery({
      queryKey: ["getInvoicesFromManufacturer", params],
      queryFn: async () => {
        const response = await api.get("/distributor/invoices", { params });
        return response.data;
      },
    });
  },

  getMyInvoices: (params = {}) => {
    return useQuery({
      queryKey: ["getMyInvoices", params],
      queryFn: async () => {
        const response = await api.get("/distributor/invoices", { params });
        return response.data;
      },
    });
  },

  getInvoiceDetail: (invoiceId) => {
    return useQuery({
      queryKey: ["getInvoiceDetail", invoiceId],
      queryFn: async () => {
        const response = await api.get(
          `/distributor/invoices/${invoiceId}/detail`
        );
        return response.data;
      },
    });
  },

  getDistributionHistory: (params = {}, options = {}) => {
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
  },

  getTransferToPharmacyHistory: (params = {}) => {
    return useQuery({
      queryKey: ["getTransferToPharmacyHistory", params],
      queryFn: async () => {
        const response = await api.get("/distributor/transfer/history", {
          params,
        });
        return response.data;
      },
    });
  },

  getPharmacies: (params = {}) => {
    return useQuery({
      queryKey: ["getPharmacies", params],
      queryFn: async () => {
        const response = await api.get("/distributor/pharmacies", { params });
        return response.data;
      },
    });
  },

  getDistributions: (params = {}) => {
    return useQuery({
      queryKey: ["getDistributions", params],
      queryFn: async () => {
        const response = await api.get("/distributor/invoices", {
          params,
        });
        return response.data;
      },
    });
  },

  getDistributionDetail: (id) => {
    return useQuery({
      queryKey: ["getDistributionDetail", id],
      queryFn: async () => {
        const response = await api.get(`/distributor/distributions/${id}`);
        return response.data;
      },
    });
  },

  getDistributionStats: () => {
    return useQuery({
      queryKey: ["getDistributionStats"],
      queryFn: async () => {
        const response = await api.get("/distributor/distributions/stats");
        return response.data;
      },
    });
  },

  confirmDistribution: () => {
    return useMutation({
      mutationFn: async (id) => {
        const response = await api.post(
          `/distributor/distributions/${id}/confirm-receipt`
        );
        return response.data;
      },
    });
  },

  updateDistributionStatus: () => {
    return useMutation({
      mutationFn: async (id, data) => {
        const response = await api.put(
          `/proof-of-distribution/${id}/status`,
          data
        );
        return response.data;
      },
    });
  },

  getStatistics: () => {
    return useQuery({
      queryKey: ["distributorStatistics"],
      queryFn: async () => {
        const response = await api.get("/distributor/statistics");
        return response.data;
      },
    });
  },

  getDashboardStats: () => {
    return useQuery({
      queryKey: ["distributorDashboardStats"],
      queryFn: async () => {
        const response = await api.get("/distributor/dashboard/stats");
        console.log("Dashboard Stats API Response:", response.data);
        return response.data;
      },
    });
  },

  getChartOneWeek: () => {
    return useQuery({
      queryKey: ["distributorChartOneWeek"],
      queryFn: async () => {
        const response = await api.get("/distributor/chart/one-week");
        return response.data;
      },
    });
  },

  getChartTodayYesterday: () => {
    return useQuery({
      queryKey: ["distributorChartTodayYesterday"],
      queryFn: async () => {
        const response = await api.get("/distributor/chart/today-yesterday");
        return response.data;
      },
    });
  },

  getMonthlyTrends: (months = 6) => {
    return useQuery({
      queryKey: ["distributorMonthlyTrends", months],
      queryFn: async () => {
        const response = await api.get("/distributor/chart/monthly-trends", {
          params: { months },
        });
        console.log("Monthly Trends API Response:", response.data);
        return response.data;
      },
    });
  },

  getDrugs: (params = {}) => {
    return useQuery({
      queryKey: ["distributorDrugs", params],
      queryFn: async () => {
        const response = await api.get("/distributor/drugs", { params });
        return response.data;
      },
    });
  },

  trackDrugByNFT: () => {
    return useMutation({
      mutationFn: async (tokenId) => {
        const response = await api.get(`/distributor/nft/${tokenId}/track`);
        return response.data;
      },
    });
  },

  getDeliveriesToPharmacy: (params = {}) => {
    return useQuery({
      queryKey: ["getDeliveriesToPharmacy", params],
      queryFn: async () => {
        const response = await api.get("/distributor/deliveries", { params });
        return response.data;
      },
    });
  },

  updatePharmacyDeliveryStatus: () => {
    return useMutation({
      mutationFn: async ({ id, data }) => {
        const response = await api.put(
          `/distributor/deliveries/${id}/status`,
          data
        );
        return response.data;
      },
    });
  },

  createProofToPharmacy: () => {
    return useMutation({
      mutationFn: async (data) => {
        const response = await api.post("/distributor/proof-to-pharmacy", data);
        return response.data;
      },
    });
  },

  transferToPharmacy: () => {
    return useMutation({
      mutationFn: async (data) => {
        const response = await api.post(
          "/distributor/transfer-to-pharmacy",
          data
        );
        return response.data;
      },
    });
  },

  saveTransferTransaction: () => {
    return useMutation({
      mutationFn: async (data) => {
        const response = await api.post(
          "/distributor/transfer/transaction",
          data
        );
        return response.data;
      },
    });
  },
};
