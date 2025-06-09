// src/screens/components/UserAvatarName.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux"; // Import useSelector
import { colors, spacing, typography } from "../../../theme";
import { profileService } from "../../../api/profile";

const DEFAULT_AVATAR = "https://i.pravatar.cc/150?u=defaultUser";
const DEFAULT_USERNAME = "Unknown User";

const UserAvatarName = ({ userId }) => {
  const navigation = useNavigation();
  const currentUserId = useSelector((state) => state.auth.user?._id); // Get current user's ID
  const [userData, setUserData] = useState({
    username: DEFAULT_USERNAME,
    avatar: DEFAULT_AVATAR,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        setError("No user ID provided");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await profileService.fetchUserProfileById(userId);
        setUserData({
          username: response.username || DEFAULT_USERNAME,
          avatar: response.avatar || DEFAULT_AVATAR,
        });
        setError(null);
      } catch (err) {
        console.error("UserAvatarName fetch error:", err.message);
        setError(err.message || "Failed to load user data");
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [userId]);

  const handlePress = () => {
    if (!userId) {
      console.warn("UserAvatarName: No userId provided");
      return;
    }
    if (userId === currentUserId) {
      navigation.navigate("Profile"); // Navigate to user's own profile
    } else {
      navigation.navigate("OtherProfile", { userId }); // Navigate to other user's profile
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={colors.primary}
          style={styles.avatar}
        />
      ) : (
        <Image source={{ uri: userData.avatar }} style={styles.avatar} />
      )}
      <Text style={styles.username} numberOfLines={1}>
        {loading ? "Loading..." : userData.username}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.sm,
  },
  username: {
    fontSize: typography.fontSize.md,
    fontWeight: "bold",
    color: colors.text,
    flex: 1,
  },
});

export default UserAvatarName;
