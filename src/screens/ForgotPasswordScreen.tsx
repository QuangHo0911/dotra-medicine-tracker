import React, { useState } from 'react';
import {
  Alert,
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
    <View style={{ flex: 1, backgroundColor: '#F1EEE7' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 24, gap: 18 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            onPress={() => navigation.goBack()}
            style={{ alignSelf: 'flex-start', backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 999, padding: 10, marginTop: 48 }}
          >
            <ChevronLeft size={18} color="#141414" />
          </Pressable>
          <Text style={{ color: '#141414', fontSize: 32, fontWeight: '700' }}>Reset your password</Text>
          <Text style={{ color: '#6B6B6B', fontSize: 16 }}>Enter your email and we'll send the reset link.</Text>

          <FormField
            label="Email"
            required
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
          />

          <Pressable
            onPress={handleSubmit}
            disabled={!email.trim()}
            style={{
              backgroundColor: email.trim() ? '#024039' : '#B0B5B3',
              borderRadius: 16,
              paddingVertical: 18,
              alignItems: 'center',
              opacity: email.trim() ? 1 : 0.7,
            }}
          >
            <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>Send reset link</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
