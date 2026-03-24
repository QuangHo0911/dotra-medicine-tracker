import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { User } from 'firebase/auth';
import {
  createProfileFromUser,
  getStoredProfile,
  isAuthConfigured,
  logout,
  signInWithGoogleIdToken,
  subscribeToAuthState,
  updateStoredProfile,
} from '../services/auth';
import { UserProfile } from '../types';
import { saveProfileToStorage } from '../services/storage';

const GUEST_PROFILE: UserProfile = {
  uid: 'guest',
  email: null,
  fullName: 'Dotra User',
  firstName: 'Dotra',
  lastName: 'User',
  avatarUrl: null,
  localAvatarUri: null,
  initials: 'DT',
  provider: 'guest',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
  loginWithGoogleIdToken: (idToken: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  disconnectBackup: () => Promise<void>;
  refreshProfile: (user?: User | null) => Promise<void>;
  updateProfileDetails: (updates: Partial<UserProfile>, options?: { persistRemote?: boolean }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = async (authUser?: User | null) => {
    if (!authUser) {
      setProfile(GUEST_PROFILE);
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
      } else {
        setProfile(GUEST_PROFILE);
        await saveProfileToStorage(GUEST_PROFILE);
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
          setProfile((prev) => prev?.provider === 'guest' ? prev : GUEST_PROFILE);
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
      isGuest: !user,
      loginWithGoogleIdToken: async (idToken: string) => {
        setIsLoading(true);
        try {
          const nextProfile = await signInWithGoogleIdToken(idToken);
          setProfile(nextProfile);
        } finally {
          setIsLoading(false);
        }
      },
      logoutUser: async () => {
        setIsLoading(true);
        try {
          await logout();
          setUser(null);
          setProfile(GUEST_PROFILE);
          await saveProfileToStorage(GUEST_PROFILE);
        } finally {
          setIsLoading(false);
        }
      },
      disconnectBackup: async () => {
        setIsLoading(true);
        try {
          await logout();
          setUser(null);
          setProfile(GUEST_PROFILE);
          await saveProfileToStorage(GUEST_PROFILE);
        } finally {
          setIsLoading(false);
        }
      },
      refreshProfile,
      updateProfileDetails: async (updates, options) => {
        const nextProfile = await updateStoredProfile(updates, options);
        setProfile(nextProfile);
      },
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
