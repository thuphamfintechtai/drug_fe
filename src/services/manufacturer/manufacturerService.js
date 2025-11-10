import api from '../../utils/api';

// ============ QUẢN LÝ THUỐC ============
export const getDrugs = (params = {}) => api.get('/pharma-company/drugs', { params });
export const getDrugById = (drugId) => api.get(`/pharma-company/drugs/${drugId}`);
export const searchDrugByATC = (atcCode) => api.get('/pharma-company/drugs/search', { params: { atcCode } });
export const addDrug = (data) => api.post('/pharma-company/drugs', data);
export const updateDrug = (drugId, data) => api.put(`/pharma-company/drugs/${drugId}`, data);
export const deleteDrug = (drugId) => api.delete(`/pharma-company/drugs/${drugId}`);

// ============ QUẢN LÝ SẢN XUẤT VÀ PHÂN PHỐI ============
// Bước 1: Upload lên IPFS
export const uploadToIPFS = (data) => api.post('/pharma-company/production/upload-ipfs', data);

// Bước 2: Lưu NFT sau khi mint trên smart contract
export const saveMintedNFTs = (data) => api.post('/pharma-company/production/save-minted', data);

// Chuyển giao: Bước 1 - Tạo invoice pending
export const createTransferToDistributor = (data) => api.post('/pharma-company/production/transfer', data);

// Chuyển giao: Bước 2 - Lưu transaction hash
export const saveTransferTransaction = (data) => api.post('/pharma-company/production/save-transfer', data);

// Lịch sử sản xuất
export const getProductionHistory = (params = {}) => api.get('/pharma-company/production/history', { params });

// Lấy danh sách tokenId còn khả dụng theo lô sản xuất
export const getAvailableTokensForProduction = (productionId) => api.get(`/pharma-company/production/${productionId}/available-tokens`);

// Lịch sử chuyển giao
export const getTransferHistory = (params = {}) => api.get('/pharma-company/transfer/history', { params });

// Thống kê
export const getStatistics = () => api.get('/pharma-company/statistics');
export const getDashboardStats = () => api.get('/statistics/manufacturer/dashboard');

// Chart APIs
export const getChartOneWeek = () => api.get('/pharma-company/chart/one-week');
export const getChartTodayYesterday = () => api.get('/pharma-company/chart/today-yesterday');
export const getChartProductionsByDateRange = (startDate, endDate) => 
  api.get('/pharma-company/chart/productions-by-date-range', { 
    params: { startDate, endDate } 
  });
export const getChartDistributionsByDateRange = (startDate, endDate) => 
  api.get('/pharma-company/chart/distributions-by-date-range', { 
    params: { startDate, endDate } 
  });
export const getChartTransfersByDateRange = (startDate, endDate) => 
  api.get('/pharma-company/chart/transfers-by-date-range', { 
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
export const getProductAnalytics = () => api.get('/statistics/manufacturer/products');
export const getSupplyChainStats = () => api.get('/statistics/manufacturer/supply-chain');
export const getManufactureIPFSStatus = () => api.get('/pharma-company/ipfs-status');

// ============ QUẢN LÝ THÔNG TIN CÁ NHÂN ============
export const getProfile = () => api.get('/pharma-company/profile');

// ============ DANH SÁCH DISTRIBUTORS ============
export const getDistributors = (params = {}) => api.get('/pharma-company/distributors', { params });

// (ĐÃ LOẠI BỎ) QUẢN LÝ DISTRIBUTION (XÁC NHẬN QUYỀN NFT)

export default {
  // Thuốc
  getDrugs,
  getDrugById,
  searchDrugByATC,
  addDrug,
  updateDrug,
  deleteDrug,
  
  // Sản xuất & Phân phối
  uploadToIPFS,
  saveMintedNFTs,
  createTransferToDistributor,
  saveTransferTransaction,
  getProductionHistory,
  getAvailableTokensForProduction,
  getTransferHistory,
  getStatistics,
  getDashboardStats,
  
  // Chart APIs
  getChartOneWeek,
  getChartTodayYesterday,
  getChartProductionsByDateRange,
  getChartDistributionsByDateRange,
  getChartTransfersByDateRange,
  
  // Additional statistics
  getMonthlyTrends,
  getPerformanceMetrics,
  getComplianceStats,
  getBlockchainStats,
  getAlertsStats,
  getProductAnalytics,
  getSupplyChainStats,
  getManufactureIPFSStatus,
  
  // Profile
  getProfile,
  
  // Distributors
  getDistributors,
  
  // Distributions (đã bỏ)
};

