import { useQuery } from "@tanstack/react-query";
import api from "../../../utils/api";

// Individual hooks - must be called at top level of component/hook
export const useAdminListDrugs = (params = {}) => {
  return useQuery({
    queryKey: ["listDrugs", params],
    queryFn: async () => {
      const response = await api.get("/admin/drugs", { params });
      return response.data;
    },
  });
};

export const useAdminGetDrugById = (id) => {
  return useQuery({
    queryKey: ["drugById", id],
    queryFn: async () => {
      const response = await api.get(`/admin/drugs/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useAdminSearchDrugByAtc = (atcCode) => {
  return useQuery({
    queryKey: ["searchDrugByAtc", atcCode],
    queryFn: async () => {
      const response = await api.get(
        `/drugs/code/${encodeURIComponent(atcCode)}`
      );
      return response.data;
    },
    enabled: !!atcCode,
  });
};

export const useAdminGetDrugStats = () => {
  return useQuery({
    queryKey: ["drugStats"],
    queryFn: async () => {
      const response = await api.get("/drugs/stats/overview");
      return response.data;
    },
  });
};

export const useAdminGetDrugCodes = () => {
  return useQuery({
    queryKey: ["drugCodes"],
    queryFn: async () => {
      const response = await api.get("/drugs/codes/list");
      return response.data;
    },
  });
};

// Legacy exports for backward compatibility (deprecated - use individual hooks above)
export const drugQueries = {
  listDrugs: useAdminListDrugs,
  getDrugById: useAdminGetDrugById,
  searchDrugByAtc: useAdminSearchDrugByAtc,
  getDrugStats: useAdminGetDrugStats,
  getDrugCodes: useAdminGetDrugCodes,
};
