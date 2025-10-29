import api from '../../utils/api';

export const listManufacturers = (params = {}) => api.get('/manufactors', { params });
export const getManufacturerByName = (name) => api.get(`/manufactors/${encodeURIComponent(name)}`);

export default {
  listManufacturers,
  getManufacturerByName,
};


