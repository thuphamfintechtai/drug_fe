import axios from "axios";
import { getAuthToken, clearAuthCookies } from "../auth/utils/cookieUtils";

const api = axios.create({
  baseURL: "https://drug-be.vercel.app/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
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
    // Handle both 401 (Unauthorized) and 403 (Forbidden) as authentication failures
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Chỉ xóa token, không redirect vì có thể đang ở trang public
      clearAuthCookies();
    }
    return Promise.reject(error);
  }
);

export default api;
