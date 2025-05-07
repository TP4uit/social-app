// src/components/screens/NotificationsScreen.js
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '../../theme';

// Dummy data for notifications
const dummyNotifications = [
  {
    id: '1',
    type: 'like',
    user: 'Jane Smith',
    content: 'liked your post',
    time: '2 hours ago',
    read: false
  },
  {
    id: '2',
    type: 'comment',
    user: 'John Doe',
    content: 'commented on your post: "Great photo!"',
    time: '5 hours ago',
    read: false
  },
  {
    id: '3',
    type: 'follow',
    user: 'Alex Johnson',
    content: 'started following you',
    time: '1 day ago',
    read: true
  },
  {
    id: '4',
    type: 'mention',
    user: 'Sarah Williams',
    content: 'mentioned you in a comment',
    time: '2 days ago',
    read: true
  }
];

const NotificationItem = ({ item }) => {
  return (
    <TouchableOpacity 
      style={[
        styles.notificationItem,
        !item.read && styles.unreadNotification
      ]}
    >
      <View style={styles.notificationContent}>
        <Text style={styles.notificationText}>
          <Text style={styles.userName}>{item.user}</Text> {item.content}
        </Text>
        <Text style={styles.timeText}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );
};

const NotificationsScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <TouchableOpacity>
          <Text style={styles.markAllRead}>Mark all as read</Text>
        </TouchableOpacity>
      </View>
      
      {dummyNotifications.length > 0 ? (
        <FlatList
          data={dummyNotifications}
          renderItem={({ item }) => <NotificationItem item={item} />}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No notifications yet</Text>
          <Text style={styles.emptySubText}>
            When you get notifications, they'll appear here
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
  },
  markAllRead: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
  },
  listContainer: {
    padding: spacing.sm,
  },
  notificationItem: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadNotification: {
    backgroundColor: '#EDF2FD',
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  userName: {
    fontWeight: 'bold',
  },
  timeText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptySubText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default NotificationsScreen;