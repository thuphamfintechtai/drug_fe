import api from "../../../../src_broken/utils/api";
import { useMutation } from "@tanstack/react-query";
import {
  setAuthToken,
  setAuthUser,
  setAuthRole,
  clearAuthCookies,
} from "../utils/cookieUtils";
import { useAuthStore } from "../store";

export const authMutations = {
  login: () => {
    return useMutation({
      mutationFn: async (data) => {
        const response = await api.post("/auth/login", {
          email: data.email,
          password: data.password,
        });
        return response.data;
      },
      onSuccess: (response) => {
        if (response.success) {
          const { user, token } = response.data || {};
          if (token && user) {
            const role = user?.role;
            setAuthToken(token);
            setAuthUser(user);
            if (role) {
              setAuthRole(role);
            }
            useAuthStore.getState().setAuthState({
              user,
              role,
              isAuthenticated: true,
            });
          }
        }
      },
      onError: (error) => {
        console.error("Login error:", error);
      },
    });
  },

  register: () => {
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
  },

  logout: () => {
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
  },

  forgotPassword: () => {
    return useMutation({
      mutationFn: async (data) => {
        const response = await api.post("/auth/forgot-password", data);
        return response.data;
      },
    });
  },

  resetPassword: () => {
    return useMutation({
      mutationFn: async (data) => {
        const response = await api.post("/auth/reset-password", data);
        return response.data;
      },
    });
  },

  approvePasswordReset: () => {
    return useMutation({
      mutationFn: async (resetRequestId) => {
        const response = await api.post(
          `/auth/password-reset-requests/${resetRequestId}/approve`
        );
        return response.data;
      },
    });
  },

  rejectPasswordReset: () => {
    return useMutation({
      mutationFn: async (data) => {
        const response = await api.post(
          "/auth/password-reset-requests/reject",
          data
        );
        return response.data;
      },
    });
  },

  registerPharmaCompany: () => {
    return useMutation({
      mutationFn: async (data) => {
        const response = await api.post("/auth/register/pharma-company", data);
        return response.data;
      },
    });
  },

  registerDistributor: () => {
    return useMutation({
      mutationFn: async (data) => {
        const response = await api.post("/auth/register/distributor", data);
        return response.data;
      },
    });
  },

  registerPharmacy: () => {
    return useMutation({
      mutationFn: async (data) => {
        const response = await api.post("/auth/register/pharmacy", data);
        return response.data;
      },
    });
  },
};
