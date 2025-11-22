import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../utils/api";
import { toast } from "sonner";

// Individual hooks - must be called at top level of component/hook
export const useAdminApproveRegistration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await api.post(
        `/auth/registration-requests/${id}/approve`
      );
      return response.data;
    },
    onSuccess: (data, id) => {
      toast.success("Duyệt đăng ký thành công!");
      queryClient.invalidateQueries({ queryKey: ["pendingRegistrations"] });
      queryClient.invalidateQueries({ queryKey: ["registrationById", id] });
      queryClient.invalidateQueries({ queryKey: ["registrationStatistics"] });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Duyệt đăng ký thất bại"
      );
    },
  });
};

export const useAdminRejectRegistration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, rejectionReason }) => {
      const response = await api.post(
        `/auth/registration-requests/${id}/reject`,
        { rejectionReason }
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      toast.success("Từ chối đăng ký thành công!");
      // Invalidate queries liên quan
      queryClient.invalidateQueries({ queryKey: ["pendingRegistrations"] });
      queryClient.invalidateQueries({
        queryKey: ["registrationById", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["registrationStatistics"] });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Từ chối đăng ký thất bại"
      );
    },
  });
};

export const useAdminRetryRegistrationBlockchain = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await api.post(
        `/admin/registration/${id}/retry-blockchain`
      );
      return response.data;
    },
    onSuccess: (data, id) => {
      toast.success("Thử lại blockchain thành công!");
      // Invalidate queries liên quan
      queryClient.invalidateQueries({ queryKey: ["pendingRegistrations"] });
      queryClient.invalidateQueries({ queryKey: ["registrationById", id] });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Thử lại blockchain thất bại"
      );
    },
  });
};

export const useAdminCreateDrug = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (drug) => {
      const response = await api.post(`/admin/drugs`, drug);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Tạo thuốc thành công!");
      // Invalidate queries liên quan
      queryClient.invalidateQueries({ queryKey: ["allDrugs"] });
      queryClient.invalidateQueries({ queryKey: ["listDrugs"] });
      queryClient.invalidateQueries({ queryKey: ["drugStatistics"] });
      queryClient.invalidateQueries({ queryKey: ["drugStats"] });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || error.message || "Tạo thuốc thất bại"
      );
    },
  });
};

// Legacy exports for backward compatibility (deprecated - use individual hooks above)
export const adminMutations = {
  approveRegistration: useAdminApproveRegistration,
  rejectRegistration: useAdminRejectRegistration,
  retryRegistrationBlockchain: useAdminRetryRegistrationBlockchain,
  createDrug: useAdminCreateDrug,
};
