import { format, parseISO, isSameDay, addDays, startOfDay } from 'date-fns';

export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'yyyy-MM-dd');
};

export const formatDisplayDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy');
};

export const formatTime = (time: string): string => {
  // Time is in HH:mm format
  const [hours, minutes] = time.split(':');
  const date = new Date();
  date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
  return format(date, 'h:mm a');
};

export const getToday = (): string => {
  return formatDate(new Date());
};

export const getDayProgress = (startDate: string, durationDays: number): number => {
  const start = startOfDay(parseISO(startDate));
  const today = startOfDay(new Date());
  const diffDays = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.min(Math.max(diffDays + 1, 0), durationDays);
};

export const isDateInRange = (date: string, startDate: string, durationDays: number): boolean => {
  const checkDate = startOfDay(parseISO(date));
  const start = startOfDay(parseISO(startDate));
  const end = addDays(start, durationDays - 1);

  return checkDate >= start && checkDate <= end;
};

export const getDatesInRange = (startDate: string, durationDays: number): string[] => {
  const dates: string[] = [];
  const start = parseISO(startDate);

  for (let i = 0; i < durationDays; i++) {
    dates.push(formatDate(addDays(start, i)));
  }

  return dates;
};

export const getDaysRemaining = (startDate: string, durationDays: number): number => {
  const progress = getDayProgress(startDate, durationDays);
  return Math.max(durationDays - progress, 0);
};

export const isMedicineCompleted = (medicine: {
  checks: { [date: string]: number };
  timesPerDay: number;
  startDate: string;
  durationDays: number;
}): boolean => {
  const dates = getDatesInRange(medicine.startDate, medicine.durationDays);

  for (const date of dates) {
    const checks = medicine.checks[date] || 0;
    if (checks < medicine.timesPerDay) {
      return false;
    }
  }

  return true;
};

export const getCompletionPercentage = (medicine: {
  checks: { [date: string]: number };
  timesPerDay: number;
  startDate: string;
  durationDays: number;
}): number => {
  const dates = getDatesInRange(medicine.startDate, medicine.durationDays);
  let totalChecks = 0;
  let totalRequired = 0;

  for (const date of dates) {
    const checks = medicine.checks[date] || 0;
    totalChecks += checks;
    totalRequired += medicine.timesPerDay;
  }

  if (totalRequired === 0) return 0;
  return Math.round((totalChecks / totalRequired) * 100);
};

export const getCurrentStreak = (checks: { [date: string]: number }, timesPerDay: number): number => {
  const dates = Object.keys(checks).sort().reverse();
  let streak = 0;
  const today = getToday();
  
  for (const date of dates) {
    if (checks[date] >= timesPerDay) {
      // Count consecutive days with all doses taken
      const daysDiff = Math.floor(
        (new Date(today).getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysDiff === streak) {
        streak++;
      } else {
        break;
      }
    }
  }
  
  return streak;
};
