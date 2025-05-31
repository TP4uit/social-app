// src/navigation/index.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { Text, StatusBar, Platform, Image } from 'react-native';
import { colors } from '../theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import screens
import AccountSelectionScreen from '../components/screens/AccountSelectionScreen';
import LoginFormScreen from '../components/screens/LoginFormScreen';
import RegisterScreen from '../components/screens/RegisterScreen';
import FeedScreen from '../components/screens/FeedScreen';
import ProfileScreen from '../components/screens/ProfileScreen';
import SearchScreen from '../components/screens/SearchScreen';
import NotificationsScreen from '../components/screens/NotificationsScreen';
import CreatePostScreen from '../components/screens/CreatePostScreen';
import SettingsScreen from '../components/screens/SettingsScreen';
import ChatsScreen from '../components/screens/ChatsScreen';
import GroupChatScreen from '../components/screens/GroupChatScreen';
import EditProfileScreen from '../components/screens/EditProfileScreen';
import CameraScreen from '../components/screens/CameraScreen';

// Create navigators
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Auth navigator
const AuthNavigator = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
      }}
    >
      <Stack.Screen name="AccountSelection" component={AccountSelectionScreen} />
      <Stack.Screen name="LoginForm" component={LoginFormScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

// Simple icon component for tab navigator
const TabIcon = ({ name, focused, color, size }) => { // Thêm props color và size từ TabNavigator
  let iconName;
  const iconSize = focused ? size + 2 : size; // Icon có thể to hơn một chút khi active

  switch (name) {
    case 'Feed':
      iconName = focused ? 'home' : 'home-outline';
      break;
    case 'Search':
      iconName = focused ? 'search' : 'search-outline';
      break;
    case 'Post': // CreatePostScreen
      iconName = focused ? 'add-circle' : 'add-circle-outline';
      break;
    case 'Activity': // NotificationsScreen
      iconName = focused ? 'heart' : 'heart-outline';
      break;
    case 'Profile': // ProfileScreen
      iconName = focused ? 'person' : 'person-outline';
      break;
    default:
      iconName = 'ellipse-outline'; // Icon mặc định nếu có lỗi
  }

  return <Icon name={iconName} size={iconSize} color={color} />;
};

// Main tab navigator
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({ // Truyền route vào screenOptions
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.white,
          height: 60,
          paddingTop: 10, // Có thể điều chỉnh nếu cần
        },
        // Cập nhật tabBarIcon để truyền props chuẩn
        tabBarIcon: ({ focused, color, size }) => {
          return <TabIcon name={route.name} focused={focused} color={color} size={size || 24} />;
        },
        tabBarLabel: '', // Giữ nguyên không hiển thị label
      })}
    >
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        // options đã được xử lý ở screenOptions chung
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
      />
      <Tab.Screen
        name="Post" // Đây là routeName cho CreatePostScreen
        component={CreatePostScreen}
      />
      <Tab.Screen
        name="Activity" // Đây là routeName cho NotificationsScreen
        component={NotificationsScreen}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
      />
    </Tab.Navigator>
  );
};

// Main navigator
const AppNavigator = () => {
  const { isAuthenticated } = useSelector(state => state.auth);

  // Ensure the status bar is properly set
  return (
    <SafeAreaProvider>
      <StatusBar
        backgroundColor="white"
        barStyle="dark-content"
        translucent={false}
      />
      <NavigationContainer>
        {isAuthenticated ? (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Chats" component={ChatsScreen} />
            <Stack.Screen name="GroupChat" component={GroupChatScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="Camera" component={CameraScreen} />
          </Stack.Navigator>
        ) : (
          <AuthNavigator />
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default AppNavigator;