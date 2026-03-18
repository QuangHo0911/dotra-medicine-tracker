import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChevronLeft } from 'lucide-react-native';
import { RootStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';
import { checkEmailExists } from '../services/auth';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const emailCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCheckedEmail = useRef('');

  const setFieldError = useCallback((field: string, message: string | undefined) => {
    setErrors((prev) => {
      if (message) return { ...prev, [field]: message };
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const runEmailCheck = useCallback(async (emailToCheck: string) => {
    if (lastCheckedEmail.current === emailToCheck) return;
    lastCheckedEmail.current = emailToCheck;
    setIsCheckingEmail(true);
    try {
      const exists = await checkEmailExists(emailToCheck);
      if (exists) {
        setFieldError('email', 'Email already exists');
      }
    } finally {
      setIsCheckingEmail(false);
    }
  }, [setFieldError]);

  const handleEmailChange = useCallback((text: string) => {
    setEmail(text);
    setFieldError('email', undefined);
    lastCheckedEmail.current = '';

    if (emailCheckTimer.current) clearTimeout(emailCheckTimer.current);

    const trimmed = text.trim();
    if (!trimmed || !isValidEmail(trimmed)) return;

    emailCheckTimer.current = setTimeout(() => {
      runEmailCheck(trimmed);
    }, 600);
  }, [setFieldError, runEmailCheck]);

  const handleEmailBlur = useCallback(() => {
    const trimmed = email.trim();
    if (trimmed && isValidEmail(trimmed) && lastCheckedEmail.current !== trimmed) {
      runEmailCheck(trimmed);
    }
  }, [email, runEmailCheck]);

  const handleConfirmPasswordChange = useCallback((text: string) => {
    setConfirmPassword(text);
    if (text && password && text !== password) {
      setFieldError('confirmPassword', 'Passwords do not match');
    } else {
      setFieldError('confirmPassword', undefined);
    }
  }, [password, setFieldError]);

  const handlePasswordChange = useCallback((text: string) => {
    setPassword(text);
    setFieldError('password', undefined);
    if (confirmPassword && text !== confirmPassword) {
      setFieldError('confirmPassword', 'Passwords do not match');
    } else {
      setFieldError('confirmPassword', undefined);
    }
  }, [confirmPassword, setFieldError]);

  const isFormValid = useMemo(() => {
    return (
      fullName.trim().length > 0 &&
      isValidEmail(email) &&
      password.length > 0 &&
      confirmPassword.length > 0 &&
      password === confirmPassword &&
      Object.keys(errors).length === 0
    );
  }, [fullName, email, password, confirmPassword, errors]);

  const handleSubmit = async () => {
    if (!isFormValid || isSubmitting) return;

    const nextErrors: Record<string, string> = {};
    if (!fullName.trim()) nextErrors.fullName = 'Full name is required';
    if (!isValidEmail(email)) nextErrors.email = 'Please enter a valid email';
    if (!password) nextErrors.password = 'Password is required';
    if (password !== confirmPassword) nextErrors.confirmPassword = 'Passwords do not match';
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await register(fullName, email, password);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Please try again.';
      if (
        message.toLowerCase().includes('email-already-in-use') ||
        (message.toLowerCase().includes('email') && message.toLowerCase().includes('already'))
      ) {
        setFieldError('email', 'Email already exists');
      } else {
        setFieldError('submit', message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields = [
    { key: 'fullName', label: 'Full name', value: fullName, setter: setFullName, secure: false, onBlur: undefined as (() => void) | undefined },
    { key: 'email', label: 'Email', value: email, setter: handleEmailChange, secure: false, onBlur: handleEmailBlur },
    { key: 'password', label: 'Password', value: password, setter: handlePasswordChange, secure: true, onBlur: undefined as (() => void) | undefined },
    { key: 'confirmPassword', label: 'Confirm password', value: confirmPassword, setter: handleConfirmPasswordChange, secure: true, onBlur: undefined as (() => void) | undefined },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#F1EEE7', padding: 24, gap: 18 }}>
      <Pressable onPress={() => navigation.goBack()} style={{ alignSelf: 'flex-start', backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 999, padding: 10, marginTop: 48 }}>
        <ChevronLeft size={18} color="#141414" />
      </Pressable>
      <Text style={{ color: '#141414', fontSize: 32, fontWeight: '700' }}>Create your account</Text>
      <Text style={{ color: '#6B6B6B', fontSize: 16 }}>We'll keep this fast: just the essentials.</Text>
      {fields.map((field) => {
        const error = errors[field.key];
        const hasError = !!error;
        return (
          <View key={field.key}>
            <View
              style={{
                backgroundColor: hasError ? '#FFF5F5' : '#FFF',
                borderRadius: 24,
                paddingHorizontal: 18,
                paddingVertical: 14,
                borderWidth: 1.5,
                borderColor: hasError ? '#C73B2A' : 'transparent',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <Text style={{ color: hasError ? '#C73B2A' : '#6B6B6B', fontSize: 12 }}>
                  <Text style={{ color: '#C73B2A' }}>* </Text>{field.label}
                </Text>
                {field.key === 'email' && isCheckingEmail && (
                  <ActivityIndicator size="small" color="#6B6B6B" style={{ marginLeft: 8 }} />
                )}
              </View>
              <TextInput
                value={field.value}
                onChangeText={field.setter}
                onBlur={field.onBlur}
                secureTextEntry={field.secure}
                autoCapitalize={field.key === 'fullName' ? 'words' : 'none'}
                keyboardType={field.key === 'email' ? 'email-address' : 'default'}
                style={{ fontSize: 18, fontWeight: '600', color: '#141414' }}
              />
            </View>
            {hasError && (
              <Text style={{ color: '#C73B2A', fontSize: 12, fontWeight: '600', marginTop: 6, marginLeft: 18 }}>{error}</Text>
            )}
          </View>
        );
      })}
      {errors.submit && (
        <Text style={{ color: '#C73B2A', fontSize: 13, textAlign: 'center' }}>{errors.submit}</Text>
      )}
      <Pressable
        onPress={handleSubmit}
        disabled={!isFormValid || isSubmitting}
        style={{
          backgroundColor: isFormValid && !isSubmitting ? '#024039' : '#9CA3A0',
          borderRadius: 999,
          paddingVertical: 18,
          alignItems: 'center',
          opacity: isFormValid && !isSubmitting ? 1 : 0.7,
        }}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>Create account</Text>
        )}
      </Pressable>
    </View>
  );
};
