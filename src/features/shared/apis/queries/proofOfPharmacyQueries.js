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

  getDeliveriesToPharmacy: () => {
    return useQuery({
      queryKey: ["getDeliveriesToPharmacy"],
      queryFn: async () => {
        const response = await api.get(
          "/proof-of-pharmacy/pharmacy/distributor/my-deliveries"
        );
        return response.data;
      },
    });
  },

  getAllProofOfPharmacies: () => {
    return useQuery({
      queryKey: ["getAllProofOfPharmacies"],
      queryFn: async () => {
        const response = await api.get(
          "/proof-of-pharmacy/pharmacy?limit=1000"
        );
        return response.data;
      },
    });
  },

  getProofOfPharmacyById: (id) => {
    return useQuery({
      queryKey: ["getProofOfPharmacyById", id],
      queryFn: async () => {
        const response = await api.get(`/proof-of-pharmacy/pharmacy/${id}`);
        return response.data;
      },
    });
  },
};
