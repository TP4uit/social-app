import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Icon from "react-native-vector-icons/Ionicons";
import UserAvatarName from "./UserAvatarName";
import CommentModal from "./CommentModal";
import { colors, spacing, typography } from "../../../theme";
import { likePost } from "../../../redux/actions/postsActions";
import {
  fetchComments,
  addComment,
} from "../../../redux/actions/commentsActions";
import { socketService } from "../../../api/socket";

const PostItem = ({ post }) => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user.user); // Sửa user thành currentUser
  const comments = useSelector(
    (state) => state.comments.commentsByPost[post._id] || []
  );
  console.log("current user from PostItem:", currentUser);

  const { author, content, createdAt, likes, _id, images } = post;
  const shares = post.shares || 0;
  const saves = post.savedBy?.length || 0;

  const isLiked =
    Array.isArray(likes) && currentUser?._id && likes.includes(currentUser._id);
  const [optimisticLiked, setOptimisticLiked] = useState(isLiked);
  const [optimisticLikeCount, setOptimisticLikeCount] = useState(
    likes?.length || 0
  );
  const [loading, setLoading] = useState(false);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [isFetchingComments, setIsFetchingComments] = useState(false);

  // Initialize Socket.IO and fetch comments
  useEffect(() => {
    let socket = null;
    const initSocket = async () => {
      if (!_id) {
        console.error("Invalid post ID:", _id);
        return;
      }
      setIsFetchingComments(true);
      try {
        socket = await socketService.connect();
        if (!socket) {
          console.warn(
            "Socket connection not available, comments may not update in real-time"
          );
          // Không dùng alert để tránh lặp lại
        } else {
          console.log("Socket connected in PostItem:", socket.id);
          socket.emit("join_post", _id);
          console.log(`Joined post room: ${_id}`);

          socket.on("new_comment", (comment) => {
            console.log("Received new comment:", comment);
            dispatch(addComment(_id, comment));
          });
        }

        // Fetch comments
        await dispatch(fetchComments(_id));
        console.log("Fetched comments for post", _id);
      } catch (error) {
        console.error("Init error:", error.message, error.response?.data);
      } finally {
        setIsFetchingComments(false);
      }
    };

    if (_id) {
      initSocket();
    }

    return () => {
      if (socket) {
        socket.emit("leave_post", _id);
        socket.off("new_comment");
        console.log(`Left post room: ${_id}`);
      }
    };
  }, [_id, dispatch]);

  const formatTimestamp = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24)
      return `${diffHour} ${diffHour > 1 ? "hours" : "hour"} ago`;
    if (diffDay < 7) return `${diffDay} ${diffDay > 1 ? "days" : "day"} ago`;
    return `${Math.floor(diffDay / 7)}w ago`;
  };

  const handleLike = async () => {
    if (!currentUser?._id) {
      console.log("No user ID, prompting login");
      alert("Please log in to like posts");
      return;
    }

    if (loading) return;

    const newLiked = !optimisticLiked;
    const newLikeCount = newLiked
      ? optimisticLikeCount + 1
      : optimisticLikeCount - 1;
    setOptimisticLiked(newLiked);
    setOptimisticLikeCount(newLikeCount);
    setLoading(true);

    try {
      console.log("Dispatching likePost:", {
        postId: post._id,
        userId: currentUser._id,
        newLiked,
      });
      await dispatch(likePost(post._id, currentUser._id, newLiked));
      console.log("Like successful");
    } catch (error) {
      console.error("Like error:", error.message, error.response?.data);
      setOptimisticLiked(isLiked);
      setOptimisticLikeCount(likes?.length || 0);
      alert(error.message || "Failed to like post");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCommentModal = () => {
    if (!currentUser?._id) {
      console.log("No user ID, prompting login for comments");
      alert("Please log in to view or add comments");
      return;
    }
    setCommentModalVisible(true);
  };

  const handleCloseModal = () => {
    setCommentModalVisible(false);
    dispatch(fetchComments(_id)); // Sync comments
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentHeader}>
        <View style={styles.headerLeft}>
          <UserAvatarName userId={author?._id} />
        </View>
        <TouchableOpacity style={styles.closeButton}>
          <Icon
            name="ellipsis-horizontal"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
      <Text style={styles.captionText}>{content}</Text>
      <Text style={styles.timestamp}>{formatTimestamp(createdAt)}</Text>
      {Array.isArray(images) && images.length > 0 && images[0] !== "string" && (
        <Image
          source={{ uri: images[0] }}
          style={styles.postImage}
          resizeMode="cover"
        />
      )}
      <View style={styles.actionBar}>
        <View style={styles.actionGroup}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleLike}
            disabled={loading}
          >
            <Icon
              name={optimisticLiked ? "heart" : "heart-outline"}
              size={26}
              color={optimisticLiked ? colors.error : colors.textSecondary}
            />
          </TouchableOpacity>
          <Text style={styles.actionCount}>{optimisticLikeCount}</Text>
        </View>
        <View style={styles.actionGroup}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleOpenCommentModal}
          >
            <Icon
              name="chatbubble-outline"
              size={24}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
          <Text style={styles.actionCount}>{comments.length}</Text>
        </View>
        <View style={styles.actionGroup}>
          <TouchableOpacity style={styles.actionButton}>
            <Icon
              name="paper-plane-outline"
              size={24}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
          <Text style={styles.actionCount}>{shares}</Text>
        </View>
        <View style={[styles.actionGroup, styles.saveAction]}>
          <TouchableOpacity style={styles.actionButton}>
            <Icon
              name="bookmark-outline"
              size={24}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
          <Text style={styles.actionCount}>{saves}</Text>
        </View>
      </View>
      <View style={styles.engagementSummary}>
        {comments.length > 0 && (
          <View style={styles.commentSection}>
            <Text style={styles.commentPreview} numberOfLines={1}>
              <Text style={styles.commentAuthor}>
                {comments[0].author?.username || "alibaba"}{" "}
              </Text>
              {comments[0].content}
            </Text>
            <TouchableOpacity
              style={styles.viewCommentsButton}
              onPress={handleOpenCommentModal}
            >
              <Text style={styles.viewCommentsText}>
                View all {comments.length} comments
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <CommentModal
        visible={commentModalVisible}
        onClose={handleCloseModal}
        postId={post._id}
        postContent={content}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    marginBottom: spacing.sm,
  },
  contentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  closeButton: {
    padding: spacing.xs,
  },
  captionText: {
    fontSize: typography.fontSize.md - 1,
    color: colors.text,
    lineHeight: typography.fontSize.md * 1.4,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  timestamp: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  postImage: {
    width: "100%",
    aspectRatio: 1,
  },
  actionBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  actionGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: spacing.xs,
  },
  actionCount: {
    fontSize: typography.fontSize.sm - 1,
    color: colors.textSecondary,
    marginLeft: spacing.xs / 2,
  },
  saveAction: {},
  engagementSummary: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  commentSection: {
    marginTop: spacing.xs,
  },
  commentPreview: {
    fontSize: typography.fontSize.sm - 1,
    color: colors.text,
    lineHeight: typography.fontSize.sm * 1.3,
    marginBottom: spacing.xs,
  },
  commentAuthor: {
    fontWeight: "bold",
    color: colors.text,
  },
  viewCommentsButton: {
    paddingVertical: spacing.xs,
  },
  viewCommentsText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontWeight: "500",
  },
});

export default PostItem;
