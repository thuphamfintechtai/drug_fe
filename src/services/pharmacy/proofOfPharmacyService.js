import api from '../../utils/api';

export const createProofOfPharmacy = (payload) => api.post('/proof-of-pharmacy/pharmacy', payload);
export const confirmReceipt = (pharmacyId, payload) => api.post(`/proof-of-pharmacy/pharmacy/${encodeURIComponent(pharmacyId)}/confirm-receipt`, payload);
export const listProofs = (params = {}) => api.get('/proof-of-pharmacy/pharmacy', { params });
export const getProofById = (id) => api.get(`/proof-of-pharmacy/pharmacy/${id}`);
export const getMyReceipts = (params = {}) => api.get('/proof-of-pharmacy/pharmacy/my-receipts', { params });
export const updateProofStatus = (id, payload) => api.put(`/proof-of-pharmacy/pharmacy/${id}/status`, payload);
export const getPharmacyStats = (params = {}) => api.get('/proof-of-pharmacy/pharmacy/stats/overview', { params });
export const searchPharmacyByCode = (verificationCode) => api.get(`/proof-of-pharmacy/pharmacy/search/code/${encodeURIComponent(verificationCode)}`);

export default {
  createProofOfPharmacy,
  confirmReceipt,
  listProofs,
  getProofById,
  getMyReceipts,
  updateProofStatus,
  getPharmacyStats,
  searchPharmacyByCode,
};


