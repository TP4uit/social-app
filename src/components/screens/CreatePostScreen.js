import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import {
  createPost as createPostAction,
  fetchPosts,
} from "../../redux/actions/postsActions";
import { colors, spacing, typography } from "../../theme";
import { useAuth } from "../../hooks/useAuth";
import { imageService } from "../../api/imageService";
import Icon from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

const DEFAULT_AVATAR = "https://i.pravatar.cc/150?u=defaultUser";

const CreatePostScreen = ({ navigation }) => {
  const [content, setContent] = useState("");
  const [contentError, setContentError] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  const dispatch = useDispatch();
  const { creating, createError } = useSelector((state) => state.posts || {});
  const { user } = useAuth();
  const insets = useSafeAreaInsets(); // Get safe area insets for mobile

  const currentUserAvatar = user?.avatar || DEFAULT_AVATAR;

  const validateForm = () => {
    if (!content.trim() && !imageUri) {
      setContentError("Please add text or an image to your post.");
      return false;
    }
    setContentError("");
    return true;
  };

  const handleImagePick = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
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
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        const uri = result.assets[0].uri;
        console.log("Selected image URI:", uri);
        const fileInfo = await FileSystem.getInfoAsync(uri);
        if (!fileInfo.exists) {
          throw new Error("Selected image does not exist");
        }
        setImageUri(uri);
        if (contentError && (content.trim() || uri)) {
          setContentError("");
        }
      } else {
        console.log("Image picker cancelled or failed:", result);
      }
    } catch (error) {
      console.error("Image pick error:", error);
      Alert.alert("Error", "Failed to pick image: " + error.message);
    }
  };

  const handleCreatePost = async () => {
    if (!validateForm()) return;

    setIsPosting(true);
    try {
      let images = [];
      if (imageUri) {
        setIsUploadingImage(true);
        try {
          console.log("Uploading image with URI:", imageUri);
          let imageString = imageUri;
          if (imageUri.startsWith("file://")) {
            console.log("Validating file:// URI:", imageUri);
            const fileInfo = await FileSystem.getInfoAsync(imageUri);
            if (!fileInfo.exists) {
              throw new Error("Selected image does not exist");
            }
            imageString = await imageService.getImageString(imageUri);
            console.log("Cloudinary URL received:", imageString);
          } else {
            console.log("Using existing URI (non-file://):", imageUri);
          }
          images = [imageString];
        } catch (error) {
          console.error(
            "Image upload error:",
            error.message,
            error.response?.data
          );
          setContentError(
            "Failed to upload image: " +
              (error.response?.data?.error || error.message)
          );
          setIsUploadingImage(false);
          setIsPosting(false);
          return;
        }
        setIsUploadingImage(false);
      }

      const postData = {
        content: content.trim() || "",
        images,
        privacy: "public",
      };

      console.log("Posting data:", postData);
      await dispatch(createPostAction(postData));
      setContent("");
      setImageUri(null);

      await dispatch(fetchPosts());

      console.log("Navigating to Feed tab");
      navigation.navigate("Main", { screen: "Feed" });
    } catch (error) {
      console.error("Create post error:", error);
      setContentError(error.message || "Failed to create post");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Icon name="close-outline" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Post</Text>
        <TouchableOpacity
          onPress={handleCreatePost}
          style={styles.postButton}
          disabled={
            creating ||
            isPosting ||
            isUploadingImage ||
            (!content.trim() && !imageUri)
          }
        >
          {isPosting || isUploadingImage ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text
              style={[
                styles.postButtonText,
                (creating ||
                  isPosting ||
                  isUploadingImage ||
                  (!content.trim() && !imageUri)) &&
                  styles.postButtonTextDisabled,
              ]}
            >
              Post
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={
          Platform.OS === "ios" ? insets.top : StatusBar.currentHeight || 0
        }
      >
        <ScrollView
          contentContainerStyle={styles.scrollContentContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.cardContainer}>
            <View style={styles.userInfo}>
              <Image
                source={{ uri: currentUserAvatar }}
                style={styles.avatar}
                onError={(e) =>
                  console.error("Avatar load error:", e.nativeEvent.error)
                }
              />
              <Text style={styles.username}>
                {user?.username || "Unknown User"}
              </Text>
            </View>
            <TextInput
              placeholder="What's on your mind?"
              placeholderTextColor={colors.textSecondary}
              value={content}
              onChangeText={(text) => {
                setContent(text);
                if (contentError && (text.trim() || imageUri))
                  setContentError("");
              }}
              multiline
              style={styles.textStyle}
              textAlignVertical="top"
              minHeight={100}
            />
            {imageUri ? (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: imageUri }}
                  style={styles.previewImage}
                  onError={(e) => {
                    console.error("Image load error:", e.nativeEvent.error);
                    setContentError("Failed to load image");
                    setImageUri(null);
                  }}
                />
                {isUploadingImage && (
                  <View style={styles.imageLoading}>
                    <ActivityIndicator size="large" color={colors.white} />
                  </View>
                )}
                <TouchableOpacity
                  onPress={() => setImageUri(null)}
                  style={styles.removeImageButton}
                  disabled={isUploadingImage}
                >
                  <Icon name="close-circle" size={24} color={colors.white} />
                </TouchableOpacity>
              </View>
            ) : null}
            {contentError && (
              <Text style={styles.errorText}>{contentError}</Text>
            )}
            <View style={styles.toolbar}>
              <TouchableOpacity
                onPress={handleImagePick}
                style={styles.toolbarButton}
              >
                <Icon name="images-outline" size={24} color={colors.primary} />
                <Text style={styles.toolbarText}>Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.toolbarButton}>
                <Icon
                  name="pricetag-outline"
                  size={24}
                  color={colors.textSecondary}
                />
                <Text style={styles.toolbarText}>Tag</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.toolbarButton}>
                <Icon
                  name="location-outline"
                  size={24}
                  color={colors.textSecondary}
                />
                <Text style={styles.toolbarText}>Location</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderColor: colors.borderColor,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    zIndex: 1000,
  },
  headerButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: "bold",
    color: colors.text,
  },
  postButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: 20,
    minWidth: 80,
    alignItems: "center",
  },
  postButtonText: {
    fontSize: typography.fontSize.md,
    color: colors.white,
    fontWeight: "600",
  },
  postButtonTextDisabled: {
    color: colors.textSecondary,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    padding: spacing.md,
    paddingBottom: spacing.lg + (Platform.OS === "ios" ? 20 : 0),
  },
  cardContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
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
  },
  textStyle: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    textAlignVertical: "top",
    padding: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: 8,
    marginBottom: spacing.sm,
    lineHeight: typography.fontSize.md * 1.5,
    minHeight: 100,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.sm,
  },
  imageContainer: {
    position: "relative",
    marginBottom: spacing.md,
    borderRadius: 8,
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    aspectRatio: 1,
    resizeMode: "cover",
  },
  imageLoading: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  removeImageButton: {
    position: "absolute",
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 12,
    padding: spacing.xs,
  },
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderColor: colors.borderColor,
  },
  toolbarButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
  },
  toolbarText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
});

export default CreatePostScreen;
