import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  FlatList,
} from 'react-native';

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
        style={[styles.timeItem, isSelected && styles.timeItemSelected]}
        onPress={() => {
          handleHourChange(index);
          hourListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
        }}
      >
        <Text style={[styles.timeItemText, isSelected && styles.timeItemTextSelected]}>
          {item.toString().padStart(2, '0')}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderMinuteItem = ({ item, index }: { item: number; index: number }) => {
    const isSelected = index === selectedMinuteIndex;
    return (
      <TouchableOpacity
        style={[styles.timeItem, isSelected && styles.timeItemSelected]}
        onPress={() => {
          handleMinuteChange(index);
          minuteListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
        }}
      >
        <Text style={[styles.timeItemText, isSelected && styles.timeItemTextSelected]}>
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
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Select Time</Text>

          <View style={styles.pickersContainer}>
            {/* Hours Picker */}
            <View style={styles.pickerWrapper}>
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
                style={styles.flatList}
              />
            </View>

            {/* Separator */}
            <Text style={styles.separator}>:</Text>

            {/* Minutes Picker */}
            <View style={styles.pickerWrapper}>
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
                style={styles.flatList}
              />
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={handleCancel}
              style={[styles.button, styles.cancelButton]}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleConfirm}
              style={[styles.button, styles.confirmButton]}
              activeOpacity={0.7}
            >
              <Text style={styles.confirmButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: Math.min(width - 40, 320),
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  pickersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    marginBottom: 20,
  },
  pickerWrapper: {
    alignItems: 'center',
    width: 100,
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    overflow: 'hidden',
  },
  flatList: {
    width: 100,
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
  },
  timeItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeItemSelected: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  timeItemText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#999',
  },
  timeItemTextSelected: {
    color: '#1a1a1a',
    fontWeight: '700',
  },
  separator: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginHorizontal: 8,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    marginLeft: 8,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
