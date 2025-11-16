import api from '../../utils/api';

export const getDistributions = () =>
  api.get('/proof-of-distribution/distributor/my-distributions');

export const confirmDistribution = (distributionId) =>
  api.post(`/proof-of-distribution/${distributionId}/confirm-receipt`);

export const getDistributionDetail = (id) =>
  api.get(`/proof-of-distribution/${id}`);

export const getDistributionStats = () =>
  api.get('/proof-of-distribution/stats/overview');

export const updateDistributionStatus = (id, data) =>
  api.put(`/proof-of-distribution/${id}/status`, data);

