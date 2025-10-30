import api from '../../utils/api';

export const getAllPharmacies = (params = {}) =>
  api.get('/pharmacy/pharmacies', { params });

