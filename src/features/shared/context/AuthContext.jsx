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
  const { user, loading, isAuthenticated, initAuth, logout } = useAuthStore();

  useEffect(() => {
    if (loading) {
      initAuth();
    }
  }, [loading, initAuth]);

  const value = {
    user,
    loading,
    isAuthenticated,
    logout,

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
