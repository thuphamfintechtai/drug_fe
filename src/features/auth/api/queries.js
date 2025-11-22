import { useQuery } from "@tanstack/react-query";
import api from "../../utils/api";

// Individual hooks - must be called at top level of component/hook
export const useGetCurrentUser = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const response = await api.get("/auth/me");
      return response.data;
    },
  });
};

export const useGetPasswordResetRequests = () => {
  return useQuery({
    queryKey: ["passwordResetRequests"],
    queryFn: async () => {
      const response = await api.get("/auth/password-reset-requests");
      return response.data;
    },
  });
};

// Legacy exports for backward compatibility (deprecated - use individual hooks above)
export const authQueries = {
  getCurrentUser: useGetCurrentUser,
  getPasswordResetRequests: useGetPasswordResetRequests,
};
