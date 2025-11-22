import api from "../../../utils/api";
import { useQuery } from "@tanstack/react-query";

// Individual hooks - must be called at top level of component/hook
export const useAdminListDistributions = (params = {}) => {
  return useQuery({
    queryKey: ["listDistributions", params],
    queryFn: async () => {
      const response = await api.get("/distribution/history", { params });
      return response.data;
    },
  });
};

export const useAdminGetDistributionById = (id) => {
  return useQuery({
    queryKey: ["getDistributionById", id],
    queryFn: async () => {
      const response = await api.get(`/distribution/history/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useAdminSearchByVerificationCode = (code) => {
  return useQuery({
    queryKey: ["searchByVerificationCode", code],
    queryFn: async () => {
      const response = await api.get(
        `/distribution/search/code/${encodeURIComponent(code)}`
      );
      return response.data;
    },
    enabled: !!code,
  });
};

export const useAdminGetDistributionStats = () => {
  return useQuery({
    queryKey: ["getDistributionStats"],
    queryFn: async () => {
      const response = await api.get("/distribution/stats/overview");
      return response.data;
    },
  });
};

// Legacy exports for backward compatibility (deprecated - use individual hooks above)
export const proofOfDistributionQueries = {
  listDistributions: useAdminListDistributions,
  getDistributionById: useAdminGetDistributionById,
  searchByVerificationCode: useAdminSearchByVerificationCode,
  getDistributionStats: useAdminGetDistributionStats,
};
