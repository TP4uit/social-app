import React, { useState, useEffect } from "react";
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
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import DatePicker from "react-native-date-picker"; // Import date picker
import { colors, spacing, typography } from "../../theme";
import { useAuth } from "../../hooks/useAuth";
import { dummyUsers } from "../../utils/dummyData";
import { profileService } from "../../api/profile";
import { imageService } from "../../api/imageService";

const DEFAULT_AVATAR = "https://i.pravatar.cc/150?u=defaultUser";
const DEFAULT_COVER_PHOTO = "https://via.placeholder.com/150";

const EditProfileScreen = ({ navigation }) => {
  const { user: currentUser, loading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState({
    username: "",
    avatar: DEFAULT_AVATAR,
    coverPhoto: DEFAULT_COVER_PHOTO,
    bio: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [openDatePicker, setOpenDatePicker] = useState(false); // State for date picker modal

  useEffect(() => {
    if (currentUser) {
      setProfileData({
        username: currentUser.username || "",
        avatar: currentUser.avatar || DEFAULT_AVATAR,
        coverPhoto: currentUser.coverPhoto || DEFAULT_COVER_PHOTO,
        bio: currentUser.bio || "",
        phone: currentUser.phone || "",
        dateOfBirth: currentUser.dateOfBirth || "",
        gender: currentUser.gender || "",
      });
    }
  }, [currentUser]);

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
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
      console.log(`Selected ${field} URI:`, imageUri);
      setProfileData((prev) => ({ ...prev, [field]: imageUri }));
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      console.log("Saving profile with data:", profileData);

      let avatarString = profileData.avatar;
      if (profileData.avatar.startsWith("file://")) {
        const fileInfo = await FileSystem.getInfoAsync(profileData.avatar);
        if (!fileInfo.exists) {
          throw new Error("Selected avatar image does not exist");
        }
        avatarString = await imageService.getImageString(profileData.avatar);
      }

      let coverPhotoString = profileData.coverPhoto;
      if (profileData.coverPhoto.startsWith("file://")) {
        const fileInfo = await FileSystem.getInfoAsync(profileData.coverPhoto);
        if (!fileInfo.exists) {
          throw new Error("Selected cover photo does not exist");
        }
        coverPhotoString = await imageService.getImageString(
          profileData.coverPhoto
        );
      }

      await profileService.updateUserInfo({
        username: profileData.username,
        avatar: avatarString,
        coverPhoto: coverPhotoString,
        bio: profileData.bio,
        phone: profileData.phone,
        dateOfBirth: profileData.dateOfBirth,
        gender: profileData.gender,
      });

      if (currentUser) {
        const userIndex = dummyUsers.findIndex((u) => u.id === currentUser.id);
        if (userIndex !== -1) {
          dummyUsers[userIndex] = {
            ...dummyUsers[userIndex],
            username: profileData.username,
            avatar: avatarString,
            coverPhoto: coverPhotoString,
            bio: profileData.bio,
            phone: profileData.phone,
            dateOfBirth: profileData.dateOfBirth,
            gender: profileData.gender,
          };
          console.log("Dummy user updated:", dummyUsers[userIndex]);
        }
      }

      setIsLoading(false);
      Alert.alert("Success", "Your profile has been updated.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      setIsLoading(false);
      console.error("Save profile error:", error.message, error.response?.data);
      Alert.alert(
        "Error",
        error.message || "Failed to save profile. Please try again."
      );
    }
  };

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
        <Text style={styles.headerTitle}>Edit Profile</Text>
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
        <Text style={styles.sectionTitle}>Profile Photo</Text>
        <View style={styles.profilePhotoContainer}>
          <Image
            source={{ uri: profileData.avatar }}
            style={styles.profileImage}
          />
          <TouchableOpacity
            style={styles.editPhotoButton}
            onPress={() => handlePickImage("avatar")}
          >
            <Text style={styles.editPhotoButtonText}>Change Profile Photo</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Cover Photo</Text>
        <View style={styles.profilePhotoContainer}>
          <Image
            source={{ uri: profileData.coverPhoto }}
            style={styles.coverPhoto}
          />
          <TouchableOpacity
            style={styles.editPhotoButton}
            onPress={() => handlePickImage("coverPhoto")}
          >
            <Text style={styles.editPhotoButtonText}>Change Cover Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={profileData.username}
            onChangeText={(text) => handleInputChange("username", text)}
            placeholder="Enter your username"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.bioInput]}
            value={profileData.bio}
            onChangeText={(text) => handleInputChange("bio", text)}
            placeholder="Tell us about yourself"
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={profileData.phone}
            onChangeText={(text) => handleInputChange("phone", text)}
            placeholder="Enter your phone number"
            placeholderTextColor={colors.textSecondary}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date of Birth</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setOpenDatePicker(true)}
          >
            <Text style={styles.inputText}>
              {profileData.dateOfBirth || "Select date (YYYY-MM-DD)"}
            </Text>
          </TouchableOpacity>
          <DatePicker
            modal
            open={openDatePicker}
            date={
              profileData.dateOfBirth
                ? new Date(profileData.dateOfBirth)
                : new Date()
            }
            onConfirm={(date) => {
              setOpenDatePicker(false);
              handleInputChange(
                "dateOfBirth",
                date.toISOString().split("T")[0]
              );
            }}
            onCancel={() => setOpenDatePicker(false)}
            mode="date"
            maximumDate={new Date()} // Prevent future dates
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Gender</Text>
          <TextInput
            style={styles.input}
            value={profileData.gender}
            onChangeText={(text) => handleInputChange("gender", text)}
            placeholder="e.g., male, female, other"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="words"
          />
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
  profilePhotoContainer: {
    alignItems: "center",
    marginVertical: spacing.md,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: spacing.md,
    backgroundColor: colors.border,
  },
  coverPhoto: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginBottom: spacing.md,
    backgroundColor: colors.border,
  },
  editPhotoButton: {
    backgroundColor: colors.background,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
  },
  editPhotoButtonText: {
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
    justifyContent: "center", // For TouchableOpacity
  },
  inputText: {
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  bioInput: {
    height: 100,
    textAlignVertical: "top",
    paddingTop: spacing.sm,
  },
});

export default EditProfileScreen;
