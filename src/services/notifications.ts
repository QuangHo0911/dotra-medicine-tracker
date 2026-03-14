import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Medicine } from '../types';
import { formatDate, formatTime } from '../utils/dateUtils';

// Configure notifications handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
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

  console.log('Notification permissions granted');
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

      // Schedule daily recurring notification
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Time for your medicine!',
          body: `Take your ${medicine.name}`,
          data: { medicineId: medicine.id },
        },
        trigger: {
          type: 'daily',
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
    // Get all scheduled notifications
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

    // Cancel notifications that match this medicine
    for (const notification of scheduledNotifications) {
      if (notification.content.data?.medicineId === medicineId) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        console.log('Cancelled reminder:', notification.identifier);
      }
    }
  } catch (error) {
    console.error('Error cancelling reminders:', error);
  }
};

export const cancelAllReminders = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All reminders cancelled');
  } catch (error) {
    console.error('Error cancelling all reminders:', error);
  }
};

export const updateMedicineReminders = async (medicine: Medicine): Promise<string[]> => {
  // Cancel existing reminders for this medicine
  await cancelMedicineReminders(medicine.id);

  // Schedule new reminders
  return await scheduleMedicineReminders(medicine);
};

export const getScheduledNotifications = async (): Promise<Notifications.NotificationRequest[]> => {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
};

// Set up notification tap handler
export const setNotificationTapHandler = (callback: (medicineId: string) => void): void => {
  Notifications.addNotificationResponseReceivedListener((response) => {
    const medicineId = response.notification.request.content.data?.medicineId;
    if (medicineId) {
      callback(medicineId);
    }
  });
};
