import React, { useMemo, useState } from 'react';
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

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

          <View style={{ marginBottom: 14 }}>
            <FormField
              label="Email"
              required
              value={email}
              onChangeText={(t) => { setEmail(t); setError(''); }}
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
              onChangeText={(t) => { setPassword(t); setError(''); }}
              secureTextEntry
              autoCapitalize="none"
              placeholder="Enter your password"
              error={error || undefined}
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
