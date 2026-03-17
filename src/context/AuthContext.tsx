import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { User } from 'firebase/auth';
import {
  createProfileFromUser,
  getStoredProfile,
  isAuthConfigured,
  loginWithEmail,
  logout,
  registerWithEmail,
  sendResetEmail,
  signInWithGoogle,
  subscribeToAuthState,
} from '../services/auth';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  refreshProfile: (user?: User | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = async (authUser?: User | null) => {
    if (!authUser) {
      setProfile(null);
      return;
    }
    const hydratedProfile = await createProfileFromUser(authUser);
    setProfile(hydratedProfile);
  };

  useEffect(() => {
    let unsubscribe = () => {};

    const hydrate = async () => {
      const storedProfile = await getStoredProfile();
      if (storedProfile) {
        setProfile(storedProfile);
      }

      if (!isAuthConfigured()) {
        setIsLoading(false);
        return;
      }

      unsubscribe = subscribeToAuthState(async (authUser) => {
        setUser(authUser);
        if (authUser) {
          await refreshProfile(authUser);
        } else {
          setProfile(null);
        }
        setIsLoading(false);
      });
    };

    hydrate();
    return () => unsubscribe();
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      profile,
      isLoading,
      isAuthenticated: !!user,
      register: async (fullName, email, password) => {
        setIsLoading(true);
        try {
          const nextProfile = await registerWithEmail(fullName, email, password);
          setProfile(nextProfile);
        } finally {
          setIsLoading(false);
        }
      },
      login: async (email, password) => {
        setIsLoading(true);
        try {
          const nextProfile = await loginWithEmail(email, password);
          setProfile(nextProfile);
        } finally {
          setIsLoading(false);
        }
      },
      loginWithGoogle: async () => {
        setIsLoading(true);
        try {
          const nextProfile = await signInWithGoogle();
          setProfile(nextProfile);
        } finally {
          setIsLoading(false);
        }
      },
      forgotPassword: async (email) => {
        await sendResetEmail(email);
      },
      logoutUser: async () => {
        setIsLoading(true);
        try {
          await logout();
          setUser(null);
          setProfile(null);
        } finally {
          setIsLoading(false);
        }
      },
      refreshProfile,
    }),
    [user, profile, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
