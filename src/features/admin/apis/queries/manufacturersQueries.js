import api from "../../../utils/api";
import { useQuery } from "@tanstack/react-query";

export const manufacturersQueries = {
  listManufacturers: (params = {}) => {
    return useQuery({
      queryKey: ["listManufacturers"],
      queryFn: async () => {
        const response = await api.get("/manufactors", { params });
        return response.data;
      },
    });
  },

  getManufacturerByName: (name) => {
    return useQuery({
      queryKey: ["getManufacturerByName", name],
      queryFn: async () => {
        const response = await api.get(
          `/manufactors/${encodeURIComponent(name)}`
        );
        return response.data;
      },
    });
  },
};
