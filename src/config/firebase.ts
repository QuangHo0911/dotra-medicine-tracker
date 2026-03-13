import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth, signInAnonymously } from 'firebase/auth';

// Firebase configuration
// These values are from your Firebase Console (safe to include in client-side code)
const firebaseConfig = {
  apiKey: 'AIzaSyCR793kCmBOAqyqrUxz0DQUqfXHKlwB0J8',
  authDomain: 'dotra-medicine-tracker.firebaseapp.com',
  projectId: 'dotra-medicine-tracker',
  storageBucket: 'dotra-medicine-tracker.firebasestorage.app',
  messagingSenderId: '418741910483',
  appId: '1:418741910483:web:251be7b342568b66bd0d26',
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
