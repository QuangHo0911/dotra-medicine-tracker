import React, { useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Pill, Clock, CheckCircle, Hash, CloudCheck, CloudOff, RefreshCw, ChevronRight, Trash2 } from 'lucide-react-native';
import { useMedicine } from '../context/MedicineContext';
import { clearAllData } from '../services/storage';
import { cancelAllReminders } from '../services/notifications';
import { Card } from '../components/ui/Card';
import { Text } from '../components/ui/Text';
import { cn } from '../utils/cn';

export const SettingsScreen: React.FC = () => {
  const { medicines, userId, syncWithFirebase, isLoading } = useMedicine();

  const handleClearData = useCallback(() => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to delete all medicines? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllData();
              await cancelAllReminders();
              Alert.alert('Success', 'All data has been cleared. Restart the app to see changes.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            }
          },
        },
      ]
    );
  }, []);

  const handleSync = useCallback(async () => {
    try {
      await syncWithFirebase();
      Alert.alert('Success', 'Data synced with cloud successfully!');
    } catch (error) {
      Alert.alert(
        'Sync Failed',
        'Could not sync with cloud. Please check your internet connection and try again.'
      );
    }
  }, [syncWithFirebase]);

  // Calculate stats
  const activeCount = medicines.filter(m => m.status === 'active').length;
  const completedCount = medicines.filter(m => m.status === 'completed').length;
  const totalDosesTaken = medicines.reduce((acc, m) => {
    return acc + Object.values(m.checks).reduce((sum, count) => sum + count, 0);
  }, 0);

  return (
    <ScrollView className="flex-1 bg-background">
      {/* Stats Section */}
      <View className="mt-5 px-4">
        <Text variant="label" color="muted" className="mb-3">Statistics</Text>
        <View className="flex-row flex-wrap -mx-1.5">
          <Card className="w-[46%] mx-[2%] mb-3 p-4 items-center">
            <Pill size={24} color="#4CAF50" />
            <Text variant="stat" className="mt-2">{medicines.length}</Text>
            <Text variant="caption" color="secondary">Total</Text>
          </Card>

          <Card className="w-[46%] mx-[2%] mb-3 p-4 items-center">
            <Clock size={24} color="#FF9800" />
            <Text variant="stat" className="mt-2">{activeCount}</Text>
            <Text variant="caption" color="secondary">Active</Text>
          </Card>

          <Card className="w-[46%] mx-[2%] mb-3 p-4 items-center">
            <CheckCircle size={24} color="#2196F3" />
            <Text variant="stat" className="mt-2">{completedCount}</Text>
            <Text variant="caption" color="secondary">Completed</Text>
          </Card>

          <Card className="w-[46%] mx-[2%] mb-3 p-4 items-center">
            <Hash size={24} color="#9C27B0" />
            <Text variant="stat" className="mt-2">{totalDosesTaken}</Text>
            <Text variant="caption" color="secondary">Doses Taken</Text>
          </Card>
        </View>
      </View>

      {/* Account Section */}
      <View className="mt-5 px-4">
        <Text variant="label" color="muted" className="mb-3">Account</Text>
        <Card>
          <View className="flex-row items-center">
            <View
              className={cn(
                "w-2 h-2 rounded-full mr-3",
                userId ? "bg-success" : "bg-danger"
              )}
            />
            {userId ? <CloudCheck size={22} color="#4CAF50" /> : <CloudOff size={22} color="#ef5350" />}
            <View className="ml-3 flex-1">
              <Text className="text-[15px] font-semibold text-text">
                {userId ? 'Cloud Sync Enabled' : 'Cloud Sync Disabled'}
              </Text>
              <Text variant="caption" color="muted">
                {userId
                  ? 'Your data is being backed up to the cloud'
                  : 'Sign in to enable cloud backup'}
              </Text>
            </View>
          </View>
        </Card>
      </View>

      {/* Actions Section */}
      <View className="mt-5 px-4">
        <Text variant="label" color="muted" className="mb-3">Actions</Text>

        <TouchableOpacity
          className={cn(
            "flex-row items-center bg-background-card rounded-2xl p-4 mb-3 shadow-card",
            isLoading && "opacity-60"
          )}
          onPress={handleSync}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          <View className="w-10 h-10 rounded-xl bg-success-light justify-center items-center">
            <RefreshCw size={20} color="#4CAF50" />
          </View>
          <View className="flex-1 ml-3">
            <Text className="text-base font-semibold text-text">Sync with Cloud</Text>
            <Text variant="caption" color="muted">Backup your data</Text>
          </View>
          <ChevronRight size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center bg-background-card rounded-2xl p-4 mb-3 shadow-card border border-danger-light"
          onPress={handleClearData}
          activeOpacity={0.7}
        >
          <View className="w-10 h-10 rounded-xl bg-danger-light justify-center items-center">
            <Trash2 size={20} color="#ef5350" />
          </View>
          <View className="flex-1 ml-3">
            <Text className="text-base font-semibold text-danger">Clear All Data</Text>
            <Text variant="caption" color="muted">Delete everything permanently</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View className="mt-8 mb-6 items-center">
        <Text className="text-sm font-semibold text-text-secondary">Dotra Medicine Tracker v1.0.0</Text>
        <Text variant="caption" color="muted" className="mt-1">Stay healthy, stay on track</Text>
      </View>
    </ScrollView>
  );
};
