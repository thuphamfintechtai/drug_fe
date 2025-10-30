import api from '../../utils/api';

export const getMyInvoices = () => api.get('/invoice/distributor/my-invoices');

export const getInvoiceById = (id) => api.get(`/invoice/${id}`);

export const createInvoice = (data) => api.post('/invoice/', data);

export const updateInvoiceStatus = (id, data) =>
  api.put(`/invoice/${id}/status`, data);

export const getInvoiceStats = () => api.get('/invoice/stats/overview');
