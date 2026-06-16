import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../store/authStore';

interface Session {
  accessToken: string | null;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface AuthContextType {
  session: Session | null;
}

const AuthContext = createContext<AuthContextType>({ session: null });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('crewmute_token').then(setAccessToken).catch(() => setAccessToken(null));
  }, [user]);

  const session: Session | null = user
    ? { accessToken, user: { id: user.id, name: user.name, email: user.email } }
    : null;

  return (
    <AuthContext.Provider value={{ session }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
