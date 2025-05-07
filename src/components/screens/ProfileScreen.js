// src/components/screens/ProfileScreen.js
import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import Button from '../common/Button';
import { useAuth } from '../../hooks/useAuth';

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  
  // Placeholder data if user is not available yet
  const userData = user || {
    name: 'John Doe',
    email: 'john.doe@example.com',
    bio: 'Software developer and React Native enthusiast',
    posts: 42,
    followers: 568,
    following: 235
  };
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.log('Logout error:', error);
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          <View style={styles.profileImage}>
            <Text style={styles.profileInitial}>
              {userData.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>
        
        <Text style={styles.name}>{userData.name}</Text>
        <Text style={styles.email}>{userData.email}</Text>
        <Text style={styles.bio}>{userData.bio}</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userData.posts}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userData.followers}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userData.following}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>
        
        <View style={styles.actionContainer}>
          <Button 
            title="Edit Profile" 
            type="secondary" 
            style={styles.editButton}
          />
        </View>
      </View>
      
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Your Posts</Text>
        {/* Posts content would go here */}
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No posts yet</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  profileImageContainer: {
    marginBottom: spacing.md,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 40,
    color: colors.white,
    fontWeight: 'bold',
  },
  name: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  email: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  bio: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  actionContainer: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  editButton: {
    width: 150,
  },
  sectionContainer: {
    backgroundColor: colors.white,
    marginTop: spacing.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  logoutButton: {
    margin: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error,
  },
  logoutText: {
    color: colors.error,
    fontSize: typography.fontSize.md,
    fontWeight: '500',
  },
});

export default ProfileScreen;