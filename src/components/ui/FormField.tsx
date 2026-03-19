import React, { useState } from 'react';
import { Pressable, TextInput, TextInputProps, View } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { Text } from './Text';

export interface FormFieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  secureTextEntry?: boolean;
  rightElement?: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  error,
  helperText,
  disabled = false,
  secureTextEntry = false,
  rightElement,
  multiline,
  numberOfLines,
  ...inputProps
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const hasError = !!error;
  const isSecure = secureTextEntry && !showPassword;

  return (
    <View>
      {/* Label */}
      <Text
        style={{
          color: hasError ? '#C73B2A' : '#141414',
          fontSize: 13,
          fontWeight: '600',
          marginBottom: 8,
          marginLeft: 4,
        }}
      >
        {required && <Text style={{ color: '#C73B2A' }}>* </Text>}
        {label}
      </Text>

      {/* Input container */}
      <View
        style={{
          backgroundColor: hasError ? '#FFF5F5' : disabled ? '#F5F3EF' : '#FFF',
          borderRadius: 16,
          borderWidth: 1.5,
          borderColor: hasError
            ? '#C73B2A'
            : isFocused
              ? '#024039'
              : '#E5E0D8',
          paddingHorizontal: 16,
          paddingVertical: 14,
          flexDirection: 'row',
          alignItems: multiline ? 'flex-start' : 'center',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <TextInput
          {...inputProps}
          secureTextEntry={isSecure}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? 'top' : 'auto'}
          placeholderTextColor="#A8A29E"
          onFocus={(e) => {
            setIsFocused(true);
            inputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            inputProps.onBlur?.(e);
          }}
          style={{
            fontSize: 16,
            color: '#141414',
            flex: 1,
            padding: 0,
            ...(multiline && { minHeight: numberOfLines ? numberOfLines * 22 : 60 }),
          }}
        />

        {/* Password toggle */}
        {secureTextEntry && !rightElement && (
          <Pressable
            onPress={() => setShowPassword((v) => !v)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{ marginLeft: 8 }}
          >
            {showPassword ? (
              <EyeOff size={20} color="#6B6B6B" />
            ) : (
              <Eye size={20} color="#6B6B6B" />
            )}
          </Pressable>
        )}

        {/* Custom right element */}
        {rightElement && <View style={{ marginLeft: 8 }}>{rightElement}</View>}
      </View>

      {/* Error or helper text */}
      {(hasError || helperText) && (
        <Text
          style={{
            color: hasError ? '#C73B2A' : '#6B6B6B',
            fontSize: 13,
            fontWeight: hasError ? '600' : '400',
            marginTop: 6,
            marginLeft: 4,
          }}
        >
          {error || helperText}
        </Text>
      )}
    </View>
  );
};
