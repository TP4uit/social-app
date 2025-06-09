import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { useSelector } from "react-redux";
import { colors, spacing, typography } from "../../theme";
import { communityService } from "../../api/communityService";
import { imageService } from "../../api/imageService";

const DEFAULT_AVATAR = "https://i.pravatar.cc/150?u=defaultCommunity";
const DEFAULT_BANNER = "https://via.placeholder.com/150";

const EditCommunityScreen = ({ route, navigation }) => {
  const { communityId } = route.params;
  const { user } = useSelector((state) => state.auth);
  const [communityData, setCommunityData] = useState({
    name: "",
    description: "",
    privacy: "public",
    avatar: DEFAULT_AVATAR,
    banner: DEFAULT_BANNER,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("hello from commu edit screen", { communityId });
    fetchCommunityDetails();
  }, [communityId]);

  const fetchCommunityDetails = async () => {
    try {
      setIsLoading(true);
      const response = await communityService.getMyCommunities();
      console.log("getMyCommunities response:", response);
      console.log("Looking for communityId:", communityId);
      const community = response.find((c) => c._id === communityId);
      if (!community) throw new Error("Community not found");
      if (community.createdBy !== user._id) {
        throw new Error("You are not the creator of this community");
      }
      console.log("Found community:", community);
      setCommunityData({
        name: community.name || "",
        description: community.description || "",
        privacy: community.privacy || "public",
        avatar: community.avatar || DEFAULT_AVATAR,
        banner: community.banner || DEFAULT_BANNER,
      });
    } catch (err) {
      console.error("Fetch community error:", err.message);
      setError(err.message);
      Alert.alert("Error", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setCommunityData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePickImage = async (field) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Please allow access to your photos to upload an image."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: field === "avatar" ? [1, 1] : [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setCommunityData((prev) => ({ ...prev, [field]: imageUri }));
    }
  };

  const handleSave = async () => {
    if (!communityData.name.trim()) {
      Alert.alert("Error", "Community name is required");
      return;
    }

    setIsLoading(true);
    try {
      let avatarString = communityData.avatar;
      if (communityData.avatar.startsWith("file://")) {
        const fileInfo = await FileSystem.getInfoAsync(communityData.avatar);
        if (!fileInfo.exists) {
          throw new Error("Selected avatar image does not exist");
        }
        avatarString = await imageService.getImageString(communityData.avatar);
      }

      let bannerString = communityData.banner;
      if (communityData.banner.startsWith("file://")) {
        const fileInfo = await FileSystem.getInfoAsync(communityData.banner);
        if (!fileInfo.exists) {
          throw new Error("Selected banner image does not exist");
        }
        bannerString = await imageService.getImageString(communityData.banner);
      }

      await communityService.updateCommunity(communityId, {
        name: communityData.name,
        description: communityData.description,
        privacy: communityData.privacy,
        avatar: avatarString,
        banner: bannerString,
      });

      Alert.alert("Success", "Community updated successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error(
        "Update community error:",
        error.message,
        error.response?.data
      );
      Alert.alert(
        "Error",
        error.message || "Failed to update community. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  console.log("EditCommunityScreen render:", {
    isLoading,
    error,
    communityData,
    hasName: communityData.name,
  });

  if (error && !isLoading) {
    console.log("Rendering error state");
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchCommunityDetails}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading && !communityData.name) {
    console.log("Rendering loading state");
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!isLoading && !error && !communityData.name) {
    console.log("Rendering fallback state: no community data");
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No community data available</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchCommunityDetails}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  console.log("Rendering main UI with communityData:", communityData);
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Icon name="close-outline" size={30} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Community</Text>
        <TouchableOpacity
          onPress={handleSave}
          style={styles.headerButton}
          disabled={isLoading}
        >
          <Text
            style={[
              styles.saveButtonText,
              isLoading && styles.saveButtonTextDisabled,
            ]}
          >
            {isLoading ? "Saving..." : "Save"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionTitle}>Community Avatar</Text>
        <View style={styles.imagePickerContainer}>
          <Image
            source={{ uri: communityData.avatar }}
            style={styles.avatarPreview}
          />
          <TouchableOpacity
            style={styles.imagePickerButton}
            onPress={() => handlePickImage("avatar")}
          >
            <Text style={styles.imagePickerButtonText}>Change Avatar</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Community Banner</Text>
        <View style={styles.imagePickerContainer}>
          <Image
            source={{ uri: communityData.banner }}
            style={styles.bannerPreview}
          />
          <TouchableOpacity
            style={styles.imagePickerButton}
            onPress={() => handlePickImage("banner")}
          >
            <Text style={styles.imagePickerButtonText}>Change Banner</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Community Name</Text>
          <TextInput
            style={styles.input}
            value={communityData.name}
            onChangeText={(text) => handleInputChange("name", text)}
            placeholder="Enter community name"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.descriptionInput]}
            value={communityData.description}
            onChangeText={(text) => handleInputChange("description", text)}
            placeholder="Enter community description"
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Privacy</Text>
          <View style={styles.privacyContainer}>
            <TouchableOpacity
              style={[
                styles.privacyButton,
                communityData.privacy === "public" &&
                  styles.privacyButtonActive,
              ]}
              onPress={() => handleInputChange("privacy", "public")}
            >
              <Text
                style={[
                  styles.privacyButtonText,
                  communityData.privacy === "public" &&
                    styles.privacyButtonTextActive,
                ]}
              >
                Public
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.privacyButton,
                communityData.privacy === "private" &&
                  styles.privacyButtonActive,
              ]}
              onPress={() => handleInputChange("privacy", "private")}
            >
              <Text
                style={[
                  styles.privacyButtonText,
                  communityData.privacy === "private" &&
                    styles.privacyButtonTextActive,
                ]}
              >
                Private
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  errorText: {
    fontSize: typography.fontSize.md,
    color: colors.error,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: "bold",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    height: 56,
  },
  headerButton: {
    padding: spacing.xs,
    minWidth: 50,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: "bold",
    color: colors.text,
  },
  saveButtonText: {
    fontSize: typography.fontSize.md,
    color: colors.primary,
    fontWeight: "bold",
  },
  saveButtonTextDisabled: {
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg - 1,
    fontWeight: "bold",
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  imagePickerContainer: {
    alignItems: "center",
    marginVertical: spacing.md,
  },
  avatarPreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: spacing.md,
    backgroundColor: colors.border,
  },
  bannerPreview: {
    width: "90%",
    height: 150,
    borderRadius: 8,
    marginBottom: spacing.md,
    backgroundColor: colors.border,
  },
  imagePickerButton: {
    backgroundColor: colors.background,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
  },
  imagePickerButtonText: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: "500",
  },
  inputGroup: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === "ios" ? spacing.md - 2 : spacing.sm - 2,
    fontSize: typography.fontSize.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    height: 50,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: "top",
    paddingTop: spacing.sm,
  },
  privacyContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  privacyButton: {
    flex: 1,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: spacing.xs,
  },
  privacyButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  privacyButtonText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  privacyButtonTextActive: {
    color: colors.primary,
    fontWeight: "bold",
  },
});

export default EditCommunityScreen;
