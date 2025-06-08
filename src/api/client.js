import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Base API client setup
const apiClient = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Refresh token logic here
        const refreshToken = await AsyncStorage.getItem("refresh_token");
        // Call refresh token API endpoint
        // Update tokens in storage
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Handle refresh token error (e.g., log out user)
        await AsyncStorage.removeItem("auth_token");
        await AsyncStorage.removeItem("refresh_token");
        // Navigate to login screen
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
