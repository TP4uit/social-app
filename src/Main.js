// src/Main.js - REPLACE ENTIRE FILE
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import store from './redux/store';
import AppNavigator from './navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from './api/auth';
import { LOGIN_SUCCESS } from './redux/actions/types';

export default function Main() {
  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
          // Fetch user profile
          const response = await authService.getProfile();
          store.dispatch({
            type: LOGIN_SUCCESS,
            payload: { user: response.data }
          });
        }
      } catch (error) {
        console.log('Auth check error:', error);
        // Clear token if error
        await AsyncStorage.removeItem('auth_token');
      }
    };

    checkAuth();
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppNavigator />
      </SafeAreaProvider>
    </Provider>
  );
}