import api from "../../utils/api";
import { useMutation } from "@tanstack/react-query";
import {
  setAuthToken,
  setAuthUser,
  setAuthRole,
  clearAuthCookies,
} from "../utils/cookieUtils";
import { useAuthStore } from "../store";

// Individual hooks - must be called at top level of component/hook
export const useLoginMutation = () => {
  return useMutation({
    mutationFn: async (data) => {
      const loginResponse = await api.post("/auth/login", {
        email: data.email,
        password: data.password,
      });

      if (!loginResponse.data?.success || !loginResponse.data?.data?.token) {
        return loginResponse.data;
      }

      const token = loginResponse.data.data.token;

      setAuthToken(token);

      try {
        const meResponse = await api.get("/auth/me");
        if (meResponse.data?.success && meResponse.data?.data?.user) {
          const { user, role, businessProfile } = meResponse.data.data;

          const normalizedUser = {
            ...user,
            businessProfile: businessProfile || user.businessProfile,
          };

          setAuthUser(normalizedUser);
          if (role) {
            setAuthRole(role);
          }

          useAuthStore.getState().setAuthState({
            user: normalizedUser,
            role: role || user?.role,
            isAuthenticated: true,
          });

          // Trả về response với đầy đủ thông tin
          return {
            success: true,
            data: {
              token,
              user: normalizedUser,
              role: role || user?.role,
              businessProfile: businessProfile || user.businessProfile,
            },
          };
        }
      } catch (meError) {
        // Nếu /auth/me thất bại, vẫn trả về token từ login
        console.error("Error fetching user info:", meError);
      }

      // Fallback: trả về response từ login nếu /auth/me thất bại
      return loginResponse.data;
    },
    onError: (error) => {
      console.error("Login error:", error);
      clearAuthCookies();
      useAuthStore.getState().clearAuthState();
    },
  });
};

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: async (data) => {
      const { role = "user" } = data;
      let endpoint = "/auth/register/user";

      switch (role) {
        case "pharma_company":
          endpoint = "/auth/register/pharma-company";
          break;
        case "distributor":
          endpoint = "/auth/register/distributor";
          break;
        case "pharmacy":
          endpoint = "/auth/register/pharmacy";
          break;
      }

      const response = await api.post(endpoint, data);
      return response.data;
    },
    onError: (error) => {
      console.error("Register error:", error);
    },
  });
};

export const useLogoutMutation = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await api.post("/auth/logout");
      return response.data;
    },
    onSuccess: async () => {
      clearAuthCookies();
      useAuthStore.getState().clearAuthState();

      if (typeof window.ethereum !== "undefined" && window.ethereum.request) {
        try {
          const permissions = await window.ethereum.request({
            method: "wallet_getPermissions",
          });

          if (permissions && permissions.length > 0) {
            await window.ethereum.request({
              method: "wallet_revokePermissions",
              params: [{ eth_accounts: {} }],
            });
          }
        } catch (err) {
          console.warn(
            "Could not revoke MetaMask permissions on logout:",
            err
          );
        }
      }
    },
    onError: (error) => {
      console.error("Logout error:", error);
      clearAuthCookies();
      useAuthStore.getState().clearAuthState();
    },
  });
};

export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post("/auth/forgot-password", data);
      return response.data;
    },
  });
};

export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post("/auth/reset-password", data);
      return response.data;
    },
  });
};

export const useApprovePasswordResetMutation = () => {
  return useMutation({
    mutationFn: async (resetRequestId) => {
      const response = await api.post(
        `/auth/password-reset-requests/${resetRequestId}/approve`
      );
      return response.data;
    },
  });
};

export const useRejectPasswordResetMutation = () => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post(
        "/auth/password-reset-requests/reject",
        data
      );
      return response.data;
    },
  });
};

export const useRegisterPharmaCompanyMutation = () => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post("/auth/register/pharma-company", data);
      return response.data;
    },
  });
};

export const useRegisterDistributorMutation = () => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post("/auth/register/distributor", data);
      return response.data;
    },
  });
};

export const useRegisterPharmacyMutation = () => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post("/auth/register/pharmacy", data);
      return response.data;
    },
  });
};

// Legacy exports for backward compatibility (deprecated - use individual hooks above)
export const authMutations = {
  login: useLoginMutation,
  register: useRegisterMutation,
  logout: useLogoutMutation,
  forgotPassword: useForgotPasswordMutation,
  resetPassword: useResetPasswordMutation,
  approvePasswordReset: useApprovePasswordResetMutation,
  rejectPasswordReset: useRejectPasswordResetMutation,
  registerPharmaCompany: useRegisterPharmaCompanyMutation,
  registerDistributor: useRegisterDistributorMutation,
  registerPharmacy: useRegisterPharmacyMutation,
};
