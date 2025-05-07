// src/components/screens/SettingsScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { useAuth } from '../../hooks/useAuth';

const SettingsScreen = ({ navigation }) => {
  const { logout } = useAuth();
  
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);
  const [locationEnabled, setLocationEnabled] = React.useState(true);
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.log('Logout error:', error);
    }
  };
  
  const SettingItem = ({ title, description, children }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingTextContainer}>
        <Text style={styles.settingTitle}>{title}</Text>
        {description && <Text style={styles.settingDescription}>{description}</Text>}
      </View>
      <View style={styles.settingControl}>
        {children}
      </View>
    </View>
  );
  
  const SettingSection = ({ title, children }) => (
    <View style={styles.settingSection}>
      {title && <Text style={styles.sectionTitle}>{title}</Text>}
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );
  
  return (
    <ScrollView style={styles.container}>
      <SettingSection title="Account">
        <TouchableOpacity style={styles.settingItemButton}>
          <Text style={styles.settingTitle}>Edit Profile</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItemButton}>
          <Text style={styles.settingTitle}>Change Password</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItemButton}>
          <Text style={styles.settingTitle}>Privacy</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
      </SettingSection>
      
      <SettingSection title="Preferences">
        <SettingItem 
          title="Push Notifications" 
          description="Receive notifications for likes, comments and follows"
        >
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </SettingItem>
        
        <SettingItem 
          title="Dark Mode" 
          description="Use dark theme throughout the app"
        >
          <Switch
            value={darkModeEnabled}
            onValueChange={setDarkModeEnabled}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </SettingItem>
        
        <SettingItem 
          title="Location Services" 
          description="Allow app to use your location"
        >
          <Switch
            value={locationEnabled}
            onValueChange={setLocationEnabled}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </SettingItem>
      </SettingSection>
      
      <SettingSection title="Support">
        <TouchableOpacity style={styles.settingItemButton}>
          <Text style={styles.settingTitle}>Help Center</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItemButton}>
          <Text style={styles.settingTitle}>Report a Problem</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItemButton}>
          <Text style={styles.settingTitle}>Terms of Service</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItemButton}>
          <Text style={styles.settingTitle}>Privacy Policy</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
      </SettingSection>
      
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
      
      <Text style={styles.versionText}>Version 1.0.0</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  settingSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: 'bold',
    color: colors.textSecondary,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  sectionContent: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingTextContainer: {
    flex: 1,
    paddingRight: spacing.md,
  },
  settingTitle: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  settingControl: {
    
  },
  settingArrow: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  logoutButton: {
    margin: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.error,
  },
  logoutText: {
    color: colors.error,
    fontSize: typography.fontSize.md,
    fontWeight: '500',
  },
  versionText: {
    textAlign: 'center',
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
});

export default SettingsScreen;