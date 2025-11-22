import api from "../../../utils/api";
import { useQuery } from "@tanstack/react-query";

// Individual hooks - must be called at top level of component/hook
export const useAdminListProofs = (params = {}) => {
  return useQuery({
    queryKey: ["listProofs", params],
    queryFn: async () => {
      const response = await api.get("/proof-of-production", { params });
      return response.data;
    },
  });
};

export const useAdminGetProofById = (id) => {
  return useQuery({
    queryKey: ["getProofById", id],
    queryFn: async () => {
      const response = await api.get(`/proof-of-production/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useAdminSearchProofByBatch = (batchNumber) => {
  return useQuery({
    queryKey: ["searchProofByBatch", batchNumber],
    queryFn: async () => {
      const response = await api.get(
        `/proof-of-production/search/batch/${batchNumber}`
      );
      return response.data;
    },
    enabled: !!batchNumber,
  });
};

export const useAdminGetProductionStats = () => {
  return useQuery({
    queryKey: ["getProductionStats"],
    queryFn: async () => {
      const response = await api.get("/proof-of-production/stats/overview");
      return response.data;
    },
  });
};

// Legacy exports for backward compatibility (deprecated - use individual hooks above)
export const proofOfProductionQueries = {
  listProofs: useAdminListProofs,
  getProofById: useAdminGetProofById,
  searchByBatch: useAdminSearchProofByBatch,
  getProductionStats: useAdminGetProductionStats,
};
