export interface Medicine {
  id: string;
  name: string;
  timesPerDay: number;
  durationDays: number;
  reminderTimes?: string[];
  remindersEnabled: boolean;
  startDate: string;
  checks: Record<string, number>;
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

export type AuthProviderType = 'password' | 'google' | 'apple';

export interface UserProfile {
  uid: string;
  email: string | null;
  fullName: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string | null;
  localAvatarUri?: string | null;
  initials: string;
  provider: AuthProviderType;
  createdAt: string;
  updatedAt: string;
}

export interface DailyCompletionSummary {
  date: string;
  streak: number;
  totalDoses: number;
  completedDoses: number;
  progressPercentage: number;
}

export type RootStackParamList = {
  AuthWelcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  MainTabs: undefined;
  CreateMedicine: undefined;
  EditMedicine: { medicineId: string };
  Completion: { summary: DailyCompletionSummary };
};

export type MainTabParamList = {
  Home: undefined;
  Settings: undefined;
};
