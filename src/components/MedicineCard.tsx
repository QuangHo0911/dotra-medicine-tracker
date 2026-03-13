import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Menu } from 'react-native-paper';
import { Medicine } from '../types';
import { CircleCarousel } from './CircleCarousel';
import { ConfettiCelebration } from './ConfettiCelebration';
import { useMedicine } from '../context/MedicineContext';
import { getToday, getCompletionPercentage, getDayProgress } from '../utils/dateUtils';

interface MedicineCardProps {
  medicine: Medicine;
  onEdit: (medicine: Medicine) => void;
}

export const MedicineCard: React.FC<MedicineCardProps> = ({ medicine, onEdit }) => {
  const { checkMedicine, uncheckMedicine, deleteMedicine } = useMedicine();
  const [menuVisible, setMenuVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const today = getToday();
  const todayChecks = medicine.checks[today] || 0;
  const isCompleted = medicine.status === 'completed';
  const progress = getCompletionPercentage(medicine);
  const dayProgress = getDayProgress(medicine.startDate, medicine.durationDays);

  const handleCheck = async () => {
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
  };

  const handleUncheck = async () => {
    await uncheckMedicine(medicine.id, today);
  };

  const handleEdit = () => {
    setMenuVisible(false);
    onEdit(medicine);
  };

  const handleDelete = () => {
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
  };

  const getCardBackgroundColor = () => {
    if (isCompleted) return '#E8F5E9';
    if (todayChecks >= medicine.timesPerDay) return '#F1F8E9';
    return '#fff';
  };

  return (
    <View style={[styles.container, { backgroundColor: getCardBackgroundColor() }]}>
      <ConfettiCelebration
        trigger={showConfetti}
        onComplete={() => setShowConfetti(false)}
      />

      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.name}>{medicine.name}</Text>
          <Text style={styles.progress}>
            Day {dayProgress} of {medicine.durationDays} • {progress}% complete
          </Text>
        </View>

        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <TouchableOpacity
              onPress={() => setMenuVisible(true)}
              style={styles.menuButton}
            >
              <MaterialCommunityIcons name="dots-vertical" size={24} color="#666" />
            </TouchableOpacity>
          }
        >
          <Menu.Item onPress={handleEdit} title="Edit" leadingIcon="pencil" />
          <Menu.Item onPress={handleDelete} title="Delete" leadingIcon="delete" />
        </Menu>
      </View>

      <View style={styles.carouselContainer}>
        <CircleCarousel
          totalDoses={medicine.timesPerDay}
          checkedDoses={todayChecks}
          onToggleCheck={handleCheck}
          onToggleUncheck={handleUncheck}
        />
      </View>

      {isCompleted && (
        <View style={styles.completedBadge}>
          <MaterialCommunityIcons name="check-circle" size={16} color="#4CAF50" />
          <Text style={styles.completedText}>Completed!</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  progress: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  menuButton: {
    padding: 4,
  },
  carouselContainer: {
    marginVertical: 8,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#c8e6c9',
  },
  completedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 4,
  },
});
