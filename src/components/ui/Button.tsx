import React from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  Text as RNText,
  type TouchableOpacityProps,
  type ViewStyle,
  type TextStyle,
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

const variantStyles: Record<ButtonVariant, { container: string; text: string; icon: string }> = {
  primary: {
    container: 'bg-primary shadow-button active:opacity-90',
    text: 'text-white font-semibold',
    icon: 'text-white',
  },
  secondary: {
    container: 'bg-background-card border border-border shadow-sm active:bg-neutral-50',
    text: 'text-text font-semibold',
    icon: 'text-text',
  },
  danger: {
    container: 'bg-danger shadow-button-danger active:opacity-90',
    text: 'text-white font-semibold',
    icon: 'text-white',
  },
  ghost: {
    container: 'bg-transparent active:bg-neutral-100',
    text: 'text-text font-semibold',
    icon: 'text-text',
  },
  outline: {
    container: 'bg-transparent border border-primary active:bg-primary-50',
    text: 'text-primary font-semibold',
    icon: 'text-primary',
  },
};

const sizeStyles: Record<ButtonSize, { container: string; text: string }> = {
  sm: {
    container: 'px-4 py-2 rounded-lg',
    text: 'text-sm',
  },
  md: {
    container: 'px-6 py-3 rounded-xl',
    text: 'text-base',
  },
  lg: {
    container: 'px-8 py-4 rounded-2xl',
    text: 'text-lg',
  },
};

export const Button = React.forwardRef<TouchableOpacity, ButtonProps>(
  (
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
      style,
      ...props
    },
    ref
  ) => {
    const variantStyle = variantStyles[variant];
    const sizeStyle = sizeStyles[size];
    const disabled = isDisabled || isLoading;

    return (
      <TouchableOpacity
        ref={ref}
        activeOpacity={0.8}
        disabled={disabled}
        className={cn(
          'flex-row items-center justify-center gap-2',
          variantStyle.container,
          sizeStyle.container,
          disabled && 'opacity-50',
          className
        )}
        style={style}
        {...props}
      >
        {isLoading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'primary' || variant === 'danger' ? '#fff' : '#1a1a1a'}
          />
        ) : (
          <>
            {leftIcon && (
              <React.Fragment>
                {React.isValidElement(leftIcon)
                  ? React.cloneElement(leftIcon as React.ReactElement, {
                      className: cn(variantStyle.icon, (leftIcon as React.ReactElement).props.className),
                    })
                  : leftIcon}
              </React.Fragment>
            )}
            {typeof children === 'string' ? (
              <RNText
                className={cn(
                  variantStyle.text,
                  sizeStyle.text,
                  textClassName
                )}
              >
                {children}
              </RNText>
            ) : (
              children
            )}
            {rightIcon && (
              <React.Fragment>
                {React.isValidElement(rightIcon)
                  ? React.cloneElement(rightIcon as React.ReactElement, {
                      className: cn(variantStyle.icon, (rightIcon as React.ReactElement).props.className),
                    })
                  : rightIcon}
              </React.Fragment>
            )}
          </>
        )}
      </TouchableOpacity>
    );
  }
);

Button.displayName = 'Button';
