import AsyncStorage from '@react-native-async-storage/async-storage';
import { Medicine, UserProfile } from '../types';

const MEDICINES_KEY = '@medicines';
const PROFILE_KEY = '@profile';
const COMPLETION_KEY = '@completion-screen-seen';

export const saveMedicines = async (medicines: Medicine[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(MEDICINES_KEY, JSON.stringify(medicines));
  } catch (error) {
    console.error('Error saving medicines:', error);
  }
};

export const loadMedicines = async (): Promise<Medicine[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(MEDICINES_KEY);
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

export const saveCompletionScreenSeen = async (date: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(COMPLETION_KEY, date);
  } catch (error) {
    console.error('Error saving completion state:', error);
  }
};

export const loadCompletionScreenSeen = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(COMPLETION_KEY);
  } catch (error) {
    console.error('Error loading completion state:', error);
    return null;
  }
};

export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([MEDICINES_KEY, PROFILE_KEY, COMPLETION_KEY]);
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};
