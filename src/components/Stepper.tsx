import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
}

export const Stepper: React.FC<StepperProps> = React.memo(({
  value,
  onChange,
  min = 1,
  max = 10,
  label,
}) => {
  const decrement = useCallback(() => {
    if (value > min) {
      onChange(value - 1);
    }
  }, [value, min, onChange]);

  const increment = useCallback(() => {
    if (value < max) {
      onChange(value + 1);
    }
  }, [value, max, onChange]);

  const isAtMin = value <= min;
  const isAtMax = value >= max;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.stepperContainer}>
        <TouchableOpacity
          onPress={decrement}
          disabled={isAtMin}
          style={[
            styles.button, 
            isAtMin && styles.buttonDisabled
          ]}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialCommunityIcons
            name="minus"
            size={20}
            color={isAtMin ? '#ccc' : '#fff'}
          />
        </TouchableOpacity>
        
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{value}</Text>
        </View>
        
        <TouchableOpacity
          onPress={increment}
          disabled={isAtMax}
          style={[
            styles.button, 
            isAtMax && styles.buttonDisabled
          ]}
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
  value: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
  },
});
