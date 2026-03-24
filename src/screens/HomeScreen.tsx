import React, { useCallback, useMemo, useState } from 'react';
import { Dimensions, FlatList, Modal, Pressable, RefreshControl, Text, View } from 'react-native';
import { ChevronDown, Plus, Sparkles } from 'lucide-react-native';
import { Flame } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { Medicine, RootStackParamList } from '../types';
import { useMedicine } from '../context/MedicineContext';
import { MedicineCard } from '../components/MedicineCard';
import { CalendarStrip } from '../components/CalendarStrip';
import { getCurrentStreak, getStreakDates, getToday } from '../utils/dateUtils';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const DAY_SIZE = Math.floor((SCREEN_WIDTH - 48 - 12) / 7);

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { medicines, refreshMedicines, getDailySummary } = useMedicine();
  const [refreshing, setRefreshing] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [viewedMonth, setViewedMonth] = useState(new Date());
  const streakDates = useMemo(() => getStreakDates(medicines), [medicines]);
  const summary = useMemo(() => getDailySummary(getToday()), [getDailySummary]);
  const streak = useMemo(() => getCurrentStreak(medicines), [medicines]);
  const today = new Date();

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshMedicines();
    } finally {
      setRefreshing(false);
    }
  };

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(viewedMonth);
    const monthEnd = endOfMonth(viewedMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [viewedMonth]);

  const handleSelectDate = useCallback((_date: Date) => {
    setCalendarOpen(false);
  }, []);

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
        <Pressable
          onPress={() => { setViewedMonth(new Date()); setCalendarOpen(true); }}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 22 }}
        >
          <Text style={{ color: '#FFF', fontSize: 22, fontWeight: '700' }}>
            {format(today, 'MMMM yyyy')}
          </Text>
          <ChevronDown size={20} color="rgba(255,255,255,0.8)" />
        </Pressable>
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

      {/* Calendar bottom drawer */}
      <Modal visible={calendarOpen} transparent animationType="slide" onRequestClose={() => setCalendarOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' }} onPress={() => setCalendarOpen(false)} />
        <View style={{ backgroundColor: '#FFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: 40 }}>
          <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 8 }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#D9D5CD' }} />
          </View>

          {/* Month navigation */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 12 }}>
            <Pressable onPress={() => setViewedMonth((m) => subMonths(m, 1))} style={{ padding: 8 }}>
              <Text style={{ fontSize: 20, color: '#024039' }}>‹</Text>
            </Pressable>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#141414' }}>
              {format(viewedMonth, 'MMMM yyyy')}
            </Text>
            <Pressable onPress={() => setViewedMonth((m) => addMonths(m, 1))} style={{ padding: 8 }}>
              <Text style={{ fontSize: 20, color: '#024039' }}>›</Text>
            </Pressable>
          </View>

          {/* Weekday headers */}
          <View style={{ flexDirection: 'row', paddingHorizontal: 24, marginBottom: 4 }}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <View key={i} style={{ width: DAY_SIZE, alignItems: 'center' }}>
                <Text style={{ color: '#6B6B6B', fontSize: 12, fontWeight: '600' }}>{d}</Text>
              </View>
            ))}
          </View>

          {/* Day grid */}
          <View style={{ paddingHorizontal: 24 }}>
            {Array.from({ length: Math.ceil(calendarDays.length / 7) }).map((_, weekIdx) => (
              <View key={weekIdx} style={{ flexDirection: 'row', marginBottom: 2 }}>
                {calendarDays.slice(weekIdx * 7, weekIdx * 7 + 7).map((day) => {
                  const isToday = isSameDay(day, today);
                  const inMonth = isSameMonth(day, viewedMonth);
                  const hasStreak = streakDates.some((sd) => isSameDay(parseISO(sd), day));

                  return (
                    <Pressable
                      key={day.toISOString()}
                      onPress={() => handleSelectDate(day)}
                      style={{
                        width: DAY_SIZE,
                        height: DAY_SIZE,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: DAY_SIZE / 2,
                        backgroundColor: isToday ? '#024039' : 'transparent',
                      }}
                    >
                      {hasStreak && inMonth ? (
                        <Flame size={18} color={isToday ? '#FFB24D' : '#C85C1B'} fill={isToday ? '#FFB24D' : '#C85C1B'} />
                      ) : (
                        <Text
                          style={{
                            fontSize: 15,
                            fontWeight: isToday ? '700' : '500',
                            color: isToday ? '#FFF' : inMonth ? '#141414' : '#C8C5BE',
                          }}
                        >
                          {format(day, 'd')}
                        </Text>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
};
