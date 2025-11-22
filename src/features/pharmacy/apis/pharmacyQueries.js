/* eslint-disable react-hooks/rules-of-hooks */
import api from "../../utils/api";
import { useQuery } from "@tanstack/react-query";

// Individual hooks - must be called at top level of component/hook
export const usePharmacyInvoicesFromDistributor = (params = {}) => {
  return useQuery({
    queryKey: ["getInvoicesFromDistributor", params],
    queryFn: async () => {
      const response = await api.get("/pharmacy/invoices", { params });
      return response.data;
    },
  });
};

export const usePharmacyDistributionHistory = (params = {}, options = {}) => {
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
};

export const usePharmacyStatistics = () => {
  return useQuery({
    queryKey: ["getStatistics"],
    queryFn: async () => {
      const response = await api.get("/pharmacy/statistics");
      return response.data;
    },
  });
};

export const usePharmacyDashboardStats = () => {
  return useQuery({
    queryKey: ["getDashboardStats"],
    queryFn: async () => {
      const response = await api.get("/statistics/pharmacy/dashboard");
      return response.data;
    },
  });
};

export const usePharmacyChartOneWeek = () => {
  return useQuery({
    queryKey: ["getChartOneWeek"],
    queryFn: async () => {
      const response = await api.get("/pharmacy/chart/one-week");
      return response.data;
    },
  });
};

export const usePharmacyChartTodayYesterday = () => {
  return useQuery({
    queryKey: ["getChartTodayYesterday"],
    queryFn: async () => {
      const response = await api.get("/pharmacy/chart/today-yesterday");
      return response.data;
    },
  });
};

export const usePharmacyChartInvoicesByDateRange = (params = {}) => {
  return useQuery({
    queryKey: ["getChartInvoicesByDateRange", params],
    queryFn: async () => {
      const response = await api.get("/pharmacy/chart/invoices-by-date-range", {
        params,
      });
      return response.data;
    },
    enabled: !!(params.startDate && params.endDate),
  });
};

export const usePharmacyChartReceiptsByDateRange = (params = {}) => {
  return useQuery({
    queryKey: ["getChartReceiptsByDateRange", params],
    queryFn: async () => {
      const response = await api.get("/pharmacy/chart/receipts-by-date-range", {
        params,
      });
      return response.data;
    },
    enabled: !!(params.startDate && params.endDate),
  });
};

export const usePharmacyMonthlyTrends = (params = {}) => {
  return useQuery({
    queryKey: ["getMonthlyTrends", params],
    queryFn: async () => {
      const response = await api.get("/statistics/monthly-trends", {
        params,
      });
      return response.data;
    },
  });
};

// Legacy exports for backward compatibility (deprecated - use individual hooks above)
export const pharmacyQueries = {
  getInvoicesFromDistributor: usePharmacyInvoicesFromDistributor,
  getDistributionHistory: usePharmacyDistributionHistory,
  getStatistics: usePharmacyStatistics,
  getDashboardStats: usePharmacyDashboardStats,
  getChartOneWeek: usePharmacyChartOneWeek,
  getChartTodayYesterday: usePharmacyChartTodayYesterday,
  getChartInvoicesByDateRange: usePharmacyChartInvoicesByDateRange,
  getChartReceiptsByDateRange: usePharmacyChartReceiptsByDateRange,
  getMonthlyTrends: usePharmacyMonthlyTrends,
};
