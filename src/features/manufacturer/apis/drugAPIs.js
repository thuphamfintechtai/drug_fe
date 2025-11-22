import api from "../../utils/api";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

// Individual hooks - must be called at top level of component/hook
export const useMyDrugs = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["getMyDrugs", page, limit],
    queryFn: async () => {
      const response = await api.get(`/drugs?page=${page}&limit=${limit}`);
      return response.data;
    },
  });
};

export const useGetAllDrugs = () => {
  return useQuery({
    queryKey: ["getAllDrugs"],
    queryFn: async () => {
      const response = await api.get("/drugs");
      return response.data;
    },
  });
};

export const useGetDrugCodes = () => {
  return useQuery({
    queryKey: ["getDrugCodes"],
    queryFn: async () => {
      const response = await api.get("/drugs/codes/list");
      return response.data;
    },
  });
};

export const useGetDrugById = (id) => {
  return useQuery({
    queryKey: ["getDrugById", id],
    queryFn: async () => {
      const response = await api.get(`/drugs/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateDrug = () => {
  return useMutation({
    mutationFn: async (data) => {
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
};

export const useGetDrugsByManufacturerId = (manufacturerId) => {
  return useQuery({
    queryKey: ["getDrugsByManufacturerId", manufacturerId],
    queryFn: async () => {
      const response = await api.get(
        `/drugs/getDrugByManufactor/${manufacturerId}`
      );
      return response.data;
    },
    enabled: !!manufacturerId,
  });
};

export const useSearchDrugByCode = (code) => {
  return useQuery({
    queryKey: ["searchDrugByCode", code],
    queryFn: async () => {
      const response = await api.get(`/drugs/search/atc?code=${code}`);
      return response.data;
    },
    enabled: !!code,
  });
};

// Legacy exports for backward compatibility (deprecated - use individual hooks above)
export const drugAPIs = {
  getMyDrugs: useMyDrugs,
  getAllDrugs: useGetAllDrugs,
  getDrugCodes: useGetDrugCodes,
  getDrugById: useGetDrugById,
  createDrug: useCreateDrug,
  getDrugsByManufacturerId: useGetDrugsByManufacturerId,
  searchDrugByCode: useSearchDrugByCode,
};
