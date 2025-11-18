import { useQuery, useMutation } from "@tanstack/react-query";

import api from "../../utils/api";

export const distributorQueries = {
  getInvoicesFromManufacturer: (params = {}) => {
    return useQuery({
      queryKey: ["getInvoicesFromManufacturer", params],
      queryFn: async () => {
        const response = await api.get("/distributor/invoices", { params });
        return response.data;
      },
    });
  },

  getInvoiceDetail: (invoiceId) => {
    return useQuery({
      queryKey: ["getInvoiceDetail", invoiceId],
      queryFn: async () => {
        const response = await api.get(
          `/distributor/invoices/${invoiceId}/detail`
        );
        return response.data;
      },
    });
  },

  getDistributionHistory: (params = {}) => {
    return useQuery({
      queryKey: ["getDistributionHistory", params],
      queryFn: async () => {
        const response = await api.get("/distributor/distribution/history", {
          params,
        });
        return response.data;
      },
    });
  },

  getTransferToPharmacyHistory: (params = {}) => {
    return useQuery({
      queryKey: ["getTransferToPharmacyHistory", params],
      queryFn: async () => {
        const response = await api.get("/distributor/transfer/history", {
          params,
        });
        return response.data;
      },
    });
  },

  getPharmacies: (params = {}) => {
    return useQuery({
      queryKey: ["getPharmacies", params],
      queryFn: async () => {
        const response = await api.get("/distributor/pharmacies", { params });
        return response.data;
      },
    });
  },

  getDistributions: (params = {}) => {
    return useQuery({
      queryKey: ["getDistributions", params],
      queryFn: async () => {
        const response = await api.get("/distributor/distributions", {
          params,
        });
        return response.data;
      },
    });
  },

  getDistributionDetail: (id) => {
    return useQuery({
      queryKey: ["getDistributionDetail", id],
      queryFn: async () => {
        const response = await api.get(`/distributor/distributions/${id}`);
        return response.data;
      },
    });
  },

  getDistributionStats: () => {
    return useQuery({
      queryKey: ["getDistributionStats"],
      queryFn: async () => {
        const response = await api.get("/distributor/distributions/stats");
        return response.data;
      },
    });
  },

  confirmDistribution: () => {
    return useMutation({
      mutationFn: async (id) => {
        const response = await api.post(
          `/distributor/distributions/${id}/confirm-receipt`
        );
        return response.data;
      },
    });
  },

  updateDistributionStatus: () => {
    return useMutation({
      mutationFn: async (id, data) => {
        const response = await api.put(
          `/proof-of-distribution/${id}/status`,
          data
        );
        return response.data;
      },
    });
  },
};
