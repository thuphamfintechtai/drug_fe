import axios from "axios";
import { getAuthToken } from "../auth/utils/cookieUtils";

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // Development mode: sử dụng proxy hoặc local API
  if (import.meta.env.DEV) {
    return "https://drug-be.vercel.app";
  }

  // Production mode: sử dụng production API URL
  return "https://drug-be.vercel.app/api";
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
  decompress: true,
});

api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Debug in development
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log("✅ Token attached:", config.url, {
          hasToken: !!token,
          tokenLength: token.length,
        });
      }
    } else {
      // Debug: Log when token is missing
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.warn("⚠️ No token for:", config.url);
      }
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
    return Promise.reject(error);
  }
);

export default api;
