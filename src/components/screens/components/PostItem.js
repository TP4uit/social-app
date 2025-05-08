// src/components/screens/components/PostItem.js - REPLACE ENTIRE FILE
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { colors } from '../../../theme';

const PostItem = ({ post }) => {
  // For demo purposes, assuming post has these properties
  const { author, content, createdAt, likes, comments, image } = post;

  const formatTimestamp = (dateString) => {
    // Simple relative time formatting
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin}m`;
    if (diffHour < 24) return `${diffHour}h`;
    if (diffDay < 7) return `${diffDay}d`;
    return `${Math.floor(diffDay / 7)}w`;
  };

  return (
    <View style={styles.container}>
      {/* Post Header */}
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
          <Text style={styles.username}>{author.name || 'username'}</Text>
        </View>
        <TouchableOpacity>
          <Text style={styles.moreIcon}>•••</Text>
        </TouchableOpacity>
      </View>

      {/* Post Image */}
      {image && (
        <Image source={{ uri: image }} style={styles.postImage} resizeMode="cover" />
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        <View style={styles.leftActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>♥</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>💬</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>▶</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity>
          <Text style={styles.actionIcon}>🔖</Text>
        </TouchableOpacity>
      </View>

      {/* Like Count */}
      <Text style={styles.likes}>{likes} likes</Text>

      {/* Caption */}
      <View style={styles.captionContainer}>
        <Text style={styles.caption}>
          <Text style={styles.username}>{author.name} </Text>
          {content}
        </Text>
      </View>

      {/* Comments */}
      {comments.length > 0 && (
        <TouchableOpacity style={styles.viewComments}>
          <Text style={styles.viewCommentsText}>
            View all {comments.length} comments
          </Text>
        </TouchableOpacity>
      )}

      {/* Timestamp */}
      <Text style={styles.timestamp}>{formatTimestamp(createdAt)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    height: 50,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  username: {
    fontWeight: 'bold',
    fontSize: 13,
  },
  moreIcon: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  postImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginRight: 16,
  },
  actionIcon: {
    fontSize: 24,
  },
  likes: {
    fontWeight: 'bold',
    fontSize: 13,
    paddingHorizontal: 10,
    marginBottom: 5,
  },
  captionContainer: {
    paddingHorizontal: 10,
    marginBottom: 5,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
  },
  viewComments: {
    paddingHorizontal: 10,
    marginBottom: 5,
  },
  viewCommentsText: {
    color: '#8e8e8e',
    fontSize: 13,
  },
  timestamp: {
    color: '#8e8e8e',
    fontSize: 11,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
});

export default PostItem;