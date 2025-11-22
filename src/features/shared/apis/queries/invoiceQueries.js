import api from "../../../utils/api";
import { useQuery } from "@tanstack/react-query";

// Individual hooks - must be called at top level of component/hook
export const useListInvoices = (params = {}) => {
  return useQuery({
    queryKey: ["listInvoices", params],
    queryFn: async () => {
      const response = await api.get("/invoice", { params });
      return response.data;
    },
  });
};

export const useGetInvoiceById = (id) => {
  return useQuery({
    queryKey: ["getInvoiceById", id],
    queryFn: async () => {
      const response = await api.get(`/invoice/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useGetInvoiceStats = () => {
  return useQuery({
    queryKey: ["getInvoiceStats"],
    queryFn: async () => {
      const response = await api.get("/invoice/stats/overview");
      return response.data;
    },
  });
};

export const useSearchInvoiceByVerificationCode = (code) => {
  return useQuery({
    queryKey: ["searchByVerificationCode", code],
    queryFn: async () => {
      const response = await api.get(
        `/invoice/search/code/${encodeURIComponent(code)}`
      );
      return response.data;
    },
    enabled: !!code,
  });
};

export const useGetMyInvoices = () => {
  return useQuery({
    queryKey: ["getMyInvoices"],
    queryFn: async () => {
      const response = await api.get("/invoice/distributor/my-invoices");
      return response.data;
    },
  });
};

// Legacy exports for backward compatibility (deprecated - use individual hooks above)
export const invoiceQueries = {
  listInvoices: useListInvoices,
  getInvoiceById: useGetInvoiceById,
  getInvoiceStats: useGetInvoiceStats,
  searchByVerificationCode: useSearchInvoiceByVerificationCode,
  getMyInvoices: useGetMyInvoices,
};
