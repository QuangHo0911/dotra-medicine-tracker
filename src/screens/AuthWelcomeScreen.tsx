import React, { useCallback, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { AuthRequest, CodeChallengeMethod, ResponseType } from 'expo-auth-session';
import { RootStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';
import { runtimeConfig } from '../config/runtime';

WebBrowser.maybeCompleteAuthSession();

type Props = NativeStackScreenProps<RootStackParamList, 'AuthWelcome'>;

const GOOGLE_DISCOVERY = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};

/**
 * auth.expo.io proxy redirect URI — registered in the Google OAuth client.
 * Google redirects here; the proxy then redirects to the Expo Go deep link.
 */
const getProxyRedirectUri = (): string => {
  const owner = Constants.expoConfig?.owner;
  const slug = Constants.expoConfig?.slug;
  if (owner && slug) return `https://auth.expo.io/@${owner}/${slug}`;
  throw new Error('app.json must define "owner" and "slug".');
};

/**
 * Expo Go deep link — the URL auth.expo.io redirects to after Google completes.
 * WebBrowser.openAuthSessionAsync watches for this scheme to close the browser.
 */
const getReturnUrl = (): string => Linking.createURL('');

export const AuthWelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const { loginWithGoogleIdToken } = useAuth();
  const [busy, setBusy] = useState(false);

  const handleGoogle = useCallback(async () => {
    setBusy(true);
    try {
      const proxyRedirectUri = getProxyRedirectUri();
      const returnUrl = getReturnUrl();

      // 1. Build the OAuth request (generates PKCE code_verifier + challenge)
      const request = new AuthRequest({
        clientId: runtimeConfig.googleWebClientId,
        redirectUri: proxyRedirectUri,
        responseType: ResponseType.Code,
        scopes: ['openid', 'https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
        usePKCE: true,
        codeChallengeMethod: CodeChallengeMethod.S256,
      });

      const authUrl = await request.makeAuthUrlAsync(GOOGLE_DISCOVERY);

      // 2. Wrap through the auth.expo.io proxy /start endpoint
      //    Proxy opens Google → Google redirects to proxy → proxy redirects to returnUrl
      const proxyStartUrl =
        `${proxyRedirectUri}/start?` +
        new URLSearchParams({ authUrl, returnUrl }).toString();

      // 3. Open browser — it closes automatically when it detects the returnUrl scheme
      const result = await WebBrowser.openAuthSessionAsync(proxyStartUrl, returnUrl);

      if (result.type !== 'success' || !('url' in result)) {
        if (result.type === 'cancel' || result.type === 'dismiss') return;
        throw new Error('Browser session did not complete successfully.');
      }

      // 4. Parse the authorization code from the return URL
      const resultUrl = new URL(result.url);
      const code = resultUrl.searchParams.get('code');
      if (!code) {
        const error = resultUrl.searchParams.get('error');
        throw new Error(error || 'No authorization code in response.');
      }

      // 5. Exchange code for tokens (id_token) at Google's token endpoint
      const tokenRes = await fetch(GOOGLE_DISCOVERY.tokenEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: runtimeConfig.googleWebClientId,
          client_secret: runtimeConfig.googleClientSecret,
          code,
          redirect_uri: proxyRedirectUri,
          grant_type: 'authorization_code',
          code_verifier: request.codeVerifier ?? '',
        }).toString(),
      });

      const tokens = await tokenRes.json();
      if (!tokenRes.ok || !tokens.id_token) {
        throw new Error(tokens.error_description || tokens.error || 'Token exchange failed.');
      }

      // 6. Sign in to Firebase with the Google id_token
      await loginWithGoogleIdToken(tokens.id_token);
    } catch (error) {
      if (error instanceof Error && error.message !== 'Browser session did not complete successfully.') {
        Alert.alert('Google sign-in', error.message);
      }
    } finally {
      setBusy(false);
    }
  }, [loginWithGoogleIdToken]);

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

        <Pressable disabled={busy} onPress={handleGoogle} style={{ backgroundColor: '#024039', borderRadius: 999, paddingVertical: 18, alignItems: 'center', opacity: busy ? 0.6 : 1 }}>
          <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '700' }}>{busy ? 'Signing in…' : 'Continue with Google'}</Text>
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
