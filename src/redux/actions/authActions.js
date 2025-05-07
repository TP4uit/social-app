import { 
    LOGIN_REQUEST, 
    LOGIN_SUCCESS, 
    LOGIN_FAILURE,
    LOGOUT
  } from './types';
  import { authService } from '../../api/auth';
  import AsyncStorage from '@react-native-async-storage/async-storage';
  
  export const login = (email, password) => async (dispatch) => {
    dispatch({ type: LOGIN_REQUEST });
    
    try {
      const response = await authService.login(email, password);
      const { token, user } = response.data;
      
      // Store token in AsyncStorage
      await AsyncStorage.setItem('auth_token', token);
      
      dispatch({ 
        type: LOGIN_SUCCESS, 
        payload: { user } 
      });
      
      return Promise.resolve(user);
    } catch (error) {
      dispatch({ 
        type: LOGIN_FAILURE, 
        payload: { error: error.response?.data?.message || 'Login failed' } 
      });
      
      return Promise.reject(error);
    }
  };
  
  export const logout = () => async (dispatch) => {
    try {
      await authService.logout();
    } catch (error) {
      console.log('Logout error:', error);
    }
    
    // Always clear storage and dispatch logout action
    await AsyncStorage.removeItem('auth_token');
    dispatch({ type: LOGOUT });
  };