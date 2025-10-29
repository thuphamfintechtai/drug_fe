import api from '../utils/api';

export const authService = {
  // Đăng ký user thông thường
  register: async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // Đăng nhập
  login: async (email, password) => {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  // Đăng ký nhà sản xuất
  registerPharmaCompany: async (data) => {
    const response = await api.post('/auth/register-pharma-company', data);
    return response.data;
  },

  // Đăng ký nhà phân phối
  registerDistributor: async (data) => {
    const response = await api.post('/auth/register-distributor', data);
    return response.data;
  },

  // Đăng ký nhà thuốc
  registerPharmacy: async (data) => {
    const response = await api.post('/auth/register-pharmacy', data);
    return response.data;
  },

  // Lấy thông tin user hiện tại
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Đăng xuất
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Quên mật khẩu
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset mật khẩu
  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', {
      token,
      newPassword,
    });
    return response.data;
  },
};
