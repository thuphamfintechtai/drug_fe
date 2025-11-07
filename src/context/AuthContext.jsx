import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Kiểm tra authentication khi app load
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          // Lấy thông tin user mới nhất từ server
          const response = await authService.getCurrentUser();
          if (response.success) {
            setUser(response.data.user);
            setIsAuthenticated(true);
          } else {
            // Token không hợp lệ
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      console.log('AuthService response:', response);
      
      if (response.success) {
        const { user, token } = response.data || {};
        if (token && user) {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          setUser(user);
          setIsAuthenticated(true);
          return { success: true, data: response.data };
        } else {
          console.error('Missing token or user in response:', response);
          return { success: false, message: 'Thiếu thông tin xác thực từ server' };
        }
      }
      return { success: false, message: response.message || 'Đăng nhập thất bại' };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Đăng nhập thất bại',
      };
    }
  };

  const register = async (data, role = 'user') => {
    try {
      let response;
      switch (role) {
        case 'pharma_company':
          response = await authService.registerPharmaCompany(data);
          break;
        case 'distributor':
          response = await authService.registerDistributor(data);
          break;
        case 'pharmacy':
          response = await authService.registerPharmacy(data);
          break;
        default:
          response = await authService.register(data);
      }

      return {
        success: response.success,
        message: response.message,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Đăng ký thất bại',
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      
      // Disconnect MetaMask nếu đang kết nối
      // Note: Cần import useMetaMask trong component sử dụng AuthContext
      // hoặc tạo một utility function riêng để disconnect
      if (typeof window.ethereum !== 'undefined' && window.ethereum.request) {
        try {
          const permissions = await window.ethereum.request({
            method: 'wallet_getPermissions'
          });
          
          if (permissions && permissions.length > 0) {
            await window.ethereum.request({
              method: 'wallet_revokePermissions',
              params: [{ eth_accounts: {} }]
            });
          }
        } catch (err) {
          console.warn('Could not revoke MetaMask permissions on logout:', err);
        }
      }
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
