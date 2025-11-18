import api from "../../utils/api";

// ============ QUẢN LÝ ĐƠN ĐĂNG KÝ ============
export const getPendingRegistrations = (params = {}) =>
  api.get("/auth/registration-requests", { params });
export const getRegistrationById = (id) =>
  api.get(`/auth/registration-requests/${id}`);
export const approveRegistration = (id) =>
  api.post(`/auth/registration-requests/${id}/approve`);
export const rejectRegistration = (id, rejectionReason) =>
  api.post(`/auth/registration-requests/${id}/reject`, { rejectionReason });
export const retryRegistrationBlockchain = (id) =>
  api.post(`/admin/registration/${id}/retry-blockchain`);
export const getRegistrationStatistics = () =>
  api.get("/admin/registration/statistics");

// ============ QUẢN LÝ THUỐC ============
export const getAllDrugs = (params = {}) => api.get("/admin/drugs", { params });
export const getDrugById = (drugId) => api.get(`/admin/drugs/${drugId}`);
export const getDrugStatistics = () => api.get("/admin/drugs/statistics");

// ============ GIÁM SÁT HỆ THỐNG ============
export const getSupplyChainHistory = (params = {}) =>
  api.get("/admin/supply-chain/history", { params });
export const getDistributionHistory = (params = {}) =>
  api.get("/admin/distribution/history", { params });
export const getSystemStatistics = () => api.get("/admin/statistics");

// ============ BATCH TRACKING (gộp từ batchTrackingService) ============
const ADMIN_BT_PREFIX = "/admin/batch-tracking";

export const getBatchList = (params = {}) =>
  api.get(`${ADMIN_BT_PREFIX}/batches`, { params });

export const getBatchJourney = (batchNumber, params = {}) =>
  api.get(
    `${ADMIN_BT_PREFIX}/batches/${encodeURIComponent(batchNumber)}/journey`,
    { params }
  );

export const getNFTJourney = (tokenId) =>
  api.get(`${ADMIN_BT_PREFIX}/nft/${encodeURIComponent(tokenId)}/journey`);

export default {
  // Đơn đăng ký
  getPendingRegistrations,
  getRegistrationById,
  approveRegistration,
  rejectRegistration,
  retryRegistrationBlockchain,
  getRegistrationStatistics,

  // Thuốc
  getAllDrugs,
  getDrugById,
  getDrugStatistics,

  // Hệ thống
  getSupplyChainHistory,
  getDistributionHistory,
  getSystemStatistics,
  // Batch tracking
  getBatchList,
  getBatchJourney,
  getNFTJourney,
};
