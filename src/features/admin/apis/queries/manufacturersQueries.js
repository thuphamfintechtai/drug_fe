import api from "../../../utils/api";
import { useQuery } from "@tanstack/react-query";

// Individual hooks - must be called at top level of component/hook
export const useAdminListManufacturers = (params = {}) => {
  return useQuery({
    queryKey: ["listManufacturers", params],
    queryFn: async () => {
      const response = await api.get("/manufactors", { params });
      return response.data;
    },
  });
};

export const useAdminGetManufacturerByName = (name) => {
  return useQuery({
    queryKey: ["getManufacturerByName", name],
    queryFn: async () => {
      const response = await api.get(`/manufactors/${encodeURIComponent(name)}`);
      return response.data;
    },
    enabled: !!name,
  });
};

// Legacy exports for backward compatibility (deprecated - use individual hooks above)
export const manufacturersQueries = {
  listManufacturers: useAdminListManufacturers,
  getManufacturerByName: useAdminGetManufacturerByName,
};
