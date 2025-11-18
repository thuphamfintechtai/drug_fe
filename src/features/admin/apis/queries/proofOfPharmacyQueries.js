import api from "../../../utils/api";
import { useQuery } from "@tanstack/react-query";

export const proofOfPharmacyQueries = {
  listPharmacies: (params = {}) => {
    return useQuery({
      queryKey: ["listPharmacies"],
      queryFn: async () => {
        const response = await api.get("/proof-of-pharmacy/pharmacy", {
          params,
        });
        return response.data;
      },
    });
  },

  getPharmacyById: (id) => {
    return useQuery({
      queryKey: ["getPharmacyById", id],
      queryFn: async () => {
        const response = await api.get(`/proof-of-pharmacy/pharmacy/${id}`);
        return response.data;
      },
    });
  },

  searchByVerificationCode: (code) => {
    return useQuery({
      queryKey: ["searchByVerificationCode", code],
      queryFn: async () => {
        const response = await api.get(
          `/proof-of-pharmacy/pharmacy/search/code/${encodeURIComponent(code)}`
        );
        return response.data;
      },
    });
  },

  getPharmacyStats: () => {
    return useQuery({
      queryKey: ["getPharmacyStats"],
      queryFn: async () => {
        const response = await api.get(
          "/proof-of-pharmacy/pharmacy/stats/overview"
        );
        return response.data;
      },
    });
  },
};
