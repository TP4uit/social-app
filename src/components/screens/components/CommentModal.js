import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import Video from "react-native-video";
import Icon from "react-native-vector-icons/Ionicons";
import { useSelector, useDispatch } from "react-redux";
import { colors, spacing, typography } from "../../../theme";
import { socketService } from "../../../api/socket";
import { imageService } from "../../../api/imageService";
import { profileService } from "../../../api/profile";
import {
  fetchComments,
  addComment,
} from "../../../redux/actions/commentsActions";
import apiClient from "../../../api/client";

const CommentModal = ({ visible, onClose, postId, postContent }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const comments = useSelector(
    (state) => state.comments.commentsByPost[postId] || []
  );
  const [commentText, setCommentText] = useState("");
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [userProfiles, setUserProfiles] = useState({});
  const socket = useRef(null);
  const flatListRef = useRef(null);

  // Initialize Socket.IO
  useEffect(() => {
    const initSocket = async () => {
      socket.current = await socketService.connect();
      if (!socket.current) {
        Alert.alert("Error", "Failed to connect to server. Please log in.");
        return;
      }
      console.log("Socket connected in CommentModal:", socket.current.id);

      socket.current.on("new_comment", (comment) => {
        console.log("Received new comment:", comment);
        dispatch(addComment(postId, comment));
        if (comment.author && !userProfiles[comment.author]) {
          fetchUserProfile(comment.author);
        }
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      });
    };

    if (visible) {
      initSocket();
    }

    return () => {
      socket.current?.off("new_comment");
    };
  }, [visible, dispatch, postId, userProfiles]);

  // Fetch user profile by ID and cache it
  const fetchUserProfile = async (userId) => {
    if (!userId || userProfiles[userId]) return;
    try {
      const { user: profile } = await profileService.fetchUserProfileById(
        userId
      );
      setUserProfiles((prev) => ({
        ...prev,
        [userId]: profile,
      }));
    } catch (error) {
      console.error(`Failed to fetch profile for user ${userId}:`, error);
      setUserProfiles((prev) => ({
        ...prev,
        [userId]: { username: "Unknown User", avatar: "" },
      }));
    }
  };

  // Join/leave post room and fetch comments
  useEffect(() => {
    if (visible && postId && socket.current) {
      socket.current.emit("join_post", postId);
      console.log(`Joined post room: ${postId}`);

      setIsFetching(true);
      dispatch(fetchComments(postId))
        .then(() => {
          console.log("Fetched comments for post", postId);
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: false });
          }, 100);
        })
        .catch((error) => {
          console.error("Fetch comments error:", error);
          Alert.alert("Error", "Failed to load comments");
        })
        .finally(() => {
          setIsFetching(false);
        });

      return () => {
        socket.current?.emit("leave_post", postId);
        console.log(`Left post room: ${postId}`);
      };
    }
  }, [visible, postId, dispatch]);

  // Fetch user profiles when comments change
  useEffect(() => {
    if (comments.length > 0) {
      const uniqueAuthorIds = [...new Set(comments.map((c) => c.author))];
      uniqueAuthorIds.forEach((authorId) => fetchUserProfile(authorId));
    }
  }, [comments]);

  const handlePickMedia = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Please allow access to your photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedMedia(result.assets[0]);
    }
  };

  const clearMedia = () => {
    setSelectedMedia(null);
  };

  const uploadMedia = async () => {
    if (!selectedMedia) return { imageUrl: null, videoUrl: null };

    if (selectedMedia.uri.startsWith("file://")) {
      try {
        const fileInfo = await FileSystem.getInfoAsync(selectedMedia.uri);
        if (!fileInfo.exists) {
          throw new Error("Selected media does not exist");
        }

        const mediaString = await imageService.getImageString(
          selectedMedia.uri
        );
        const endpoint =
          selectedMedia.type === "image"
            ? "/files/upload-image"
            : "/files/upload-video";

        const response = await apiClient.post(endpoint, { file: mediaString });

        return selectedMedia.type === "image"
          ? { imageUrl: response.data, videoUrl: null }
          : { imageUrl: null, videoUrl: response.data };
      } catch (error) {
        console.error("Upload media error:", error);
        Alert.alert("Error", "Failed to upload media");
        return { imageUrl: null, videoUrl: null };
      }
    }

    return selectedMedia.type === "image"
      ? { imageUrl: selectedMedia.uri, videoUrl: null }
      : { imageUrl: null, videoUrl: selectedMedia.uri };
  };

  const handleSendComment = async () => {
    if (!commentText.trim() && !selectedMedia) {
      Alert.alert("Error", "Please enter a comment or select media.");
      return;
    }

    if (!socket.current?.connected) {
      Alert.alert("Error", "Not connected to server. Please try again.");
      return;
    }

    setIsLoading(true);
    let imageUrl = null;
    let videoUrl = null;

    if (selectedMedia) {
      const uploadResult = await uploadMedia();
      imageUrl = uploadResult.imageUrl;
      videoUrl = uploadResult.videoUrl;
      if (!imageUrl && !videoUrl) {
        setIsLoading(false);
        return;
      }
    }

    socket.current.emit("send_comment", {
      postId,
      content: commentText,
      imageUrl,
      videoUrl,
    });

    setCommentText("");
    clearMedia();
    setIsLoading(false);
  };

  const renderComment = ({ item }) => {
    const profile = userProfiles[item.author] || {
      username: "Loading...",
      avatar: "",
    };

    return (
      <View
        style={[
          styles.commentContainer,
          item.author === user?._id && styles.sentComment,
        ]}
      >
        <View style={styles.commentHeader}>
          {profile.avatar ? (
            <Image
              source={{ uri: profile.avatar }}
              style={styles.commentAvatar}
            />
          ) : (
            <View style={styles.placeholderAvatar}>
              <Icon name="person" size={20} color={colors.textSecondary} />
            </View>
          )}
          <View style={styles.commentHeaderText}>
            <Text style={styles.commentAuthor}>{profile.username}</Text>
            <Text style={styles.commentTimestamp}>
              {new Date(item.createdAt).toLocaleTimeString()}
            </Text>
          </View>
        </View>
        <Text style={styles.commentContent}>{item.content}</Text>
        {item.imageUrl && (
          <Image source={{ uri: item.imageUrl }} style={styles.commentMedia} />
        )}
        {item.videoUrl && (
          <Video
            source={{ uri: item.videoUrl }}
            style={styles.commentMedia}
            controls
            resizeMode="contain"
          />
        )}
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close-outline" size={30} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Comments
          </Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {isFetching ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={comments}
            renderItem={renderComment}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.commentList}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No comments yet.</Text>
            }
          />
        )}

        <View style={styles.inputContainer}>
          {selectedMedia && (
            <View style={styles.mediaPreview}>
              {selectedMedia.type === "image" ? (
                <Image
                  source={{ uri: selectedMedia.uri }}
                  style={styles.previewImage}
                />
              ) : (
                <Video
                  source={{ uri: selectedMedia.uri }}
                  style={styles.previewImage}
                  controls
                  resizeMode="cover"
                />
              )}
              <TouchableOpacity
                onPress={clearMedia}
                style={styles.clearMediaButton}
              >
                <Icon name="close-circle" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.inputRow}>
            <TouchableOpacity
              onPress={handlePickMedia}
              style={styles.mediaButton}
            >
              <Icon name="image-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
            <TextInput
              style={styles.textInput}
              value={commentText}
              onChangeText={setCommentText}
              placeholder="Add a comment..."
              placeholderTextColor={colors.textSecondary}
              multiline
            />
            <TouchableOpacity
              onPress={handleSendComment}
              style={styles.sendButton}
              disabled={isLoading}
            >
              <Icon
                name="send"
                size={24}
                color={isLoading ? colors.textSecondary : colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
    zIndex: 1,
  },
  closeButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontWeight: "bold",
    color: colors.text,
    textAlign: "center",
  },
  headerPlaceholder: {
    width: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  commentList: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl, // Increased padding to account for input container
  },
  commentContainer: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
    maxWidth: "90%",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // For Android shadow
    borderWidth: 1,
    borderColor: colors.border,
  },
  sentComment: {
    backgroundColor: colors.primaryLight,
    alignSelf: "flex-end",
    borderColor: colors.primary,
    borderWidth: 1,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  commentHeaderText: {
    flex: 1,
    flexDirection: "column",
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  placeholderAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  commentAuthor: {
    fontSize: typography.fontSize.md,
    fontWeight: "600",
    color: colors.text,
  },
  commentContent: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  commentMedia: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    marginBottom: spacing.sm,
  },
  commentTimestamp: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    opacity: 0.7,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.lg,
  },
  inputContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5, // For Android shadow
  },
  mediaPreview: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: spacing.sm,
  },
  clearMediaButton: {
    padding: spacing.xs,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 25,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mediaButton: {
    padding: spacing.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: "transparent",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.sm,
    color: colors.text,
    maxHeight: 120,
  },
  sendButton: {
    padding: spacing.sm,
  },
});

export default CommentModal;
