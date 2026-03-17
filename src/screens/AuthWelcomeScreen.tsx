import React from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'AuthWelcome'>;

export const AuthWelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const { loginWithGoogle } = useAuth();

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      Alert.alert('Google sign-in', error instanceof Error ? error.message : 'Unable to sign in with Google right now.');
    }
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

        <Pressable onPress={handleGoogle} style={{ backgroundColor: '#024039', borderRadius: 999, paddingVertical: 18, alignItems: 'center' }}>
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
