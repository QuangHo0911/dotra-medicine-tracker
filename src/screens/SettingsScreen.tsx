import React from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Cloud, CloudOff, Flame, LogOut, ShieldCheck, Trash2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useMedicine } from '../context/MedicineContext';
import { clearAllData } from '../services/storage';
import { getCurrentStreak } from '../utils/dateUtils';
import { InitialsAvatar } from '../components/InitialsAvatar';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { profile, logoutUser, disconnectBackup, updateProfileDetails, user, isGuest } = useAuth();
  const { medicines, syncWithFirebase, isLoading } = useMedicine();
  const streak = getCurrentStreak(medicines);
  const totalDosesTaken = medicines.reduce((acc, medicine) => acc + Object.values(medicine.checks).reduce((sum, count) => sum + count, 0), 0);
  const hasLocalAvatar = !!profile?.localAvatarUri;

  const providerLabel = isGuest
    ? 'Local only'
    : profile?.provider === 'google'
    ? 'Google account'
    : 'Email account';

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
      await updateProfileDetails({ localAvatarUri: result.assets[0].uri }, { persistRemote: false });
      Alert.alert('Avatar updated', 'Your profile photo is now saved on this device and will stay after app restarts.');
    }
  };

  const handleAvatarAction = () => {
    const options = [
      { text: 'Choose photo', onPress: handleAvatarUpload },
      hasLocalAvatar
        ? {
            text: 'Remove custom photo',
            style: 'destructive' as const,
            onPress: async () => {
              await updateProfileDetails({ localAvatarUri: null }, { persistRemote: false });
              Alert.alert('Avatar removed', 'Your profile has switched back to the default avatar.');
            },
          }
        : null,
      { text: 'Cancel', style: 'cancel' as const },
    ].filter(Boolean) as Array<{ text: string; style?: 'cancel' | 'destructive'; onPress?: () => void | Promise<void> }>;

    Alert.alert('Profile photo', 'Manage the avatar stored on this device.', options);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F1EEE7' }} contentContainerStyle={{ padding: 20, gap: 18, paddingBottom: 120 }}>
      <View style={{ backgroundColor: '#024039', borderRadius: 28, padding: 22, overflow: 'hidden' }}>
        <View style={{ position: 'absolute', top: -24, right: -12, width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(255,255,255,0.08)' }} />
        <View style={{ position: 'absolute', bottom: -30, left: -10, width: 120, height: 120, borderRadius: 60, borderWidth: 18, borderColor: 'rgba(228,221,203,0.14)' }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <InitialsAvatar initials={profile?.initials || 'DT'} avatarUrl={profile?.avatarUrl} localAvatarUri={profile?.localAvatarUri} size={58} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#FFF', fontSize: 22, fontWeight: '700' }}>{profile?.fullName || 'Dotra User'}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 3 }}>
              {isGuest ? 'Using Dotra locally' : profile?.email || 'Connected'}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
              <View style={{ alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                {isGuest ? <CloudOff size={14} color="#E4DDCB" /> : <ShieldCheck size={14} color="#E4DDCB" />}
                <Text style={{ color: '#E4DDCB', fontSize: 12, fontWeight: '700' }}>{providerLabel}</Text>
              </View>
              <View style={{ alignSelf: 'flex-start', backgroundColor: hasLocalAvatar ? 'rgba(228,221,203,0.16)' : 'rgba(255,255,255,0.08)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 }}>
                <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '700' }}>{hasLocalAvatar ? 'Device photo saved' : 'Initials avatar active'}</Text>
              </View>
            </View>
          </View>
          <Pressable onPress={handleAvatarAction} style={{ backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Camera size={14} color="#FFF" />
            <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 12 }}>{hasLocalAvatar ? 'Manage' : 'Avatar'}</Text>
          </Pressable>
        </View>
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
          {isGuest ? 'Data storage' : 'Avatar storage'}
        </Text>
        {isGuest ? (
          <Text style={{ color: '#141414', fontSize: 15, lineHeight: 22 }}>
            Your medicines and settings are saved on this device. Connect a Google account in Backup & Sync to back up your data to the cloud.
          </Text>
        ) : (
          <>
            <Text style={{ color: '#141414', fontSize: 15, lineHeight: 22 }}>
              Avatar photos persist locally on this device only, so the flow stays reliable without Firebase Storage rules or extra credentials.
            </Text>
            <Text style={{ color: '#6B6B6B', fontSize: 13, lineHeight: 20 }}>
              Your chosen photo survives app restarts and sign-ins on this device, but it does not sync across other devices yet.
            </Text>
          </>
        )}
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
  );
};
