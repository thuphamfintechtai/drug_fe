import { useQuery } from "@tanstack/react-query";
import api from "../../../utils/api";

const ADMIN_BT_PREFIX = "/admin";

// Individual hooks - must be called at top level of component/hook
// ============ QUẢN LÝ ĐƠN ĐĂNG KÝ ============
export const useAdminPendingRegistrations = (params = {}) => {
  return useQuery({
    queryKey: ["pendingRegistrations", params],
    queryFn: async () => {
      const response = await api.get("/registration/requests", {
        params,
      });
      return response.data;
    },
  });
};

export const useAdminRegistrationById = (id) => {
  return useQuery({
    queryKey: ["registrationById", id],
    queryFn: async () => {
      const response = await api.get(`/registration/requests/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useAdminRegistrationStatistics = () => {
  return useQuery({
    queryKey: ["registrationStatistics"],
    queryFn: async () => {
      const response = await api.get("/admin/registration/statistics");
      return response.data;
    },
  });
};

// ============ QUẢN LÝ THUỐC ============
export const useAdminAllDrugs = (params = {}) => {
  return useQuery({
    queryKey: ["allDrugs", params],
    queryFn: async () => {
      const response = await api.get("/admin/drugs", { params });
      return response.data;
    },
  });
};

export const useAdminDrugById = (id) => {
  return useQuery({
    queryKey: ["drugById", id],
    queryFn: async () => {
      const response = await api.get(`/admin/drugs/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useAdminDrugStatistics = () => {
  return useQuery({
    queryKey: ["drugStatistics"],
    queryFn: async () => {
      const response = await api.get("/admin/drugs/statistics");
      return response.data;
    },
  });
};

// ============ GIÁM SÁT HỆ THỐNG ============
export const useAdminSupplyChainHistory = (params = {}) => {
  return useQuery({
    queryKey: ["supplyChainHistory", params],
    queryFn: async () => {
      const response = await api.get("/admin/supply-chain/history", {
        params,
      });
      return response.data;
    },
  });
};

export const useAdminDistributionHistory = (params = {}) => {
  return useQuery({
    queryKey: ["distributionHistory", params],
    queryFn: async () => {
      const response = await api.get("/admin/distribution/history", {
        params,
      });
      return response.data;
    },
  });
};

export const useAdminSystemStatistics = () => {
  return useQuery({
    queryKey: ["systemStatistics"],
    queryFn: async () => {
      const response = await api.get("/admin/system/statistics");
      return response.data;
    },
  });
};

// ============ BATCH TRACKING (gộp từ batchTrackingService) ============
export const useAdminBatchList = (params = {}) => {
  return useQuery({
    queryKey: ["batchList", params],
    queryFn: async () => {
      const response = await api.get(`${ADMIN_BT_PREFIX}/batches`, {
        params,
      });
      return response.data;
    },
  });
};

export const useAdminBatchJourney = (batchNumber, params = {}) => {
  return useQuery({
    queryKey: ["batchJourney", batchNumber, params],
    queryFn: async () => {
      const response = await api.get(
        `${ADMIN_BT_PREFIX}/batches/${encodeURIComponent(batchNumber)}/journey`,
        { params }
      );
      return response.data;
    },
    enabled: !!batchNumber,
  });
};

export const useAdminNFTJourney = (tokenId) => {
  return useQuery({
    queryKey: ["nFTJourney", tokenId],
    queryFn: async () => {
      const response = await api.get(
        `${ADMIN_BT_PREFIX}/nft/${encodeURIComponent(tokenId)}/journey`
      );
      return response.data;
    },
    enabled: !!tokenId,
  });
};

export const useAdminPasswordResetRequests = (params = {}) => {
  return useQuery({
    queryKey: ["passwordResetRequests", params],
    queryFn: async () => {
      const response = await api.get("/auth/password-reset-requests", {
        params,
      });
      return response.data;
    },
  });
};

// Legacy exports for backward compatibility (deprecated - use individual hooks above)
export const adminQueries = {
  getPendingRegistrations: useAdminPendingRegistrations,
  getRegistrationById: useAdminRegistrationById,
  getRegistrationStatistics: useAdminRegistrationStatistics,
  getAllDrugs: useAdminAllDrugs,
  getDrugById: useAdminDrugById,
  getDrugStatistics: useAdminDrugStatistics,
  getSupplyChainHistory: useAdminSupplyChainHistory,
  getDistributionHistory: useAdminDistributionHistory,
  getSystemStatistics: useAdminSystemStatistics,
  getBatchList: useAdminBatchList,
  getBatchJourney: useAdminBatchJourney,
  getNFTJourney: useAdminNFTJourney,
  getPasswordResetRequests: useAdminPasswordResetRequests,
};
