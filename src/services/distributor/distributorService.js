import api from '../../utils/api';

// ============ QUẢN LÝ ĐƠN HÀNG TỪ PHARMA COMPANY ============
export const getInvoicesFromManufacturer = (params = {}) => 
  api.get('/distributor/invoices', { params });

export const getInvoiceDetail = (invoiceId) => 
  api.get(`/distributor/invoices/${invoiceId}/detail`);

export const confirmReceipt = (data) => 
  api.post('/distributor/invoices/confirm-receipt', data);

// ============ CHUYỂN TIẾP CHO PHARMACY ============
export const transferToPharmacy = (data) => 
  api.post('/distributor/transfer/pharmacy', data);

export const saveTransferToPharmacyTransaction = (data) => 
  api.post('/distributor/transfer/pharmacy/save-transaction', data);

// ============ LỊCH SỬ VÀ THỐNG KÊ ============
export const getDistributionHistory = (params = {}) => 
  api.get('/distributor/distribution/history', { params });

export const getTransferToPharmacyHistory = (params = {}) => 
  api.get('/distributor/transfer/history', { params });

export const getStatistics = () => 
  api.get('/distributor/statistics');
export const getDashboardStats = () => 
  api.get('/statistics/distributor/dashboard');

// Chart APIs
export const getChartOneWeek = () => api.get('/distributor/chart/one-week');
export const getChartTodayYesterday = () => api.get('/distributor/chart/today-yesterday');
export const getChartInvoicesByDateRange = (startDate, endDate) => 
  api.get('/distributor/chart/invoices-by-date-range', { 
    params: { startDate, endDate } 
  });
export const getChartDistributionsByDateRange = (startDate, endDate) => 
  api.get('/distributor/chart/distributions-by-date-range', { 
    params: { startDate, endDate } 
  });
export const getChartTransfersToPharmacyByDateRange = (startDate, endDate) => 
  api.get('/distributor/chart/transfers-to-pharmacy-by-date-range', { 
    params: { startDate, endDate } 
  });

// Additional statistics
export const getMonthlyTrends = (months = 6) => 
  api.get('/statistics/trends/monthly', { params: { months } });
export const getPerformanceMetrics = (startDate, endDate) => 
  api.get('/statistics/performance', { params: { startDate, endDate } });
export const getComplianceStats = () => api.get('/statistics/compliance');
export const getBlockchainStats = () => api.get('/statistics/blockchain');
export const getAlertsStats = () => api.get('/statistics/alerts');
export const getSupplyChainStats = () => api.get('/statistics/distributor/supply-chain');

export const trackDrugByNFTId = (tokenId) => 
  api.get(`/distributor/track/${tokenId}`);

// ============ QUẢN LÝ THUỐC ============
export const getDrugs = (params = {}) => 
  api.get('/distributor/drugs', { params });

export const searchDrugByATCCode = (atcCode) => 
  api.get('/distributor/drugs/search', { params: { atcCode } });

// ============ QUẢN LÝ THÔNG TIN CÁ NHÂN ============
export const getProfile = () => 
  api.get('/distributor/profile');

// ============ DANH SÁCH PHARMACIES ============
export const getPharmacies = () => 
  api.get('/distributor/pharmacies');

export default {
  getInvoicesFromManufacturer,
  getInvoiceDetail,
  confirmReceipt,
  transferToPharmacy,
  saveTransferToPharmacyTransaction,
  getDistributionHistory,
  getTransferToPharmacyHistory,
  getStatistics,
  getDashboardStats,
  
  // Chart APIs
  getChartOneWeek,
  getChartTodayYesterday,
  getChartInvoicesByDateRange,
  getChartDistributionsByDateRange,
  getChartTransfersToPharmacyByDateRange,
  
  // Additional statistics
  getMonthlyTrends,
  getPerformanceMetrics,
  getComplianceStats,
  getBlockchainStats,
  getAlertsStats,
  getSupplyChainStats,
  
  trackDrugByNFTId,
  getDrugs,
  searchDrugByATCCode,
  getProfile,
  getPharmacies,
};

