import api from '../../utils/api';

export const getPendingRegistrations = (params = {}) => api.get('/admin/registrations', { params });
export const getRegistrationById = (id) => api.get(`/admin/registrations/${id}`);
export const approveRegistration = (id) => api.post(`/admin/registrations/${id}/approve`);
export const rejectRegistration = (id, rejectionReason) => api.post(`/admin/registrations/${id}/reject`, { rejectionReason });
export const retryRegistrationBlockchain = (id) => api.post(`/admin/registrations/${id}/retry-blockchain`);
export const getRegistrationStats = () => api.get('/admin/stats');

export default {
  getPendingRegistrations,
  getRegistrationById,
  approveRegistration,
  rejectRegistration,
  retryRegistrationBlockchain,
  getRegistrationStats,
};


