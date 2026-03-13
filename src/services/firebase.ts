import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { Medicine } from '../types';

const MEDICINES_COLLECTION = 'medicines';

export const saveMedicineToFirebase = async (medicine: Medicine): Promise<boolean> => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    console.warn('No authenticated user, skipping Firebase save');
    return false;
  }

  try {
    const medicineRef = doc(db, MEDICINES_COLLECTION, medicine.id);
    await setDoc(medicineRef, {
      ...medicine,
      userId,
    });
    console.log('Medicine saved to Firebase:', medicine.id);
    return true;
  } catch (error) {
    console.error('Error saving medicine to Firebase:', error);
    return false;
  }
};

export const getMedicinesFromFirebase = async (): Promise<Medicine[]> => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    console.warn('No authenticated user, cannot fetch from Firebase');
    return [];
  }

  try {
    const medicinesRef = collection(db, MEDICINES_COLLECTION);
    const q = query(medicinesRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    const medicines: Medicine[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as Medicine & { userId: string };
      delete (data as { userId?: string }).userId;
      medicines.push(data);
    });

    console.log('Medicines fetched from Firebase:', medicines.length);
    return medicines;
  } catch (error) {
    console.error('Error fetching medicines from Firebase:', error);
    return [];
  }
};

export const deleteMedicineFromFirebase = async (medicineId: string): Promise<boolean> => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    console.warn('No authenticated user, skipping Firebase delete');
    return false;
  }

  try {
    const medicineRef = doc(db, MEDICINES_COLLECTION, medicineId);
    await deleteDoc(medicineRef);
    console.log('Medicine deleted from Firebase:', medicineId);
    return true;
  } catch (error) {
    console.error('Error deleting medicine from Firebase:', error);
    return false;
  }
};

export const syncMedicinesToFirebase = async (medicines: Medicine[]): Promise<boolean> => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    console.warn('No authenticated user, skipping sync');
    return false;
  }

  try {
    for (const medicine of medicines) {
      await saveMedicineToFirebase(medicine);
    }
    console.log('All medicines synced to Firebase');
    return true;
  } catch (error) {
    console.error('Error syncing medicines to Firebase:', error);
    return false;
  }
};

export const subscribeToMedicines = (callback: (medicines: Medicine[]) => void): Unsubscribe | null => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    console.warn('No authenticated user, cannot subscribe');
    return null;
  }

  const medicinesRef = collection(db, MEDICINES_COLLECTION);
  const q = query(medicinesRef, where('userId', '==', userId));

  return onSnapshot(q, (querySnapshot) => {
    const medicines: Medicine[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as Medicine & { userId: string };
      delete (data as { userId?: string }).userId;
      medicines.push(data);
    });
    callback(medicines);
  }, (error) => {
    console.error('Error in medicines subscription:', error);
  });
};
