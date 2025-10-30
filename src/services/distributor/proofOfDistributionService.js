import api from '../../utils/api';

// Danh sách PoD của distributor hiện tại
export const listMyDistributions = (params = {}) => api.get('/proof-of-distribution/distributor/my-distributions', { params });

// Lấy chi tiết PoD theo id
export const getDistributionById = (id) => api.get(`/proof-of-distribution/${id}`);

// Xác nhận nhận hàng từ manufacturer -> chuyển quyền sở hữu NFT sang distributor
export const confirmReceipt = (distributionId, payload) =>
  api.post(`/proof-of-distribution/${encodeURIComponent(distributionId)}/confirm-receipt`, payload);

// Cập nhật trạng thái PoD (ví dụ: in_transit, delivered, etc.)
export const updateStatus = (id, payload) => api.put(`/proof-of-distribution/${encodeURIComponent(id)}/status`, payload);

// Thống kê cho distributor
export const getStats = (params = {}) => api.get('/proof-of-distribution/stats/overview', { params });

// Tìm theo mã xác thực (verification code)
export const searchByVerificationCode = (verificationCode) =>
  api.get(`/proof-of-distribution/search/code/${encodeURIComponent(verificationCode)}`);

export default {
  listMyDistributions,
  getDistributionById,
  confirmReceipt,
  updateStatus,
  getStats,
  searchByVerificationCode,
};


