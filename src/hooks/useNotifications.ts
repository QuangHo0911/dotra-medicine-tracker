import { useEffect, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import {
  requestNotificationPermissions,
  scheduleMedicineReminders,
  cancelMedicineReminders,
  updateMedicineReminders,
  cancelAllReminders,
  setNotificationTapHandler,
} from '../services/notifications';
import { Medicine } from '../types';

export const useNotifications = () => {
  useEffect(() => {
    // Request permissions on mount
    requestNotificationPermissions();

    // Set up notification tap handler
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const scheduleReminders = useCallback(async (medicine: Medicine): Promise<string[]> => {
    return await scheduleMedicineReminders(medicine);
  }, []);

  const cancelReminders = useCallback(async (medicineId: string): Promise<void> => {
    await cancelMedicineReminders(medicineId);
  }, []);

  const updateReminders = useCallback(async (medicine: Medicine): Promise<string[]> => {
    return await updateMedicineReminders(medicine);
  }, []);

  const cancelAll = useCallback(async (): Promise<void> => {
    await cancelAllReminders();
  }, []);

  const onNotificationTap = useCallback((callback: (medicineId: string) => void): (() => void) => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const medicineId = response.notification.request.content.data?.medicineId;
      if (medicineId) {
        callback(medicineId);
      }
    });

    return () => subscription.remove();
  }, []);

  return {
    scheduleReminders,
    cancelReminders,
    updateReminders,
    cancelAll,
    onNotificationTap,
    requestPermissions: requestNotificationPermissions,
  };
};
