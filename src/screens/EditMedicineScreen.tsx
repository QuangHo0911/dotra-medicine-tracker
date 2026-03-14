import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { AlertCircle, Clock, XCircle, Plus, Trash2 } from 'lucide-react-native';
import { Stepper } from '../components/Stepper';
import { TimePickerModal } from '../components/TimePickerModal';
import { useMedicine } from '../context/MedicineContext';
import { MedicineFormData, RootStackParamList } from '../types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Card } from '../components/ui/Card';
import { Text } from '../components/ui/Text';
import { Button } from '../components/ui/Button';
import { cn } from '../utils/cn';

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
      <View className="flex-1 bg-background justify-center items-center px-8">
        <AlertCircle size={64} color="#ef5350" />
        <Text variant="h4" color="secondary" className="mt-4">Medicine not found</Text>
        <Button
          variant="primary"
          size="md"
          onPress={() => navigation.goBack()}
          className="mt-6"
        >
          Go Back
        </Button>
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
      className="flex-1 bg-background"
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="pb-8"
    >
      <View className="p-4">
        {/* Medicine Name */}
        <Card className="mb-4">
          <Text variant="h4" className="mb-4">Medicine Details</Text>

          <View className="mb-2">
            <Text variant="label">
              <Text className="text-danger">*</Text> Medicine Name
            </Text>
            <TextInput
              className={cn(
                "border-2 border-border rounded-xl px-4 py-3.5 bg-background-input mt-2 text-base text-text",
                errors.name && "border-danger bg-danger-light"
              )}
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errors.name) setErrors({});
              }}
              placeholder="e.g., Vitamin D, Ibuprofen"
              maxLength={50}
            />
            {errors.name && (
              <Text variant="caption" color="danger" className="mt-2">{errors.name}</Text>
            )}
            <Text variant="caption" color="muted" className="mt-2 text-right">{name.length}/50</Text>
          </View>
        </Card>

        {/* Schedule */}
        <Card className="mb-4">
          <Text variant="h4" className="mb-4">Schedule</Text>

          <View className="mb-4">
            <Stepper
              label="Times per day"
              value={timesPerDay}
              onChange={handleTimesPerDayChange}
              min={1}
              max={10}
            />
          </View>

          <View className="mb-0">
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
        </Card>

        {/* Reminders */}
        <Card className="mb-4">
          <View className="flex-row justify-between items-start mb-4">
            <View>
              <Text variant="h4">Reminders</Text>
              <Text variant="caption" color="muted">Get notified when it's time</Text>
            </View>
            <Switch
              value={remindersEnabled}
              onValueChange={setRemindersEnabled}
              trackColor={{ false: '#e0e0e0', true: '#81c784' }}
              thumbColor={remindersEnabled ? '#4CAF50' : '#fff'}
            />
          </View>

          {remindersEnabled && (
            <View className="mt-2">
              {reminderTimes.map((time, index) => (
                <View key={index} className="flex-row items-center mb-3">
                  <TouchableOpacity
                    className="flex-1 flex-row items-center border-2 border-border rounded-xl px-4 py-3 bg-background-input"
                    onPress={() => handleTimePress(index)}
                    activeOpacity={0.7}
                  >
                    <Clock size={20} color="#666" />
                    <Text className="flex-1 ml-3 text-base font-medium text-text">{time}</Text>
                  </TouchableOpacity>
                  {reminderTimes.length > 1 && (
                    <TouchableOpacity
                      onPress={() => handleRemoveReminderTime(index)}
                      className="ml-3 p-1"
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <XCircle size={24} color="#ef5350" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              {reminderTimes.length < timesPerDay && (
                <TouchableOpacity
                  className="flex-row items-center py-2 mt-1"
                  onPress={handleAddReminderTime}
                  activeOpacity={0.7}
                >
                  <View className="w-7 h-7 rounded-full bg-primary justify-center items-center mr-2.5">
                    <Plus size={16} color="#fff" />
                  </View>
                  <Text className="text-[15px] font-semibold text-primary">Add reminder time</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </Card>

        {/* Save Button */}
        <Button
          variant="primary"
          size="lg"
          isLoading={isSaving}
          isDisabled={!isFormValid}
          onPress={handleSave}
          className="mt-2"
        >
          Update Medicine
        </Button>

        {/* Delete Button */}
        <Button
          variant="outline"
          size="lg"
          leftIcon={<Trash2 size={20} color="#ef5350" />}
          onPress={handleDelete}
          className="mt-3 border-danger"
          textClassName="text-danger"
        >
          Delete Medicine
        </Button>
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
