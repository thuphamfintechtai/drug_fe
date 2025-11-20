import React, { createContext, useContext, useEffect } from "react";
import { useAuthStore } from "../../auth/store";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const initAuth = useAuthStore((state) => state.initAuth);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    if (loading) {
      initAuth();
    }
  }, [loading, initAuth]);

  const value = {
    user,
    loading,
    isAuthenticated,
    logout:
      logout ||
      (async () => {
        // Fallback nếu logout chưa có
        useAuthStore.getState().clearAuthState();
        const { clearAuthCookies } = await import(
          "../../auth/utils/cookieUtils"
        );
        clearAuthCookies();
      }),

    login: async () => {
      console.warn(
        "login() từ AuthContext đã deprecated, dùng authMutations.login() thay thế"
      );
      return { success: false, message: "Vui lòng dùng mutations" };
    },
    register: async () => {
      console.warn(
        "register() từ AuthContext đã deprecated, dùng authMutations.register() thay thế"
      );
      return { success: false, message: "Vui lòng dùng mutations" };
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
