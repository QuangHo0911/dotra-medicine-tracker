import { useCallback, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import {
  requestNotificationPermissions,
  scheduleMedicineReminders,
  cancelMedicineReminders,
  updateMedicineReminders,
  cancelAllReminders,
} from '../services/notifications';
import { Medicine } from '../types';

export const useNotifications = () => {
  useEffect(() => {
    requestNotificationPermissions();
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
    });
    return () => subscription.remove();
  }, []);

  const onNotificationTap = useCallback((callback: (medicineId: string) => void) => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const medicineId = response.notification.request.content.data?.medicineId;
      if (typeof medicineId === 'string') {
        callback(medicineId);
      }
    });

    return () => subscription.remove();
  }, []);

  return {
    scheduleReminders: async (medicine: Medicine) => scheduleMedicineReminders(medicine),
    cancelReminders: async (medicineId: string) => cancelMedicineReminders(medicineId),
    updateReminders: async (medicine: Medicine) => updateMedicineReminders(medicine),
    cancelAll: async () => cancelAllReminders(),
    onNotificationTap,
    requestPermissions: requestNotificationPermissions,
  };
};
