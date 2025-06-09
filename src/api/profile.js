import apiClient from "./client";

export const profileService = {
  updateUserInfo: async ({
    username,
    avatar,
    coverPhoto,
    bio,
    phone,
    dateOfBirth,
    gender,
  }) => {
    console.log("Updating profile with:", {
      username,
      avatar,
      coverPhoto,
      bio,
      phone,
      dateOfBirth,
      gender,
    });
    try {
      const response = await apiClient.put("/users/me", {
        username,
        avatar,
        coverPhoto,
        bio,
        phone,
        dateOfBirth,
        gender,
      });
      console.log("Profile update response:", response.data);
      // Normalize response: return user object directly
      return response.data.user || response.data;
    } catch (error) {
      console.error(
        "Profile update failed:",
        error.message,
        error.response?.data
      );
      throw new Error(
        error.response?.data?.error || "Failed to update profile"
      );
    }
  },

  changePassword: async ({ oldPassword, newPassword }) => {
    try {
      const response = await apiClient.put("/users/me/change-password", {
        oldPassword,
        newPassword,
      });
      console.log("Password change response:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "Change password failed:",
        error.message,
        error.response?.data
      );
      throw new Error(
        error.response?.data?.error || "Failed to change password"
      );
    }
  },

  getCurrentUserProfile: async () => {
    try {
      const response = await apiClient.get("/users/me");
      console.log("Current user profile response:", response.data);
      // Normalize response: return { user, privacy }
      return {
        user: response.data.user || response.data,
        privacy: response.data.privacy || null,
      };
    } catch (error) {
      console.error(
        "Fetch current user profile failed:",
        error.message,
        error.response?.data
      );
      throw new Error(
        error.response?.data?.error || "Failed to fetch current user profile"
      );
    }
  },

  fetchUserProfileById: async (userId) => {
    if (!userId) {
      console.error("fetchUserProfileById: No userId provided");
      throw new Error("User ID is required");
    }
    try {
      const response = await apiClient.get(`/users/${userId}`);
      console.log(`User profile response for ID ${userId}:`, response.data);
      // Normalize response: return { user, privacy }
      return {
        user: response.data.user || response.data,
        privacy: response.data.privacy || null,
      };
    } catch (error) {
      console.error(
        `Fetch user profile failed for ID ${userId}:`,
        error.message,
        error.response?.data
      );
      throw new Error(
        error.response?.data?.error || "Failed to fetch user profile"
      );
    }
  },

  followUser: async (userId) => {
    if (!userId) {
      console.error("followUser: No userId provided");
      throw new Error("User ID is required");
    }
    try {
      const response = await apiClient.post(`/users/${userId}/follow`);
      console.log(`Follow user response for ID ${userId}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(
        `Follow user failed for ID ${userId}:`,
        error.message,
        error.response?.data
      );
      throw new Error(error.response?.data?.error || "Failed to follow user");
    }
  },

  getFollowers: async (userId) => {
    if (!userId) {
      console.error("getFollowers: No userId provided");
      throw new Error("User ID is required");
    }
    try {
      const response = await apiClient.get(`/users/${userId}/followers`);
      console.log(`Followers response for ID ${userId}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(
        `Fetch followers failed for ID ${userId}:`,
        error.message,
        error.response?.data
      );
      throw new Error(
        error.response?.data?.error || "Failed to fetch followers"
      );
    }
  },

  getFollowing: async () => {
    try {
      const response = await apiClient.get(`/users/me/following`);
      console.log(`Following response:`, response.data.following);
      return response.data.following;
    } catch (error) {
      console.error(
        `Fetch following failed:`,
        error.message,
        error.response?.data
      );
      throw new Error(
        error.response?.data?.error || "Failed to fetch following"
      );
    }
  },

  searchUsers: async (query) => {
    if (!query) {
      console.error("searchUsers: No query provided");
      throw new Error("Search query is required");
    }
    try {
      const response = await apiClient.get("/users/search", {
        params: { query },
      });
      console.log(`Search users response for query "${query}":`, response.data);
      return response.data;
    } catch (error) {
      console.error(
        `Search users failed for query "${query}":`,
        error.message,
        error.response?.data
      );
      throw new Error(error.response?.data?.error || "Failed to search users");
    }
  },
};
