import Constants from 'expo-constants';

type RuntimeRecord = Record<string, string | undefined>;

const extraConfig = (Constants.expoConfig?.extra ?? {}) as RuntimeRecord;

const readRuntimeValue = (...keys: string[]): string => {
  for (const key of keys) {
    const envValue = process.env[key];
    if (typeof envValue === 'string' && envValue.length > 0) {
      return envValue;
    }

    const extraValue = extraConfig[key];
    if (typeof extraValue === 'string' && extraValue.length > 0) {
      return extraValue;
    }
  }

  return '';
};

export const runtimeConfig = {
  firebaseApiKey: readRuntimeValue('EXPO_PUBLIC_FIREBASE_API_KEY', 'FIREBASE_API_KEY', 'firebaseApiKey'),
  firebaseAuthDomain: readRuntimeValue('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN', 'FIREBASE_AUTH_DOMAIN', 'firebaseAuthDomain'),
  firebaseProjectId: readRuntimeValue('EXPO_PUBLIC_FIREBASE_PROJECT_ID', 'FIREBASE_PROJECT_ID', 'firebaseProjectId'),
  firebaseStorageBucket: readRuntimeValue('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET', 'FIREBASE_STORAGE_BUCKET', 'firebaseStorageBucket'),
  firebaseMessagingSenderId: readRuntimeValue(
    'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'FIREBASE_MESSAGING_SENDER_ID',
    'firebaseMessagingSenderId'
  ),
  firebaseAppId: readRuntimeValue('EXPO_PUBLIC_FIREBASE_APP_ID', 'FIREBASE_APP_ID', 'firebaseAppId'),
  googleWebClientId: readRuntimeValue(
    'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID',
    'GOOGLE_WEB_CLIENT_ID',
    'GOOGLE_EXPO_CLIENT_ID',
    'googleWebClientId'
  ),
  googleRedirectUri: readRuntimeValue(
    'EXPO_PUBLIC_GOOGLE_REDIRECT_URI',
    'GOOGLE_REDIRECT_URI',
    'googleRedirectUri'
  ),
};

