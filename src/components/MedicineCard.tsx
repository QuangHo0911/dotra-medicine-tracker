import React, { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, Text, View } from 'react-native';
import { MoreVertical, Pencil, Pill, Trash2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Medicine, RootStackParamList } from '../types';
import { useMedicine } from '../context/MedicineContext';
import { formatTime, getToday } from '../utils/dateUtils';

interface Props {
  medicine: Medicine;
  onEdit: (medicine: Medicine) => void;
}

export const MedicineCard: React.FC<Props> = ({ medicine, onEdit }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { checkMedicine, uncheckMedicine, deleteMedicine } = useMedicine();
  const [menuVisible, setMenuVisible] = useState(false);
  const today = getToday();
  const todayChecks = medicine.checks[today] || 0;
  const isTodayComplete = todayChecks >= medicine.timesPerDay;
  const primaryTime = medicine.reminderTimes?.[0] ? formatTime(medicine.reminderTimes[0]) : `${medicine.timesPerDay} dose${medicine.timesPerDay > 1 ? 's' : ''}`;

  const progressDots = useMemo(() => Array.from({ length: medicine.timesPerDay }, (_, index) => index < todayChecks), [medicine.timesPerDay, todayChecks]);

  const handleCheck = async () => {
    const summary = await checkMedicine(medicine.id, today);
    if (summary) {
      navigation.navigate('Completion', { summary });
    }
  };

  const handleDelete = () => {
    setMenuVisible(false);
    Alert.alert('Delete medicine', `Delete "${medicine.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => deleteMedicine(medicine.id),
      },
    ]);
  };

  return (
    <View style={{ backgroundColor: isTodayComplete ? '#F8F9F7' : '#FFFFFF', borderRadius: 24, padding: 20, overflow: 'hidden' }}>
      <View style={{ position: 'absolute', right: -12, bottom: -12, width: 96, height: 96, borderRadius: 48, borderWidth: 12, borderColor: '#F1EEE7', opacity: 0.7 }} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', gap: 14, flex: 1 }}>
          <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: '#E4DDCB', alignItems: 'center', justifyContent: 'center' }}>
            <Pill size={24} color="#024039" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#141414', fontSize: 20, fontWeight: '600', marginBottom: 4 }}>{medicine.name}</Text>
            <Text style={{ color: '#6B6B6B', fontSize: 14 }}>{medicine.timesPerDay} dose{medicine.timesPerDay > 1 ? 's' : ''} · {medicine.durationDays} days</Text>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 10 }}>
          <View style={{ backgroundColor: '#F1EEE7', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999 }}>
            <Text style={{ color: '#141414', fontSize: 12, fontWeight: '700' }}>{primaryTime}</Text>
          </View>
          <Pressable onPress={() => setMenuVisible(true)} style={{ padding: 4 }}>
            <MoreVertical color="#6B6B6B" size={20} />
          </Pressable>
        </View>
      </View>
      <View style={{ height: 1, backgroundColor: 'rgba(0,0,0,0.06)', marginHorizontal: -20, marginBottom: 16 }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ color: isTodayComplete ? '#0A655A' : '#141414', fontSize: 14, fontWeight: '600' }}>
          {isTodayComplete ? 'Daily dose complete' : `${todayChecks} of ${medicine.timesPerDay} doses taken`}
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {progressDots.map((filled, index) => {
            const canToggle = index === todayChecks || (filled && index === todayChecks - 1);
            return (
              <Pressable
                key={`${medicine.id}-${index}`}
                onPress={filled ? () => uncheckMedicine(medicine.id, today) : handleCheck}
                disabled={!canToggle}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  borderWidth: 2,
                  borderColor: filled ? '#024039' : '#E4DDCB',
                  backgroundColor: filled ? '#024039' : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: canToggle ? 1 : 0.65,
                }}
              >
                {filled ? <Text style={{ color: '#FFF', fontWeight: '700' }}>✓</Text> : null}
              </Pressable>
            );
          })}
        </View>
      </View>

      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.18)', justifyContent: 'center', padding: 24 }} onPress={() => setMenuVisible(false)}>
          <View style={{ marginLeft: 'auto', width: 180, backgroundColor: '#FFF', borderRadius: 20, padding: 8 }}>
            <Pressable onPress={() => { setMenuVisible(false); onEdit(medicine); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
              <Pencil size={18} color="#141414" />
              <Text style={{ color: '#141414', fontWeight: '600' }}>Edit</Text>
            </Pressable>
            <Pressable onPress={handleDelete} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
              <Trash2 size={18} color="#C73B2A" />
              <Text style={{ color: '#C73B2A', fontWeight: '600' }}>Delete</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};
