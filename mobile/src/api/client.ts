import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import mobileEnv from '../config/env';

// Use env var if available, otherwise fallback to localhost for simulator / 10.0.2.2 for emulator
const API_URL = mobileEnv.apiUrl || (Platform.OS === 'android' 
  ? 'http://10.0.2.2:5000/api/v1' 
  : 'http://localhost:5000/api/v1');

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
      const token = await AsyncStorage.getItem('crewmute_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error reading token from storage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
