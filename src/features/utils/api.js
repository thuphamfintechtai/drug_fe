import axios from "axios";
import { getAuthToken, clearAuthCookies } from "../auth/utils/cookieUtils";

const getApiBaseUrl = () => {
  if (import.meta.env.DEV) {
    return "/api";
  }
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
    if (error.response?.status === 401 || error.response?.status === 403) {
      clearAuthCookies();
    }
    return Promise.reject(error);
  }
);

export default api;
