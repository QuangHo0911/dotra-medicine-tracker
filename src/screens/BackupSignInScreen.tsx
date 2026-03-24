import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChevronLeft } from 'lucide-react-native';
import { RootStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';
import { FormField } from '../components/ui/FormField';

type Props = NativeStackScreenProps<RootStackParamList, 'BackupSignIn'>;

export const BackupSignInScreen: React.FC<Props> = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      navigation.goBack();
    } catch (error) {
      setSignInError(
        error instanceof Error ? error.message : 'Sign in failed. Please try again.',
      );
    } finally {
      setIsSigningIn(false);
    }
  }, [email, password, isSignInValid, isSigningIn, login, navigation]);

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
          <View
            style={{
              backgroundColor: '#024039',
              borderBottomLeftRadius: 32,
              borderBottomRightRadius: 32,
              paddingTop: 56,
              paddingBottom: 28,
              paddingHorizontal: 24,
              overflow: 'hidden',
              marginBottom: 28,
            }}
          >
            <View style={{ position: 'absolute', top: -30, right: -20, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.06)' }} />
            <View style={{ position: 'absolute', bottom: -40, left: -24, width: 140, height: 140, borderRadius: 70, borderWidth: 18, borderColor: 'rgba(228,221,203,0.1)' }} />

            <Pressable onPress={() => navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 }}>
              <ChevronLeft size={22} color="#FFF" />
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15, fontWeight: '600' }}>Back</Text>
            </Pressable>

            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10 }}>
              Connect account
            </Text>
            <Text style={{ color: '#FFFFFF', fontSize: 26, fontWeight: '800', letterSpacing: -0.4, lineHeight: 34 }}>
              Sign in to enable{'\n'}backup & sync
            </Text>
          </View>

          <View style={{ paddingHorizontal: 24 }}>
            <View style={{ marginBottom: 14 }}>
              <FormField
                label="Email"
                required
                value={email}
                onChangeText={(t) => { setEmail(t); setSignInError(''); }}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="you@example.com"
              />
            </View>

            <View style={{ marginBottom: 6 }}>
              <FormField
                label="Password"
                required
                value={password}
                onChangeText={(t) => { setPassword(t); setSignInError(''); }}
                secureTextEntry
                autoCapitalize="none"
                placeholder="Enter your password"
                error={signInError || undefined}
              />
            </View>

            <Pressable
              onPress={() => navigation.navigate('ForgotPassword')}
              style={{ alignSelf: 'flex-end', marginTop: 10, marginBottom: 20 }}
            >
              <Text style={{ color: '#024039', fontSize: 14, fontWeight: '600' }}>
                Forgot password?
              </Text>
            </Pressable>

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
                  Connect Account
                </Text>
              )}
            </Pressable>

            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingBottom: 24 }}>
              <Text style={{ color: '#6B6B6B', fontSize: 15 }}>
                Don't have an account?{' '}
              </Text>
              <Pressable onPress={() => navigation.navigate('BackupRegister')}>
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
