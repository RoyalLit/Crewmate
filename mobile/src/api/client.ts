import axios from 'axios';
import { Platform } from 'react-native';
import mobileEnv from '../config/env';
import { storage } from '../lib/storage';
import logger from '../utils/logger';

// Use env var if available, otherwise fallback to localhost for simulator / 10.0.2.2 for emulator
const API_URL = mobileEnv.apiUrl || (Platform.OS === 'android' 
  ? 'http://10.0.2.2:5001/api/v1' 
  : 'http://localhost:5001/api/v1');

export const apiClient = axios.create({

  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await storage.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      logger.error('Error reading token from storage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to catch 401 errors globally
import { useAuthStore } from '../store/authStore';

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      logger.log('401 Unauthorized caught globally. Logging out...');
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
