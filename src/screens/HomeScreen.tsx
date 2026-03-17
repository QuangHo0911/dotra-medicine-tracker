import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { Plus, Sparkles } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Medicine, RootStackParamList } from '../types';
import { useMedicine } from '../context/MedicineContext';
import { useAuth } from '../context/AuthContext';
import { MedicineCard } from '../components/MedicineCard';
import { CalendarStrip } from '../components/CalendarStrip';
import { InitialsAvatar } from '../components/InitialsAvatar';
import { formatHeaderDate, getCurrentStreak, getStreakDates, getToday } from '../utils/dateUtils';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { medicines, refreshMedicines, getDailySummary } = useMedicine();
  const { profile } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const streakDates = useMemo(() => getStreakDates(medicines), [medicines]);
  const summary = useMemo(() => getDailySummary(getToday()), [getDailySummary]);
  const streak = useMemo(() => getCurrentStreak(medicines), [medicines]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshMedicines();
    } finally {
      setRefreshing(false);
    }
  };

  const renderItem = ({ item }: { item: Medicine }) => (
    <MedicineCard
      medicine={item}
      onEdit={(medicine) => navigation.navigate('EditMedicine', { medicineId: medicine.id })}
    />
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F1EEE7' }}>
      <View
        style={{
          backgroundColor: '#024039',
          paddingTop: 56,
          paddingHorizontal: 24,
          paddingBottom: 22,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <View>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 4 }}>
              {formatHeaderDate(new Date())}
            </Text>
            <Text style={{ color: '#FFF', fontSize: 32, fontWeight: '600' }}>My Medicines</Text>
          </View>
          <InitialsAvatar initials={profile?.initials || 'DT'} avatarUrl={profile?.avatarUrl} />
        </View>
        <CalendarStrip streakDates={streakDates} />
      </View>

      <FlatList
        data={medicines}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#024039" />}
        contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 160, flexGrow: medicines.length === 0 ? 1 : undefined }}
        ListHeaderComponent={
          medicines.length ? (
            <View style={{ backgroundColor: '#FFF', borderRadius: 24, padding: 20 }}>
              <Text style={{ color: '#6B6B6B', fontSize: 14, marginBottom: 6 }}>Today</Text>
              <Text style={{ color: '#141414', fontSize: 28, fontWeight: '700', marginBottom: 12 }}>
                {summary.completedDoses} / {summary.totalDoses || 0} doses
              </Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1, backgroundColor: '#F8F9F7', borderRadius: 18, padding: 14 }}>
                  <Text style={{ color: '#6B6B6B', fontSize: 12, textTransform: 'uppercase', marginBottom: 4 }}>
                    Progress
                  </Text>
                  <Text style={{ color: '#024039', fontSize: 20, fontWeight: '700' }}>{summary.progressPercentage}%</Text>
                </View>
                <View style={{ flex: 1, backgroundColor: '#F8F9F7', borderRadius: 18, padding: 14 }}>
                  <Text style={{ color: '#6B6B6B', fontSize: 12, textTransform: 'uppercase', marginBottom: 4 }}>
                    Streak
                  </Text>
                  <Text style={{ color: '#024039', fontSize: 20, fontWeight: '700' }}>
                    {streak} day{streak === 1 ? '' : 's'}
                  </Text>
                </View>
              </View>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
            <View
              style={{
                width: 240,
                height: 240,
                borderRadius: 120,
                backgroundColor: 'rgba(255,255,255,0.45)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 28,
              }}
            >
              <View
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 24,
                  backgroundColor: '#E4DDCB',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: [{ rotate: '-10deg' }],
                }}
              >
                <Sparkles size={52} color="#024039" />
              </View>
              <View
                style={{
                  position: 'absolute',
                  top: 28,
                  right: 18,
                  backgroundColor: '#FFF',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 999,
                }}
              >
                <Text style={{ color: '#0A655A', fontWeight: '700', fontSize: 12 }}>Health</Text>
              </View>
              <View
                style={{
                  position: 'absolute',
                  left: 8,
                  bottom: 38,
                  backgroundColor: '#FFF',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 999,
                }}
              >
                <Text style={{ color: '#0A655A', fontWeight: '700', fontSize: 12 }}>Daily</Text>
              </View>
            </View>
            <Text style={{ color: '#141414', fontSize: 28, fontWeight: '700', marginBottom: 10 }}>
              Your kit is empty
            </Text>
            <Text
              style={{
                color: '#6B6B6B',
                fontSize: 16,
                textAlign: 'center',
                lineHeight: 24,
                marginBottom: 26,
              }}
            >
              Add your medications to receive reminders and stay on track with your health journey.
            </Text>
            <Pressable
              onPress={() => navigation.navigate('CreateMedicine')}
              style={{ backgroundColor: '#024039', borderRadius: 999, paddingVertical: 18, paddingHorizontal: 28 }}
            >
              <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '700' }}>Add Your First Medicine</Text>
            </Pressable>
          </View>
        }
      />

      <Pressable
        onPress={() => navigation.navigate('CreateMedicine')}
        style={{
          position: 'absolute',
          right: 24,
          bottom: 112,
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: '#024039',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Plus color="#FFF" size={28} />
      </Pressable>
    </View>
  );
};
