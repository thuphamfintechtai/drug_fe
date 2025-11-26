import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "../../auth/api/index";
import api from "../../utils/api";
import {
  getAuthToken,
  getAuthUser,
  getAuthRole,
  setAuthUser,
  setAuthRole,
  clearAuthCookies,
} from "../utils/cookieUtils";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      role: null,
      loading: true,
      isAuthenticated: false,

      setAuthState: ({ user, role, isAuthenticated }) => {
        set({ user, role, isAuthenticated: isAuthenticated ?? !!user });
      },

      clearAuthState: () => {
        set({ user: null, role: null, isAuthenticated: false });
      },

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
        if (user) {
          setAuthUser(user);
        }
      },

      setRole: (role) => {
        set({ role });
        if (role) {
          setAuthRole(role);
        }
      },

      clearRole: () => {
        set({ role: null });
      },

      setLoading: (loading) => set({ loading }),

      // Init auth từ cookies
      initAuth: async () => {
        const token = getAuthToken();
        const storedUser = getAuthUser();
        const storedRole = getAuthRole();

        if (token && storedUser) {
          try {
            const response = await authService.getCurrentUser();
            if (response.success) {
              const rawUser = response.data?.user || response.user;
              const businessProfile =
                response.data?.businessProfile || response.businessProfile;
              const user = {
                ...rawUser,
                businessProfile: businessProfile || rawUser?.businessProfile,
              };
              const role = storedRole || user?.role;
              set({
                user,
                role,
                isAuthenticated: true,
                loading: false,
              });
              // Update cookies
              setAuthUser(user);
              if (role) {
                setAuthRole(role);
              }
            } else {
              clearAuthCookies();
              set({
                user: null,
                role: null,
                isAuthenticated: false,
                loading: false,
              });
            }
          } catch (error) {
            const status = error.response?.status;
            if (status !== 401 && status !== 403) {
              console.error("Auth check failed:", error);
            }
            clearAuthCookies();
            set({
              user: null,
              role: null,
              isAuthenticated: false,
              loading: false,
            });
          }
        } else {
          set({ loading: false });
        }
      },

      // Update user (có thể dùng từ mutations hoặc components)
      updateUser: (userData) => {
        const currentUser = get().user;
        const updatedUser = { ...currentUser, ...userData };
        setAuthUser(updatedUser);
        set({ user: updatedUser });
      },

      // Logout function
      logout: async () => {
        try {
          // Disconnect wallet trước khi logout
          if (
            typeof window.ethereum !== "undefined" &&
            window.ethereum.request
          ) {
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
          // Gọi API logout nếu cần
          await api.post("/auth/logout");
        } catch (error) {
          // Ignore errors, vẫn clear local state
          console.error("Logout API error:", error);
        } finally {
          // Clear cookies và state
          clearAuthCookies();
          set({
            user: null,
            role: null,
            isAuthenticated: false,
            loading: false,
          });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
