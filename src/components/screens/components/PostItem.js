import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '../../../theme';
import Icon from 'react-native-vector-icons/Ionicons'; // Sử dụng Ionicons, bạn có thể chọn bộ khác

const PostItem = ({ post }) => {
  const { author, content, createdAt, likes, comments, image } = post;
  // Giả lập số liệu cho shares và saves, vì dummyData chưa có
  const shares = post.shares || Math.floor(Math.random() * 50);
  const saves = post.saves || Math.floor(Math.random() * 100);

  const formatTimestamp = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour} ${diffHour > 1 ? 'hours' : 'hour'} ago`;
    if (diffDay < 7) return `${diffDay} ${diffDay > 1 ? 'days' : 'day'} ago`;
    return `${Math.floor(diffDay / 7)}w ago`;
  };

  // Lấy phần đầu của content cho dòng tóm tắt
  const getContentSummary = (text, maxLength = 50) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, text.lastIndexOf(' ', maxLength)) + '...';
  };

  return (
    <View style={styles.container}>
      {/* Thông tin người đăng và nội dung */}
      <View style={styles.contentHeader}>
        <Text style={styles.authorName}>{author.name || 'Username'}</Text>
        <Text style={styles.captionText}>{content}</Text>
        <Text style={styles.timestamp}>{formatTimestamp(createdAt)}</Text>
      </View>

      {/* Hình ảnh bài đăng */}
      {image && (
        <Image source={{ uri: image }} style={styles.postImage} resizeMode="cover" />
      )}

      {/* Thanh hành động (Likes, Comments, Shares, Saves) */}
      <View style={styles.actionBar}>
        <View style={styles.actionGroup}>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="heart-outline" size={26} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.actionCount}>{likes}</Text>
        </View>
        <View style={styles.actionGroup}>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="chatbubble-outline" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.actionCount}>{comments.length}</Text>
        </View>
        <View style={styles.actionGroup}>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="paper-plane-outline" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.actionCount}>{shares}</Text>
        </View>
        <View style={[styles.actionGroup, styles.saveAction]}>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="bookmark-outline" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.actionCount}>{saves}</Text>
        </View>
      </View>

      {/* Tóm tắt nội dung và link xem bình luận */}
      <View style={styles.engagementSummary}>
        <Text style={styles.summaryText} numberOfLines={2}>
          <Text style={styles.summaryAuthorName}>{author.name} </Text>
          {/* Sử dụng lại content hoặc một phần content tóm tắt */}
          {getContentSummary(content, 70)} 
        </Text>
        {comments.length > 0 && (
          <TouchableOpacity style={styles.viewCommentsButton}>
            <Text style={styles.viewCommentsText}>
              View all {comments.length} comments
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    marginBottom: spacing.sm, // Khoảng cách giữa các bài đăng
    // Có thể thêm border hoặc shadow nhẹ nếu muốn tách biệt card rõ hơn
    // borderWidth: 1,
    // borderColor: colors.border,
    // borderRadius: 8, // Nếu muốn bo góc card
  },
  contentHeader: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  authorName: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  captionText: {
    fontSize: typography.fontSize.md - 1, // Cỡ chữ cho caption
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
    width: '100%',
    // height: undefined, // Để tự tính theo aspectRatio
    aspectRatio: 1, // Giả sử ảnh vuông, có thể thay đổi
    // marginBottom: spacing.sm,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Phân bố đều các cụm action
    alignItems: 'center',
    paddingHorizontal: spacing.sm, // Giảm padding ngang một chút
    paddingVertical: spacing.md,
    borderTopWidth: 1, // Đường kẻ mỏng phía trên action bar
    borderBottomWidth: 1, // Đường kẻ mỏng phía dưới action bar
    borderColor: colors.border,
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: spacing.xs, // Vùng nhấn cho icon
  },
  actionCount: {
    fontSize: typography.fontSize.sm -1,
    color: colors.textSecondary,
    marginLeft: spacing.xs / 2, // Khoảng cách giữa icon và số
  },
  saveAction: {
    // Nếu cần style riêng cho nút save (ví dụ: đẩy sang phải)
    // marginLeft: 'auto', // Đẩy cụm này sang phải nếu các cụm khác không fill hết
  },
  engagementSummary: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  summaryText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    lineHeight: typography.fontSize.sm * 1.4,
    marginBottom: spacing.xs,
  },
  summaryAuthorName: {
    fontWeight: 'bold',
  },
  viewCommentsButton: {
    // Style cho nút xem comment
  },
  viewCommentsText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
});

export default PostItem;