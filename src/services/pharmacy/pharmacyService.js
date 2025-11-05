import api from '../../utils/api';

export const pharmacyService = {
  // Quản lý đơn hàng từ Distributor
  getInvoicesFromDistributor: (params = {}) => {
    return api.get('/pharmacy/invoices', { params });
  },

  confirmReceipt: (data) => {
    return api.post('/pharmacy/invoices/confirm-receipt', data);
  },

  // Lịch sử và Thống kê
  getDistributionHistory: async (params) => {
    const response = await api.get('/pharmacy/distribution/history', { params });
    return response;
  },

  getStatistics: async () => {
    const response = await api.get('/pharmacy/statistics');
    return response;
  },

  trackDrugByNFTId: async (tokenId) => {
    const response = await api.get(`/pharmacy/track/${tokenId}`);
    return response;
  },

  // Quản lý thuốc
  getDrugs: async (params) => {
    const response = await api.get('/pharmacy/drugs', { params });
    return response;
  },

  searchDrugByATCCode: async (atcCode) => {
    const response = await api.get('/pharmacy/drugs/search', { params: { atcCode } });
    return response;
  },

  // Quản lý thông tin cá nhân
  getProfile: async () => {
    const response = await api.get('/pharmacy/profile');
    return response;
  },
};

export default pharmacyService;

