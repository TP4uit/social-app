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
  }, [visible, dispatch, postId]);

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

  const renderComment = ({ item }) => (
    <View
      style={[
        styles.commentContainer,
        item.author._id === user?._id && styles.sentComment,
      ]}
    >
      <Text style={styles.commentAuthor}>
        {item.author.username || "Unknown User"}
      </Text>
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
      <Text style={styles.commentTimestamp}>
        {new Date(item.createdAt).toLocaleTimeString()}
      </Text>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close-outline" size={30} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Comments for Post
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
    paddingBottom: spacing.xl,
  },
  commentContainer: {
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.sm,
    maxWidth: "80%",
  },
  sentComment: {
    backgroundColor: colors.primaryLight,
    alignSelf: "flex-end",
  },
  commentAuthor: {
    fontSize: typography.fontSize.sm,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  commentContent: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  commentMedia: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: spacing.xs,
  },
  commentTimestamp: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    textAlign: "right",
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.lg,
  },
  inputContainer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderColor: colors.background,
    backgroundColor: colors.white,
  },
  mediaPreview: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
    backgroundColor: colors.background,
    padding: spacing.xs,
    borderRadius: 8,
  },
  previewImage: {
    width: 90,
    height: 60,
    borderRadius: 8,
    marginRight: spacing.sm,
  },
  clearMediaButton: {
    padding: spacing.xs,
  },
  inputView: {
    flexDirection: "row",
    alignItems: "center",
  },
  mediaButton: {
    padding: spacing.sm,
  },
  textStyle: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.sm,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: 100,
  },
  sendButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
  },
});

export default CommentModal;
