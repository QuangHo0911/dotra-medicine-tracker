import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
  }, []);

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
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.stepperContainer}>
        <TouchableOpacity
          onPress={decrement}
          disabled={isAtMin}
          style={[styles.button, isAtMin && styles.buttonDisabled]}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialCommunityIcons
            name="minus"
            size={20}
            color={isAtMin ? '#ccc' : '#fff'}
          />
        </TouchableOpacity>

        <View style={[styles.valueContainer, isEditing && styles.valueContainerActive]}>
          <TextInput
            ref={inputRef}
            style={styles.valueInput}
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
          style={[styles.button, isAtMax && styles.buttonDisabled]}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialCommunityIcons
            name="plus"
            size={20}
            color={isAtMax ? '#ccc' : '#fff'}
          />
        </TouchableOpacity>
      </View>

      {/* Upgrade Callout */}
      {showUpgradeCallout && upgradeMessage && (
        <TouchableOpacity
          style={styles.upgradeCallout}
          onPress={handleUpgradePress}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="alert" size={16} color="#f59e0b" />
          <Text style={styles.upgradeText}>{upgradeMessage}</Text>
          <MaterialCommunityIcons name="chevron-right" size={16} color="#f59e0b" />
        </TouchableOpacity>
      )}
    </View>
  );
});

Stepper.displayName = 'Stepper';

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
    fontWeight: '600',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#e0e0e0',
    shadowOpacity: 0,
    elevation: 0,
  },
  valueContainer: {
    minWidth: 70,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
  },
  valueContainerActive: {
    borderColor: '#4CAF50',
    backgroundColor: '#fff',
  },
  valueInput: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    minWidth: 50,
    padding: 0,
  },
  upgradeCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 12,
  },
  upgradeText: {
    flex: 1,
    fontSize: 13,
    color: '#92400e',
    marginLeft: 8,
    fontWeight: '500',
  },
});
