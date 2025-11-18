import api from "../../../utils/api";
import { useQuery } from "@tanstack/react-query";

export const invoiceQueries = {
  listInvoices: (params = {}) => {
    return useQuery({
      queryKey: ["listInvoices"],
      queryFn: async () => {
        const response = await api.get("/invoice", { params });
        return response.data;
      },
    });
  },

  getInvoiceById: (id) => {
    return useQuery({
      queryKey: ["getInvoiceById", id],
      queryFn: async () => {
        const response = await api.get(`/invoice/${id}`);
        return response.data;
      },
    });
  },

  getInvoiceStats: () => {
    return useQuery({
      queryKey: ["getInvoiceStats"],
      queryFn: async () => {
        const response = await api.get("/invoice/stats/overview");
        return response.data;
      },
    });
  },

  searchByVerificationCode: (code) => {
    return useQuery({
      queryKey: ["searchByVerificationCode", code],
      queryFn: async () => {
        const response = await api.get(
          `/invoice/search/code/${encodeURIComponent(code)}`
        );
        return response.data;
      },
    });
  },

  getMyInvoices: () => {
    return useQuery({
      queryKey: ["getMyInvoices"],
      queryFn: async () => {
        const response = await api.get("/invoice/distributor/my-invoices");
        return response.data;
      },
    });
  },
};
