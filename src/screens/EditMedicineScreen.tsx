import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stepper } from '../components/Stepper';
import { TimePickerModal } from '../components/TimePickerModal';
import { useMedicine } from '../context/MedicineContext';
import { MedicineFormData, RootStackParamList } from '../types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type EditMedicineScreenProps = NativeStackScreenProps<RootStackParamList, 'EditMedicine'>;

export const EditMedicineScreen: React.FC<EditMedicineScreenProps> = ({ route, navigation }) => {
  const { medicineId } = route.params;
  const { getMedicine, updateMedicine, deleteMedicine } = useMedicine();
  const medicine = getMedicine(medicineId);

  const [name, setName] = useState('');
  const [timesPerDay, setTimesPerDay] = useState(1);
  const [durationDays, setDurationDays] = useState(7);
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [reminderTimes, setReminderTimes] = useState<string[]>(['09:00']);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [editingTimeIndex, setEditingTimeIndex] = useState<number | null>(null);

  useEffect(() => {
    if (medicine) {
      setName(medicine.name);
      setTimesPerDay(medicine.timesPerDay);
      setDurationDays(medicine.durationDays);
      setRemindersEnabled(medicine.remindersEnabled);
      setReminderTimes(medicine.reminderTimes || ['09:00']);
    }
  }, [medicine]);

  if (!medicine) {
    return (
      <View style={styles.container}>
        <View style={styles.notFoundContainer}>
          <MaterialCommunityIcons name="alert-circle" size={64} color="#f44336" />
          <Text style={styles.errorText}>Medicine not found</Text>
          <TouchableOpacity
            style={styles.goBackButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.goBackButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
      const data: Partial<MedicineFormData> = {
        name: name.trim(),
        timesPerDay,
        durationDays,
        remindersEnabled,
        reminderTimes: remindersEnabled ? reminderTimes : undefined,
      };

      await updateMedicine(medicineId, data);
      
      Alert.alert(
        'Success',
        `"${name.trim()}" has been updated!`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error updating medicine:', error);
      Alert.alert('Error', 'Failed to update medicine. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [name, timesPerDay, durationDays, remindersEnabled, reminderTimes, medicineId, updateMedicine, navigation, validate]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Delete Medicine',
      `Are you sure you want to delete "${medicine.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMedicine(medicineId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete medicine. Please try again.');
            }
          },
        },
      ]
    );
  }, [deleteMedicine, medicineId, medicine?.name, navigation]);

  const handleTimesPerDayChange = useCallback((value: number) => {
    setTimesPerDay(value);
    setReminderTimes(prev => {
      if (value < prev.length) {
        return prev.slice(0, value);
      }
      return prev;
    });
  }, []);

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
              max={365}
              upgradeMessage="Maximum duration is 365 days. Upgrade for longer tracking."
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
                    <MaterialCommunityIcons name="clock-outline" size={20} color="#666" />
                    <Text style={styles.timeDisplayText}>{time}</Text>
                  </TouchableOpacity>
                  {reminderTimes.length > 1 && (
                    <TouchableOpacity
                      onPress={() => handleRemoveReminderTime(index)}
                      style={styles.removeTimeButton}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <MaterialCommunityIcons name="close-circle" size={24} color="#f44336" />
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
                    <MaterialCommunityIcons name="plus" size={16} color="#fff" />
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
            <Text style={styles.saveButtonText}>Update Medicine</Text>
          )}
        </TouchableOpacity>

        {/* Delete Button */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="delete-outline" size={20} color="#f44336" />
          <Text style={styles.deleteButtonText}>Delete Medicine</Text>
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
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
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
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#ffcdd2',
    backgroundColor: '#fff',
  },
  deleteButtonText: {
    color: '#f44336',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
  goBackButton: {
    marginTop: 24,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  goBackButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
