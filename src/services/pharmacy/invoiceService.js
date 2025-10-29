import api from '../../utils/api';

export const listInvoices = (params = {}) => api.get('/invoice', { params });
export const getInvoiceById = (id) => api.get(`/invoice/${id}`);
export const getMyInvoices = (params = {}) => api.get('/invoice/pharmacy/my-invoices', { params });
export const updateInvoiceStatus = (id, payload) => api.put(`/invoice/${id}/status`, payload);
export const updatePaymentInfo = (id, payload) => api.put(`/invoice/${id}/payment`, payload);
export const getInvoiceStats = (params = {}) => api.get('/invoice/stats/overview', { params });
export const searchInvoiceByCode = (verificationCode) => api.get(`/invoice/search/code/${encodeURIComponent(verificationCode)}`);

export default {
  listInvoices,
  getInvoiceById,
  getMyInvoices,
  updateInvoiceStatus,
  updatePaymentInfo,
  getInvoiceStats,
  searchInvoiceByCode,
};


