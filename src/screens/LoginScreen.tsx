import React, { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChevronLeft } from 'lucide-react-native';
import { RootStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {
    try {
      await login(email, password);
    } catch (error) {
      Alert.alert('Sign in failed', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F1EEE7', padding: 24, gap: 18 }}>
      <Pressable onPress={() => navigation.goBack()} style={{ alignSelf: 'flex-start', backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 999, padding: 10, marginTop: 48 }}>
        <ChevronLeft size={18} color="#141414" />
      </Pressable>
      <Text style={{ color: '#141414', fontSize: 32, fontWeight: '700' }}>Welcome back</Text>
      <Text style={{ color: '#6B6B6B', fontSize: 16 }}>Pick up where you left off.</Text>
      {[
        { label: 'Email', value: email, setter: setEmail, secure: false },
        { label: 'Password', value: password, setter: setPassword, secure: true },
      ].map((field) => (
        <View key={field.label} style={{ backgroundColor: '#FFF', borderRadius: 24, paddingHorizontal: 18, paddingVertical: 14 }}>
          <Text style={{ color: '#6B6B6B', fontSize: 12, marginBottom: 6 }}>
            <Text style={{ color: '#C73B2A' }}>* </Text>{field.label}
          </Text>
          <TextInput value={field.value} onChangeText={field.setter} secureTextEntry={field.secure} autoCapitalize="none" style={{ fontSize: 18, fontWeight: '600', color: '#141414' }} />
        </View>
      ))}
      <Pressable onPress={() => navigation.navigate('ForgotPassword')}><Text style={{ color: '#024039', fontWeight: '600' }}>Forgot password?</Text></Pressable>
      <Pressable onPress={handleSubmit} style={{ backgroundColor: '#024039', borderRadius: 999, paddingVertical: 18, alignItems: 'center' }}>
        <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>Sign in</Text>
      </Pressable>
    </View>
  );
};
