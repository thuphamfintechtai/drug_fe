import api from '../../utils/api';

export const listPharmacies = (params = {}) => api.get('/proof-of-pharmacy/pharmacy', { params });
export const getPharmacyById = (id) => api.get(`/proof-of-pharmacy/pharmacy/${id}`);
export const searchByVerificationCode = (code) => api.get(`/proof-of-pharmacy/pharmacy/search/code/${encodeURIComponent(code)}`);
export const getStats = () => api.get('/proof-of-pharmacy/pharmacy/stats/overview');

export default {
  listPharmacies,
  getPharmacyById,
  searchByVerificationCode,
  getStats,
};


