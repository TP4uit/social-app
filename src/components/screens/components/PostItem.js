import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '../../../theme';

const PostItem = ({ post }) => {
  // For demo purposes, assuming post has these properties
  const { author, content, createdAt, likes, comments, image } = post;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          {author.avatar ? (
            <Image source={{ uri: author.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {author.name ? author.name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
          )}
          <View>
            <Text style={styles.userName}>{author.name}</Text>
            <Text style={styles.timestamp}>{formatDate(createdAt)}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Text>•••</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.content}>{content}</Text>

      {image && (
        <Image source={{ uri: image }} style={styles.postImage} resizeMode="cover" />
      )}

      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={styles.statCount}>{likes} likes</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statCount}>{comments.length} comments</Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>Like</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>Comment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 8,
    marginBottom: spacing.md,
    padding: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.sm,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  avatarText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: typography.fontSize.md,
    fontWeight: 'bold',
    color: colors.text,
  },
  timestamp: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  moreButton: {
    padding: spacing.xs,
  },
  content: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statCount: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    paddingVertical: spacing.xs,
    flex: 1,
    alignItems: 'center',
  },
  actionText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});

export default PostItem;