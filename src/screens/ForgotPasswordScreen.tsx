import React, { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');

  const handleSubmit = async () => {
    try {
      await forgotPassword(email);
      Alert.alert('Check your inbox', 'We sent you a password reset email.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Reset failed', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F1EEE7', padding: 24, gap: 18 }}>
      <Text style={{ color: '#141414', fontSize: 32, fontWeight: '700', marginTop: 64 }}>Reset your password</Text>
      <Text style={{ color: '#6B6B6B', fontSize: 16 }}>Enter your email and we’ll send the reset link.</Text>
      <View style={{ backgroundColor: '#FFF', borderRadius: 24, paddingHorizontal: 18, paddingVertical: 14 }}>
        <Text style={{ color: '#6B6B6B', fontSize: 12, marginBottom: 6 }}>Email</Text>
        <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" style={{ fontSize: 18, fontWeight: '600', color: '#141414' }} />
      </View>
      <Pressable onPress={handleSubmit} style={{ backgroundColor: '#024039', borderRadius: 999, paddingVertical: 18, alignItems: 'center' }}>
        <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>Send reset link</Text>
      </Pressable>
    </View>
  );
};
