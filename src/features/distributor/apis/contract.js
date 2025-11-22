import { useQuery, useMutation } from "@tanstack/react-query";
import api from "../../utils/api";

export const contractQueries = {
  getContracts: (params = {}) => {
    return useQuery({
      queryKey: ["distributorContracts", params],
      queryFn: async () => {
        const response = await api.get("/distributor/contracts", { params });
        return response.data;
      },
    });
  },

  getContractDetail: (contractId) => {
    return useQuery({
      queryKey: ["distributorContractDetail", contractId],
      queryFn: async () => {
        const response = await api.get(`/distributor/contracts/${contractId}`);
        return response.data;
      },
      enabled: !!contractId,
    });
  },

  // Create contract request (Distributor)
  createContractRequest: () => {
    return useMutation({
      mutationFn: async (data) => {
        const response = await api.post("/distributor/contracts/create", data);
        return response.data;
      },
    });
  },

  // Finalize contract and mint NFT (Distributor)
  finalizeContractAndMint: () => {
    return useMutation({
      mutationFn: async (data) => {
        const response = await api.post("/distributor/contracts/finalize-and-mint", data);
        return response.data;
      },
    });
  },

  getBlockchainContractInfo: () => {
    return useQuery({
      queryKey: ["distributorBlockchainContractInfo"],
      queryFn: async () => {
        const response = await api.get("/distributor/contracts/blockchain/info");
        return response.data;
      },
    });
  },
};

// Pharmacy contract queries
export const pharmacyContractQueries = {
  // Get all contracts for pharmacy
  getContracts: (params = {}) => {
    return useQuery({
      queryKey: ["pharmacyContracts", params],
      queryFn: async () => {
        const response = await api.get("/pharmacy/contracts", { params });
        return response.data;
      },
    });
  },

  // Get contract detail
  getContractDetail: (contractId) => {
    return useQuery({
      queryKey: ["pharmacyContractDetail", contractId],
      queryFn: async () => {
        const response = await api.get(`/pharmacy/contracts/${contractId}`);
        return response.data;
      },
      enabled: !!contractId,
    });
  },

  confirmContract: () => {
    return useMutation({
      mutationFn: async (data) => {
        const response = await api.post("/pharmacy/contracts/confirm", data);
        return response.data;
      },
    });
  },
};

