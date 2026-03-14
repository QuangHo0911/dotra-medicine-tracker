import React from 'react';
import { View } from 'react-native';
import { Button } from './Button';

export interface BottomActionBarProps {
  onCancel: () => void;
  onPrimaryAction: () => void;
  primaryActionLabel: string;
  isLoading?: boolean;
  isDisabled?: boolean;
}

export const BottomActionBar: React.FC<BottomActionBarProps> = ({
  onCancel,
  onPrimaryAction,
  primaryActionLabel,
  isLoading = false,
  isDisabled = false,
}) => {
  return (
    <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-border px-4 pt-4 pb-safe">
      <View className="flex-row gap-3">
        <Button
          variant="secondary"
          size="lg"
          onPress={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          size="lg"
          isLoading={isLoading}
          isDisabled={isDisabled}
          onPress={onPrimaryAction}
          className="flex-[1.5]"
        >
          {primaryActionLabel}
        </Button>
      </View>
    </View>
  );
};
