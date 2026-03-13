export interface Medicine {
  id: string;
  name: string;
  timesPerDay: number;
  durationDays: number;
  reminderTimes?: string[];
  remindersEnabled: boolean;
  startDate: string;
  checks: { [date: string]: number };
  status: 'active' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface MedicineFormData {
  name: string;
  timesPerDay: number;
  durationDays: number;
  reminderTimes?: string[];
  remindersEnabled: boolean;
}

export type RootStackParamList = {
  MainTabs: undefined;
  CreateMedicine: undefined;
  EditMedicine: { medicineId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Settings: undefined;
};
