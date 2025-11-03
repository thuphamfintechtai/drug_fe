import api from '../../utils/api';

export const userService = {
  // Quản lý hồ sơ cá nhân
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },

  changePassword: async (data) => {
    const response = await api.put('/users/profile/change-password', data);
    return response.data;
  },

  // Tra cứu thông tin thuốc
  trackDrugByNFTId: async (tokenId) => {
    const response = await api.get(`/users/drugs/track/${tokenId}`);
    return response.data;
  },

  getDrugInfo: async (params) => {
    const response = await api.get('/users/drugs/info', { params });
    return response.data;
  },

  searchDrugs: async (params) => {
    const response = await api.get('/users/drugs/search', { params });
    return response.data;
  },
};

export default userService;

