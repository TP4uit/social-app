import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { colors } from '../theme';

// Import screens (to be created)
import LoginScreen from '../components/screens/LoginScreen';
import RegisterScreen from '../components/screens/RegisterScreen';
import FeedScreen from '../components/screens/FeedScreen';
import ProfileScreen from '../components/screens/ProfileScreen';
import CreatePostScreen from '../components/screens/CreatePostScreen';
import NotificationsScreen from '../components/screens/NotificationsScreen';
import SettingsScreen from '../components/screens/SettingsScreen';

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
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

// Main tab navigator
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.white,
        },
      }}
    >
      <Tab.Screen 
        name="Feed" 
        component={FeedScreen} 
        options={{
          tabBarLabel: 'Feed',
          // Add your icon here
        }}
      />
      <Tab.Screen 
        name="CreatePost" 
        component={CreatePostScreen} 
        options={{
          tabBarLabel: 'Post',
          // Add your icon here
        }}
      />
      <Tab.Screen 
        name="Notifications" 
        component={NotificationsScreen} 
        options={{
          tabBarLabel: 'Notifications',
          // Add your icon here
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarLabel: 'Profile',
          // Add your icon here
        }}
      />
    </Tab.Navigator>
  );
};

// Main navigator
const AppNavigator = () => {
  const { isAuthenticated } = useSelector(state => state.auth);

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;