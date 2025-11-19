/* eslint-disable no-undef */
import api from "../../utils/api";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const proofAPIs = {
  generateNFTMetadata: (data) => {
    return useMutation({
      mutationFn: async () => {
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
  },

  createProofOfProduction: (data) => {
    return useMutation({
      mutationFn: async () => {
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
  },

  getMyProofs: (page = 1, limit = 10) => {
    return useQuery({
      queryKey: ["getMyProofs", page, limit],
      queryFn: async () => {
        const response = await api.get(
          `/proof-of-production/manufacturer/my-proofs?page=${page}&limit=${limit}`
        );
        return response.data;
      },
    });
  },

  getAllProofs: (params = {}) => {
    return useQuery({
      queryKey: ["getAllProofs", params],
      queryFn: async () => {
        const queryString = new URLSearchParams(params).toString();
        const response = await api.get(`/proof-of-production?${queryString}`);
        return response.data;
      },
    });
  },

  getProofById: (proofId) => {
    return useQuery({
      queryKey: ["getProofById", proofId],
      queryFn: async () => {
        const response = await api.get(`/proof-of-production/${proofId}`);
        return response.data;
      },
    });
  },

  updateProof: (proofId, data) => {
    return useMutation({
      mutationFn: async () => {
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
  },

  searchProofByBatch: (batchNumber) => {
    return useQuery({
      queryKey: ["searchProofByBatch", batchNumber],
      queryFn: async () => {
        const response = await api.get(
          `/proof-of-production/search/batch/${batchNumber}`
        );
        return response.data;
      },
    });
  },

  getProofStats: () => {
    return useQuery({
      queryKey: ["getProofStats"],
      queryFn: async () => {
        const response = await api.get("/proof-of-production/stats/overview");
        return response.data;
      },
    });
  },
};
