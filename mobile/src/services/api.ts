import axios from "axios";
import { store } from "../store/store";
import { logout, updateAccessToken } from "../store/authSlice";

// ⚠️ REPLACE WITH YOUR LAPTOP'S LOCAL IP ADDRESS
// Ensure this matches the one in global constants or index.tsx
// TODO: Move to a shared config file
const API_URL = "http://192.168.31.29:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the token
api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 (Unauthorized) and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark as retried to prevent infinite loop

      try {
        // Get the Refresh Token from Redux
        const state = store.getState();
        const refreshToken = state.auth.refreshToken;

        if (!refreshToken) {
          // No refresh token? Force logout.
          store.dispatch(logout());
          return Promise.reject(error);
        }

        // Call Backend to get new Access Token
        // NOTE: Use raw 'axios' here, not 'api' instance, to avoid circular interceptors
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const newAccessToken = response.data.accessToken;

        // 1. Save new token to Redux
        store.dispatch(updateAccessToken(newAccessToken));

        // 2. Update the header for the original failed request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // 3. Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token invalid or expired? Log them out.
        console.log("Session expired completely.");
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export { api };
