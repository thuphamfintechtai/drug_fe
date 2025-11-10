import api from '../../utils/api';

// Lấy thống kê đăng ký
export const getRegistrationStats = async () => {
  try {
    const response = await api.get('/admin/registration/statistics');
    return response.data;
  } catch (error) {
    console.error('Error fetching registration stats:', error);
    throw error;
  }
};

// Lấy thống kê users
export const getUserStats = async () => {
  try {
    const response = await api.get('/users/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }
};

// Lấy thống kê thuốc
export const getDrugStats = async () => {
  try {
    const response = await api.get('/admin/drugs/statistics');
    return response.data;
  } catch (error) {
    console.error('Error fetching drug stats:', error);
    throw error;
  }
};

// Lấy thống kê tổng quan hệ thống
export const getSystemStats = async () => {
  try {
    const response = await api.get('/admin/statistics');
    return response.data;
  } catch (error) {
    console.error('Error fetching system stats:', error);
    throw error;
  }
};

// Chart APIs for Admin (can use monthly trends)
export const getMonthlyTrends = async (months = 6) => {
  try {
    const response = await api.get('/statistics/trends/monthly', { 
      params: { months } 
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching monthly trends:', error);
    throw error;
  }
};

// Additional statistics
export const getComplianceStats = async () => {
  try {
    const response = await api.get('/statistics/compliance');
    return response.data;
  } catch (error) {
    console.error('Error fetching compliance stats:', error);
    throw error;
  }
};

export const getBlockchainStats = async () => {
  try {
    const response = await api.get('/statistics/blockchain');
    return response.data;
  } catch (error) {
    console.error('Error fetching blockchain stats:', error);
    throw error;
  }
};

export const getAlertsStats = async () => {
  try {
    const response = await api.get('/statistics/alerts');
    return response.data;
  } catch (error) {
    console.error('Error fetching alerts stats:', error);
    throw error;
  }
};

export default {
  getRegistrationStats,
  getUserStats,
  getDrugStats,
  getSystemStats,
  getMonthlyTrends,
  getComplianceStats,
  getBlockchainStats,
  getAlertsStats,
};

