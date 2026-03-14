import React, { useState, useCallback } from 'react';
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

  // Memoize filtered lists
  const activeMedicines = React.useMemo(() => 
    medicines.filter((m) => m.status === 'active'),
    [medicines]
  );
  
  const completedMedicines = React.useMemo(() => 
    medicines.filter((m) => m.status === 'completed'),
    [medicines]
  );

  const handleEdit = useCallback((medicine: Medicine) => {
    navigation.navigate('EditMedicine', { medicineId: medicine.id });
  }, [navigation]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshMedicines();
    } finally {
      setRefreshing(false);
    }
  }, [refreshMedicines]);

  const renderMedicine = useCallback(({ item }: { item: Medicine }) => (
    <MedicineCard medicine={item} onEdit={handleEdit} />
  ), [handleEdit]);

  const keyExtractor = useCallback((item: Medicine) => item.id, []);

  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <MaterialCommunityIcons name="pill" size={80} color="#4CAF50" />
      </View>
      <Text style={styles.emptyTitle}>No Medicines Yet</Text>
      <Text style={styles.emptySubtitle}>
        Keep track of your medications and never miss a dose. Tap the button below to add your first medicine.
      </Text>
      
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => navigation.navigate('CreateMedicine')}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="plus" size={20} color="#fff" />
        <Text style={styles.emptyButtonText}>Add Your First Medicine</Text>
      </TouchableOpacity>
    </View>
  ), [navigation]);

  const renderHeader = useCallback(() => {
    if (medicines.length === 0) return null;
    
    return (
      <View style={styles.header}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{activeMedicines.length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{completedMedicines.length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{medicines.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>
      </View>
    );
  }, [medicines.length, activeMedicines.length, completedMedicines.length]);

  return (
    <View style={styles.container}>
      <FlatList
        data={medicines}
        renderItem={renderMedicine}
        keyExtractor={keyExtractor}
        contentContainerStyle={[
          styles.list,
          medicines.length === 0 && styles.emptyList
        ]}
        ListEmptyComponent={renderEmptyState}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#4CAF50"
            colors={['#4CAF50']}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {medicines.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('CreateMedicine')}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="plus" size={28} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  list: {
    paddingVertical: 12,
    flexGrow: 1,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
});
