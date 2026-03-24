import AsyncStorage from '@react-native-async-storage/async-storage';
import { Medicine, UserProfile } from '../types';

const MEDICINES_KEY = '@medicines';
const PROFILE_KEY = '@profile';
const COMPLETION_KEY = '@completion-screen-seen';

const getMedicinesKey = (scopeKey: string = 'guest') => `${MEDICINES_KEY}:${scopeKey}`;
const getCompletionKey = (scopeKey: string = 'guest') => `${COMPLETION_KEY}:${scopeKey}`;

export const saveMedicines = async (medicines: Medicine[], scopeKey?: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(getMedicinesKey(scopeKey), JSON.stringify(medicines));
  } catch (error) {
    console.error('Error saving medicines:', error);
  }
};

export const loadMedicines = async (scopeKey?: string): Promise<Medicine[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(getMedicinesKey(scopeKey));
    return jsonValue ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Error loading medicines:', error);
    return [];
  }
};

export const saveProfileToStorage = async (profile: UserProfile): Promise<void> => {
  try {
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error('Error saving profile:', error);
  }
};

export const loadProfileFromStorage = async (): Promise<UserProfile | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(PROFILE_KEY);
    return jsonValue ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error loading profile:', error);
    return null;
  }
};

export const clearProfileFromStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(PROFILE_KEY);
  } catch (error) {
    console.error('Error clearing profile:', error);
  }
};

export const saveCompletionScreenSeen = async (date: string, scopeKey?: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(getCompletionKey(scopeKey), date);
  } catch (error) {
    console.error('Error saving completion state:', error);
  }
};

export const loadCompletionScreenSeen = async (scopeKey?: string): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(getCompletionKey(scopeKey));
  } catch (error) {
    console.error('Error loading completion state:', error);
    return null;
  }
};

export const migrateGuestDataToUser = async (userUid: string): Promise<Medicine[]> => {
  const guestMedicines = await loadMedicines('guest');
  if (guestMedicines.length === 0) return [];

  await saveMedicines(guestMedicines, userUid);

  await AsyncStorage.removeItem(getMedicinesKey('guest'));
  await AsyncStorage.removeItem(getCompletionKey('guest'));

  return guestMedicines;
};

export const hasGuestData = async (): Promise<boolean> => {
  const medicines = await loadMedicines('guest');
  return medicines.length > 0;
};

export const clearAllData = async (scopeKey?: string): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([getMedicinesKey(scopeKey), PROFILE_KEY, getCompletionKey(scopeKey)]);
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};
