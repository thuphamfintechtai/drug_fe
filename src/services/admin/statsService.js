import api from '../../utils/api';

// Lấy thống kê đăng ký
export const getRegistrationStats = async () => {
  try {
    const response = await api.get('/admin/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching registration stats:', error);
    throw error;
  }
};

// Lấy thống kê users
export const getUserStats = async () => {
  try {
    // TODO: Backend cần có API này
    // const response = await api.get('/admin/users/stats');
    // return response.data;
    return { success: true, data: { total: 0, active: 0 } };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }
};

export default {
  getRegistrationStats,
  getUserStats,
};

