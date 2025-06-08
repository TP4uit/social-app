import apiClient from "./client";

export const authService = {
  login: async (email, password) => {
    console.log("Making API call to /auth/login", { email, password });
    try {
      const response = await apiClient.post("/auth/login", {
        email: email,
        password: password,
      });
      console.log("API response:", response.data);
      return response;
    } catch (error) {
      console.error("API call failed:", error.message, error.response?.data);
      throw error;
    }
  },

  register: async (username, email, password) => {
    return await apiClient.post("/auth/register", {
      username,
      email,
      password,
    });
  },

  logout: async () => {
    return await apiClient.post("/auth/logout");
  },

  getProfile: async () => {
    return await apiClient.get("/users/me");
  },
};
