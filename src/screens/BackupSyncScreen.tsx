import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { AuthRequest, ResponseType } from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import { ChevronLeft, Cloud, CloudOff, RefreshCw, RotateCcw } from 'lucide-react-native';
import { Medicine, RootStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';
import { useMedicine } from '../context/MedicineContext';
import { runtimeConfig } from '../config/runtime';
import { getMedicinesFromFirebase } from '../services/firebase';
import { hasGuestData, loadMedicines, migrateGuestDataToUser } from '../services/storage';

WebBrowser.maybeCompleteAuthSession();

type Props = NativeStackScreenProps<RootStackParamList, 'BackupSync'>;

const GOOGLE_DISCOVERY = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
};

const getProxyRedirectUri = (): string => {
  const owner = Constants.expoConfig?.owner;
  const slug = Constants.expoConfig?.slug;
  if (owner && slug) return `https://auth.expo.io/@${owner}/${slug}`;
  throw new Error('app.json must define "owner" and "slug".');
};

const getReturnUrl = (): string => Linking.createURL('');

const GoogleIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 48 48">
    <Path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <Path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <Path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.01 24.01 0 0 0 0 21.56l7.98-6.19z" />
    <Path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </Svg>
);

export const BackupSyncScreen: React.FC<Props> = ({ navigation }) => {
  const { isGuest, loginWithGoogleIdToken, disconnectBackup, profile } = useAuth();
  const { syncWithFirebase, refreshMedicines } = useMedicine();
  const [busy, setBusy] = useState(false);

  const handleConflictResolution = useCallback((
    localMedicines: Medicine[],
    cloudMedicines: Medicine[],
    onResolve: (choice: 'local' | 'cloud') => Promise<void>,
  ) => {
    Alert.alert(
      'Data already exists in the cloud',
      `You have ${localMedicines.length} medicine(s) on this device and ${cloudMedicines.length} in the cloud.\n\nWhich data would you like to keep?`,
      [
        {
          text: 'Use this device\'s data',
          onPress: () => onResolve('local'),
        },
        {
          text: 'Restore cloud backup',
          onPress: () => onResolve('cloud'),
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  }, []);

  const handleGoogleBackup = useCallback(async () => {
    setBusy(true);
    try {
      const proxyRedirectUri = getProxyRedirectUri();
      const returnUrl = getReturnUrl();

      const nonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        Crypto.getRandomBytes(32).toString(),
      );

      const request = new AuthRequest({
        clientId: runtimeConfig.googleWebClientId,
        redirectUri: proxyRedirectUri,
        responseType: ResponseType.IdToken,
        scopes: [
          'openid',
          'https://www.googleapis.com/auth/userinfo.profile',
          'https://www.googleapis.com/auth/userinfo.email',
        ],
        usePKCE: false,
        extraParams: { nonce },
      });

      const authUrl = await request.makeAuthUrlAsync(GOOGLE_DISCOVERY);
      const proxyStartUrl =
        `${proxyRedirectUri}/start?` +
        new URLSearchParams({ authUrl, returnUrl }).toString();

      const result = await WebBrowser.openAuthSessionAsync(proxyStartUrl, returnUrl);

      if (result.type !== 'success' || !('url' in result)) {
        if (result.type === 'cancel' || result.type === 'dismiss') return;
        throw new Error('Browser session did not complete successfully.');
      }

      const resultUrl = new URL(result.url);
      const idToken =
        resultUrl.searchParams.get('id_token') ||
        new URLSearchParams(resultUrl.hash.slice(1)).get('id_token');
      if (!idToken) {
        const errorParam = resultUrl.searchParams.get('error');
        throw new Error(errorParam || 'No id_token in response.');
      }

      const hadGuestData = await hasGuestData();
      const guestMedicines = hadGuestData ? await loadMedicines('guest') : [];

      await loginWithGoogleIdToken(idToken);

      const cloudMedicines = await getMedicinesFromFirebase();

      if (hadGuestData && guestMedicines.length > 0 && cloudMedicines.length > 0) {
        handleConflictResolution(
          guestMedicines,
          cloudMedicines,
          async (choice) => {
            if (choice === 'local') {
              await syncWithFirebase();
            }
            await refreshMedicines();
            Alert.alert('Connected', 'Your Google account is now linked for backup and sync.');
          },
        );
      } else {
        if (cloudMedicines.length > 0) {
          await refreshMedicines();
        } else {
          await syncWithFirebase();
        }
        Alert.alert('Connected', 'Your Google account is now linked for backup and sync.');
      }
    } catch (error) {
      if (error instanceof Error && error.message !== 'Browser session did not complete successfully.') {
        Alert.alert('Google sign-in', error.message);
      }
    } finally {
      setBusy(false);
    }
  }, [loginWithGoogleIdToken, syncWithFirebase, refreshMedicines, handleConflictResolution]);

  const handleSync = useCallback(async () => {
    setBusy(true);
    try {
      await syncWithFirebase();
      Alert.alert('Synced', 'Your data has been backed up to the cloud.');
    } catch {
      Alert.alert('Sync failed', 'Could not sync with the cloud. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [syncWithFirebase]);

  const handleRestore = useCallback(async () => {
    Alert.alert(
      'Restore from cloud',
      'This will replace your local data with the cloud backup. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            try {
              await refreshMedicines();
              Alert.alert('Restored', 'Your data has been restored from the cloud backup.');
            } catch {
              Alert.alert('Restore failed', 'Could not restore from the cloud. Please try again.');
            } finally {
              setBusy(false);
            }
          },
        },
      ],
    );
  }, [refreshMedicines]);

  const handleDisconnect = useCallback(async () => {
    Alert.alert(
      'Disconnect backup',
      'Your local data will remain on this device, but syncing will stop. You can reconnect later.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            try {
              await disconnectBackup();
              Alert.alert('Disconnected', 'Backup has been disconnected. Your local data is still here.');
            } finally {
              setBusy(false);
            }
          },
        },
      ],
    );
  }, [disconnectBackup]);

  return (
    <View style={{ flex: 1, backgroundColor: '#F1EEE7' }}>
      <View style={{ backgroundColor: '#024039', paddingTop: 56, paddingHorizontal: 24, paddingBottom: 28, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden' }}>
        <View style={{ position: 'absolute', top: -24, right: -12, width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(255,255,255,0.08)' }} />
        <View style={{ position: 'absolute', bottom: -30, left: -10, width: 120, height: 120, borderRadius: 60, borderWidth: 18, borderColor: 'rgba(228,221,203,0.14)' }} />
        <Pressable onPress={() => navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 }}>
          <ChevronLeft size={22} color="#FFF" />
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15, fontWeight: '600' }}>Settings</Text>
        </Pressable>
        <Cloud size={28} color="#E4DDCB" style={{ marginBottom: 10 }} />
        <Text style={{ color: '#FFF', fontSize: 26, fontWeight: '800', letterSpacing: -0.4 }}>
          Backup & Sync
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 6, lineHeight: 20 }}>
          {isGuest
            ? 'Your data is stored on this device. Connect Google to back up and sync across devices.'
            : `Connected as ${profile?.email || profile?.fullName}`}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 48 }}>
        {isGuest ? (
          <>
            <Pressable
              onPress={handleGoogleBackup}
              disabled={busy}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#FFFFFF',
                borderRadius: 20,
                borderWidth: 1.5,
                borderColor: '#E5E0D8',
                paddingVertical: 18,
                gap: 12,
                opacity: busy ? 0.6 : 1,
              }}
            >
              {busy ? <ActivityIndicator size="small" color="#4285F4" /> : <GoogleIcon />}
              <Text style={{ color: '#141414', fontSize: 16, fontWeight: '600' }}>
                {busy ? 'Connecting…' : 'Back up with Google'}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate('BackupSignIn')}
              style={{
                backgroundColor: '#FFF',
                borderRadius: 20,
                padding: 18,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#024039', fontSize: 15, fontWeight: '600' }}>
                Sign in with email instead
              </Text>
            </Pressable>

            <View style={{ backgroundColor: '#FFF', borderRadius: 20, padding: 18, gap: 8 }}>
              <Text style={{ color: '#6B6B6B', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                Why connect?
              </Text>
              <Text style={{ color: '#141414', fontSize: 15, lineHeight: 22 }}>
                Connecting a Google account lets you back up your medicines to the cloud, sync across devices, and restore your data if you switch phones.
              </Text>
              <Text style={{ color: '#6B6B6B', fontSize: 13, lineHeight: 20 }}>
                Your app works fully without signing in. This is optional.
              </Text>
            </View>
          </>
        ) : (
          <>
            <Pressable
              onPress={handleSync}
              disabled={busy}
              style={{
                backgroundColor: '#FFF',
                borderRadius: 20,
                padding: 18,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                opacity: busy ? 0.6 : 1,
              }}
            >
              <RefreshCw size={18} color="#024039" />
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#141414', fontSize: 16, fontWeight: '600' }}>Sync now</Text>
                <Text style={{ color: '#6B6B6B', fontSize: 13, marginTop: 2 }}>Upload local changes to the cloud</Text>
              </View>
            </Pressable>

            <Pressable
              onPress={handleRestore}
              disabled={busy}
              style={{
                backgroundColor: '#FFF',
                borderRadius: 20,
                padding: 18,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                opacity: busy ? 0.6 : 1,
              }}
            >
              <RotateCcw size={18} color="#024039" />
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#141414', fontSize: 16, fontWeight: '600' }}>Restore from backup</Text>
                <Text style={{ color: '#6B6B6B', fontSize: 13, marginTop: 2 }}>Replace local data with cloud backup</Text>
              </View>
            </Pressable>

            <Pressable
              onPress={handleDisconnect}
              disabled={busy}
              style={{
                backgroundColor: '#FFF',
                borderRadius: 20,
                padding: 18,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <CloudOff size={18} color="#C73B2A" />
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#C73B2A', fontSize: 16, fontWeight: '600' }}>Disconnect backup</Text>
                <Text style={{ color: '#6B6B6B', fontSize: 13, marginTop: 2 }}>Stop syncing — your local data stays</Text>
              </View>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
};
