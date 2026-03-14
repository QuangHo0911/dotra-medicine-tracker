import React from 'react';
import {
  Modal as RNModal,
  View,
  Text as RNText,
  TouchableOpacity,
  type ModalProps as RNModalProps,
  type ViewProps,
} from 'react-native';
import { cn } from '../../utils/cn';

export interface ModalProps extends Omit<RNModalProps, 'visible'> {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  className,
  animationType = 'fade',
  transparent = true,
  ...props
}) => {
  return (
    <RNModal
      visible={isOpen}
      transparent={transparent}
      animationType={animationType}
      onRequestClose={onClose}
      {...props}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        className="flex-1 bg-black/30 justify-center items-center p-6"
      >
        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
          <View
            className={cn(
              'bg-background-card rounded-2xl p-6 w-full max-w-sm',
              'rounded-continuous',
              'shadow-xl',
              className
            )}
          >
            {children}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </RNModal>
  );
};

// Modal sub-components
export const ModalHeader: React.FC<ViewProps & { className?: string }> = ({
  children,
  className,
  ...props
}) => (
  <View className={cn('mb-4', className)} {...props}>
    {children}
  </View>
);

export const ModalContent: React.FC<ViewProps & { className?: string }> = ({
  children,
  className,
  ...props
}) => (
  <View className={cn('mb-6', className)} {...props}>
    {children}
  </View>
);

export const ModalFooter: React.FC<ViewProps & { className?: string }> = ({
  children,
  className,
  ...props
}) => (
  <View className={cn('flex-row justify-end gap-3', className)} {...props}>
    {children}
  </View>
);

// Action Menu Modal (for dropdowns/menus)
export interface ActionMenuProps {
  isVisible: boolean;
  onClose: () => void;
  items: {
    label: string;
    onPress: () => void;
    icon?: React.ReactNode;
    variant?: 'default' | 'danger';
    disabled?: boolean;
  }[];
  className?: string;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({
  isVisible,
  onClose,
  items,
  className,
}) => {
  return (
    <RNModal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        className="flex-1 bg-transparent"
      >
        <View
          className={cn(
            'absolute bg-background-card rounded-2xl py-2 px-1 min-w-[140px]',
            'rounded-continuous',
            'shadow-dropdown',
            className
          )}
        >
          {items.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                if (!item.disabled) {
                  item.onPress();
                  onClose();
                }
              }}
              disabled={item.disabled}
              className={cn(
                'flex-row items-center py-3 px-4 rounded-xl gap-3',
                item.disabled && 'opacity-50',
                item.variant === 'danger'
                  ? 'active:bg-danger-light'
                  : 'active:bg-neutral-100'
              )}
            >
              {item.icon && (
                <View
                  className={cn(
                    item.variant === 'danger' ? 'text-danger' : 'text-text-secondary'
                  )}
                >
                  {item.icon}
                </View>
              )}
              <RNText
                className={cn(
                  'text-base font-semibold',
                  item.variant === 'danger' ? 'text-danger' : 'text-text'
                )}
              >
                {item.label}
              </RNText>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </RNModal>
  );
};
