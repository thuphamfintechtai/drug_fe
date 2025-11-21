/* eslint-disable react-hooks/rules-of-hooks */
import api from "../../utils/api";
import { useQuery } from "@tanstack/react-query";

export const pharmacyQueries = {
  getInvoicesFromDistributor: (params = {}) => {
    return useQuery({
      queryKey: ["getInvoicesFromDistributor", params],
      queryFn: async () => {
        const response = await api.get("/pharmacy/invoices", { params });
        return response.data;
      },
    });
  },

  getDistributionHistory: (params = {}, options = {}) => {
    return useQuery({
      queryKey: ["getDistributionHistory", params],
      queryFn: async () => {
        const response = await api.get("/pharmacy/distribution/history", {
          params,
        });
        return response.data;
      },
      ...options,
    });
  },

  getStatistics: () => {
    return useQuery({
      queryKey: ["getStatistics"],
      queryFn: async () => {
        const response = await api.get("/pharmacy/statistics");
        return response.data;
      },
    });
  },

  getDashboardStats: () => {
    return useQuery({
      queryKey: ["getDashboardStats"],
      queryFn: async () => {
        const response = await api.get("/statistics/pharmacy/dashboard");
        return response.data;
      },
    });
  },

  getChartOneWeek: () => {
    return useQuery({
      queryKey: ["getChartOneWeek"],
      queryFn: async () => {
        const response = await api.get("/pharmacy/chart/one-week");
        return response.data;
      },
    });
  },

  getChartTodayYesterday: () => {
    return useQuery({
      queryKey: ["getChartTodayYesterday"],
      queryFn: async () => {
        const response = await api.get("/pharmacy/chart/today-yesterday");
        return response.data;
      },
    });
  },

  getChartInvoicesByDateRange: (params = {}) => {
    return useQuery({
      queryKey: ["getChartInvoicesByDateRange", params],
      queryFn: async () => {
        const response = await api.get(
          "/pharmacy/chart/invoices-by-date-range",
          { params }
        );
        return response.data;
      },
    });
  },

  getChartReceiptsByDateRange: (params = {}) => {
    return useQuery({
      queryKey: ["getChartReceiptsByDateRange", params],
      queryFn: async () => {
        const response = await api.get(
          "/pharmacy/chart/receipts-by-date-range",
          { params }
        );
        return response.data;
      },
    });
  },

  getMonthlyTrends: (params = {}) => {
    return useQuery({
      queryKey: ["getMonthlyTrends", params],
      queryFn: async () => {
        const response = await api.get("/statistics/trends/monthly", {
          params,
        });
        return response.data;
      },
    });
  },

  getPerformanceMetrics: (params = {}) => {
    return useQuery({
      queryKey: ["getPerformanceMetrics", params],
      queryFn: async () => {
        const response = await api.get("/statistics/performance", { params });
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

  getQualityStats: () => {
    return useQuery({
      queryKey: ["getQualityStats"],
      queryFn: async () => {
        const response = await api.get("/statistics/pharmacy/quality");
        return response.data;
      },
    });
  },

  getDrugs: (params = {}, options = {}) => {
    return useQuery({
      queryKey: ["getDrugs", params],
      queryFn: async () => {
        const response = await api.get("/pharmacy/drugs", { params });
        return response.data;
      },
      ...options,
    });
  },

  trackDrugByNFTId: (tokenId) => {
    return useQuery({
      queryKey: ["trackDrugByNFTId", tokenId],
      queryFn: async () => {
        const response = await api.get(`/pharmacy/track/${tokenId}`);
        return response.data;
      },
    });
  },

  searchDrugByATCCode: (atcCode) => {
    return useQuery({
      queryKey: ["searchDrugByATCCode", atcCode],
      queryFn: async () => {
        const response = await api.get(`/pharmacy/drugs/search`, {
          params: { atcCode },
        });
        return response.data;
      },
    });
  },
};
