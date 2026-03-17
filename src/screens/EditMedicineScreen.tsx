import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { AlertCircle, ChevronLeft, Clock, Pill, Plus, Trash2, XCircle } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Stepper } from '../components/Stepper';
import { TimePickerModal } from '../components/TimePickerModal';
import { useMedicine } from '../context/MedicineContext';
import { MedicineFormData, RootStackParamList } from '../types';
import { Text } from '../components/ui/Text';
import { BottomActionBar } from '../components/ui/BottomActionBar';

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
  const [showTimePicker, setShowTimePicker] = useState(false);
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

  const handleAddReminderTime = useCallback(() => {
    if (reminderTimes.length < timesPerDay) {
      setReminderTimes((previous) => [...previous, '09:00']);
    }
  }, [reminderTimes.length, timesPerDay]);

  const handleRemoveReminderTime = useCallback((index: number) => {
    setReminderTimes((previous) => previous.filter((_, reminderIndex) => reminderIndex !== index));
  }, []);

  const handleReminderTimeChange = useCallback((index: number, time: string) => {
    setReminderTimes((previous) => {
      const updated = [...previous];
      updated[index] = time;
      return updated;
    });
  }, []);

  const handleTimePress = useCallback((index: number) => {
    setEditingTimeIndex(index);
    setShowTimePicker(true);
  }, []);

  const handleTimeConfirm = useCallback((time: string) => {
    if (editingTimeIndex !== null) {
      handleReminderTimeChange(editingTimeIndex, time);
    }
  }, [editingTimeIndex, handleReminderTimeChange]);

  const validate = useCallback(() => {
    const nextErrors: { name?: string } = {};

    if (!name.trim()) {
      nextErrors.name = 'Please enter a medicine name';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [name]);

  const handleSave = useCallback(async () => {
    if (!validate()) {
      Alert.alert('Error', 'Please fix the errors before saving.');
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
      Alert.alert('Success', `"${name.trim()}" has been updated.`, [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (error) {
      console.error('Error updating medicine:', error);
      Alert.alert('Error', 'Failed to update medicine. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [durationDays, medicineId, name, navigation, reminderTimes, remindersEnabled, timesPerDay, updateMedicine, validate]);

  const handleDelete = useCallback(() => {
    if (!medicine) {
      return;
    }

    Alert.alert(
      'Delete medicine',
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
  }, [deleteMedicine, medicine, medicineId, navigation]);

  const handleTimesPerDayChange = useCallback((value: number) => {
    setTimesPerDay(value);
    setReminderTimes((previous) => {
      if (value < previous.length) {
        return previous.slice(0, value);
      }
      return previous;
    });
  }, []);

  const isFormValid = useMemo(() => name.trim().length > 0 && timesPerDay >= 1 && durationDays >= 1, [durationDays, name, timesPerDay]);
  const summaryChips = useMemo(
    () => [
      `${timesPerDay}× daily`,
      `${durationDays} day${durationDays === 1 ? '' : 's'}`,
      remindersEnabled ? `${reminderTimes.length} reminder${reminderTimes.length === 1 ? '' : 's'}` : 'Reminders off',
    ],
    [durationDays, reminderTimes.length, remindersEnabled, timesPerDay]
  );

  if (!medicine) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F2EEE6', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28 }}>
        <View style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <AlertCircle size={40} color="#C73B2A" />
        </View>
        <Text style={{ color: '#141414', fontSize: 26, fontWeight: '700', marginBottom: 10 }}>Medicine not found</Text>
        <Text style={{ color: '#6B6B6B', fontSize: 15, lineHeight: 22, textAlign: 'center', marginBottom: 24 }}>
          This medicine may have been removed already or your local list changed before this screen opened.
        </Text>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.85} style={{ backgroundColor: '#024039', borderRadius: 999, paddingHorizontal: 22, paddingVertical: 14 }}>
          <Text style={{ color: '#FFF', fontSize: 15, fontWeight: '700' }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F2EEE6' }}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 132 }}>
        <View
          style={{
            backgroundColor: '#024039',
            paddingTop: 56,
            paddingHorizontal: 20,
            paddingBottom: 28,
            borderBottomLeftRadius: 34,
            borderBottomRightRadius: 34,
            overflow: 'hidden',
          }}
        >
          <View style={{ position: 'absolute', top: -24, right: -12, width: 116, height: 116, borderRadius: 58, backgroundColor: 'rgba(255,255,255,0.08)' }} />
          <View style={{ position: 'absolute', bottom: -54, left: -18, width: 148, height: 148, borderRadius: 74, borderWidth: 20, borderColor: 'rgba(228,221,203,0.12)' }} />

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
            style={{ alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 999, padding: 10, marginBottom: 18 }}
          >
            <ChevronLeft size={18} color="#FFF" />
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', gap: 16, alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: 'rgba(255,255,255,0.72)', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.1, marginBottom: 8 }}>
                Edit medicine
              </Text>
              <Text style={{ color: '#FFF', fontSize: 31, fontWeight: '700', lineHeight: 38, marginBottom: 10 }}>
                Tune the routine without making it noisy.
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.82)', fontSize: 15, lineHeight: 22 }}>
                Keep the same focused setup while adjusting cadence, duration, or the reminder pattern.
              </Text>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
                {summaryChips.map((chip) => (
                  <View key={chip} style={{ backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 }}>
                    <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '700' }}>{chip}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={{ width: 72, height: 72, borderRadius: 24, backgroundColor: '#E4DDCB', alignItems: 'center', justifyContent: 'center', marginTop: 6 }}>
              <Pill size={30} color="#024039" />
            </View>
          </View>
        </View>

        <View style={{ padding: 18, gap: 16 }}>
          <View style={{ backgroundColor: '#FFF8EF', borderRadius: 28, padding: 20 }}>
            <Text style={{ color: '#141414', fontSize: 22, fontWeight: '700', marginBottom: 4 }}>Medicine name</Text>
            <Text style={{ color: '#6B6B6B', fontSize: 14, lineHeight: 21, marginBottom: 16 }}>
              Keep the label familiar so the medicine stays easy to spot at a glance.
            </Text>

            <Text style={{ color: '#141414', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
              <Text style={{ color: '#C73B2A' }}>* </Text>Name
            </Text>
            <TextInput
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errors.name) setErrors({});
              }}
              placeholder="Vitamin D, Ibuprofen, Amoxicillin"
              placeholderTextColor="#8E8A80"
              maxLength={200}
              style={{
                borderWidth: 1.5,
                borderColor: errors.name ? '#C73B2A' : '#DDD5C7',
                backgroundColor: '#FFF',
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 16,
                fontSize: 16,
                color: '#141414',
              }}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
              <Text style={{ color: errors.name ? '#C73B2A' : '#6B6B6B', fontSize: 13 }}>
                {errors.name || 'Short, clear names make daily check-offs faster.'}
              </Text>
              <Text style={{ color: '#8E8A80', fontSize: 12, fontWeight: '700' }}>{name.length}/200</Text>
            </View>
          </View>

          <View style={{ backgroundColor: '#FFF', borderRadius: 28, padding: 20 }}>
            <Text style={{ color: '#141414', fontSize: 22, fontWeight: '700', marginBottom: 4 }}>Schedule</Text>
            <Text style={{ color: '#6B6B6B', fontSize: 14, lineHeight: 21, marginBottom: 16 }}>
              Adjust the cadence or course length while keeping the product scope lean and predictable.
            </Text>

            <View style={{ backgroundColor: '#F7F4EE', borderRadius: 22, padding: 16, marginBottom: 14 }}>
              <Stepper label="Times per day" value={timesPerDay} onChange={handleTimesPerDayChange} min={1} max={10} />
            </View>

            <View style={{ backgroundColor: '#F7F4EE', borderRadius: 22, padding: 16 }}>
              <Stepper
                label="Duration days"
                value={durationDays}
                onChange={setDurationDays}
                min={1}
                max={365}
                upgradeMessage="Maximum duration is 365 days."
                showUpgrade
              />
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
              <View style={{ backgroundColor: '#EEF4EE', borderRadius: 18, paddingHorizontal: 12, paddingVertical: 10 }}>
                <Text style={{ color: '#0A655A', fontSize: 13, fontWeight: '700' }}>{timesPerDay} check-in{timesPerDay === 1 ? '' : 's'} per day</Text>
              </View>
              <View style={{ backgroundColor: '#FFF3E4', borderRadius: 18, paddingHorizontal: 12, paddingVertical: 10 }}>
                <Text style={{ color: '#B15A1B', fontSize: 13, fontWeight: '700' }}>{durationDays} day plan</Text>
              </View>
            </View>
          </View>

          <View style={{ backgroundColor: '#EEF4EE', borderRadius: 28, padding: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 14 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#141414', fontSize: 22, fontWeight: '700', marginBottom: 4 }}>Reminders</Text>
                <Text style={{ color: '#587069', fontSize: 14, lineHeight: 21 }}>
                  Update reminder timing only if a different rhythm would make the routine easier to keep.
                </Text>
              </View>
              <Switch
                value={remindersEnabled}
                onValueChange={setRemindersEnabled}
                trackColor={{ false: '#D8DED8', true: '#9DC7BA' }}
                thumbColor={remindersEnabled ? '#0A655A' : '#FFF'}
              />
            </View>

            {remindersEnabled ? (
              <>
                <View style={{ backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 18, padding: 14, marginBottom: 14 }}>
                  <Text style={{ color: '#0A655A', fontSize: 13, lineHeight: 20 }}>
                    Keep up to {timesPerDay} reminder time{timesPerDay === 1 ? '' : 's'} aligned with the daily dose count.
                  </Text>
                </View>

                {reminderTimes.map((time, index) => (
                  <View key={`${time}-${index}`} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#D7E7DF', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                      <Text style={{ color: '#0A655A', fontSize: 13, fontWeight: '700' }}>{index + 1}</Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => handleTimePress(index)}
                      activeOpacity={0.8}
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        borderRadius: 20,
                        backgroundColor: '#FFF',
                        borderWidth: 1,
                        borderColor: '#C9D9CF',
                        paddingHorizontal: 14,
                        paddingVertical: 14,
                      }}
                    >
                      <Clock size={18} color="#0A655A" />
                      <Text style={{ color: '#141414', fontSize: 16, fontWeight: '700', marginLeft: 10 }}>{time}</Text>
                    </TouchableOpacity>

                    {reminderTimes.length > 1 ? (
                      <TouchableOpacity
                        onPress={() => handleRemoveReminderTime(index)}
                        activeOpacity={0.8}
                        style={{ marginLeft: 10, padding: 4 }}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <XCircle size={24} color="#C73B2A" />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                ))}

                {reminderTimes.length < timesPerDay ? (
                  <TouchableOpacity
                    onPress={handleAddReminderTime}
                    activeOpacity={0.85}
                    style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginTop: 4, backgroundColor: '#0A655A', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 11 }}
                  >
                    <Plus size={16} color="#FFF" />
                    <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '700', marginLeft: 8 }}>Add reminder time</Text>
                  </TouchableOpacity>
                ) : null}
              </>
            ) : (
              <View style={{ backgroundColor: 'rgba(255,255,255,0.72)', borderRadius: 18, padding: 14 }}>
                <Text style={{ color: '#587069', fontSize: 14, lineHeight: 21 }}>
                  Reminders are off. The medicine stays trackable manually from the home screen.
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={handleDelete}
            activeOpacity={0.85}
            style={{ backgroundColor: '#FFF', borderRadius: 24, padding: 18, borderWidth: 1, borderColor: 'rgba(199,59,42,0.18)', flexDirection: 'row', alignItems: 'center', gap: 12 }}
          >
            <Trash2 size={18} color="#C73B2A" />
            <Text style={{ color: '#C73B2A', fontSize: 15, fontWeight: '700' }}>Delete medicine</Text>
          </TouchableOpacity>
        </View>

        <TimePickerModal
          visible={showTimePicker}
          onClose={() => {
            setShowTimePicker(false);
            setEditingTimeIndex(null);
          }}
          onConfirm={handleTimeConfirm}
          initialTime={editingTimeIndex !== null ? reminderTimes[editingTimeIndex] : '09:00'}
        />
      </ScrollView>

      <BottomActionBar
        onCancel={() => navigation.goBack()}
        onPrimaryAction={handleSave}
        primaryActionLabel="Update Medicine"
        isLoading={isSaving}
        isDisabled={!isFormValid}
      />
    </View>
  );
};
