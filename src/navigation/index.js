import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/Ionicons";
import { useSelector } from "react-redux";
import { Text, StatusBar, Platform } from "react-native";
import { colors } from "../theme";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Import screens
import AccountSelectionScreen from "../components/screens/AccountSelectionScreen";
import LoginFormScreen from "../components/screens/LoginFormScreen";
import RegisterScreen from "../components/screens/RegisterScreen";
import FeedScreen from "../components/screens/FeedScreen";
import ProfileScreen from "../components/screens/ProfileScreen";
import SearchScreen from "../components/screens/SearchScreen";
import NotificationsScreen from "../components/screens/NotificationsScreen";
import CreatePostScreen from "../components/screens/CreatePostScreen";
import SettingsScreen from "../components/screens/SettingsScreen";
import ChatsScreen from "../components/screens/ChatsScreen";
import GroupChatScreen from "../components/screens/GroupChatScreen";
import EditProfileScreen from "../components/screens/EditProfileScreen";
import SimpleCameraScreen from "../components/screens/SimpleCameraScreen";
import ChangePasswordScreen from "../components/screens/ChangePasswordScreen";
import OtherProfileScreen from "../components/screens/OtherProfileScreen";
import CommunityScreen from "../components/screens/CommunityScreen";
import CommunityDetailScreen from "../components/screens/CommunityDetailScreen";

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
      <Stack.Screen
        name="AccountSelection"
        component={AccountSelectionScreen}
      />
      <Stack.Screen name="LoginForm" component={LoginFormScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

// Simple icon component for tab navigator
const TabIcon = ({ name, focused, color, size }) => {
  let iconName;
  const iconSize = focused ? size + 2 : size;

  switch (name) {
    case "Feed":
      iconName = focused ? "home" : "home-outline";
      break;
    case "Search":
      iconName = focused ? "search" : "search-outline";
      break;
    case "Post":
      iconName = focused ? "add-circle" : "add-circle-outline";
      break;
    case "Activity":
      iconName = focused ? "heart" : "heart-outline";
      break;
    case "Profile":
      iconName = focused ? "person" : "person-outline";
      break;
    default:
      iconName = "ellipse-outline";
  }

  return <Icon name={iconName} size={iconSize} color={color} />;
};

// Main tab navigator
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.white,
          height: 60,
          paddingTop: 10,
        },
        tabBarIcon: ({ focused, color, size }) => {
          return (
            <TabIcon
              name={route.name}
              focused={focused}
              color={color}
              size={size || 24}
            />
          );
        },
        tabBarLabel: "",
      })}
    >
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Post" component={CreatePostScreen} />
      <Tab.Screen name="Activity" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// Main navigator
const AppNavigator = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

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
            <Stack.Screen name="Camera" component={SimpleCameraScreen} />
            <Stack.Screen
              name="ChangePassword"
              component={ChangePasswordScreen}
            />
            <Stack.Screen name="OtherProfile" component={OtherProfileScreen} />
            <Stack.Screen name="Communities" component={CommunityScreen} />
            <Stack.Screen
              name="CommunityDetail"
              component={CommunityDetailScreen}
            />
            {/* New screen */}
          </Stack.Navigator>
        ) : (
          <AuthNavigator />
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default AppNavigator;
