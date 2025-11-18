import api from "../../../utils/api";
import { useQuery } from "@tanstack/react-query";

export const proofOfProductionQueries = {
  listProofs: (params = {}) => {
    return useQuery({
      queryKey: ["listProofs"],
      queryFn: async () => {
        const response = await api.get("/proof-of-production", { params });
        return response.data;
      },
    });
  },

  getProofById: (id) => {
    return useQuery({
      queryKey: ["getProofById", id],
      queryFn: async () => {
        const response = await api.get(`/proof-of-production/${id}`);
        return response.data;
      },
    });
  },

  searchByBatch: (batchNumber) => {
    return useQuery({
      queryKey: ["searchByBatch", batchNumber],
      queryFn: async () => {
        const response = await api.get(
          `/proof-of-production/search/batch/${encodeURIComponent(batchNumber)}`
        );
        return response.data;
      },
    });
  },

  getProductionStats: () => {
    return useQuery({
      queryKey: ["getProductionStats"],
      queryFn: async () => {
        const response = await api.get("/proof-of-production/stats/overview");
        return response.data;
      },
    });
  },
};
