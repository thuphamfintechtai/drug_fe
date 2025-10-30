import api from '../../utils/api';

export const getDistributions = () =>
  api.get('/proof-of-distribution/distributor/my-distributions');

export const confirmDistribution = (distributionId) =>
  api.post(`/proof-of-distribution/${distributionId}/confirm-receipt`);

export const getDistributionDetail = (id) =>
  api.get(`/proof-of-distribution/${id}`);

