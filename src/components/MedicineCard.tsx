import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Menu } from 'react-native-paper';
import { Medicine } from '../types';
import { CircleCarousel } from './CircleCarousel';
import { ConfettiCelebration } from './ConfettiCelebration';
import { useMedicine } from '../context/MedicineContext';
import { getToday, getCompletionPercentage, getDayProgress, getDaysRemaining } from '../utils/dateUtils';

interface MedicineCardProps {
  medicine: Medicine;
  onEdit: (medicine: Medicine) => void;
}

const { width } = Dimensions.get('window');

export const MedicineCard: React.FC<MedicineCardProps> = React.memo(({ medicine, onEdit }) => {
  const { checkMedicine, uncheckMedicine, deleteMedicine } = useMedicine();
  const [menuVisible, setMenuVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const today = getToday();
  const todayChecks = medicine.checks[today] || 0;
  const isCompleted = medicine.status === 'completed';
  const progress = getCompletionPercentage(medicine);
  const dayProgress = getDayProgress(medicine.startDate, medicine.durationDays);
  const daysRemaining = getDaysRemaining(medicine.startDate, medicine.durationDays);

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
    setMenuVisible(false);
    onEdit(medicine);
  }, [onEdit, medicine]);

  const handleDelete = useCallback(() => {
    setMenuVisible(false);
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
  }, [deleteMedicine, medicine.id, medicine.name]);

  // Memoize card background color
  const cardStyle = useMemo(() => {
    let backgroundColor = '#fff';
    if (isCompleted) backgroundColor = '#e8f5e9';
    else if (todayChecks >= medicine.timesPerDay) backgroundColor = '#f1f8e9';
    
    return { backgroundColor };
  }, [isCompleted, todayChecks, medicine.timesPerDay]);

  // Memoize progress color
  const progressColor = useMemo(() => {
    if (progress >= 80) return '#4CAF50';
    if (progress >= 50) return '#FF9800';
    return '#2196F3';
  }, [progress]);

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
              <MaterialCommunityIcons name="pill" size={20} color={progressColor} />
            </View>
            <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
              {medicine.name}
            </Text>
          </View>
          
          <View style={styles.metaRow}>
            <Text style={styles.progressText}>
              Day {dayProgress} of {medicine.durationDays}
            </Text>
            <Text style={styles.dot}>•</Text>
            <Text style={[styles.progressPercentage, { color: progressColor }]}>
              {progress}%
            </Text>
            {daysRemaining > 0 && (
              <>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.daysRemaining}>{daysRemaining} days left</Text>
              </>
            )}
          </View>
        </View>

        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <TouchableOpacity
              onPress={() => setMenuVisible(true)}
              style={styles.menuButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons name="dots-vertical" size={24} color="#666" />
            </TouchableOpacity>
          }
        >
          <Menu.Item onPress={handleEdit} title="Edit" leadingIcon="pencil" />
          <Menu.Item onPress={handleDelete} title="Delete" leadingIcon="delete" />
        </Menu>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: progressColor }]} />
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
      </View>

      {isCompleted && (
        <View style={styles.completedBadge}>
          <MaterialCommunityIcons name="check-circle" size={18} color="#4CAF50" />
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
  dot: {
    fontSize: 13,
    color: '#ccc',
    marginHorizontal: 6,
  },
  progressPercentage: {
    fontSize: 13,
    fontWeight: '700',
  },
  daysRemaining: {
    fontSize: 13,
    color: '#888',
  },
  menuButton: {
    padding: 4,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
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
