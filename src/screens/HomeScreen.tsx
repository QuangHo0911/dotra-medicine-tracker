import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MedicineCard } from '../components/MedicineCard';
import { useMedicine } from '../context/MedicineContext';
import { Medicine, RootStackParamList } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { medicines, isLoading, refreshMedicines } = useMedicine();
  const [refreshing, setRefreshing] = useState(false);

  const activeMedicines = medicines.filter((m) => m.status === 'active');
  const completedMedicines = medicines.filter((m) => m.status === 'completed');

  const handleEdit = (medicine: Medicine) => {
    navigation.navigate('EditMedicine', { medicineId: medicine.id });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshMedicines();
    setRefreshing(false);
  };

  const renderMedicine = ({ item }: { item: Medicine }) => (
    <MedicineCard medicine={item} onEdit={handleEdit} />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="pill" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No Medicines Yet</Text>
      <Text style={styles.emptySubtitle}>
        Tap the + button to add your first medicine
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={medicines}
        renderItem={renderMedicine}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={() =>
          medicines.length > 0 ? (
            <View style={styles.header}>
              <Text style={styles.headerTitle}>
                {activeMedicines.length} Active • {completedMedicines.length} Completed
              </Text>
            </View>
          ) : null
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateMedicine')}
      >
        <MaterialCommunityIcons name="plus" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    paddingVertical: 8,
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
