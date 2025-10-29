import api from '../../utils/api';

export const listDrugs = (params = {}) => api.get('/drug', { params });
export const getDrugById = (id) => api.get(`/drug/${id}`);
export const createDrug = (payload) => api.post('/drug', payload);
export const updateDrug = (id, payload) => api.put(`/drug/${id}`, payload);
export const deleteDrug = (id) => api.delete(`/drug/${id}`);
export const searchDrugByAtc = (atcCode) => api.get(`/drug/code/${encodeURIComponent(atcCode)}`);
export const getDrugStats = () => api.get('/drug/stats/overview');
export const getDrugCodes = () => api.get('/drug/codes/list');

export default {
  listDrugs,
  getDrugById,
  createDrug,
  updateDrug,
  deleteDrug,
  searchDrugByAtc,
  getDrugStats,
  getDrugCodes,
};


