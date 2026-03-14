import React from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { cn } from '../../utils/cn';

export type TextVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'body'
  | 'body-small'
  | 'caption'
  | 'label'
  | 'stat'
  | 'button';

export type TextColor =
  | 'default'
  | 'secondary'
  | 'muted'
  | 'inverse'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: TextColor;
  weight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  align?: 'left' | 'center' | 'right';
  numberOfLines?: number;
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<TextVariant, string> = {
  h1: 'text-4xl font-bold leading-tight',
  h2: 'text-3xl font-bold leading-tight',
  h3: 'text-2xl font-bold leading-snug',
  h4: 'text-xl font-semibold leading-snug',
  body: 'text-base leading-relaxed',
  'body-small': 'text-sm leading-relaxed',
  caption: 'text-xs leading-normal',
  label: 'text-sm font-semibold uppercase tracking-wide',
  stat: 'text-3xl font-extrabold tabular-nums',
  button: 'text-base font-semibold',
};

const colorStyles: Record<TextColor, string> = {
  default: 'text-text',
  secondary: 'text-text-secondary',
  muted: 'text-text-muted',
  inverse: 'text-white',
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
  info: 'text-info',
};

const weightStyles: Record<string, string> = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
};

const alignStyles: Record<string, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export const Text = React.forwardRef<RNText, TextProps>(
  (
    {
      variant = 'body',
      color = 'default',
      weight,
      align,
      numberOfLines,
      className,
      children,
      style,
      ...props
    },
    ref
  ) => {
    return (
      <RNText
        ref={ref}
        className={cn(
          variantStyles[variant],
          colorStyles[color],
          weight && weightStyles[weight],
          align && alignStyles[align],
          className
        )}
        numberOfLines={numberOfLines}
        style={style}
        {...props}
      >
        {children}
      </RNText>
    );
  }
);

Text.displayName = 'Text';

// Helper components for common text patterns
export const Heading: React.FC<Omit<TextProps, 'variant'>> = ({
  children,
  className,
  ...props
}) => (
  <Text variant="h2" className={className} {...props}>
    {children}
  </Text>
);

export const Subheading: React.FC<Omit<TextProps, 'variant'>> = ({
  children,
  className,
  ...props
}) => (
  <Text variant="h3" className={className} {...props}>
    {children}
  </Text>
);

export const BodyText: React.FC<Omit<TextProps, 'variant'>> = ({
  children,
  className,
  ...props
}) => (
  <Text variant="body" className={className} {...props}>
    {children}
  </Text>
);

export const Caption: React.FC<Omit<TextProps, 'variant'>> = ({
  children,
  className,
  ...props
}) => (
  <Text variant="caption" color="muted" className={className} {...props}>
    {children}
  </Text>
);

export const Label: React.FC<Omit<TextProps, 'variant'>> = ({
  children,
  className,
  ...props
}) => (
  <Text variant="label" className={className} {...props}>
    {children}
  </Text>
);
