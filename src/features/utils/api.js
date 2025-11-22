import axios from "axios";
import { getAuthToken, clearAuthCookies } from "../auth/utils/cookieUtils";

// Get API base URL from environment or use default
const getApiBaseUrl = () => {
  // Check if running in production
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_BASE_URL || "https://drug-be.vercel.app/api";
  }
  // In development, use proxy
  return "/api";
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds timeout
  // Enable compression
  decompress: true,
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
