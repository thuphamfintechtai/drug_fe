import api from '../../utils/api';

export const listDrugs = (params = {}) => api.get('/drugs', { params });
export const getDrugById = (id) => api.get(`/drugs/${id}`);
export const createDrug = (payload) => api.post('/drugs', payload);
export const updateDrug = (id, payload) => api.put(`/drugs/${id}`, payload);
export const deleteDrug = (id) => api.delete(`/drugs/${id}`);
export const searchDrugByAtc = (atcCode) => api.get(`/drugs/code/${encodeURIComponent(atcCode)}`);
export const getDrugStats = () => api.get('/drugs/stats/overview');
export const getDrugCodes = () => api.get('/drugs/codes/list');

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


