// src/components/screens/AccountSelectionScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Platform, // Đã thêm ở bước trước
} from 'react-native';
import { colors, spacing, typography } from '../../theme';

const PLACEHOLDER_AVATAR = 'https://i.pravatar.cc/150?u=sophia.wright';

const AccountSelectionScreen = ({ navigation }) => {
  const user = {
    avatar: PLACEHOLDER_AVATAR,
    username: 'sophia.wright',
    accountType: 'Regular account',
  };

  const handleLogin = () => {
    // Sửa ở đây:
    navigation.navigate('LoginForm');
  };

  const handleSwitchAccounts = () => {
    // Sửa ở đây:
    navigation.navigate('LoginForm');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.contentContainer}>
        <Text style={styles.appName}>Drama Social</Text>

        <Image source={{ uri: user.avatar }} style={styles.profileImage} />
        <Text style={styles.username}>{user.username}</Text>
        <Text style={styles.accountType}>{user.accountType}</Text>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Log In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchAccountButton}
          onPress={handleSwitchAccounts}>
          <Text style={styles.switchAccountButtonText}>Switch Accounts</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.noAccountText}>Don't have an account? </Text>
        {/* Đảm bảo tên màn hình 'Register' là chính xác */}
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.signupText}>Sign up.</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Styles giữ nguyên như bạn đã cung cấp ở lần trước
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  appName: {
    fontSize: typography.fontSize.xxl + 8,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: spacing.xl + 10,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: spacing.md,
  },
  username: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: spacing.xs,
  },
  accountType: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xl + 10,
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  loginButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: 'bold',
  },
  switchAccountButton: {
    backgroundColor: '#EFEFF4',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  switchAccountButtonText: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    width: '100%',
    position: 'absolute',
    bottom: 0,
    backgroundColor: colors.white,
  },
  noAccountText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  signupText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: 'bold',
  },
});

export default AccountSelectionScreen;