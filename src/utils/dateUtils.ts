import {
  addDays,
  eachDayOfInterval,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  parseISO,
  startOfDay,
  startOfWeek,
  subWeeks,
  addWeeks,
} from 'date-fns';
import { Medicine } from '../types';

export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'yyyy-MM-dd');
};

export const formatDisplayDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy');
};

export const formatHeaderDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'EEEE, MMM d');
};

export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const date = new Date();
  date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
  return format(date, 'h:mm a');
};

export const getToday = (): string => formatDate(new Date());

export const getDayProgress = (startDate: string, durationDays: number): number => {
  const start = startOfDay(parseISO(startDate));
  const today = startOfDay(new Date());
  const diffDays = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.min(Math.max(diffDays + 1, 0), durationDays);
};

export const getDatesInRange = (startDate: string, durationDays: number): string[] => {
  const dates: string[] = [];
  const start = parseISO(startDate);
  for (let i = 0; i < durationDays; i++) {
    dates.push(formatDate(addDays(start, i)));
  }
  return dates;
};

export const isDateInRange = (date: string, startDate: string, durationDays: number): boolean => {
  const checkDate = startOfDay(parseISO(date));
  const start = startOfDay(parseISO(startDate));
  const end = addDays(start, durationDays - 1);
  return checkDate >= start && checkDate <= end;
};

export const isMedicineScheduledOnDate = (medicine: Medicine, date: string): boolean => {
  return isDateInRange(date, medicine.startDate, medicine.durationDays);
};

export const getScheduledMedicinesForDate = (medicines: Medicine[], date: string): Medicine[] => {
  return medicines.filter((medicine) => isMedicineScheduledOnDate(medicine, date));
};

export const getDailyDoseStats = (medicines: Medicine[], date: string) => {
  const scheduledMedicines = getScheduledMedicinesForDate(medicines, date);
  const totalDoses = scheduledMedicines.reduce((sum, medicine) => sum + medicine.timesPerDay, 0);
  const completedDoses = scheduledMedicines.reduce(
    (sum, medicine) => sum + Math.min(medicine.checks[date] || 0, medicine.timesPerDay),
    0
  );
  const allDone = totalDoses > 0 && completedDoses >= totalDoses;

  return {
    scheduledMedicines,
    totalDoses,
    completedDoses,
    progressPercentage: totalDoses === 0 ? 0 : Math.round((completedDoses / totalDoses) * 100),
    allDone,
  };
};

export const getCurrentStreak = (medicines: Medicine[], referenceDate: string = getToday()): number => {
  const ref = startOfDay(parseISO(referenceDate));
  let cursor = ref;
  let streak = 0;

  while (true) {
    const date = formatDate(cursor);
    const stats = getDailyDoseStats(medicines, date);

    if (stats.totalDoses === 0 || !stats.allDone) {
      break;
    }

    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
};

export const getStreakDates = (medicines: Medicine[], referenceDate: string = getToday()): string[] => {
  const streak = getCurrentStreak(medicines, referenceDate);
  if (streak === 0) return [];
  const ref = parseISO(referenceDate);
  return Array.from({ length: streak }, (_, index) => formatDate(addDays(ref, -index)));
};

export const getCalendarDates = (referenceDate: Date = new Date()): Date[] => {
  const start = startOfWeek(subWeeks(referenceDate, 3), { weekStartsOn: 1 });
  const end = endOfWeek(addWeeks(referenceDate, 1), { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
};

export const isWithinCalendarWindow = (date: Date, referenceDate: Date = new Date()): boolean => {
  const start = startOfWeek(subWeeks(referenceDate, 3), { weekStartsOn: 1 });
  const end = endOfWeek(addWeeks(referenceDate, 1), { weekStartsOn: 1 });
  return !isBefore(date, start) && !isAfter(date, end);
};

export const isMedicineCompleted = (medicine: {
  checks: Record<string, number>;
  timesPerDay: number;
  startDate: string;
  durationDays: number;
}): boolean => {
  const dates = getDatesInRange(medicine.startDate, medicine.durationDays);
  return dates.every((date) => (medicine.checks[date] || 0) >= medicine.timesPerDay);
};

export const getCompletionPercentage = (medicine: {
  checks: Record<string, number>;
  timesPerDay: number;
  startDate: string;
  durationDays: number;
}): number => {
  const dates = getDatesInRange(medicine.startDate, medicine.durationDays);
  let totalChecks = 0;
  let totalRequired = 0;

  for (const date of dates) {
    totalChecks += medicine.checks[date] || 0;
    totalRequired += medicine.timesPerDay;
  }

  return totalRequired === 0 ? 0 : Math.round((totalChecks / totalRequired) * 100);
};

export const isToday = (date: string | Date): boolean => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isSameDay(d, new Date());
};
