import Cookies from "js-cookie";

const COOKIE_KEYS = {
  TOKEN: "auth_token",
  USER: "auth_user",
  ROLE: "auth_role",
};

const COOKIE_OPTIONS = {
  expires: 7,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
};

/**
 * Set authentication token cookie
 * @param {string} token - Authentication token
 */
export const setAuthToken = (token) => {
  if (token) {
    Cookies.set(COOKIE_KEYS.TOKEN, token, COOKIE_OPTIONS);
  }
};

/**
 * Get authentication token from cookie
 * @returns {string|null} - Authentication token or null
 */
export const getAuthToken = () => {
  return Cookies.get(COOKIE_KEYS.TOKEN) || null;
};

/**
 * Remove authentication token cookie
 */
export const removeAuthToken = () => {
  Cookies.remove(COOKIE_KEYS.TOKEN);
};

/**
 * Set user data cookie
 * @param {object} user - User object
 */
export const setAuthUser = (user) => {
  if (user) {
    Cookies.set(COOKIE_KEYS.USER, JSON.stringify(user), COOKIE_OPTIONS);
  }
};

/**
 * Get user data from cookie
 * @returns {object|null} - User object or null
 */
export const getAuthUser = () => {
  const userStr = Cookies.get(COOKIE_KEYS.USER);
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error("Error parsing user cookie:", error);
      return null;
    }
  }
  return null;
};

/**
 * Remove user data cookie
 */
export const removeAuthUser = () => {
  Cookies.remove(COOKIE_KEYS.USER);
};

/**
 * Set user role cookie
 * @param {string} role - User role
 */
export const setAuthRole = (role) => {
  if (role) {
    Cookies.set(COOKIE_KEYS.ROLE, role, COOKIE_OPTIONS);
  }
};

/**
 * Get user role from cookie
 * @returns {string|null} - User role or null
 */
export const getAuthRole = () => {
  return Cookies.get(COOKIE_KEYS.ROLE) || null;
};

/**
 * Remove user role cookie
 */
export const removeAuthRole = () => {
  Cookies.remove(COOKIE_KEYS.ROLE);
};

/**
 * Clear all authentication cookies
 */
export const clearAuthCookies = () => {
  removeAuthToken();
  removeAuthUser();
  removeAuthRole();
};

export default {
  setAuthToken,
  getAuthToken,
  removeAuthToken,
  setAuthUser,
  getAuthUser,
  removeAuthUser,
  setAuthRole,
  getAuthRole,
  removeAuthRole,
  clearAuthCookies,
};
