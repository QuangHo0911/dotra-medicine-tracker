import React, { useEffect, useMemo } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { makeRedirectUri } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import { RootStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';
import { runtimeConfig } from '../config/runtime';

type Props = NativeStackScreenProps<RootStackParamList, 'AuthWelcome'>;

/**
 * In Expo Go the default makeRedirectUri returns an `exp://` URL that Google's
 * web-type OAuth client rejects.  Expo Go intercepts redirects to
 * `https://auth.expo.io/@owner/slug` as a universal-link, so we can use that
 * as the redirect_uri for both the authorization request and the code exchange.
 *
 * In dev-builds / standalone the app's own scheme (`dotra://`) works because
 * we can register an iOS or Android OAuth client for it.
 */
const getGoogleRedirectUri = (): string => {
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
    const fullName = Constants.expoConfig?.originalFullName;
    if (fullName) return `https://auth.expo.io/${fullName}`;
  }
  return makeRedirectUri({ scheme: 'dotra', path: 'oauthredirect' });
};

export const AuthWelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const { loginWithGoogleIdToken } = useAuth();
  const redirectUri = useMemo(getGoogleRedirectUri, []);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: runtimeConfig.googleWebClientId,
    clientSecret: runtimeConfig.googleClientSecret || undefined,
    redirectUri,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.params.id_token;
      if (idToken) {
        loginWithGoogleIdToken(idToken).catch((error) => {
          Alert.alert('Google sign-in', error instanceof Error ? error.message : 'Unable to sign in with Google right now.');
        });
      } else {
        Alert.alert('Google sign-in', 'No ID token received from Google.');
      }
    } else if (response?.type === 'error') {
      Alert.alert('Google sign-in', response.error?.message || 'An error occurred during Google sign-in.');
    }
  }, [response]);

  const handleGoogle = () => {
    promptAsync().catch((error) => {
      Alert.alert('Google sign-in', error instanceof Error ? error.message : 'Unable to sign in with Google right now.');
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F1EEE7', padding: 24, justifyContent: 'space-between' }}>
      <View style={{ backgroundColor: '#024039', borderBottomLeftRadius: 32, borderBottomRightRadius: 32, padding: 28, marginHorizontal: -24, marginTop: -24, paddingTop: 72 }}>
        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 4 }}>Welcome to Dotra</Text>
        <Text style={{ color: '#FFF', fontSize: 34, fontWeight: '600', letterSpacing: -1.2 }}>Stay on track with every dose.</Text>
      </View>

      <View style={{ gap: 16 }}>
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 28, padding: 24 }}>
          <Text style={{ color: '#141414', fontSize: 24, fontWeight: '700', marginBottom: 8 }}>Simple onboarding, real accountability.</Text>
          <Text style={{ color: '#6B6B6B', fontSize: 16, lineHeight: 24 }}>
            Sign in fast, keep your medicines synced, and get a streak system that actually feels motivating.
          </Text>
        </View>

        <Pressable disabled={!request} onPress={handleGoogle} style={{ backgroundColor: '#024039', borderRadius: 999, paddingVertical: 18, alignItems: 'center', opacity: request ? 1 : 0.6 }}>
          <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '700' }}>Continue with Google</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('Register')} style={{ backgroundColor: '#FFFFFF', borderRadius: 999, paddingVertical: 18, alignItems: 'center' }}>
          <Text style={{ color: '#141414', fontSize: 16, fontWeight: '700' }}>Create account with email</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('Login')} style={{ paddingVertical: 12, alignItems: 'center' }}>
          <Text style={{ color: '#024039', fontSize: 15, fontWeight: '600' }}>Already have an account? Sign in</Text>
        </Pressable>
      </View>
    </View>
  );
};
