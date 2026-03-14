import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth, signInAnonymously } from 'firebase/auth';

// Firebase configuration
// These values are from your Firebase Console
const firebaseConfig = {
  apiKey: 'AIzaSyCR793kCmBOAqyqrUxz0DQUqfXHKlwB0J8',
  authDomain: 'dotra-medicine-tracker.firebaseapp.com',
  projectId: 'dotra-medicine-tracker',
  storageBucket: 'dotra-medicine-tracker.firebasestorage.app',
  messagingSenderId: '418741910483',
  appId: '1:418741910483:web:251be7b342568b66bd0d26',
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

// Check if Firebase is configured
const isFirebaseConfigured = (): boolean => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
  );
};

// Initialize Firebase only if configured
if (isFirebaseConfigured()) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase:', error);
  }
} else {
  console.log('Firebase not configured - running in local-only mode');
}

// Authenticate user anonymously
export const authenticateUser = async (): Promise<string | null> => {
  if (!auth) {
    console.log('Firebase not configured, skipping authentication');
    return null;
  }

  try {
    const userCredential = await signInAnonymously(auth);
    console.log('User authenticated anonymously:', userCredential.user.uid);
    return userCredential.user.uid;
  } catch (error) {
    console.error('Anonymous authentication failed:', error);
    return null;
  }
};

export { app, db, auth, isFirebaseConfigured };
