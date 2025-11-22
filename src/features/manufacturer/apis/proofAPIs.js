/* eslint-disable no-undef */
import api from "../../utils/api";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

// Individual hooks - must be called at top level of component/hook
export const useGenerateNFTMetadata = () => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post(
        "/proof-of-production/generate-metadata",
        data
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Tạo Metadata thành công");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message);
    },
  });
};

export const useCreateProofOfProduction = () => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post("/proof-of-production", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Tạo Proof thành công");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message);
    },
  });
};

export const useMyProofs = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["getMyProofs", page, limit],
    queryFn: async () => {
      const response = await api.get(
        `/proof-of-production/manufacturer/my-proofs?page=${page}&limit=${limit}`
      );
      return response.data;
    },
  });
};

export const useGetAllProofs = (params = {}) => {
  return useQuery({
    queryKey: ["getAllProofs", params],
    queryFn: async () => {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/proof-of-production?${queryString}`);
      return response.data;
    },
  });
};

export const useGetProofById = (proofId) => {
  return useQuery({
    queryKey: ["getProofById", proofId],
    queryFn: async () => {
      const response = await api.get(`/proof-of-production/${proofId}`);
      return response.data;
    },
    enabled: !!proofId,
  });
};

export const useUpdateProof = () => {
  return useMutation({
    mutationFn: async ({ proofId, data }) => {
      const response = await api.put(`/proof-of-production/${proofId}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Cập nhật Proof thành công");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message);
    },
  });
};

export const useSearchProofByBatch = (batchNumber) => {
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

export const useGetProofStats = () => {
  return useQuery({
    queryKey: ["getProofStats"],
    queryFn: async () => {
      const response = await api.get("/proof-of-production/stats/overview");
      return response.data;
    },
  });
};

// Legacy exports for backward compatibility (deprecated - use individual hooks above)
export const proofAPIs = {
  generateNFTMetadata: useGenerateNFTMetadata,
  createProofOfProduction: useCreateProofOfProduction,
  getMyProofs: useMyProofs,
  getAllProofs: useGetAllProofs,
  getProofById: useGetProofById,
  updateProof: useUpdateProof,
  searchProofByBatch: useSearchProofByBatch,
  getProofStats: useGetProofStats,
};
