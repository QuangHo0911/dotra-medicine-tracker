import React from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Cloud, CloudOff, Flame, LogOut, ShieldCheck, Trash2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useMedicine } from '../context/MedicineContext';
import { clearAllData } from '../services/storage';
import { getCurrentStreak } from '../utils/dateUtils';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { profile, disconnectBackup, user, isGuest } = useAuth();
  const { medicines, syncWithFirebase, isLoading } = useMedicine();
  const streak = getCurrentStreak(medicines);
  const totalDosesTaken = medicines.reduce((acc, medicine) => acc + Object.values(medicine.checks).reduce((sum, count) => sum + count, 0), 0);

  const providerLabel = isGuest
    ? 'Local only'
    : profile?.provider === 'google'
    ? 'Google account'
    : 'Email account';

  return (
    <View style={{ flex: 1, backgroundColor: '#F1EEE7' }}>
      <SafeAreaView style={{ backgroundColor: '#024039' }} edges={['top']} />
        <View
          style={{
            backgroundColor: '#024039',
            paddingHorizontal: 24,
            paddingBottom: 22,
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
          }}
        >
          <Text style={{ color: '#FFF', fontSize: 22, fontWeight: '700' }}>
            {profile?.fullName || 'Dotra User'}
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4, lineHeight: 20 }}>
            {isGuest ? 'Using Dotra locally' : profile?.email || 'Connected'}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 7 }}>
              {isGuest ? <CloudOff size={14} color="#E4DDCB" /> : <ShieldCheck size={14} color="#E4DDCB" />}
              <Text style={{ color: '#E4DDCB', fontSize: 12, fontWeight: '700' }}>{providerLabel}</Text>
            </View>
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, gap: 18, paddingBottom: 100 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1, backgroundColor: '#FFF', borderRadius: 24, padding: 18 }}>
              <Flame size={20} color="#C85C1B" />
              <Text style={{ color: '#141414', fontSize: 24, fontWeight: '700', marginTop: 10 }}>{streak}</Text>
              <Text style={{ color: '#6B6B6B', fontSize: 13 }}>Current streak</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: '#FFF', borderRadius: 24, padding: 18 }}>
              <Cloud size={20} color="#024039" />
              <Text style={{ color: '#141414', fontSize: 24, fontWeight: '700', marginTop: 10 }}>{totalDosesTaken}</Text>
              <Text style={{ color: '#6B6B6B', fontSize: 13 }}>Doses taken</Text>
            </View>
          </View>

          {/* Backup & Sync section */}
          <Pressable
            onPress={() => navigation.navigate('BackupSync')}
            style={{ backgroundColor: '#FFF', borderRadius: 24, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14 }}
          >
            <Cloud size={18} color="#024039" />
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#141414', fontSize: 16, fontWeight: '600' }}>Backup & Sync</Text>
              <Text style={{ color: '#6B6B6B', fontSize: 13, marginTop: 2 }}>
                {isGuest
                  ? 'Your data is stored on this device'
                  : `Connected as ${profile?.email || profile?.fullName}`}
              </Text>
            </View>
          </Pressable>

          {/* Sync button - only when connected */}
          {!isGuest && (
            <Pressable
              disabled={isLoading}
              onPress={syncWithFirebase}
              style={{ backgroundColor: '#FFF', borderRadius: 24, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14, opacity: isLoading ? 0.6 : 1 }}
            >
              <Cloud size={18} color="#024039" />
              <Text style={{ color: '#141414', fontSize: 16, fontWeight: '600' }}>Sync with cloud</Text>
            </Pressable>
          )}

          <View style={{ backgroundColor: '#FFF', borderRadius: 24, padding: 18, gap: 10 }}>
            <Text style={{ color: '#6B6B6B', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 }}>
              Data storage
            </Text>
            <Text style={{ color: '#141414', fontSize: 15, lineHeight: 22 }}>
              {isGuest
                ? 'Your medicines and settings are saved on this device. Connect a Google account in Backup & Sync to back up your data to the cloud.'
                : 'Your medicines are synced to the cloud via your Google account. Local data is also kept on this device.'}
            </Text>
          </View>

          {/* Log out - only when connected */}
          {!isGuest && (
            <Pressable
              onPress={() => {
                Alert.alert(
                  'Sign out',
                  'Your local data will remain on this device. You can sign back in later to resume syncing.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Sign out',
                      onPress: async () => {
                        await disconnectBackup();
                      },
                    },
                  ],
                );
              }}
              style={{ backgroundColor: '#FFF', borderRadius: 24, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14 }}
            >
              <LogOut size={18} color="#141414" />
              <Text style={{ color: '#141414', fontSize: 16, fontWeight: '600' }}>Sign out</Text>
            </Pressable>
          )}

          <Pressable
            onPress={() => Alert.alert('Clear all data', 'Delete all local medicine data?', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                  await clearAllData(user?.uid ?? 'guest');
                  Alert.alert('Done', 'Local data cleared. Relaunch the app to start fresh.');
                },
              },
            ])}
            style={{ backgroundColor: '#FFF', borderRadius: 24, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14 }}
          >
            <Trash2 size={18} color="#C73B2A" />
            <Text style={{ color: '#C73B2A', fontSize: 16, fontWeight: '600' }}>Clear all data</Text>
          </Pressable>
        </ScrollView>
    </View>
  );
};
