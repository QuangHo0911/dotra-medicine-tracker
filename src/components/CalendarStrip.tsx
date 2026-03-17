import React, { useMemo, useRef } from 'react';
import { FlatList, Text, View } from 'react-native';
import { Flame } from 'lucide-react-native';
import { format, isSameDay, parseISO } from 'date-fns';
import { getCalendarDates } from '../utils/dateUtils';

interface CalendarStripProps {
  streakDates: string[];
}

export const CalendarStrip: React.FC<CalendarStripProps> = ({ streakDates }) => {
  const dates = useMemo(() => getCalendarDates(new Date()), []);
  const listRef = useRef<FlatList<Date>>(null);
  const today = new Date();
  const todayIndex = dates.findIndex((date) => isSameDay(date, today));

  React.useEffect(() => {
    if (todayIndex >= 0) {
      requestAnimationFrame(() => {
        listRef.current?.scrollToIndex({ index: Math.max(todayIndex - 2, 0), animated: false });
      });
    }
  }, [todayIndex]);

  return (
    <FlatList
      ref={listRef}
      data={dates}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.toISOString()}
      contentContainerStyle={{ paddingHorizontal: 4, gap: 10 }}
      getItemLayout={(_, index) => ({ length: 56, offset: 56 * index, index })}
      renderItem={({ item }) => {
        const streak = streakDates.some((date) => isSameDay(parseISO(date), item));
        const active = isSameDay(item, today);

        return (
          <View
            style={{
              width: 46,
              paddingVertical: 10,
              borderRadius: 999,
              alignItems: 'center',
              backgroundColor: active ? '#E4DDCB' : 'transparent',
            }}
          >
            <Text style={{ color: active ? '#141414' : 'rgba(255,255,255,0.72)', fontSize: 12, fontWeight: '600', marginBottom: 4 }}>
              {format(item, 'EEEEE')}
            </Text>
            {streak ? (
              <Flame size={18} color={active ? '#C85C1B' : '#FFB24D'} fill={active ? '#C85C1B' : '#FFB24D'} />
            ) : (
              <Text style={{ color: active ? '#141414' : '#FFFFFF', fontSize: 16, fontWeight: '700' }}>{format(item, 'd')}</Text>
            )}
          </View>
        );
      }}
    />
  );
};
