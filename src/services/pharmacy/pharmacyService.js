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
  
  getDashboardStats: async () => {
    const response = await api.get('/statistics/pharmacy/dashboard');
    return response;
  },
  
  // Chart APIs
  getChartOneWeek: async () => {
    const response = await api.get('/pharmacy/chart/one-week');
    return response;
  },
  
  getChartTodayYesterday: async () => {
    const response = await api.get('/pharmacy/chart/today-yesterday');
    return response;
  },
  
  getChartInvoicesByDateRange: async (startDate, endDate) => {
    const response = await api.get('/pharmacy/chart/invoices-by-date-range', {
      params: { startDate, endDate }
    });
    return response;
  },
  
  getChartReceiptsByDateRange: async (startDate, endDate) => {
    const response = await api.get('/pharmacy/chart/receipts-by-date-range', {
      params: { startDate, endDate }
    });
    return response;
  },
  
  // Additional statistics
  getMonthlyTrends: async (months = 6) => {
    const response = await api.get('/statistics/trends/monthly', {
      params: { months }
    });
    return response;
  },
  
  getPerformanceMetrics: async (startDate, endDate) => {
    const response = await api.get('/statistics/performance', {
      params: { startDate, endDate }
    });
    return response;
  },
  
  getComplianceStats: async () => {
    const response = await api.get('/statistics/compliance');
    return response;
  },
  
  getBlockchainStats: async () => {
    const response = await api.get('/statistics/blockchain');
    return response;
  },
  
  getAlertsStats: async () => {
    const response = await api.get('/statistics/alerts');
    return response;
  },
  
  getQualityStats: async () => {
    const response = await api.get('/statistics/pharmacy/quality');
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

