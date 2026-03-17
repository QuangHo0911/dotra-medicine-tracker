import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Medicine } from '../types';
import { formatTime } from '../utils/dateUtils';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (!Device.isDevice) {
    console.log('Must use physical device for Push Notifications');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return false;
  }

  return true;
};

export const scheduleMedicineReminders = async (medicine: Medicine): Promise<string[]> => {
  if (!medicine.remindersEnabled || !medicine.reminderTimes || medicine.reminderTimes.length === 0) {
    return [];
  }

  const scheduledIds: string[] = [];

  try {
    for (const time of medicine.reminderTimes) {
      const [hours, minutes] = time.split(':').map(Number);

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Time for your medicine!',
          body: `Take your ${medicine.name}`,
          data: { medicineId: medicine.id },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: hours,
          minute: minutes,
        },
      });

      scheduledIds.push(identifier);
      console.log(`Scheduled reminder for ${medicine.name} at ${formatTime(time)}: ${identifier}`);
    }

    return scheduledIds;
  } catch (error) {
    console.error('Error scheduling reminders:', error);
    return [];
  }
};

export const cancelMedicineReminders = async (medicineId: string): Promise<void> => {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

    for (const notification of scheduledNotifications) {
      const dataMedicineId = notification.content.data?.medicineId;
      if (typeof dataMedicineId === 'string' && dataMedicineId === medicineId) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  } catch (error) {
    console.error('Error cancelling reminders:', error);
  }
};

export const cancelAllReminders = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error cancelling all reminders:', error);
  }
};

export const updateMedicineReminders = async (medicine: Medicine): Promise<string[]> => {
  await cancelMedicineReminders(medicine.id);
  return scheduleMedicineReminders(medicine);
};

export const getScheduledNotifications = async (): Promise<Notifications.NotificationRequest[]> => {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
};

export const setNotificationTapHandler = (callback: (medicineId: string) => void): void => {
  Notifications.addNotificationResponseReceivedListener((response) => {
    const medicineId = response.notification.request.content.data?.medicineId;
    if (typeof medicineId === 'string') {
      callback(medicineId);
    }
  });
};
