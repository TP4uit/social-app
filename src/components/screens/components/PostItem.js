import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { colors, spacing, typography } from "../../../theme";
import Icon from "react-native-vector-icons/Ionicons";
import { likePost } from "../../../redux/actions/postsActions";

const PostItem = ({ post }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth || {});
  const { author, content, createdAt, likes, comments, images } = post;
  const shares = post.shares || 0; // Remove random fallback
  const saves = post.savedBy?.length || 0; // Remove random fallback

  // Check if the current user has liked the post
  const isLiked = Array.isArray(likes) && user?._id && likes.includes(user._id);
  const [optimisticLiked, setOptimisticLiked] = useState(isLiked);
  const [optimisticLikeCount, setOptimisticLikeCount] = useState(
    likes?.length || 0
  );
  const [loading, setLoading] = useState(false);

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

  const getContentSummary = (text, maxLength = 50) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, text.lastIndexOf(" ", maxLength)) + "...";
  };

  const handleLike = async () => {
    if (!user?._id) {
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
      await dispatch(likePost(post._id, user._id, newLiked));
    } catch (error) {
      setOptimisticLiked(isLiked);
      setOptimisticLikeCount(likes?.length || 0);
      alert(error.message || "Failed to like post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Thông tin người đăng và nội dung */}
      <View style={styles.contentHeader}>
        <Text style={styles.authorName}>
          {author.username || "Unknown User"}
        </Text>
        <Text style={styles.captionText}>{content}</Text>
        <Text style={styles.timestamp}>{formatTimestamp(createdAt)}</Text>
      </View>

      {/* Hình ảnh bài đăng */}
      {Array.isArray(images) && images.length > 0 && images[0] !== "string" && (
        <Image
          source={{ uri: images[0] }}
          style={styles.postImage}
          resizeMode="cover"
        />
      )}

      {/* Thanh hành động (Likes, Comments, Shares, Saves) */}
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
          <TouchableOpacity style={styles.actionButton}>
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

      {/* Tóm tắt nội dung và bình luận */}
      <View style={styles.engagementSummary}>
        {comments.length > 0 && (
          <View style={styles.commentSection}>
            {/* Preview first comment */}
            <Text style={styles.commentPreview} numberOfLines={1}>
              <Text style={styles.commentAuthor}>
                {comments[0].author?.username || "Unknown User"}{" "}
              </Text>
              {comments[0].content}
            </Text>
            {/* View all comments button */}
            <TouchableOpacity style={styles.viewCommentsButton}>
              <Text style={styles.viewCommentsText}>
                View all {comments.length} comments
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    marginBottom: spacing.sm,
  },
  contentHeader: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  authorName: {
    fontSize: typography.fontSize.lg,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  captionText: {
    fontSize: typography.fontSize.md - 1,
    color: colors.text,
    lineHeight: typography.fontSize.md * 1.4,
    marginBottom: spacing.xs,
  },
  timestamp: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
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
  summaryText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    lineHeight: typography.fontSize.sm * 1.4,
    marginBottom: spacing.sm,
  },
  summaryAuthorName: {
    fontWeight: "bold",
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
