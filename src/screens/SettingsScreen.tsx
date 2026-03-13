import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMedicine } from '../context/MedicineContext';
import { clearAllData } from '../services/storage';
import { cancelAllReminders } from '../services/notifications';

export const SettingsScreen: React.FC = () => {
  const { medicines, userId, syncWithFirebase } = useMedicine();

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to delete all medicines? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            await cancelAllReminders();
            Alert.alert('Success', 'All data has been cleared');
          },
        },
      ]
    );
  };

  const handleSync = async () => {
    await syncWithFirebase();
    Alert.alert('Success', 'Data synced with cloud');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistics</Text>
        <View style={styles.statCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{medicines.length}</Text>
            <Text style={styles.statLabel}>Total Medicines</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {medicines.filter(m => m.status === 'active').length}
            </Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {medicines.filter(m => m.status === 'completed').length}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="cloud" size={20} color="#666" />
            <Text style={styles.infoText}>
              {userId ? 'Signed in (Anonymous)' : 'Not signed in'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>

        <TouchableOpacity style={styles.button} onPress={handleSync}>
          <MaterialCommunityIcons name="sync" size={20} color="#4CAF50" />
          <Text style={styles.buttonText}>Sync with Cloud</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.dangerButton]}
          onPress={handleClearData}
        >
          <MaterialCommunityIcons name="delete" size={20} color="#f44336" />
          <Text style={[styles.buttonText, styles.dangerText]}>
            Clear All Data
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Dotra: Medicine Tracker v1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#333',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  dangerButton: {
    borderColor: '#ffcdd2',
    borderWidth: 1,
  },
  dangerText: {
    color: '#f44336',
  },
  footer: {
    marginTop: 32,
    marginBottom: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});
