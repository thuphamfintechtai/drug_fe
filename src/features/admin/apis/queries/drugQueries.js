import { useQuery } from "@tanstack/react-query";
import api from "../../../utils/api";

export const drugQueries = {
  listDrugs: (params = {}) => {
    return useQuery({
      queryKey: ["listDrugs"],
      queryFn: async () => {
        const response = await api.get("/drugs", { params });
        return response.data;
      },
    });
  },

  getDrugById: (id) => {
    return useQuery({
      queryKey: ["drugById", id],
      queryFn: async () => {
        const response = await api.get(`/drugs/${id}`);
        return response.data;
      },
    });
  },

  searchDrugByAtc: (atcCode) => {
    return useQuery({
      queryKey: ["searchDrugByAtc", atcCode],
      queryFn: async () => {
        const response = await api.get(
          `/drugs/code/${encodeURIComponent(atcCode)}`
        );
        return response.data;
      },
    });
  },

  getDrugStats: () => {
    return useQuery({
      queryKey: ["drugStats"],
      queryFn: async () => {
        const response = await api.get("/drugs/stats/overview");
        return response.data;
      },
    });
  },

  getDrugCodes: () => {
    return useQuery({
      queryKey: ["drugCodes"],
      queryFn: async () => {
        const response = await api.get("/drugs/codes/list");
        return response.data;
      },
    });
  },
};
