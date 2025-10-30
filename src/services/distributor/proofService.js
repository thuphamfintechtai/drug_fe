import api from '../../utils/api';

// Lấy thống kê Proof of Distribution
export const getDistributionStats = async (params = {}) => {
  try {
    const response = await api.get('/proof-of-distribution/stats/overview', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching distribution stats:', error);
    throw error;
  }
};

// Lấy danh sách Proof of Distribution của distributor
export const getMyDistributions = async (page = 1, limit = 10) => {
  try {
    const response = await api.get(`/proof-of-distribution/distributor/my-distributions?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching my distributions:', error);
    throw error;
  }
};

export default {
  getDistributionStats,
  getMyDistributions,
};

