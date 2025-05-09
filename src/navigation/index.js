// src/navigation/index.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
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
const TabIcon = ({ name, focused }) => {
  let icon = '';
  
  switch (name) {
    case 'Feed':
      icon = focused ? '🏠' : '🏡';
      break;
    case 'Search':
      icon = focused ? '🔍' : '🔎';
      break;
    case 'Post':
      icon = focused ? '➕' : '✚';
      break;
    case 'Activity':
      icon = focused ? '❤️' : '♡';
      break;
    case 'Profile':
      icon = focused ? '👤' : '👤';
      break;
    default:
      icon = '⚪';
  }
  
  return (
    <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.5 }}>{icon}</Text>
  );
};

// Main tab navigator
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.white,
          height: 50,
          paddingTop: 5,
        },
      }}
    >
      <Tab.Screen 
        name="Feed" 
        component={FeedScreen} 
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => <TabIcon name="Feed" focused={focused} />
        }}
      />
      <Tab.Screen 
        name="Search" 
        component={SearchScreen} 
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => <TabIcon name="Search" focused={focused} />
        }}
      />
      <Tab.Screen 
        name="Post" 
        component={CreatePostScreen} 
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => <TabIcon name="Post" focused={focused} />
        }}
      />
      <Tab.Screen 
        name="Activity" 
        component={NotificationsScreen} 
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => <TabIcon name="Activity" focused={focused} />
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => <TabIcon name="Profile" focused={focused} />
        }}
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
          </Stack.Navigator>
        ) : (
          <AuthNavigator />
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default AppNavigator;