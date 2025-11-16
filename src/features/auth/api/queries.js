import { useQuery } from "@tanstack/react-query";
import api from "../../../../src_broken/utils/api";

export const authQueries = {
  getCurrentUser: () => {
    return useQuery({
      queryKey: ["currentUser"],
      queryFn: async () => {
        const response = await api.get("/auth/me");
        return response.data;
      },
    });
  },

  getPasswordResetRequests: () => {
    return useQuery({
      queryKey: ["passwordResetRequests"],
      queryFn: async () => {
        const response = await api.get("/auth/password-reset-requests");
        return response.data;
      },
    });
  },
};
