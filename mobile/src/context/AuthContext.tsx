import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { storage } from '../lib/storage';
import { useUpdatePushTokenMutation } from '../api/authHooks';
import { registerForPushNotificationsAsync } from '../utils/notifications';

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

  const { mutate: updatePushToken } = useUpdatePushTokenMutation();

  useEffect(() => {
    storage.getAccessToken().then(setAccessToken).catch(() => setAccessToken(null));

    // Register push token when user is logged in
    if (user) {
      registerForPushNotificationsAsync().then((token) => {
        if (token) {
          updatePushToken({ pushToken: token });
        }
      });
    }
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
