import api from "../../utils/api";

export const authService = {
  async getCurrentUser() {
    const response = await api.get("/auth/me");
    return response.data;
  },
};

export * from "./queries";
export * from "./mutations";
