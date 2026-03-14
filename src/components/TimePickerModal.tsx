import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Modal,
  Dimensions,
  FlatList,
} from 'react-native';
import { Text } from './ui/Text';
import { Button } from './ui/Button';
import { cn } from '../utils/cn';

interface TimePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (time: string) => void;
  initialTime?: string; // Format: "HH:MM"
}

const { width } = Dimensions.get('window');
const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;

// Generate 10 copies of 0-23 for hours (total 240 items)
const hourOptions = Array.from({ length: 240 }, (_, i) => i % 24);
// Generate 10 copies of 0-59 for minutes (total 600 items)
const minuteOptions = Array.from({ length: 600 }, (_, i) => i % 60);

// Calculate initial indices (start at middle copy - 5th)
const getInitialHourIndex = (hour: number) => 120 + hour; // 5*24 + hour
const getInitialMinuteIndex = (minute: number) => 300 + minute; // 5*60 + minute

export const TimePickerModal: React.FC<TimePickerModalProps> = ({
  visible,
  onClose,
  onConfirm,
  initialTime = '09:00',
}) => {
  const [hours, setHours] = useState(9);
  const [minutes, setMinutes] = useState(0);
  const [selectedHourIndex, setSelectedHourIndex] = useState(0);
  const [selectedMinuteIndex, setSelectedMinuteIndex] = useState(0);

  const hourListRef = useRef<FlatList>(null);
  const minuteListRef = useRef<FlatList>(null);

  // Parse initial time when modal opens
  useEffect(() => {
    if (visible && initialTime) {
      const [h, m] = initialTime.split(':').map(Number);
      const hour = isNaN(h) ? 9 : h;
      const minute = isNaN(m) ? 0 : m;
      setHours(hour);
      setMinutes(minute);
      setSelectedHourIndex(getInitialHourIndex(hour));
      setSelectedMinuteIndex(getInitialMinuteIndex(minute));
    }
  }, [visible, initialTime]);

  const handleConfirm = () => {
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    onConfirm(formattedTime);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const handleHourChange = (index: number) => {
    setSelectedHourIndex(index);
    setHours(hourOptions[index]);
  };

  const handleMinuteChange = (index: number) => {
    setSelectedMinuteIndex(index);
    setMinutes(minuteOptions[index]);
  };

  const renderHourItem = ({ item, index }: { item: number; index: number }) => {
    const isSelected = index === selectedHourIndex;
    return (
      <TouchableOpacity
        className={cn(
          "h-11 justify-center items-center",
          isSelected && "bg-background-input rounded-lg"
        )}
        onPress={() => {
          handleHourChange(index);
          hourListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
        }}
      >
        <Text
          className={cn(
            "text-xl font-semibold",
            isSelected ? "text-text font-bold" : "text-text-muted"
          )}
        >
          {item.toString().padStart(2, '0')}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderMinuteItem = ({ item, index }: { item: number; index: number }) => {
    const isSelected = index === selectedMinuteIndex;
    return (
      <TouchableOpacity
        className={cn(
          "h-11 justify-center items-center",
          isSelected && "bg-background-input rounded-lg"
        )}
        onPress={() => {
          handleMinuteChange(index);
          minuteListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
        }}
      >
        <Text
          className={cn(
            "text-xl font-semibold",
            isSelected ? "text-text font-bold" : "text-text-muted"
          )}
        >
          {item.toString().padStart(2, '0')}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-5">
        <View
          className="bg-background-card rounded-2xl p-6 items-center"
          style={{ width: Math.min(width - 40, 320) }}
        >
          <Text variant="h4" className="mb-5">Select Time</Text>

          <View
            className="flex-row items-center justify-center mb-5"
            style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }}
          >
            {/* Hours Picker */}
            <View className="items-center w-[100px] overflow-hidden" style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }}>
              <FlatList
                ref={hourListRef}
                data={hourOptions}
                renderItem={renderHourItem}
                keyExtractor={(_, index) => `hour-${index}`}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                getItemLayout={(_, index) => ({
                  length: ITEM_HEIGHT,
                  offset: ITEM_HEIGHT * index,
                  index,
                })}
                onMomentumScrollEnd={(event) => {
                  const y = event.nativeEvent.contentOffset.y;
                  const index = Math.round(y / ITEM_HEIGHT);
                  handleHourChange(index);
                }}
                contentContainerStyle={{
                  paddingVertical: ITEM_HEIGHT * ((VISIBLE_ITEMS - 1) / 2),
                }}
                initialScrollIndex={selectedHourIndex}
                className="w-[100px]"
                style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }}
              />
            </View>

            {/* Separator */}
            <Text className="text-2xl font-bold text-text mx-2 mb-2.5">:</Text>

            {/* Minutes Picker */}
            <View className="items-center w-[100px] overflow-hidden" style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }}>
              <FlatList
                ref={minuteListRef}
                data={minuteOptions}
                renderItem={renderMinuteItem}
                keyExtractor={(_, index) => `minute-${index}`}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                getItemLayout={(_, index) => ({
                  length: ITEM_HEIGHT,
                  offset: ITEM_HEIGHT * index,
                  index,
                })}
                onMomentumScrollEnd={(event) => {
                  const y = event.nativeEvent.contentOffset.y;
                  const index = Math.round(y / ITEM_HEIGHT);
                  handleMinuteChange(index);
                }}
                contentContainerStyle={{
                  paddingVertical: ITEM_HEIGHT * ((VISIBLE_ITEMS - 1) / 2),
                }}
                initialScrollIndex={selectedMinuteIndex}
                className="w-[100px]"
                style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }}
              />
            </View>
          </View>

          <View className="flex-row justify-between w-full">
            <Button
              variant="secondary"
              size="md"
              onPress={handleCancel}
              className="flex-1 mr-2"
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              size="md"
              onPress={handleConfirm}
              className="flex-1 ml-2"
            >
              Done
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};
