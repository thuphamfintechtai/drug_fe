import { useQuery, useMutation } from "@tanstack/react-query";
import api from "../../utils/api";

// Distributor contract queries - these are hooks and must be called from React components
export const useDistributorContracts = (params = {}) => {
  return useQuery({
    queryKey: ["distributorContracts", params],
    queryFn: async () => {
      const response = await api.get("/distributor/contracts", { params });
      return response.data;
    },
  });
};

export const useDistributorContractDetail = (contractId) => {
  return useQuery({
    queryKey: ["distributorContractDetail", contractId],
    queryFn: async () => {
      const response = await api.get(`/distributor/contracts/${contractId}`);
      return response.data;
    },
    enabled: !!contractId,
  });
};

export const useCreateContractRequest = () => {
  return useMutation({
    mutationFn: async (formData) => {
      const response = await api.post("/distributor/contracts/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
  });
};

export const useFinalizeContractAndMint = () => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post("/distributor/contracts/finalize-and-mint", data);
      return response.data;
    },
  });
};

export const useBlockchainContractInfo = () => {
  return useQuery({
    queryKey: ["distributorBlockchainContractInfo"],
    queryFn: async () => {
      const response = await api.get("/distributor/contracts/blockchain/info");
      return response.data;
    },
  });
};

// Pharmacy contract queries - these are hooks and must be called from React components
export const usePharmacyContracts = (params = {}) => {
  return useQuery({
    queryKey: ["pharmacyContracts", params],
    queryFn: async () => {
      const response = await api.get("/pharmacy/contracts", { params });
      return response.data;
    },
  });
};

export const usePharmacyContractDetail = (contractId) => {
  return useQuery({
    queryKey: ["pharmacyContractDetail", contractId],
    queryFn: async () => {
      const response = await api.get(`/pharmacy/contracts/${contractId}`);
      return response.data;
    },
    enabled: !!contractId,
  });
};

export const useConfirmContract = () => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post("/pharmacy/contracts/confirm", data);
      return response.data;
    },
  });
};

// Legacy exports for backward compatibility (deprecated - use hooks above)
export const contractQueries = {
  getContracts: useDistributorContracts,
  getContractDetail: useDistributorContractDetail,
  createContractRequest: useCreateContractRequest,
  finalizeContractAndMint: useFinalizeContractAndMint,
  getBlockchainContractInfo: useBlockchainContractInfo,
};

export const pharmacyContractQueries = {
  getContracts: usePharmacyContracts,
  getContractDetail: usePharmacyContractDetail,
  confirmContract: useConfirmContract,
};

