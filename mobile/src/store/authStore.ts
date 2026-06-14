import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  name: string;
  email: string;
  college: string;
  homeCity?: string;
  profilePhotoUrl?: string;
  isEmailVerified: boolean;
  status: string;
  createdAt: Date;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  // Actions
  login: (user: User) => void;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Set to false initially, we'll force users to log in
  isAuthenticated: false,
  user: null,

  login: (user) => set({ isAuthenticated: true, user }),
  logout: () => {
    AsyncStorage.removeItem('crewmute_token').catch((e) => {
      console.error('Failed to clear auth token', e);
    });
    set({ isAuthenticated: false, user: null });
  },
  updateProfile: (data) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null,
    })),
}));
