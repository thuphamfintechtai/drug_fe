import api from "../../../utils/api";
import { useQuery } from "@tanstack/react-query";

// Individual hooks - must be called at top level of component/hook
export const useListPharmacies = (params = {}) => {
  return useQuery({
    queryKey: ["listPharmacies", params],
    queryFn: async () => {
      const response = await api.get("/proof-of-pharmacy/pharmacy", {
        params,
      });
      return response.data;
    },
  });
};

export const useGetPharmacyById = (id) => {
  return useQuery({
    queryKey: ["getPharmacyById", id],
    queryFn: async () => {
      const response = await api.get(`/proof-of-pharmacy/pharmacy/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useSearchPharmacyByVerificationCode = (code) => {
  return useQuery({
    queryKey: ["searchByVerificationCode", code],
    queryFn: async () => {
      const response = await api.get(
        `/proof-of-pharmacy/pharmacy/search/code/${encodeURIComponent(code)}`
      );
      return response.data;
    },
    enabled: !!code,
  });
};

export const useGetPharmacyStats = () => {
  return useQuery({
    queryKey: ["getPharmacyStats"],
    queryFn: async () => {
      const response = await api.get(
        "/proof-of-pharmacy/pharmacy/stats/overview"
      );
      return response.data;
    },
  });
};

export const useGetDeliveriesToPharmacy = () => {
  return useQuery({
    queryKey: ["getDeliveriesToPharmacy"],
    queryFn: async () => {
      const response = await api.get(
        "/proof-of-pharmacy/pharmacy/distributor/my-deliveries"
      );
      return response.data;
    },
  });
};

export const useGetAllProofOfPharmacies = () => {
  return useQuery({
    queryKey: ["getAllProofOfPharmacies"],
    queryFn: async () => {
      const response = await api.get(
        "/proof-of-pharmacy/pharmacy?limit=1000"
      );
      return response.data;
    },
  });
};

export const useGetProofOfPharmacyById = (id) => {
  return useQuery({
    queryKey: ["getProofOfPharmacyById", id],
    queryFn: async () => {
      const response = await api.get(`/proof-of-pharmacy/pharmacy/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Legacy exports for backward compatibility (deprecated - use individual hooks above)
export const proofOfPharmacyQueries = {
  listPharmacies: useListPharmacies,
  getPharmacyById: useGetPharmacyById,
  searchByVerificationCode: useSearchPharmacyByVerificationCode,
  getPharmacyStats: useGetPharmacyStats,
  getDeliveriesToPharmacy: useGetDeliveriesToPharmacy,
  getAllProofOfPharmacies: useGetAllProofOfPharmacies,
  getProofOfPharmacyById: useGetProofOfPharmacyById,
};
