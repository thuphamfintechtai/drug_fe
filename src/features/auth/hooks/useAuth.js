import { useEffect } from "react";
import { useAuthStore } from "../store";

export const useAuth = () => {
  const store = useAuthStore();

  useEffect(() => {
    if (store.loading) {
      store.initAuth();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    user: store.user,
    role: store.role,
    loading: store.loading,
    isAuthenticated: store.isAuthenticated,
    updateUser: store.updateUser,
    setUser: store.setUser,
    setRole: store.setRole,
    clearRole: store.clearRole,
    getRole: store.getRole,
    logout: store.logout,
  };
};

export default useAuth;
