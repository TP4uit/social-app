import AsyncStorage from "@react-native-async-storage/async-storage";
import { profileService } from "../api/profile";

export const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem("auth_token");
    return token;
  } catch (error) {
    console.error("Failed to get auth token:", error);
    return null;
  }
};

export const getCurrentUser = async () => {
  try {
    const userString = await AsyncStorage.getItem("user");
    return userString ? JSON.parse(userString) : null;
  } catch (error) {
    console.error("Failed to get current user:", error);
    return null;
  }
};

export const syncCurrentUser = async () => {
  try {
    const { user } = await profileService.getCurrentUserProfile();
    await AsyncStorage.setItem("user", JSON.stringify(user));
    return user;
  } catch (error) {
    console.error("Failed to sync current user:", error);
    return null;
  }
};
