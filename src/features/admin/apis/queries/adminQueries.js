import { useQuery } from "@tanstack/react-query";
import api from "../../../utils/api";

const ADMIN_BT_PREFIX = "/admin/batch-tracking";

export const adminQueries = {
  // ============ QUẢN LÝ ĐƠN ĐĂNG KÝ ============
  getPendingRegistrations: (params = {}) => {
    return useQuery({
      queryKey: ["pendingRegistrations"],
      queryFn: async () => {
        const response = await api.get("/registration/requests", {
          params,
        });
        return response.data;
      },
    });
  },

  getRegistrationById: (id) => {
    return useQuery({
      queryKey: ["registrationById", id],
      queryFn: async () => {
        const response = await api.get(`/registration/requests/${id}`);
        return response.data;
      },
    });
  },

  getRegistrationStatistics: () => {
    return useQuery({
      queryKey: ["registrationStatistics"],
      queryFn: async () => {
        const response = await api.get("/admin/registration/statistics");
        return response.data;
      },
    });
  },

  // ============ QUẢN LÝ THUỐC ============
  getAllDrugs: (params = {}) => {
    return useQuery({
      queryKey: ["allDrugs"],
      queryFn: async () => {
        const response = await api.get("/admin/drugs", { params });
        return response.data;
      },
    });
  },

  getDrugById: (id) => {
    return useQuery({
      queryKey: ["drugById", id],
      queryFn: async () => {
        const response = await api.get(`/admin/drugs/${id}`);
        return response.data;
      },
    });
  },

  getDrugStatistics: () => {
    return useQuery({
      queryKey: ["drugStatistics"],
      queryFn: async () => {
        const response = await api.get("/admin/drugs/statistics");
        return response.data;
      },
    });
  },

  // ============ GIÁM SÁT HỆ THỐNG ============
  getSupplyChainHistory: (params = {}) => {
    return useQuery({
      queryKey: ["supplyChainHistory"],
      queryFn: async () => {
        const response = await api.get("/admin/supply-chain/history", {
          params,
        });
        return response.data;
      },
    });
  },

  getDistributionHistory: (params = {}) => {
    return useQuery({
      queryKey: ["distributionHistory"],
      queryFn: async () => {
        const response = await api.get("/admin/distribution/history", {
          params,
        });
        return response.data;
      },
    });
  },

  getSystemStatistics: () => {
    return useQuery({
      queryKey: ["systemStatistics"],
      queryFn: async () => {
        const response = await api.get("/admin/statistics");
        return response.data;
      },
    });
  },

  // ============ BATCH TRACKING (gộp từ batchTrackingService) ============
  getBatchList: (params = {}) => {
    return useQuery({
      queryKey: ["batchList"],
      queryFn: async () => {
        const response = await api.get(`${ADMIN_BT_PREFIX}/batches`, {
          params,
        });
        return response.data;
      },
    });
  },

  getBatchJourney: (batchNumber, params = {}) => {
    return useQuery({
      queryKey: ["batchJourney", batchNumber],
      queryFn: async () => {
        const response = await api.get(
          `${ADMIN_BT_PREFIX}/batches/${encodeURIComponent(
            batchNumber
          )}/journey`,
          { params }
        );
        return response.data;
      },
    });
  },

  getNFTJourney: (tokenId) => {
    return useQuery({
      queryKey: ["nFTJourney", tokenId],
      queryFn: async () => {
        const response = await api.get(
          `${ADMIN_BT_PREFIX}/nft/${encodeURIComponent(tokenId)}/journey`
        );
        return response.data;
      },
    });
  },

  getPasswordResetRequests: (params = {}) => {
    return useQuery({
      queryKey: ["passwordResetRequests"],
      queryFn: async () => {
        const response = await api.get("/auth/password-reset-requests", {
          params,
        });
        return response.data;
      },
    });
  },
};
