import api from "../../utils/api";

export const listInvoices = (params = {}) => api.get("/invoice", { params });
export const getInvoiceById = (id) => api.get(`/invoice/${id}`);
export const createInvoice = (payload) => api.post("/invoice", payload);
export const getStats = () => api.get("/invoice/stats/overview");
export const searchByVerificationCode = (code) =>
  api.get(`/invoice/search/code/${encodeURIComponent(code)}`);

export default {
  listInvoices,
  getInvoiceById,
  createInvoice,
  getStats,
  searchByVerificationCode,
};
