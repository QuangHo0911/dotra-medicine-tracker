import AsyncStorage from '@react-native-async-storage/async-storage';
import { Medicine } from '../types';

const MEDICINES_KEY = '@medicines';
const USER_ID_KEY = '@userId';

export const saveMedicines = async (medicines: Medicine[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(medicines);
    await AsyncStorage.setItem(MEDICINES_KEY, jsonValue);
    console.log('Medicines saved to local storage:', medicines.length);
  } catch (error) {
    console.error('Error saving medicines:', error);
  }
};

export const loadMedicines = async (): Promise<Medicine[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(MEDICINES_KEY);
    if (jsonValue != null) {
      const medicines = JSON.parse(jsonValue);
      console.log('Medicines loaded from local storage:', medicines.length);
      return medicines;
    }
    return [];
  } catch (error) {
    console.error('Error loading medicines:', error);
    return [];
  }
};

export const saveUserId = async (userId: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(USER_ID_KEY, userId);
    console.log('User ID saved:', userId);
  } catch (error) {
    console.error('Error saving user ID:', error);
  }
};

export const loadUserId = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(USER_ID_KEY);
  } catch (error) {
    console.error('Error loading user ID:', error);
    return null;
  }
};

export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(MEDICINES_KEY);
    await AsyncStorage.removeItem(USER_ID_KEY);
    console.log('All local data cleared');
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};
