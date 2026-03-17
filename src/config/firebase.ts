import { getApp, getApps, initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { runtimeConfig } from './runtime';

const firebaseConfig = {
  apiKey: runtimeConfig.firebaseApiKey,
  authDomain: runtimeConfig.firebaseAuthDomain,
  projectId: runtimeConfig.firebaseProjectId,
  storageBucket: runtimeConfig.firebaseStorageBucket,
  messagingSenderId: runtimeConfig.firebaseMessagingSenderId,
  appId: runtimeConfig.firebaseAppId,
};

export const isFirebaseConfigured = (): boolean => {
  return !!(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);
};

const firebaseApp: FirebaseApp | null = isFirebaseConfigured()
  ? getApps().length
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

const firestoreDb: Firestore | null = firebaseApp ? getFirestore(firebaseApp) : null;
const firebaseAuth: Auth | null = firebaseApp ? getAuth(firebaseApp) : null;
const firebaseStorage: FirebaseStorage | null = firebaseApp ? getStorage(firebaseApp) : null;

export const app = firebaseApp;
export const db = firestoreDb;
export const auth = firebaseAuth;
export const storage = firebaseStorage;
