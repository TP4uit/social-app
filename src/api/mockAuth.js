// src/api/mockAuth.js
import { simulateLogin, simulateLogout, getCurrentUser } from '../utils/dummyData';

export const mockAuthService = {
  login: async (email, password) => {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const result = await simulateLogin(email, password);
      return { data: result };
    } catch (error) {
      throw { 
        response: { 
          data: { 
            message: error.message 
          } 
        } 
      };
    }
  },
  
  register: async (userData) => {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For testing purposes, just simulate login with the provided email and a default password
      // In a real implementation, you would create a new user here
      const result = await simulateLogin(userData.email, 'password123');
      return { data: result };
    } catch (error) {
      throw { 
        response: { 
          data: { 
            message: error.message || 'Registration failed' 
          } 
        } 
      };
    }
  },
  
  logout: async () => {
    try {
      await simulateLogout();
      return { data: { success: true } };
    } catch (error) {
      throw { 
        response: { 
          data: { 
            message: 'Logout failed' 
          } 
        } 
      };
    }
  },
  
  getProfile: async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('Not authenticated');
      }
      return { data: user };
    } catch (error) {
      throw { 
        response: { 
          data: { 
            message: error.message || 'Failed to get profile' 
          } 
        } 
      };
    }
  },
};