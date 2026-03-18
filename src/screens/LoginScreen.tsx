import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react-native';
import { RootStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isValid = useMemo(
    () => email.trim().length > 0 && password.length > 0,
    [email, password],
  );

  const handleSubmit = async () => {
    if (!isValid || isLoading) return;
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F1EEE7' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            onPress={() => navigation.goBack()}
            style={{
              alignSelf: 'flex-start',
              backgroundColor: 'rgba(0,0,0,0.06)',
              borderRadius: 999,
              padding: 10,
              marginTop: 48,
              marginBottom: 28,
            }}
          >
            <ChevronLeft size={18} color="#141414" />
          </Pressable>

          <Text
            style={{
              color: '#141414',
              fontSize: 30,
              fontWeight: '800',
              letterSpacing: -0.6,
              lineHeight: 38,
              marginBottom: 8,
            }}
          >
            Welcome back
          </Text>
          <Text style={{ color: '#6B6B6B', fontSize: 16, marginBottom: 32 }}>
            Pick up where you left off.
          </Text>

          {/* ── Email ── */}
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
                  setError('');
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="you@example.com"
                placeholderTextColor="#A8A29E"
                style={{ fontSize: 16, color: '#141414' }}
              />
            </View>
          </View>

          {/* ── Password ── */}
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
                  setError('');
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

          {error ? (
            <Text style={{ color: '#C73B2A', fontSize: 13, marginTop: 6, marginLeft: 4 }}>
              {error}
            </Text>
          ) : null}

          <Pressable
            onPress={() => navigation.navigate('ForgotPassword')}
            style={{ alignSelf: 'flex-end', marginTop: 10, marginBottom: 20 }}
          >
            <Text style={{ color: '#024039', fontSize: 14, fontWeight: '600' }}>
              Forgot password?
            </Text>
          </Pressable>

          <Pressable
            onPress={handleSubmit}
            disabled={!isValid || isLoading}
            style={{
              backgroundColor: isValid && !isLoading ? '#024039' : '#B0B5B3',
              borderRadius: 16,
              paddingVertical: 17,
              alignItems: 'center',
            }}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '700' }}>Sign In</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
