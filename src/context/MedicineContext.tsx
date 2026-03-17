import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import * as Crypto from 'expo-crypto';
import { DailyCompletionSummary, Medicine, MedicineFormData } from '../types';
import {
  loadCompletionScreenSeen,
  loadMedicines,
  saveCompletionScreenSeen,
  saveMedicines,
} from '../services/storage';
import {
  deleteMedicineFromFirebase,
  getMedicinesFromFirebase,
  saveMedicineToFirebase,
  syncMedicinesToFirebase,
} from '../services/firebase';
import {
  getCurrentStreak,
  getDailyDoseStats,
  getToday,
  isMedicineCompleted,
} from '../utils/dateUtils';
import {
  cancelMedicineReminders,
  scheduleMedicineReminders,
  updateMedicineReminders,
} from '../services/notifications';
import { useAuth } from './AuthContext';

interface MedicineContextType {
  medicines: Medicine[];
  isLoading: boolean;
  createMedicine: (data: MedicineFormData) => Promise<Medicine>;
  updateMedicine: (id: string, data: Partial<MedicineFormData>) => Promise<void>;
  deleteMedicine: (id: string) => Promise<void>;
  checkMedicine: (id: string, date?: string) => Promise<DailyCompletionSummary | null>;
  uncheckMedicine: (id: string, date?: string) => Promise<void>;
  getMedicine: (id: string) => Medicine | undefined;
  syncWithFirebase: () => Promise<void>;
  refreshMedicines: () => Promise<void>;
  getDailySummary: (date?: string) => DailyCompletionSummary;
}

const MedicineContext = createContext<MedicineContextType | undefined>(undefined);

export const MedicineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const mergeMedicines = useCallback((local: Medicine[], remote: Medicine[]) => {
    const merged: Medicine[] = [];
    const allIds = new Set([...local.map((m) => m.id), ...remote.map((m) => m.id)]);

    allIds.forEach((id) => {
      const localMed = local.find((m) => m.id === id);
      const remoteMed = remote.find((m) => m.id === id);
      if (localMed && remoteMed) {
        merged.push(new Date(localMed.updatedAt) > new Date(remoteMed.updatedAt) ? localMed : remoteMed);
      } else if (localMed) {
        merged.push(localMed);
      } else if (remoteMed) {
        merged.push(remoteMed);
      }
    });

    return merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const localMedicines = await loadMedicines();
      setMedicines(localMedicines);

      if (user) {
        try {
          const remoteMedicines = await getMedicinesFromFirebase();
          const merged = mergeMedicines(localMedicines, remoteMedicines);
          setMedicines(merged);
          await saveMedicines(merged);
          if (remoteMedicines.length === 0 && localMedicines.length > 0) {
            await syncMedicinesToFirebase(localMedicines);
          }
        } catch (error) {
          console.warn('Firebase sync failed, using local medicines', error);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [mergeMedicines, user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getDailySummary = useCallback(
    (date: string = getToday()): DailyCompletionSummary => {
      const stats = getDailyDoseStats(medicines, date);
      return {
        date,
        streak: getCurrentStreak(medicines, date),
        totalDoses: stats.totalDoses,
        completedDoses: stats.completedDoses,
        progressPercentage: stats.progressPercentage,
      };
    },
    [medicines]
  );

  const persistMedicines = useCallback(async (nextMedicines: Medicine[]) => {
    setMedicines(nextMedicines);
    await saveMedicines(nextMedicines);
  }, []);

  const createMedicine = useCallback(async (data: MedicineFormData): Promise<Medicine> => {
    const now = new Date().toISOString();
    const medicine: Medicine = {
      id: Crypto.randomUUID(),
      name: data.name.trim(),
      timesPerDay: data.timesPerDay,
      durationDays: data.durationDays,
      remindersEnabled: data.remindersEnabled,
      reminderTimes: data.remindersEnabled ? data.reminderTimes || [] : [],
      startDate: getToday(),
      checks: {},
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };

    const nextMedicines = [medicine, ...medicines];
    await persistMedicines(nextMedicines);
    await saveMedicineToFirebase(medicine).catch(() => false);

    if (medicine.remindersEnabled && medicine.reminderTimes?.length) {
      scheduleMedicineReminders(medicine).catch((error) => console.warn('Reminder scheduling failed', error));
    }

    return medicine;
  }, [medicines, persistMedicines]);

  const updateMedicine = useCallback(async (id: string, data: Partial<MedicineFormData>) => {
    const medicine = medicines.find((item) => item.id === id);
    if (!medicine) return;

    const updated: Medicine = {
      ...medicine,
      ...data,
      reminderTimes: data.remindersEnabled === false ? [] : data.reminderTimes ?? medicine.reminderTimes,
      updatedAt: new Date().toISOString(),
    };

    const nextMedicines = medicines.map((item) => (item.id === id ? updated : item));
    await persistMedicines(nextMedicines);
    await saveMedicineToFirebase(updated).catch(() => false);
    updateMedicineReminders(updated).catch((error) => console.warn('Reminder update failed', error));
  }, [medicines, persistMedicines]);

  const deleteMedicine = useCallback(async (id: string) => {
    const nextMedicines = medicines.filter((medicine) => medicine.id !== id);
    await persistMedicines(nextMedicines);
    await deleteMedicineFromFirebase(id).catch(() => false);
    cancelMedicineReminders(id).catch((error) => console.warn('Reminder cancel failed', error));
  }, [medicines, persistMedicines]);

  const checkMedicine = useCallback(async (id: string, date: string = getToday()) => {
    const medicine = medicines.find((item) => item.id === id);
    if (!medicine) return null;

    const currentChecks = medicine.checks[date] || 0;
    if (currentChecks >= medicine.timesPerDay) return null;

    const updatedMedicine: Medicine = {
      ...medicine,
      checks: { ...medicine.checks, [date]: currentChecks + 1 },
      status: isMedicineCompleted({ ...medicine, checks: { ...medicine.checks, [date]: currentChecks + 1 } })
        ? 'completed'
        : 'active',
      updatedAt: new Date().toISOString(),
    };

    const nextMedicines = medicines.map((item) => (item.id === id ? updatedMedicine : item));
    await persistMedicines(nextMedicines);
    await saveMedicineToFirebase(updatedMedicine).catch(() => false);

    const stats = getDailyDoseStats(nextMedicines, date);
    if (!stats.allDone) return null;

    const summary: DailyCompletionSummary = {
      date,
      streak: getCurrentStreak(nextMedicines, date),
      totalDoses: stats.totalDoses,
      completedDoses: stats.completedDoses,
      progressPercentage: stats.progressPercentage,
    };

    const seenDate = await loadCompletionScreenSeen();
    if (seenDate === date) return null;
    await saveCompletionScreenSeen(date);
    return summary;
  }, [medicines, persistMedicines]);

  const uncheckMedicine = useCallback(async (id: string, date: string = getToday()) => {
    const medicine = medicines.find((item) => item.id === id);
    if (!medicine) return;

    const currentChecks = medicine.checks[date] || 0;
    if (currentChecks <= 0) return;

    const updatedMedicine: Medicine = {
      ...medicine,
      checks: { ...medicine.checks, [date]: currentChecks - 1 },
      status: 'active',
      updatedAt: new Date().toISOString(),
    };

    const nextMedicines = medicines.map((item) => (item.id === id ? updatedMedicine : item));
    await persistMedicines(nextMedicines);
    await saveMedicineToFirebase(updatedMedicine).catch(() => false);
  }, [medicines, persistMedicines]);

  const getMedicine = useCallback((id: string) => medicines.find((medicine) => medicine.id === id), [medicines]);

  const syncWithFirebase = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      await syncMedicinesToFirebase(medicines);
    } finally {
      setIsLoading(false);
    }
  }, [medicines, user]);

  const refreshMedicines = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const remote = await getMedicinesFromFirebase();
      const merged = mergeMedicines(medicines, remote);
      await persistMedicines(merged);
    } finally {
      setIsLoading(false);
    }
  }, [medicines, mergeMedicines, persistMedicines, user]);

  const value = useMemo(
    () => ({
      medicines,
      isLoading,
      createMedicine,
      updateMedicine,
      deleteMedicine,
      checkMedicine,
      uncheckMedicine,
      getMedicine,
      syncWithFirebase,
      refreshMedicines,
      getDailySummary,
    }),
    [
      medicines,
      isLoading,
      createMedicine,
      updateMedicine,
      deleteMedicine,
      checkMedicine,
      uncheckMedicine,
      getMedicine,
      syncWithFirebase,
      refreshMedicines,
      getDailySummary,
    ]
  );

  return <MedicineContext.Provider value={value}>{children}</MedicineContext.Provider>;
};

export const useMedicine = () => {
  const context = useContext(MedicineContext);
  if (!context) throw new Error('useMedicine must be used within MedicineProvider');
  return context;
};
