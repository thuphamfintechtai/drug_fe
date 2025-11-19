import api from "../../utils/api";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const drugAPIs = {
  getMyDrugs: (page = 1, limit = 10) => {
    return useQuery({
      queryKey: ["getMyDrugs", page, limit],
      queryFn: async () => {
        const response = await api.get(`/drugs?page=${page}&limit=${limit}`);
        return response.data;
      },
    });
  },

  getAllDrugs: () => {
    return useQuery({
      queryKey: ["getAllDrugs"],
      queryFn: async () => {
        const response = await api.get("/drugs");
        return response.data;
      },
    });
  },

  // ============ QUẢN LÝ MÃ ATC ============ chưa bt
  getDrugCodes: () => {
    return useQuery({
      queryKey: ["getDrugCodes"],
      queryFn: async () => {
        const response = await api.get("/drugs/codes/list");
        return response.data;
      },
    });
  },

  getDrugById: (id) => {
    return useQuery({
      queryKey: ["getDrugById", id],
      queryFn: async () => {
        const response = await api.get(`/drugs/${id}`);
        return response.data;
      },
    });
  },

  createDrug: (data) => {
    return useMutation({
      mutationFn: async () => {
        const response = await api.post("/drugs", data);
        return response.data;
      },
      onSuccess: () => {
        toast.success("Thêm thuốc thành công");
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || error.message);
      },
    });
  },

  getDrugsByManufacturerId: (manufacturerId) => {
    return useQuery({
      queryKey: ["getDrugsByManufacturerId", manufacturerId],
      queryFn: async () => {
        const response = await api.get(
          `/drugs/getDrugByManufactor/${manufacturerId}`
        );
        return response.data;
      },
    });
  },

  searchDrugByCode: (code) => {
    return useQuery({
      queryKey: ["searchDrugByCode", code],
      queryFn: async () => {
        const response = await api.get(`/drugs/code/${code}`);
        return response.data;
      },
    });
  },
};
