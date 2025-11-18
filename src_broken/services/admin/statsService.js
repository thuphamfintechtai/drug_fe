import api from "../../utils/api";

// Helper function to handle errors - only log unexpected errors
const handleError = (error, context) => {
  const status = error?.response?.status;
  // Don't log 401 (Unauthorized) or 403 (Forbidden) as they're expected authentication/authorization failures
  // The API interceptor already handles clearing tokens for these cases
  if (status !== 401 && status !== 403) {
    console.error(`Error ${context}:`, error);
  }
  throw error;
};

// Lấy thống kê đăng ký
export const getRegistrationStats = async () => {
  try {
    const response = await api.get("/admin/registration/statistics");
    return response.data;
  } catch (error) {
    handleError(error, "fetching registration stats");
  }
};

// Lấy thống kê users
export const getUserStats = async () => {
  try {
    const response = await api.get("/users/stats");
    return response.data;
  } catch (error) {
    handleError(error, "fetching user stats");
  }
};

// Lấy thống kê thuốc
export const getDrugStats = async () => {
  try {
    const response = await api.get("/admin/drugs/statistics");
    return response.data;
  } catch (error) {
    handleError(error, "fetching drug stats");
  }
};

// Lấy thống kê tổng quan hệ thống
export const getSystemStats = async () => {
  try {
    const response = await api.get("/admin/statistics");
    return response.data;
  } catch (error) {
    handleError(error, "fetching system stats");
  }
};

// Chart APIs for Admin (can use monthly trends)
export const getMonthlyTrends = async (months = 6) => {
  try {
    const response = await api.get("/statistics/trends/monthly", {
      params: { months },
    });
    return response.data;
  } catch (error) {
    handleError(error, "fetching monthly trends");
  }
};

// Additional statistics
export const getComplianceStats = async () => {
  try {
    const response = await api.get("/statistics/compliance");
    return response.data;
  } catch (error) {
    handleError(error, "fetching compliance stats");
  }
};

export const getBlockchainStats = async () => {
  try {
    const response = await api.get("/statistics/blockchain");
    return response.data;
  } catch (error) {
    handleError(error, "fetching blockchain stats");
  }
};

export const getAlertsStats = async () => {
  try {
    const response = await api.get("/statistics/alerts");
    return response.data;
  } catch (error) {
    handleError(error, "fetching alerts stats");
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
