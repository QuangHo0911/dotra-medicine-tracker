import React from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Cloud, Flame, LogOut, RefreshCw, Trash2 } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useMedicine } from '../context/MedicineContext';
import { clearAllData } from '../services/storage';
import { getCurrentStreak } from '../utils/dateUtils';
import { InitialsAvatar } from '../components/InitialsAvatar';

export const SettingsScreen: React.FC = () => {
  const { profile, logoutUser } = useAuth();
  const { medicines, syncWithFirebase, isLoading } = useMedicine();
  const streak = getCurrentStreak(medicines);
  const totalDosesTaken = medicines.reduce((acc, medicine) => acc + Object.values(medicine.checks).reduce((sum, count) => sum + count, 0), 0);

  const handleAvatarUpload = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow photo access to set a custom avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled) {
      Alert.alert('Avatar upload', 'Avatar picker is wired. The selected image is ready to persist next.');
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F1EEE7' }} contentContainerStyle={{ padding: 20, gap: 18, paddingBottom: 48 }}>
      <View style={{ backgroundColor: '#024039', borderRadius: 28, padding: 22, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <InitialsAvatar initials={profile?.initials || 'DT'} avatarUrl={profile?.avatarUrl} size={58} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#FFF', fontSize: 22, fontWeight: '700' }}>{profile?.fullName || 'Dotra User'}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>{profile?.email || 'Signed in'}</Text>
        </View>
        <Pressable onPress={handleAvatarUpload} style={{ backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10 }}>
          <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 12 }}>Avatar</Text>
        </Pressable>
      </View>

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

      <Pressable disabled={isLoading} onPress={syncWithFirebase} style={{ backgroundColor: '#FFF', borderRadius: 24, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <RefreshCw size={18} color="#024039" />
        <Text style={{ color: '#141414', fontSize: 16, fontWeight: '600' }}>Sync with cloud</Text>
      </Pressable>

      <Pressable onPress={logoutUser} style={{ backgroundColor: '#FFF', borderRadius: 24, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <LogOut size={18} color="#141414" />
        <Text style={{ color: '#141414', fontSize: 16, fontWeight: '600' }}>Log out</Text>
      </Pressable>

      <Pressable
        onPress={() => Alert.alert('Clear all data', 'Delete all local medicine data?', [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              await clearAllData();
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
  );
};
