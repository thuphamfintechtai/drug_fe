import api from "../../../utils/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Individual hooks - must be called at top level of component/hook
export const useCreateDrugMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const response = await api.post(`/drugs`, payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Tạo thuốc thành công!");
      queryClient.invalidateQueries({ queryKey: ["listDrugs"] });
      queryClient.invalidateQueries({ queryKey: ["allDrugs"] });
      queryClient.invalidateQueries({ queryKey: ["drugStats"] });
      queryClient.invalidateQueries({ queryKey: ["drugStatistics"] });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || error.message || "Tạo thuốc thất bại"
      );
    },
  });
};

export const useUpdateDrugMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }) => {
      const response = await api.put(`/drugs/${id}`, payload);
      return response.data;
    },
    onSuccess: (data, variables) => {
      toast.success("Cập nhật thuốc thành công!");
      queryClient.invalidateQueries({ queryKey: ["listDrugs"] });
      queryClient.invalidateQueries({ queryKey: ["allDrugs"] });
      queryClient.invalidateQueries({ queryKey: ["drugById", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["drugStats"] });
      queryClient.invalidateQueries({ queryKey: ["drugStatistics"] });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Cập nhật thuốc thất bại"
      );
    },
  });
};

export const useDeleteDrugMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await api.delete(`/drugs/${id}`);
      return response.data;
    },
    onSuccess: (data, id) => {
      toast.success("Xóa thuốc thành công!");
      queryClient.invalidateQueries({ queryKey: ["listDrugs"] });
      queryClient.invalidateQueries({ queryKey: ["allDrugs"] });
      queryClient.invalidateQueries({ queryKey: ["drugById", id] });
      queryClient.invalidateQueries({ queryKey: ["drugStats"] });
      queryClient.invalidateQueries({ queryKey: ["drugStatistics"] });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || error.message || "Xóa thuốc thất bại"
      );
    },
  });
};

// Legacy exports for backward compatibility (deprecated - use individual hooks above)
export const drugMutations = {
  createDrug: useCreateDrugMutation,
  updateDrug: useUpdateDrugMutation,
  deleteDrug: useDeleteDrugMutation,
};
