import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Minus, Plus, AlertCircle, ChevronRight } from 'lucide-react-native';
import { Text } from './ui/Text';
import { cn } from '../utils/cn';

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  upgradeMessage?: string; // Message shown when exceeding max
  showUpgrade?: boolean;   // Whether to show upgrade callout
}

export const Stepper: React.FC<StepperProps> = React.memo(({
  value,
  onChange,
  min = 1,
  max = 10,
  label,
  upgradeMessage,
  showUpgrade = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());
  const [showUpgradeCallout, setShowUpgradeCallout] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Sync input value with prop value when not editing
  React.useEffect(() => {
    if (!isEditing) {
      setInputValue(value.toString());
    }
  }, [value, isEditing]);

  const decrement = useCallback(() => {
    if (value > min) {
      onChange(value - 1);
      setShowUpgradeCallout(false);
    }
  }, [value, min, onChange]);

  const increment = useCallback(() => {
    if (value < max) {
      onChange(value + 1);
      setShowUpgradeCallout(false);
    }
  }, [value, max, onChange]);

  const handleInputChange = useCallback((text: string) => {
    // Allow only numeric characters
    const numericValue = text.replace(/[^0-9]/g, '');
    setInputValue(numericValue);

    // Show upgrade warning while typing if exceeds max
    if (showUpgrade && upgradeMessage) {
      const num = parseInt(numericValue, 10);
      if (!isNaN(num) && num > max) {
        setShowUpgradeCallout(true);
      } else {
        setShowUpgradeCallout(false);
      }
    }
  }, [showUpgrade, upgradeMessage, max]);

  const handleInputBlur = useCallback(() => {
    setIsEditing(false);

    let numValue = parseInt(inputValue, 10);

    if (isNaN(numValue) || numValue < min) {
      numValue = min;
    } else if (numValue > max) {
      // Show upgrade callout if exceeding max
      if (showUpgrade && upgradeMessage) {
        setShowUpgradeCallout(true);
      }
      numValue = max;
    } else {
      setShowUpgradeCallout(false);
    }

    onChange(numValue);
    setInputValue(numValue.toString());
  }, [inputValue, min, max, onChange, showUpgrade, upgradeMessage]);

  const handleInputFocus = useCallback(() => {
    setIsEditing(true);
    setInputValue(value.toString());
  }, [value]);

  const handleUpgradePress = useCallback(() => {
    Alert.alert('Coming Soon', 'Upgrade feature will be available soon!');
  }, []);

  const isAtMin = value <= min;
  const isAtMax = value >= max;

  return (
    <View className="my-1">
      {label && <Text variant="label" color="secondary" className="mb-3">{label}</Text>}

      <View className="flex-row items-center justify-start">
        <TouchableOpacity
          onPress={decrement}
          disabled={isAtMin}
          className={cn(
            "w-11 h-11 rounded-full bg-primary justify-center items-center shadow-button",
            isAtMin && "bg-border shadow-none"
          )}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Minus
            size={20}
            color={isAtMin ? '#ccc' : '#fff'}
          />
        </TouchableOpacity>

        <View
          className={cn(
            "min-w-[70px] h-12 justify-center items-center mx-4 bg-background-input rounded-xl border-2 border-border",
            isEditing && "border-primary bg-background-card"
          )}
        >
          <TextInput
            ref={inputRef}
            className="text-[22px] font-bold text-text text-center min-w-[50px] p-0"
            value={inputValue}
            onChangeText={handleInputChange}
            onBlur={handleInputBlur}
            onFocus={handleInputFocus}
            keyboardType="number-pad"
            selectTextOnFocus
          />
        </View>

        <TouchableOpacity
          onPress={increment}
          disabled={isAtMax}
          className={cn(
            "w-11 h-11 rounded-full bg-primary justify-center items-center shadow-button",
            isAtMax && "bg-border shadow-none"
          )}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Plus
            size={20}
            color={isAtMax ? '#ccc' : '#fff'}
          />
        </TouchableOpacity>
      </View>

      {/* Upgrade Callout */}
      {showUpgradeCallout && upgradeMessage && (
        <TouchableOpacity
          className="flex-row items-center bg-warning-light rounded-lg px-3 py-2.5 mt-3"
          onPress={handleUpgradePress}
          activeOpacity={0.8}
        >
          <AlertCircle size={16} color="#f59e0b" />
          <Text className="flex-1 text-[13px] text-warning-dark ml-2 font-medium">
            {upgradeMessage}
          </Text>
          <ChevronRight size={16} color="#f59e0b" />
        </TouchableOpacity>
      )}
    </View>
  );
});

Stepper.displayName = 'Stepper';
