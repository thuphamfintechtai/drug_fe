import api from '../../utils/api';

export const listProofs = (params = {}) => api.get('/proof-of-production', { params });
export const getProofById = (id) => api.get(`/proof-of-production/${id}`);
export const searchByBatch = (batchNumber) => api.get(`/proof-of-production/search/batch/${encodeURIComponent(batchNumber)}`);
export const getStats = () => api.get('/proof-of-production/stats/overview');
export const fixBrokenData = (payload) => api.post('/proof-of-production/fix-broken-data', payload);

export default {
  listProofs,
  getProofById,
  searchByBatch,
  getStats,
  fixBrokenData,
};


