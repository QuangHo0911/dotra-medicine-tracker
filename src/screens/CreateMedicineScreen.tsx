import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Clock, XCircle, Plus } from 'lucide-react-native';
import { Stepper } from '../components/Stepper';
import { TimePickerModal } from '../components/TimePickerModal';
import { useMedicine } from '../context/MedicineContext';
import { MedicineFormData } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type CreateMedicineScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface CreateMedicineScreenProps {
  navigation: CreateMedicineScreenNavigationProp;
}

export const CreateMedicineScreen: React.FC<CreateMedicineScreenProps> = ({ navigation }) => {
  const { createMedicine } = useMedicine();
  const [name, setName] = useState('');
  const [timesPerDay, setTimesPerDay] = useState(1);
  const [durationDays, setDurationDays] = useState(7);
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [reminderTimes, setReminderTimes] = useState<string[]>(['09:00']);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [editingTimeIndex, setEditingTimeIndex] = useState<number | null>(null);

  const handleAddReminderTime = useCallback(() => {
    if (reminderTimes.length < timesPerDay) {
      setReminderTimes(prev => [...prev, '09:00']);
    }
  }, [reminderTimes.length, timesPerDay]);

  const handleRemoveReminderTime = useCallback((index: number) => {
    setReminderTimes(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleReminderTimeChange = useCallback((index: number, time: string) => {
    setReminderTimes(prev => {
      const updated = [...prev];
      updated[index] = time;
      return updated;
    });
  }, []);

  const handleTimePress = useCallback((index: number) => {
    setEditingTimeIndex(index);
    setTimePickerVisible(true);
  }, []);

  const handleTimeConfirm = useCallback((time: string) => {
    if (editingTimeIndex !== null) {
      handleReminderTimeChange(editingTimeIndex, time);
    }
    setEditingTimeIndex(null);
  }, [editingTimeIndex, handleReminderTimeChange]);

  const handleTimePickerClose = useCallback(() => {
    setTimePickerVisible(false);
    setEditingTimeIndex(null);
  }, []);

  const validate = useCallback((): boolean => {
    const newErrors: { name?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = 'Please enter a medicine name';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name]);

  const handleSave = useCallback(async () => {
    if (!validate()) {
      Alert.alert('Error', 'Please fix the errors before saving');
      return;
    }

    setIsSaving(true);
    try {
      const data: MedicineFormData = {
        name: name.trim(),
        timesPerDay,
        durationDays,
        remindersEnabled,
        reminderTimes: remindersEnabled ? reminderTimes : undefined,
      };

      const newMedicine = await createMedicine(data);
      
      // Show success feedback
      Alert.alert(
        'Success',
        `"${newMedicine.name}" has been added successfully!`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error creating medicine:', error);
      Alert.alert(
        'Error',
        'Failed to create medicine. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSaving(false);
    }
  }, [name, timesPerDay, durationDays, remindersEnabled, reminderTimes, createMedicine, navigation, validate]);

  const handleTimesPerDayChange = useCallback((value: number) => {
    setTimesPerDay(value);
    // Adjust reminder times if needed
    setReminderTimes(prev => {
      if (value < prev.length) {
        return prev.slice(0, value);
      }
      return prev;
    });
  }, []);

  // Memoize form validity
  const isFormValid = useMemo(() => {
    return name.trim().length > 0 && timesPerDay >= 1 && durationDays >= 1;
  }, [name, timesPerDay, durationDays]);

  return (
    <ScrollView 
      style={styles.container} 
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.form}>
        {/* Medicine Name */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Medicine Details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errors.name) setErrors({});
              }}
              placeholder="e.g., Vitamin D, Ibuprofen"
              maxLength={50}
              autoFocus
            />
            {errors.name && (
              <Text style={styles.errorText}>{errors.name}</Text>
            )}
            <Text style={styles.characterCount}>{name.length}/50</Text>
          </View>
        </View>

        {/* Schedule */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Schedule</Text>
          
          <View style={styles.stepperRow}>
            <Stepper
              label="Times per day"
              value={timesPerDay}
              onChange={handleTimesPerDayChange}
              min={1}
              max={10}
            />
          </View>

          <View style={styles.stepperRow}>
            <Stepper
              label="Duration (days)"
              value={durationDays}
              onChange={setDurationDays}
              min={1}
              max={7}
              upgradeMessage="Maximum duration is 7 days. Upgrade for longer tracking."
              showUpgrade={true}
            />
          </View>
        </View>

        {/* Reminders */}
        <View style={styles.card}>
          <View style={styles.reminderHeader}>
            <View>
              <Text style={styles.cardTitle}>Reminders</Text>
              <Text style={styles.reminderSubtitle}>Get notified when it's time</Text>
            </View>
            <Switch
              value={remindersEnabled}
              onValueChange={setRemindersEnabled}
              trackColor={{ false: '#e0e0e0', true: '#81c784' }}
              thumbColor={remindersEnabled ? '#4CAF50' : '#fff'}
            />
          </View>

          {remindersEnabled && (
            <View style={styles.reminderTimesContainer}>
              {reminderTimes.map((time, index) => (
                <View key={index} style={styles.reminderTimeRow}>
                  <TouchableOpacity
                    style={styles.timeDisplayContainer}
                    onPress={() => handleTimePress(index)}
                    activeOpacity={0.7}
                  >
                    <Clock size={20} color="#666" />
                    <Text style={styles.timeDisplayText}>{time}</Text>
                  </TouchableOpacity>
                  {reminderTimes.length > 1 && (
                    <TouchableOpacity
                      onPress={() => handleRemoveReminderTime(index)}
                      style={styles.removeTimeButton}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <XCircle size={24} color="#f44336" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              {reminderTimes.length < timesPerDay && (
                <TouchableOpacity
                  style={styles.addTimeButton}
                  onPress={handleAddReminderTime}
                  activeOpacity={0.7}
                >
                  <View style={styles.addTimeIcon}>
                    <Plus size={16} color="#fff" />
                  </View>
                  <Text style={styles.addTimeText}>Add reminder time</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton, 
            (!isFormValid || isSaving) && styles.saveButtonDisabled
          ]}
          onPress={handleSave}
          disabled={!isFormValid || isSaving}
          activeOpacity={0.8}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Create Medicine</Text>
          )}
        </TouchableOpacity>
      </View>

      <TimePickerModal
        visible={timePickerVisible}
        onClose={handleTimePickerClose}
        onConfirm={handleTimeConfirm}
        initialTime={editingTimeIndex !== null ? reminderTimes[editingTimeIndex] : '09:00'}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    paddingBottom: 32,
  },
  form: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  inputError: {
    borderColor: '#f44336',
    backgroundColor: '#fff5f5',
  },
  errorText: {
    fontSize: 12,
    color: '#f44336',
    marginTop: 6,
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 6,
  },
  stepperRow: {
    marginBottom: 16,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  reminderSubtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: -12,
    marginBottom: 16,
  },
  reminderTimesContainer: {
    marginTop: 8,
  },
  reminderTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeDisplayContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fafafa',
  },
  timeDisplayText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  removeTimeButton: {
    marginLeft: 12,
    padding: 4,
  },
  addTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 4,
  },
  addTimeIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  addTimeText: {
    fontSize: 15,
    color: '#4CAF50',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: '#a5d6a7',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});
