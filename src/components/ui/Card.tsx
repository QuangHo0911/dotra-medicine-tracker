import React from 'react';
import { View, Text as RNText, type ViewProps } from 'react-native';
import { cn } from '../../utils/cn';

export type CardVariant = 'default' | 'completed' | 'highlighted' | 'outlined';

export interface CardProps extends ViewProps {
  variant?: CardVariant;
  isPressable?: boolean;
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-background-card shadow-card',
  completed: 'bg-success-light shadow-sm',
  highlighted: 'bg-info-light border border-info',
  outlined: 'bg-background-card border border-border shadow-sm',
};

export const Card = React.forwardRef<View, CardProps>(
  (
    {
      variant = 'default',
      isPressable = false,
      className,
      children,
      style,
      ...props
    },
    ref
  ) => {
    return (
      <View
        ref={ref}
        className={cn(
          'rounded p-5',
          'rounded-continuous',
          variantStyles[variant],
          isPressable && 'active:opacity-90',
          className
        )}
        style={style}
        {...props}
      >
        {children}
      </View>
    );
  }
);

Card.displayName = 'Card';

// Card sub-components for structured layouts
export const CardHeader: React.FC<ViewProps & { className?: string }> = ({
  children,
  className,
  ...props
}) => (
  <View className={cn('flex-row items-start justify-between mb-3', className)} {...props}>
    {children}
  </View>
);

export const CardContent: React.FC<ViewProps & { className?: string }> = ({
  children,
  className,
  ...props
}) => (
  <View className={cn('', className)} {...props}>
    {children}
  </View>
);

export const CardFooter: React.FC<ViewProps & { className?: string }> = ({
  children,
  className,
  ...props
}) => (
  <View
    className={cn(
      'flex-row items-center justify-between mt-4 pt-4 border-t border-border-light',
      className
    )}
    {...props}
  >
    {children}
  </View>
);

// Badge component for card labels
export interface BadgeProps extends ViewProps {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  className?: string;
  children: React.ReactNode;
}

const badgeVariantStyles: Record<string, string> = {
  default: 'bg-neutral-100 text-neutral-700',
  primary: 'bg-primary-100 text-primary-700',
  success: 'bg-success-light text-success',
  warning: 'bg-warning-light text-warning',
  danger: 'bg-danger-light text-danger',
  info: 'bg-info-light text-info-dark',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  className,
  children,
  ...props
}) => {
  return (
    <View
      className={cn(
        'self-start rounded-full items-center justify-center',
        size === 'sm' ? 'px-2.5 py-1' : 'px-3 py-1.5',
        badgeVariantStyles[variant],
        className
      )}
      {...props}
    >
      {typeof children === 'string' ? (
        <RNText className={cn(
          'font-semibold',
          size === 'sm' ? 'text-xs' : 'text-sm'
        )}>
          {children}
        </RNText>
      ) : (
        children
      )}
    </View>
  );
};
