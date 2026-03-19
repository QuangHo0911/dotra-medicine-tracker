import * as WebBrowser from 'expo-web-browser';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../config/firebase';
import { UserProfile } from '../types';
import { getUserProfileFromFirebase, saveUserProfileToFirebase } from './firebase';
import { clearProfileFromStorage, loadProfileFromStorage, saveProfileToStorage } from './storage';

WebBrowser.maybeCompleteAuthSession();

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
  const storedProfile = await loadProfileFromStorage();
  const storedProfileForUser = storedProfile?.uid === user.uid ? storedProfile : null;
  const fallbackName =
    overrides?.fullName ||
    user.displayName ||
    storedProfileForUser?.fullName ||
    user.email?.split('@')[0] ||
    'Dotra User';
  const nameParts = splitName(fallbackName);

  const existing = await getUserProfileFromFirebase(user.uid);
  const profile: UserProfile = {
    uid: user.uid,
    email: user.email,
    fullName: overrides?.fullName || existing?.fullName || storedProfileForUser?.fullName || fallbackName,
    firstName: overrides?.firstName || existing?.firstName || storedProfileForUser?.firstName || nameParts.firstName,
    lastName: overrides?.lastName || existing?.lastName || storedProfileForUser?.lastName || nameParts.lastName,
    avatarUrl: overrides?.avatarUrl ?? existing?.avatarUrl ?? storedProfileForUser?.avatarUrl ?? user.photoURL,
    localAvatarUri: overrides?.localAvatarUri ?? storedProfileForUser?.localAvatarUri ?? null,
    initials:
      overrides?.initials ||
      existing?.initials ||
      storedProfileForUser?.initials ||
      buildInitials(overrides?.fullName || existing?.fullName || storedProfileForUser?.fullName || fallbackName),
    provider:
      overrides?.provider ||
      existing?.provider ||
      storedProfileForUser?.provider ||
      (user.providerData[0]?.providerId === 'google.com' ? 'google' : 'password'),
    createdAt: existing?.createdAt || storedProfileForUser?.createdAt || new Date().toISOString(),
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
  if (auth) {
    await signOut(auth);
  }
  await clearProfileFromStorage();
};

export const updateStoredProfile = async (
  updates: Partial<UserProfile>,
  options: { persistRemote?: boolean } = {}
): Promise<UserProfile> => {
  const existingProfile = await loadProfileFromStorage();

  if (!existingProfile) {
    throw new Error('No stored profile is available to update.');
  }

  const nextProfile: UserProfile = {
    ...existingProfile,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await saveProfileToStorage(nextProfile);

  if (options.persistRemote) {
    await saveUserProfileToFirebase(nextProfile);
  }

  return nextProfile;
};

export const checkEmailExists = async (email: string): Promise<boolean> => {
  const apiKey = auth?.app.options.apiKey;
  if (!apiKey) return false;
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:createAuthUri?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: email.trim(),
          continueUri: 'http://localhost',
        }),
      },
    );
    if (!res.ok) return false;
    const data = await res.json();
    return data.registered === true;
  } catch {
    return false;
  }
};

export const signInWithGoogleIdToken = async (idToken: string): Promise<UserProfile> => {
  if (!auth) throw new Error('Firebase auth is not configured.');
  const firebaseCredential = GoogleAuthProvider.credential(idToken);
  const credential = await signInWithCredential(auth, firebaseCredential);
  return createProfileFromUser(credential.user, { provider: 'google' });
};
