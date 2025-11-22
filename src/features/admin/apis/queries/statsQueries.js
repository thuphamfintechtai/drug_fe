import api from "../../../utils/api";
import { useQuery } from "@tanstack/react-query";

// Individual hooks - must be called at top level of component/hook
export const useAdminRegistrationStats = () => {
  return useQuery({
    queryKey: ["getRegistrationStats"],
    queryFn: async () => {
      const response = await api.get("/admin/registration/statistics");
      return response.data;
    },
  });
};

export const useAdminUserStats = () => {
  return useQuery({
    queryKey: ["getUserStats"],
    queryFn: async () => {
      const response = await api.get("/users/stats");
      return response.data;
    },
  });
};

export const useAdminDrugStats = () => {
  return useQuery({
    queryKey: ["getDrugStats"],
    queryFn: async () => {
      const response = await api.get("/admin/drugs/statistics");
      return response.data;
    },
  });
};

export const useAdminSystemStats = () => {
  return useQuery({
    queryKey: ["getSystemStats"],
    queryFn: async () => {
      const response = await api.get("/admin/statistics");
      return response.data;
    },
  });
};

export const useAdminMonthlyTrends = (months = 6) => {
  return useQuery({
    queryKey: ["getMonthlyTrends", months],
    queryFn: async () => {
      const response = await api.get("/statistics/monthly-trends/", {
        params: { months },
      });
      return response.data;
    },
  });
};

export const useAdminBlockchainStats = () => {
  return useQuery({
    queryKey: ["getBlockchainStats"],
    queryFn: async () => {
      const response = await api.get("/statistics/compliance");
      return response.data;
    },
  });
};

export const useAdminAlertsStats = () => {
  return useQuery({
    queryKey: ["getAlertsStats"],
    queryFn: async () => {
      const response = await api.get("/statistics/alerts");
      return response.data;
    },
  });
};

// Legacy exports for backward compatibility (deprecated - use individual hooks above)
export const statsQueries = {
  getRegistrationStats: useAdminRegistrationStats,
  getUserStats: useAdminUserStats,
  getDrugStats: useAdminDrugStats,
  getSystemStats: useAdminSystemStats,
  getMonthlyTrends: useAdminMonthlyTrends,
  getBlockchainStats: useAdminBlockchainStats,
  getAlertsStats: useAdminAlertsStats,
};
