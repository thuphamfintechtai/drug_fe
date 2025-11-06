import axios from 'axios';

const api = axios.create({
  baseURL: '/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Chỉ xóa token, không redirect vì có thể đang ở trang public
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Không redirect đến /login vì trang login đã bị xóa
      // Các component sẽ tự xử lý lỗi 401
    }
    return Promise.reject(error);
  }
);

export default api;