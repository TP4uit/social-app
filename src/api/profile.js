// src/api/profileService.js

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
      return response.data;
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
      return response.data; // Return response for success feedback
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
};
