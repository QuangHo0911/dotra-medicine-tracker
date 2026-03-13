import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Medicine, MedicineFormData } from '../types';
import { loadMedicines, saveMedicines } from '../services/storage';
import {
  saveMedicineToFirebase,
  deleteMedicineFromFirebase,
  getMedicinesFromFirebase,
  syncMedicinesToFirebase,
} from '../services/firebase';
import { authenticateUser } from '../config/firebase';
import {
  getToday,
  isMedicineCompleted,
  getCompletionPercentage,
  getDatesInRange,
} from '../utils/dateUtils';
import {
  scheduleMedicineReminders,
  cancelMedicineReminders,
  updateMedicineReminders,
} from '../services/notifications';

interface MedicineContextType {
  medicines: Medicine[];
  isLoading: boolean;
  userId: string | null;
  createMedicine: (data: MedicineFormData) => Promise<Medicine>;
  updateMedicine: (id: string, data: Partial<MedicineFormData>) => Promise<void>;
  deleteMedicine: (id: string) => Promise<void>;
  checkMedicine: (id: string, date?: string) => Promise<void>;
  uncheckMedicine: (id: string, date?: string) => Promise<void>;
  getMedicine: (id: string) => Medicine | undefined;
  syncWithFirebase: () => Promise<void>;
  refreshMedicines: () => Promise<void>;
}

const MedicineContext = createContext<MedicineContextType | undefined>(undefined);

export const MedicineProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Initialize: authenticate and load data
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);

      try {
        // Authenticate user
        const uid = await authenticateUser();
        setUserId(uid);

        // Load medicines from local storage first
        const localMedicines = await loadMedicines();
        setMedicines(localMedicines);

        // If authenticated, sync with Firebase
        if (uid) {
          const firebaseMedicines = await getMedicinesFromFirebase();
          if (firebaseMedicines.length > 0) {
            // Merge: prefer Firebase data if conflict
            const merged = mergeMedicines(localMedicines, firebaseMedicines);
            setMedicines(merged);
            await saveMedicines(merged);
          } else if (localMedicines.length > 0) {
            // Upload local medicines to Firebase
            await syncMedicinesToFirebase(localMedicines);
          }
        }
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  // Merge medicines from local and Firebase
  const mergeMedicines = (local: Medicine[], firebase: Medicine[]): Medicine[] => {
    const merged: Medicine[] = [];
    const allIds = new Set([...local.map(m => m.id), ...firebase.map(m => m.id)]);

    allIds.forEach(id => {
      const localMed = local.find(m => m.id === id);
      const firebaseMed = firebase.find(m => m.id === id);

      if (localMed && firebaseMed) {
        // Prefer the one with the later updatedAt
        merged.push(
          new Date(localMed.updatedAt) > new Date(firebaseMed.updatedAt)
            ? localMed
            : firebaseMed
        );
      } else if (localMed) {
        merged.push(localMed);
      } else if (firebaseMed) {
        merged.push(firebaseMed);
      }
    });

    return merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  // Create new medicine
  const createMedicine = useCallback(async (data: MedicineFormData): Promise<Medicine> => {
    const now = new Date().toISOString();
    const newMedicine: Medicine = {
      id: uuidv4(),
      name: data.name,
      timesPerDay: data.timesPerDay,
      durationDays: data.durationDays,
      reminderTimes: data.reminderTimes || [],
      remindersEnabled: data.remindersEnabled,
      startDate: getToday(),
      checks: {},
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };

    const updatedMedicines = [newMedicine, ...medicines];
    setMedicines(updatedMedicines);
    await saveMedicines(updatedMedicines);
    await saveMedicineToFirebase(newMedicine);

    // Schedule reminders if enabled
    if (newMedicine.remindersEnabled) {
      await scheduleMedicineReminders(newMedicine);
    }

    return newMedicine;
  }, [medicines]);

  // Update existing medicine
  const updateMedicine = useCallback(async (id: string, data: Partial<MedicineFormData>): Promise<void> => {
    const medicine = medicines.find(m => m.id === id);
    if (!medicine) return;

    const updatedMedicine: Medicine = {
      ...medicine,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    const updatedMedicines = medicines.map(m => (m.id === id ? updatedMedicine : m));
    setMedicines(updatedMedicines);
    await saveMedicines(updatedMedicines);
    await saveMedicineToFirebase(updatedMedicine);

    // Update reminders
    await updateMedicineReminders(updatedMedicine);
  }, [medicines]);

  // Delete medicine
  const deleteMedicine = useCallback(async (id: string): Promise<void> => {
    const updatedMedicines = medicines.filter(m => m.id !== id);
    setMedicines(updatedMedicines);
    await saveMedicines(updatedMedicines);
    await deleteMedicineFromFirebase(id);
    await cancelMedicineReminders(id);
  }, [medicines]);

  // Check a dose (increment checks for today)
  const checkMedicine = useCallback(async (id: string, date: string = getToday()): Promise<void> => {
    const medicine = medicines.find(m => m.id === id);
    if (!medicine) return;

    const currentChecks = medicine.checks[date] || 0;
    if (currentChecks >= medicine.timesPerDay) return;

    const updatedChecks = {
      ...medicine.checks,
      [date]: currentChecks + 1,
    };

    const isCompleted = isMedicineCompleted({
      ...medicine,
      checks: updatedChecks,
    });

    const updatedMedicine: Medicine = {
      ...medicine,
      checks: updatedChecks,
      status: isCompleted ? 'completed' : 'active',
      updatedAt: new Date().toISOString(),
    };

    const updatedMedicines = medicines.map(m => (m.id === id ? updatedMedicine : m));
    setMedicines(updatedMedicines);
    await saveMedicines(updatedMedicines);
    await saveMedicineToFirebase(updatedMedicine);
  }, [medicines]);

  // Uncheck a dose (decrement checks for today)
  const uncheckMedicine = useCallback(async (id: string, date: string = getToday()): Promise<void> => {
    const medicine = medicines.find(m => m.id === id);
    if (!medicine) return;

    const currentChecks = medicine.checks[date] || 0;
    if (currentChecks <= 0) return;

    const updatedChecks = {
      ...medicine.checks,
      [date]: currentChecks - 1,
    };

    const updatedMedicine: Medicine = {
      ...medicine,
      checks: updatedChecks,
      status: 'active',
      updatedAt: new Date().toISOString(),
    };

    const updatedMedicines = medicines.map(m => (m.id === id ? updatedMedicine : m));
    setMedicines(updatedMedicines);
    await saveMedicines(updatedMedicines);
    await saveMedicineToFirebase(updatedMedicine);
  }, [medicines]);

  // Get a single medicine by ID
  const getMedicine = useCallback((id: string): Medicine | undefined => {
    return medicines.find(m => m.id === id);
  }, [medicines]);

  // Sync all medicines with Firebase
  const syncWithFirebase = useCallback(async (): Promise<void> => {
    if (!userId) {
      console.warn('No user authenticated, cannot sync');
      return;
    }

    setIsLoading(true);
    try {
      await syncMedicinesToFirebase(medicines);
      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [medicines, userId]);

  // Refresh medicines from Firebase
  const refreshMedicines = useCallback(async (): Promise<void> => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const firebaseMedicines = await getMedicinesFromFirebase();
      const merged = mergeMedicines(medicines, firebaseMedicines);
      setMedicines(merged);
      await saveMedicines(merged);
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [medicines, userId]);

  return (
    <MedicineContext.Provider
      value={{
        medicines,
        isLoading,
        userId,
        createMedicine,
        updateMedicine,
        deleteMedicine,
        checkMedicine,
        uncheckMedicine,
        getMedicine,
        syncWithFirebase,
        refreshMedicines,
      }}
    >
      {children}
    </MedicineContext.Provider>
  );
};

export const useMedicine = (): MedicineContextType => {
  const context = useContext(MedicineContext);
  if (context === undefined) {
    throw new Error('useMedicine must be used within a MedicineProvider');
  }
  return context;
};
