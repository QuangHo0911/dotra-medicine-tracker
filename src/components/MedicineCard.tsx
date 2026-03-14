import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
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
    <View style={[styles.container, cardStyle]}>
      <ConfettiCelebration
        trigger={showConfetti}
        onComplete={() => setShowConfetti(false)}
      />

      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={styles.nameRow}>
            <View style={[styles.iconContainer, { backgroundColor: progressColor + '20' }]}>
              <Pill size={20} color={progressColor} />
            </View>
            <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
              {medicine.name}
            </Text>
          </View>
          
          <View style={styles.metaRow}>
            <Text style={styles.progressText}>
              Day {dayProgress}/{medicine.durationDays}
            </Text>
          </View>
        </View>

        <View ref={menuButtonRef}>
          <TouchableOpacity
            onPress={openMenu}
            style={styles.menuButton}
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
            style={styles.menuOverlay}
            activeOpacity={1}
            onPress={closeMenu}
          >
            <Animated.View
              style={[
                styles.menuContainer,
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
            >
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleEdit}
                activeOpacity={0.7}
              >
                <Pencil size={18} color="#666" />
                <Text style={styles.menuItemText}>Edit</Text>
              </TouchableOpacity>
              <View style={styles.menuDivider} />
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleDelete}
                activeOpacity={0.7}
              >
                <Trash2 size={18} color="#ef5350" />
                <Text style={[styles.menuItemText, styles.menuItemTextDanger]}>Delete</Text>
              </TouchableOpacity>
            </Animated.View>
          </TouchableOpacity>
        </Modal>
      </View>

      <View style={styles.carouselContainer}>
        <Text style={styles.carouselLabel}>
          Today's doses ({todayChecks}/{medicine.timesPerDay})
        </Text>
        <CircleCarousel
          totalDoses={medicine.timesPerDay}
          checkedDoses={todayChecks}
          onToggleCheck={handleCheck}
          onToggleUncheck={handleUncheck}
        />

        {/* Reminder Time Badges */}
        {medicine.remindersEnabled && medicine.reminderTimes && medicine.reminderTimes.length > 0 && (
          <View style={styles.reminderBadgesContainer}>
            {medicine.reminderTimes.map((time, index) => (
              <View key={index} style={styles.reminderBadge}>
                <Text style={styles.reminderBadgeText}>{time}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {isCompleted && (
        <View style={styles.completedBadge}>
          <CheckCircle size={18} color="#4CAF50" />
          <Text style={styles.completedText}>Course completed!</Text>
        </View>
      )}
    </View>
  );
});

MedicineCard.displayName = 'MedicineCard';

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  progressText: {
    fontSize: 13,
    color: '#666',
  },
  menuButton: {
    padding: 4,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 4,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 12,
  },
  menuItemTextDanger: {
    color: '#ef5350',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 12,
  },
  carouselContainer: {
    marginTop: 4,
  },
  carouselLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
    fontWeight: '500',
  },
  reminderBadgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  reminderBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#bbdefb',
  },
  reminderBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1976d2',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#c8e6c9',
  },
  completedText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4CAF50',
    marginLeft: 6,
  },
});
