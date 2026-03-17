import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, Clock, Pill, Plus, XCircle } from 'lucide-react-native';
import { Stepper } from '../components/Stepper';
import { TimePickerModal } from '../components/TimePickerModal';
import { useMedicine } from '../context/MedicineContext';
import { MedicineFormData, RootStackParamList } from '../types';
import { Text } from '../components/ui/Text';
import { BottomActionBar } from '../components/ui/BottomActionBar';

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
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [editingTimeIndex, setEditingTimeIndex] = useState<number | null>(null);

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
      const data: MedicineFormData = {
        name: name.trim(),
        timesPerDay,
        durationDays,
        remindersEnabled,
        reminderTimes: remindersEnabled ? reminderTimes : undefined,
      };

      const newMedicine = await createMedicine(data);
      Alert.alert('Success', `"${newMedicine.name}" has been added successfully.`, [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (error) {
      console.error('Error creating medicine:', error);
      Alert.alert('Error', 'Failed to create medicine. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [createMedicine, durationDays, name, navigation, reminderTimes, remindersEnabled, timesPerDay, validate]);

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
                Create medicine
              </Text>
              <Text style={{ color: '#FFF', fontSize: 31, fontWeight: '700', lineHeight: 38, marginBottom: 10 }}>
                Shape a routine that feels easy.
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.82)', fontSize: 15, lineHeight: 22 }}>
                Keep only the essentials: name, daily cadence, duration, and reminder times that actually help.
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
              Use a clear name so it stays instantly recognizable on your home list.
            </Text>

            <Text style={{ color: '#024039', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
              Required field
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
              autoFocus
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
                {errors.name || 'Example: “Vitamin D” keeps the card clean and scannable.'}
              </Text>
              <Text style={{ color: '#8E8A80', fontSize: 12, fontWeight: '700' }}>{name.length}/200</Text>
            </View>
          </View>

          <View style={{ backgroundColor: '#FFF', borderRadius: 28, padding: 20 }}>
            <Text style={{ color: '#141414', fontSize: 22, fontWeight: '700', marginBottom: 4 }}>Schedule</Text>
            <Text style={{ color: '#6B6B6B', fontSize: 14, lineHeight: 21, marginBottom: 16 }}>
              Set how often the medicine appears each day and how long the plan should run.
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
                  Turn reminders on only if scheduled nudges make the routine easier to keep.
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
                    Add up to {timesPerDay} reminder time{timesPerDay === 1 ? '' : 's'} so each daily dose has a matching nudge.
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
                  Reminders are off. You can still track every dose manually from the home screen.
                </Text>
              </View>
            )}
          </View>
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
        primaryActionLabel="Save Medicine"
        isLoading={isSaving}
        isDisabled={!isFormValid}
      />
    </View>
  );
};
