import api from "../../../utils/api";
import { useQuery } from "@tanstack/react-query";

export const proofOfDistributionQueries = {
  listDistributions: (params = {}) => {
    return useQuery({
      queryKey: ["listDistributions"],
      queryFn: async () => {
        const response = await api.get("/proof-of-distribution", { params });
        return response.data;
      },
    });
  },
  getDistributionById: (id) => {
    return useQuery({
      queryKey: ["getDistributionById", id],
      queryFn: async () => {
        const response = await api.get(`/proof-of-distribution/${id}`);
        return response.data;
      },
    });
  },
  searchByVerificationCode: (code) => {
    return useQuery({
      queryKey: ["searchByVerificationCode", code],
      queryFn: async () => {
        const response = await api.get(
          `/proof-of-distribution/search/code/${encodeURIComponent(code)}`
        );
        return response.data;
      },
    });
  },

  getDistributionStats: () => {
    return useQuery({
      queryKey: ["getDistributionStats"],
      queryFn: async () => {
        const response = await api.get("/proof-of-distribution/stats/overview");
        return response.data;
      },
    });
  },
};
