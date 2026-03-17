import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  User,
} from 'firebase/auth';
import { Platform } from 'react-native';
import { auth, isFirebaseConfigured } from '../config/firebase';
import { UserProfile } from '../types';
import { getUserProfileFromFirebase, saveUserProfileToFirebase } from './firebase';
import { loadProfileFromStorage, saveProfileToStorage } from './storage';

WebBrowser.maybeCompleteAuthSession();

const googleDiscovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

const buildInitials = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const splitName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] ?? '',
    lastName: parts.length > 1 ? parts[parts.length - 1] : '',
  };
};

export const isAuthConfigured = () => isFirebaseConfigured() && !!auth;

export const subscribeToAuthState = (callback: (user: User | null) => void) => {
  if (!auth) return () => callback(null);
  return onAuthStateChanged(auth, callback);
};

export const createProfileFromUser = async (
  user: User,
  overrides?: Partial<UserProfile>
): Promise<UserProfile> => {
  const fallbackName = overrides?.fullName || user.displayName || user.email?.split('@')[0] || 'Dotra User';
  const nameParts = splitName(fallbackName);

  const existing = await getUserProfileFromFirebase(user.uid);
  const profile: UserProfile = {
    uid: user.uid,
    email: user.email,
    fullName: overrides?.fullName || existing?.fullName || fallbackName,
    firstName: overrides?.firstName || existing?.firstName || nameParts.firstName,
    lastName: overrides?.lastName || existing?.lastName || nameParts.lastName,
    avatarUrl: overrides?.avatarUrl ?? existing?.avatarUrl ?? user.photoURL,
    initials: overrides?.initials || existing?.initials || buildInitials(overrides?.fullName || existing?.fullName || fallbackName),
    provider: overrides?.provider || existing?.provider || (user.providerData[0]?.providerId === 'google.com' ? 'google' : 'password'),
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await saveUserProfileToFirebase(profile);
  await saveProfileToStorage(profile);
  return profile;
};

export const getStoredProfile = loadProfileFromStorage;

export const registerWithEmail = async (fullName: string, email: string, password: string) => {
  if (!auth) throw new Error('Firebase auth is not configured.');
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  await updateProfile(credential.user, { displayName: fullName.trim() });
  const profile = await createProfileFromUser(credential.user, {
    fullName: fullName.trim(),
    provider: 'password',
  });
  return profile;
};

export const loginWithEmail = async (email: string, password: string) => {
  if (!auth) throw new Error('Firebase auth is not configured.');
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  return createProfileFromUser(credential.user);
};

export const sendResetEmail = async (email: string) => {
  if (!auth) throw new Error('Firebase auth is not configured.');
  await sendPasswordResetEmail(auth, email.trim());
};

export const logout = async () => {
  if (!auth) return;
  await signOut(auth);
};

export const signInWithGoogle = async (): Promise<UserProfile> => {
  if (!auth) throw new Error('Firebase auth is not configured.');

  if (Platform.OS === 'web') {
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(auth, provider);
    return createProfileFromUser(credential.user, { provider: 'google' });
  }

  const request = new AuthSession.AuthRequest({
    clientId: process.env.GOOGLE_EXPO_CLIENT_ID || process.env.GOOGLE_WEB_CLIENT_ID || '',
    scopes: ['openid', 'profile', 'email'],
    responseType: AuthSession.ResponseType.IdToken,
    usePKCE: false,
    redirectUri: AuthSession.makeRedirectUri(),
    extraParams: {
      nonce: 'dotra-google-auth',
    },
  });

  if (!request.clientId) {
    throw new Error('Google OAuth is missing GOOGLE_EXPO_CLIENT_ID or GOOGLE_WEB_CLIENT_ID.');
  }

  const result = await request.promptAsync(googleDiscovery);
  if (result.type !== 'success' || !result.params.id_token) {
    throw new Error('Google sign-in was cancelled.');
  }

  const firebaseCredential = GoogleAuthProvider.credential(result.params.id_token);
  const credential = await signInWithCredential(auth, firebaseCredential);
  return createProfileFromUser(credential.user, { provider: 'google' });
};
