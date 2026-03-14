import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Pill, Clock, CheckCircle, Hash, CloudCheck, CloudOff, RefreshCw, ChevronRight, Trash2 } from 'lucide-react-native';
import { useMedicine } from '../context/MedicineContext';
import { clearAllData } from '../services/storage';
import { cancelAllReminders } from '../services/notifications';

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
    <ScrollView style={styles.container}>
      {/* Stats Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Pill size={24} color="#4CAF50" />
            <Text style={styles.statValue}>{medicines.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>

          <View style={styles.statCard}>
            <Clock size={24} color="#FF9800" />
            <Text style={styles.statValue}>{activeCount}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>

          <View style={styles.statCard}>
            <CheckCircle size={24} color="#2196F3" />
            <Text style={styles.statValue}>{completedCount}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>

          <View style={styles.statCard}>
            <Hash size={24} color="#9C27B0" />
            <Text style={styles.statValue}>{totalDosesTaken}</Text>
            <Text style={styles.statLabel}>Doses Taken</Text>
          </View>
        </View>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={[styles.statusDot, { backgroundColor: userId ? '#4CAF50' : '#f44336' }]} />
            {userId ? <CloudCheck size={22} color="#4CAF50" /> : <CloudOff size={22} color="#f44336" />}
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoText}>
                {userId ? 'Cloud Sync Enabled' : 'Cloud Sync Disabled'}
              </Text>
              <Text style={styles.infoSubtext}>
                {userId 
                  ? 'Your data is being backed up to the cloud' 
                  : 'Sign in to enable cloud backup'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Actions Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>

        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={handleSync}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#e8f5e9' }]} >
            <RefreshCw size={20} color="#4CAF50" />
          </View>
          <View style={styles.buttonTextContainer}>
            <Text style={styles.buttonText}>Sync with Cloud</Text>
            <Text style={styles.buttonSubtext}>Backup your data</Text>
          </View>
          <ChevronRight size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.dangerButton]}
          onPress={handleClearData}
          activeOpacity={0.7}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#ffebee' }]} >
            <Trash2 size={20} color="#f44336" />
          </View>
          <View style={styles.buttonTextContainer}>
            <Text style={[styles.buttonText, styles.dangerText]}>Clear All Data</Text>
            <Text style={styles.buttonSubtext}>Delete everything permanently</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Dotra Medicine Tracker v1.0.0</Text>
        <Text style={styles.footerSubtext}>Stay healthy, stay on track</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  statCard: {
    width: '46%',
    marginHorizontal: '2%',
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a1a',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  infoTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  infoText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  infoSubtext: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  buttonSubtext: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
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
    marginBottom: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});
