import axios from "axios";

// ⚠️ Ensure this matches your backend URL
const BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
});

// 1. Request Interceptor: Attach Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. Response Interceptor: Handle 401 & Refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 (Unauthorized) and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Call backend to get new Access Token
        // NOTE: Use plain 'axios' to avoid circular dependency loop
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        // Save new token to LocalStorage
        localStorage.setItem("token", data.accessToken);

        // Update the header for the failed request
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails (token expired/invalid), force logout
        console.error("Session expired. Logging out...");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        // Optional: Redirect to login page
        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
