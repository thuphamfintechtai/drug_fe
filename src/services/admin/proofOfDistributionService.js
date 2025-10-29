import api from '../../utils/api';

export const listDistributions = (params = {}) => api.get('/proof-of-distribution', { params });
export const getDistributionById = (id) => api.get(`/proof-of-distribution/${id}`);
export const searchByVerificationCode = (code) => api.get(`/proof-of-distribution/search/code/${encodeURIComponent(code)}`);
export const getStats = () => api.get('/proof-of-distribution/stats/overview');

export default {
  listDistributions,
  getDistributionById,
  searchByVerificationCode,
  getStats,
};


