import api from "../../../utils/api";
import { useQuery } from "@tanstack/react-query";

export const statsQueries = {
  getRegistrationStats: () => {
    return useQuery({
      queryKey: ["getRegistrationStats"],
      queryFn: async () => {
        const response = await api.get("/admin/registration/statistics");
        return response.data;
      },
      onSuccess: (data) => {
        console.log("📊 Registration stats:", data);
      },
      onError: (error) => {
        console.error("❌ Error fetching registration stats:", error);
      },
    });
  },

  getUserStats: () => {
    return useQuery({
      queryKey: ["getUserStats"],
      queryFn: async () => {
        const response = await api.get("/users/stats");
        return response.data;
      },
      onSuccess: (data) => {
        console.log("📊 User stats:", data);
      },
      onError: (error) => {
        console.error("❌ Error fetching user stats:", error);
      },
    });
  },

  getDrugStats: () => {
    return useQuery({
      queryKey: ["getDrugStats"],
      queryFn: async () => {
        const response = await api.get("/admin/drugs/statistics");
        return response.data;
      },
      onSuccess: (data) => {
        console.log("📊 Drug stats:", data);
      },
      onError: (error) => {
        console.error("❌ Error fetching drug stats:", error);
      },
    });
  },

  getSystemStats: () => {
    return useQuery({
      queryKey: ["getSystemStats"],
      queryFn: async () => {
        const response = await api.get("/admin/statistics");
        return response.data;
      },
      onSuccess: (data) => {
        console.log("📊 System stats:", data);
      },
      onError: (error) => {
        console.error("❌ Error fetching system stats:", error);
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
      onSuccess: (data) => {
        console.log("📊 Monthly trends:", data);
      },
      onError: (error) => {
        console.error("❌ Error fetching monthly trends:", error);
      },
    });
  },

  getBlockchainStats: () => {
    return useQuery({
      queryKey: ["getBlockchainStats"],
      queryFn: async () => {
        const response = await api.get("/statistics/compliance");
        return response.data;
      },
      onSuccess: (data) => {
        console.log("📊 Blockchain stats:", data);
      },
      onError: (error) => {
        console.error("❌ Error fetching blockchain stats:", error);
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
      onSuccess: (data) => {
        console.log("📊 Alerts stats:", data);
      },
      onError: (error) => {
        console.error("❌ Error fetching alerts stats:", error);
      },
    });
  },
};
