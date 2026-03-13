import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  value,
  onChange,
  min = 1,
  max = 10,
  label,
}) => {
  const decrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const increment = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.stepperContainer}>
        <TouchableOpacity
          onPress={decrement}
          disabled={value <= min}
          style={[styles.button, value <= min && styles.buttonDisabled]}
        >
          <MaterialCommunityIcons
            name="minus"
            size={20}
            color={value <= min ? '#ccc' : '#fff'}
          />
        </TouchableOpacity>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{value}</Text>
        </View>
        <TouchableOpacity
          onPress={increment}
          disabled={value >= max}
          style={[styles.button, value >= max && styles.buttonDisabled]}
        >
          <MaterialCommunityIcons
            name="plus"
            size={20}
            color={value >= max ? '#ccc' : '#fff'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  valueContainer: {
    width: 60,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  value: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
});
