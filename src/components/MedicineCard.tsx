import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Alert,
  Dimensions,
  Modal,
  Animated,
} from 'react-native';
import { Pill, MoreVertical, CheckCircle, Pencil, Trash2 } from 'lucide-react-native';
import { Medicine } from '../types';
import { CircleCarousel } from './CircleCarousel';
import { ConfettiCelebration } from './ConfettiCelebration';
import { useMedicine } from '../context/MedicineContext';
import { getToday, getDayProgress } from '../utils/dateUtils';
import { Text } from './ui/Text';
import { Badge } from './ui/Card';
import { cn } from '../utils/cn';

interface MedicineCardProps {
  medicine: Medicine;
  onEdit: (medicine: Medicine) => void;
}

const { width } = Dimensions.get('window');

export const MedicineCard: React.FC<MedicineCardProps> = React.memo(({ medicine, onEdit }) => {
  const { checkMedicine, uncheckMedicine, deleteMedicine } = useMedicine();
  const [menuVisible, setMenuVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const menuAnimation = useRef(new Animated.Value(0)).current;
  const menuButtonRef = useRef<View>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const openMenu = useCallback(() => {
    menuButtonRef.current?.measure((x, y, width, height, pageX, pageY) => {
      setMenuPosition({ x: pageX - 100, y: pageY + height + 8 });
      setMenuVisible(true);
      Animated.spring(menuAnimation, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
        tension: 100,
      }).start();
    });
  }, [menuAnimation]);

  const closeMenu = useCallback(() => {
    Animated.timing(menuAnimation, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setMenuVisible(false);
    });
  }, [menuAnimation]);

  const today = getToday();
  const todayChecks = medicine.checks[today] || 0;
  const isCompleted = medicine.status === 'completed';
  const dayProgress = getDayProgress(medicine.startDate, medicine.durationDays);

  const handleCheck = useCallback(async () => {
    const wasCompleted = isCompleted;
    await checkMedicine(medicine.id, today);

    // Show confetti if medicine just became completed
    if (!wasCompleted && todayChecks + 1 >= medicine.timesPerDay) {
      const updatedChecks = { ...medicine.checks, [today]: todayChecks + 1 };
      const allDatesChecked = Object.keys(updatedChecks).length >= medicine.durationDays;
      if (allDatesChecked) {
        setShowConfetti(true);
      }
    }
  }, [isCompleted, todayChecks, medicine.id, medicine.timesPerDay, medicine.checks, medicine.durationDays, checkMedicine, today]);

  const handleUncheck = useCallback(async () => {
    await uncheckMedicine(medicine.id, today);
  }, [uncheckMedicine, medicine.id, today]);

  const handleEdit = useCallback(() => {
    closeMenu();
    onEdit(medicine);
  }, [onEdit, medicine, closeMenu]);

  const handleDelete = useCallback(() => {
    closeMenu();
    Alert.alert(
      'Delete Medicine',
      `Are you sure you want to delete "${medicine.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteMedicine(medicine.id);
          },
        },
      ]
    );
  }, [deleteMedicine, medicine.id, medicine.name, closeMenu]);

  // Memoize card background color
  const cardStyle = useMemo(() => {
    let backgroundColor = '#fff';
    if (isCompleted) backgroundColor = '#e8f5e9';
    else if (todayChecks >= medicine.timesPerDay) backgroundColor = '#f1f8e9';

    return { backgroundColor };
  }, [isCompleted, todayChecks, medicine.timesPerDay]);

  // Memoize progress color based on daily completion
  const progressColor = useMemo(() => {
    const dailyProgress = (todayChecks / medicine.timesPerDay) * 100;
    if (dailyProgress >= 80) return '#4CAF50';
    if (dailyProgress >= 50) return '#FF9800';
    return '#2196F3';
  }, [todayChecks, medicine.timesPerDay]);

  return (
    <View
      style={cardStyle}
      className="mx-4 my-2 p-5 rounded shadow-card"
    >
      <ConfettiCelebration
        trigger={showConfetti}
        onComplete={() => setShowConfetti(false)}
      />

      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1 mr-2">
          <View className="flex-row items-center mb-2">
            <View
              className="w-9 h-9 rounded justify-center items-center mr-3"
              style={{ backgroundColor: progressColor + '20' }}
            >
              <Pill size={20} color={progressColor} />
            </View>
            <Text
              variant="h4"
              className="flex-1"
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {medicine.name}
            </Text>
          </View>

        </View>

        <View ref={menuButtonRef}>
          <TouchableOpacity
            onPress={openMenu}
            className="p-1"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MoreVertical size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Custom Popover Menu */}
        <Modal
          visible={menuVisible}
          transparent
          animationType="none"
          onRequestClose={closeMenu}
        >
          <TouchableOpacity
            className="flex-1 bg-transparent"
            activeOpacity={1}
            onPress={closeMenu}
          >
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  top: menuPosition.y,
                  left: menuPosition.x,
                  opacity: menuAnimation,
                  transform: [{
                    scale: menuAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  }],
                },
              ]}
              className="bg-background-card rounded-2xl py-2 px-1 min-w-[140px] shadow-dropdown"
            >
              <TouchableOpacity
                className="flex-row items-center py-3 px-4 rounded-xl"
                onPress={handleEdit}
                activeOpacity={0.7}
              >
                <Pencil size={18} color="#666" />
                <Text className="text-[15px] font-semibold ml-3">Edit</Text>
              </TouchableOpacity>
              <View className="h-px bg-border mx-3" />
              <TouchableOpacity
                className="flex-row items-center py-3 px-4 rounded-xl"
                onPress={handleDelete}
                activeOpacity={0.7}
              >
                <Trash2 size={18} color="#ef5350" />
                <Text className="text-[15px] font-semibold ml-3 text-danger">Delete</Text>
              </TouchableOpacity>
            </Animated.View>
          </TouchableOpacity>
        </Modal>
      </View>

      <View>
        {/* Stats Row - Day and Doses side by side */}
        <View className="flex-row mb-4">
          {/* Day Stat */}
          <View className="mr-8">
            <Text className="text-sm font-semibold text-text-secondary mb-1">
              Day
            </Text>
            <Text variant="h2" className="text-text-primary">
              {dayProgress}<Text className="text-base font-normal text-text-secondary"> /{medicine.durationDays}</Text>
            </Text>
          </View>

          {/* Doses Stat */}
          <View>
            <Text className="text-sm font-semibold text-text-secondary mb-1">
              Doses
            </Text>
            <Text variant="h2" className="text-text-primary">
              {todayChecks}<Text className="text-base font-normal text-text-secondary"> /{medicine.timesPerDay}</Text>
            </Text>
          </View>
        </View>

        <CircleCarousel
          totalDoses={medicine.timesPerDay}
          checkedDoses={todayChecks}
          onToggleCheck={handleCheck}
          onToggleUncheck={handleUncheck}
        />

        {/* Reminder Time Badges */}
        {medicine.remindersEnabled && medicine.reminderTimes && medicine.reminderTimes.length > 0 && (
          <View className="flex-row flex-wrap gap-2 mt-3 pt-3 border-t border-border">
            {medicine.reminderTimes.map((time, index) => (
              <Badge key={index} variant="info" size="sm">
                {time}
              </Badge>
            ))}
          </View>
        )}
      </View>

      {isCompleted && (
        <View className="flex-row items-center mt-4 pt-3 border-t border-success/30">
          <CheckCircle size={18} color="#4CAF50" />
          <Text className="text-sm font-bold text-success ml-1.5">
            Course completed!
          </Text>
        </View>
      )}
    </View>
  );
});

MedicineCard.displayName = 'MedicineCard';
