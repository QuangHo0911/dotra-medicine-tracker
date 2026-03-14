import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Pill, Plus } from 'lucide-react-native';
import { MedicineCard } from '../components/MedicineCard';
import { useMedicine } from '../context/MedicineContext';
import { Medicine, RootStackParamList } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card } from '../components/ui/Card';
import { Text } from '../components/ui/Text';
import { Button } from '../components/ui/Button';
import { cn } from '../utils/cn';

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
    <View className="flex-1 justify-center items-center px-8">
      <View className="w-36 h-36 rounded-full bg-success-light justify-center items-center mb-6">
        <Pill size={80} color="#4CAF50" />
      </View>
      <Text variant="h3" className="mb-3">No Medicines Yet</Text>
      <Text variant="body" color="secondary" className="text-center mb-6">
        Keep track of your medications and never miss a dose. Tap the button below to add your first medicine.
      </Text>

      <Button
        variant="primary"
        size="md"
        leftIcon={<Plus size={20} color="#fff" />}
        onPress={() => navigation.navigate('CreateMedicine')}
      >
        Add Your First Medicine
      </Button>
    </View>
  ), [navigation]);

  const renderHeader = useCallback(() => {
    if (medicines.length === 0) return null;

    return (
      <View className="px-4 py-3">
        <Card className="flex-row py-4">
          <View className="flex-1 items-center">
            <Text variant="stat">{activeMedicines.length}</Text>
            <Text variant="caption" color="secondary" className="mt-1">Active</Text>
          </View>

          <View className="w-px bg-border mx-3" />

          <View className="flex-1 items-center">
            <Text variant="stat">{completedMedicines.length}</Text>
            <Text variant="caption" color="secondary" className="mt-1">Completed</Text>
          </View>

          <View className="w-px bg-border mx-3" />

          <View className="flex-1 items-center">
            <Text variant="stat">{medicines.length}</Text>
            <Text variant="caption" color="secondary" className="mt-1">Total</Text>
          </View>
        </Card>
      </View>
    );
  }, [medicines.length, activeMedicines.length, completedMedicines.length]);

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={medicines}
        renderItem={renderMedicine}
        keyExtractor={keyExtractor}
        contentContainerClassName={cn(
          "py-3 flex-grow",
          medicines.length === 0 && "justify-center"
        )}
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
          className="absolute right-5 bottom-5 w-16 h-16 rounded-full bg-primary justify-center items-center shadow-fab active:opacity-80"
          onPress={() => navigation.navigate('CreateMedicine')}
          activeOpacity={0.8}
        >
          <Plus size={28} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
};

