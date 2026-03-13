import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth, signInAnonymously } from 'firebase/auth';

// Firebase configuration
// Replace these values with your actual Firebase config from console.firebase.google.com
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || 'YOUR_API_KEY_HERE',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: process.env.FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || 'YOUR_SENDER_ID',
  appId: process.env.FIREBASE_APP_ID || 'YOUR_APP_ID',
};

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

// Initialize Firebase
try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

// Authenticate user anonymously
export const authenticateUser = async (): Promise<string | null> => {
  try {
    const userCredential = await signInAnonymously(auth);
    console.log('User authenticated anonymously:', userCredential.user.uid);
    return userCredential.user.uid;
  } catch (error) {
    console.error('Anonymous authentication failed:', error);
    return null;
  }
};

export { app, db, auth };
