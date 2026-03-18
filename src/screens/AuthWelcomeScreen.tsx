import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { AuthRequest, CodeChallengeMethod, ResponseType } from 'expo-auth-session';
import { Eye, EyeOff } from 'lucide-react-native';
import { RootStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';
import { runtimeConfig } from '../config/runtime';

WebBrowser.maybeCompleteAuthSession();

type Props = NativeStackScreenProps<RootStackParamList, 'AuthWelcome'>;

const GOOGLE_DISCOVERY = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};

const getProxyRedirectUri = (): string => {
  const owner = Constants.expoConfig?.owner;
  const slug = Constants.expoConfig?.slug;
  if (owner && slug) return `https://auth.expo.io/@${owner}/${slug}`;
  throw new Error('app.json must define "owner" and "slug".');
};

const getReturnUrl = (): string => Linking.createURL('');

const GoogleIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 48 48">
    <Path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
    />
    <Path
      fill="#4285F4"
      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
    />
    <Path
      fill="#FBBC05"
      d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.01 24.01 0 0 0 0 21.56l7.98-6.19z"
    />
    <Path
      fill="#34A853"
      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
    />
  </Svg>
);

export const AuthWelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const { login, loginWithGoogleIdToken } = useAuth();
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [signInError, setSignInError] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  const isSignInValid = useMemo(
    () => email.trim().length > 0 && password.length > 0,
    [email, password],
  );

  const handleSignIn = useCallback(async () => {
    if (!isSignInValid || isSigningIn) return;
    setSignInError('');
    setIsSigningIn(true);
    try {
      await login(email, password);
    } catch (error) {
      setSignInError(
        error instanceof Error ? error.message : 'Sign in failed. Please try again.',
      );
    } finally {
      setIsSigningIn(false);
    }
  }, [email, password, isSignInValid, isSigningIn, login]);

  const handleGoogle = useCallback(async () => {
    setBusy(true);
    try {
      const proxyRedirectUri = getProxyRedirectUri();
      const returnUrl = getReturnUrl();

      const request = new AuthRequest({
        clientId: runtimeConfig.googleWebClientId,
        redirectUri: proxyRedirectUri,
        responseType: ResponseType.Code,
        scopes: [
          'openid',
          'https://www.googleapis.com/auth/userinfo.profile',
          'https://www.googleapis.com/auth/userinfo.email',
        ],
        usePKCE: true,
        codeChallengeMethod: CodeChallengeMethod.S256,
      });

      const authUrl = await request.makeAuthUrlAsync(GOOGLE_DISCOVERY);

      const proxyStartUrl =
        `${proxyRedirectUri}/start?` +
        new URLSearchParams({ authUrl, returnUrl }).toString();

      const result = await WebBrowser.openAuthSessionAsync(proxyStartUrl, returnUrl);

      if (result.type !== 'success' || !('url' in result)) {
        if (result.type === 'cancel' || result.type === 'dismiss') return;
        throw new Error('Browser session did not complete successfully.');
      }

      const resultUrl = new URL(result.url);
      const code = resultUrl.searchParams.get('code');
      if (!code) {
        const errorParam = resultUrl.searchParams.get('error');
        throw new Error(errorParam || 'No authorization code in response.');
      }

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
        throw new Error(
          tokens.error_description || tokens.error || 'Token exchange failed.',
        );
      }

      await loginWithGoogleIdToken(tokens.id_token);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message !== 'Browser session did not complete successfully.'
      ) {
        Alert.alert('Google sign-in', error.message);
      }
    } finally {
      setBusy(false);
    }
  }, [loginWithGoogleIdToken]);

  return (
    <View style={{ flex: 1, backgroundColor: '#F1EEE7' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Green hero ── */}
          <View
            style={{
              backgroundColor: '#024039',
              borderBottomLeftRadius: 32,
              borderBottomRightRadius: 32,
              paddingTop: 68,
              paddingBottom: 36,
              paddingHorizontal: 28,
              overflow: 'hidden',
              marginBottom: 28,
            }}
          >
            <View
              style={{
                position: 'absolute',
                top: -30,
                right: -20,
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: 'rgba(255,255,255,0.06)',
              }}
            />
            <View
              style={{
                position: 'absolute',
                bottom: -40,
                left: -24,
                width: 140,
                height: 140,
                borderRadius: 70,
                borderWidth: 18,
                borderColor: 'rgba(228,221,203,0.1)',
              }}
            />

            <Text
              style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: 14,
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: 1.2,
                marginBottom: 10,
              }}
            >
              Welcome to Dotra
            </Text>
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 30,
                fontWeight: '800',
                letterSpacing: -0.6,
                lineHeight: 38,
              }}
            >
              Sign in to your{'\n'}account
            </Text>
          </View>

          <View style={{ paddingHorizontal: 24 }}>

          {/* ── Email field ── */}
          <View style={{ marginBottom: 14 }}>
            <Text
              style={{
                color: '#141414',
                fontSize: 13,
                fontWeight: '600',
                marginBottom: 8,
                marginLeft: 4,
              }}
            >
              <Text style={{ color: '#C73B2A' }}>* </Text>Email
            </Text>
            <View
              style={{
                backgroundColor: '#FFF',
                borderRadius: 16,
                borderWidth: 1.5,
                borderColor: '#E5E0D8',
                paddingHorizontal: 16,
                paddingVertical: 14,
              }}
            >
              <TextInput
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  setSignInError('');
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="you@example.com"
                placeholderTextColor="#A8A29E"
                style={{ fontSize: 16, color: '#141414' }}
              />
            </View>
          </View>

          {/* ── Password field ── */}
          <View style={{ marginBottom: 6 }}>
            <Text
              style={{
                color: '#141414',
                fontSize: 13,
                fontWeight: '600',
                marginBottom: 8,
                marginLeft: 4,
              }}
            >
              <Text style={{ color: '#C73B2A' }}>* </Text>Password
            </Text>
            <View
              style={{
                backgroundColor: '#FFF',
                borderRadius: 16,
                borderWidth: 1.5,
                borderColor: '#E5E0D8',
                paddingHorizontal: 16,
                paddingVertical: 14,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <TextInput
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  setSignInError('');
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                placeholder="Enter your password"
                placeholderTextColor="#A8A29E"
                style={{ fontSize: 16, color: '#141414', flex: 1 }}
              />
              <Pressable
                onPress={() => setShowPassword((v) => !v)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#6B6B6B" />
                ) : (
                  <Eye size={20} color="#6B6B6B" />
                )}
              </Pressable>
            </View>
          </View>

          {/* ── Error message ── */}
          {signInError ? (
            <Text style={{ color: '#C73B2A', fontSize: 13, marginTop: 6, marginLeft: 4 }}>
              {signInError}
            </Text>
          ) : null}

          {/* ── Forgot password ── */}
          <Pressable
            onPress={() => navigation.navigate('ForgotPassword')}
            style={{ alignSelf: 'flex-end', marginTop: 10, marginBottom: 20 }}
          >
            <Text style={{ color: '#024039', fontSize: 14, fontWeight: '600' }}>
              Forgot password?
            </Text>
          </Pressable>

          {/* ── Sign in button ── */}
          <Pressable
            onPress={handleSignIn}
            disabled={!isSignInValid || isSigningIn}
            style={{
              backgroundColor: isSignInValid && !isSigningIn ? '#024039' : '#B0B5B3',
              borderRadius: 16,
              paddingVertical: 17,
              alignItems: 'center',
              marginBottom: 24,
            }}
          >
            {isSigningIn ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '700' }}>
                Sign In
              </Text>
            )}
          </Pressable>

          {/* ── Divider ── */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 24,
            }}
          >
            <View style={{ flex: 1, height: 1, backgroundColor: '#D5D0C8' }} />
            <Text
              style={{
                color: '#8E8A80',
                fontSize: 13,
                fontWeight: '500',
                marginHorizontal: 16,
              }}
            >
              or continue with
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: '#D5D0C8' }} />
          </View>

          {/* ── Google button ── */}
          <Pressable
            onPress={handleGoogle}
            disabled={busy}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              borderWidth: 1.5,
              borderColor: '#E5E0D8',
              paddingVertical: 16,
              gap: 10,
              opacity: busy ? 0.6 : 1,
              marginBottom: 32,
            }}
          >
            {busy ? (
              <ActivityIndicator size="small" color="#4285F4" />
            ) : (
              <GoogleIcon />
            )}
            <Text style={{ color: '#141414', fontSize: 16, fontWeight: '600' }}>
              {busy ? 'Signing in\u2026' : 'Sign in with Google'}
            </Text>
          </Pressable>

          {/* ── Sign up link ── */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              paddingBottom: 24,
            }}
          >
            <Text style={{ color: '#6B6B6B', fontSize: 15 }}>
              Don't have an account?{' '}
            </Text>
            <Pressable onPress={() => navigation.navigate('Register')}>
              <Text style={{ color: '#024039', fontSize: 15, fontWeight: '700' }}>
                Sign up
              </Text>
            </Pressable>
          </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
