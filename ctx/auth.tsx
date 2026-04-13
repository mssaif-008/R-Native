import React, { createContext, useContext, useState, useEffect } from 'react';
import { getStorageItemAsync, setStorageItemAsync, removeStorageItemAsync } from '../utils/storage';

const AuthContext = createContext<any>(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<string | null>(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const email = await getStorageItemAsync('user_email');
        if (email) {
          setUser(email);
        }
      } catch (error) {
        console.error('Failed to load auth state', error);
      } finally {
        setIsAuthLoaded(true);
      }
    };
    loadAuth();
  }, []);

  const signIn = async (email: string) => {
    await setStorageItemAsync('user_email', email);
    setUser(email);
  };

  const signOut = async () => {
    await removeStorageItemAsync('user_email');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthLoaded, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
