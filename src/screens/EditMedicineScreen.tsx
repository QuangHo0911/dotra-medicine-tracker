import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stepper } from '../components/Stepper';
import { useMedicine } from '../context/MedicineContext';
import { MedicineFormData, RootStackParamList } from '../types';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';

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
        <Text style={styles.errorText}>Medicine not found</Text>
      </View>
    );
  }

  const handleAddReminderTime = () => {
    if (reminderTimes.length < timesPerDay) {
      setReminderTimes([...reminderTimes, '09:00']);
    }
  };

  const handleRemoveReminderTime = (index: number) => {
    setReminderTimes(reminderTimes.filter((_, i) => i !== index));
  };

  const handleReminderTimeChange = (index: number, time: string) => {
    const updated = [...reminderTimes];
    updated[index] = time;
    setReminderTimes(updated);
  };

  const validate = (): boolean => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a medicine name');
      return false;
    }
    if (timesPerDay < 1) {
      Alert.alert('Error', 'Times per day must be at least 1');
      return false;
    }
    if (durationDays < 1) {
      Alert.alert('Error', 'Duration must be at least 1 day');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

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
      navigation.goBack();
    } catch (error) {
      console.error('Error updating medicine:', error);
      Alert.alert('Error', 'Failed to update medicine. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Medicine',
      `Are you sure you want to delete "${medicine.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteMedicine(medicineId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Medicine Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g., Vitamin D, Ibuprofen"
            maxLength={50}
          />
        </View>

        <View style={styles.inputGroup}>
          <Stepper
            label="Times per day"
            value={timesPerDay}
            onChange={(value) => {
              setTimesPerDay(value);
              if (value < reminderTimes.length) {
                setReminderTimes(reminderTimes.slice(0, value));
              }
            }}
            min={1}
            max={10}
          />
        </View>

        <View style={styles.inputGroup}>
          <Stepper
            label="Duration (days)"
            value={durationDays}
            onChange={setDurationDays}
            min={1}
            max={365}
          />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.reminderHeader}>
            <Text style={styles.label}>Reminders</Text>
            <Switch
              value={remindersEnabled}
              onValueChange={setRemindersEnabled}
              trackColor={{ false: '#767577', true: '#81c784' }}
              thumbColor={remindersEnabled ? '#4CAF50' : '#f4f3f4'}
            />
          </View>

          {remindersEnabled && (
            <View style={styles.reminderTimesContainer}>
              {reminderTimes.map((time, index) => (
                <View key={index} style={styles.reminderTimeRow}>
                  <TextInput
                    style={styles.timeInput}
                    value={time}
                    onChangeText={(text) => handleReminderTimeChange(index, text)}
                    placeholder="HH:MM"
                    maxLength={5}
                  />
                  {reminderTimes.length > 1 && (
                    <TouchableOpacity
                      onPress={() => handleRemoveReminderTime(index)}
                      style={styles.removeTimeButton}
                    >
                      <MaterialCommunityIcons name="close" size={20} color="#f44336" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              {reminderTimes.length < timesPerDay && (
                <TouchableOpacity
                  style={styles.addTimeButton}
                  onPress={handleAddReminderTime}
                >
                  <MaterialCommunityIcons name="plus" size={16} color="#4CAF50" />
                  <Text style={styles.addTimeText}>Add reminder time</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Saving...' : 'Update Medicine'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
        >
          <MaterialCommunityIcons name="delete" size={18} color="#f44336" />
          <Text style={styles.deleteButtonText}>Delete Medicine</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reminderTimesContainer: {
    marginTop: 12,
  },
  reminderTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  removeTimeButton: {
    marginLeft: 8,
    padding: 4,
  },
  addTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  addTimeText: {
    marginLeft: 4,
    color: '#4CAF50',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#a5d6a7',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 12,
  },
  deleteButtonText: {
    color: '#f44336',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
    marginTop: 20,
  },
});
