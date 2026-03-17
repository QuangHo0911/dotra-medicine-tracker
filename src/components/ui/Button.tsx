import React from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  Text as RNText,
  type TouchableOpacityProps,
} from 'react-native';
import { cn } from '../../utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  isDisabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  textClassName?: string;
}

const variantStyles: Record<ButtonVariant, { container: string; text: string }> = {
  primary: { container: 'bg-primary shadow-button active:opacity-90', text: 'text-white font-semibold' },
  secondary: { container: 'bg-background-card border border-border shadow-sm', text: 'text-text font-semibold' },
  danger: { container: 'bg-danger shadow-button-danger active:opacity-90', text: 'text-white font-semibold' },
  ghost: { container: 'bg-transparent', text: 'text-text font-semibold' },
  outline: { container: 'bg-transparent border border-primary', text: 'text-primary font-semibold' },
};

const sizeStyles: Record<ButtonSize, { container: string; text: string }> = {
  sm: { container: 'px-4 py-2 rounded-lg', text: 'text-sm' },
  md: { container: 'px-6 py-3 rounded-xl', text: 'text-base' },
  lg: { container: 'px-8 py-4 rounded-2xl', text: 'text-lg' },
};

export const Button = React.forwardRef<typeof TouchableOpacity, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    isLoading = false,
    isDisabled = false,
    leftIcon,
    rightIcon,
    children,
    className,
    textClassName,
    ...props
  },
  ref
) {
  const disabled = isDisabled || isLoading;

  return (
    <TouchableOpacity
      ref={ref as never}
      activeOpacity={0.82}
      disabled={disabled}
      className={cn(
        'flex-row items-center justify-center gap-2',
        variantStyles[variant].container,
        sizeStyles[size].container,
        disabled && 'opacity-50',
        className
      )}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={variant === 'primary' || variant === 'danger' ? '#fff' : '#1a1a1a'} />
      ) : (
        <>
          {leftIcon}
          {typeof children === 'string' ? (
            <RNText className={cn(variantStyles[variant].text, sizeStyles[size].text, textClassName)}>{children}</RNText>
          ) : (
            children
          )}
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
});
