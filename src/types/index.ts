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

export type AuthProviderType = 'password' | 'google' | 'apple' | 'guest';

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
  MainTabs: undefined;
  CreateMedicine: undefined;
  EditMedicine: { medicineId: string };
  Completion: { summary: DailyCompletionSummary };
  BackupSync: undefined;
  BackupSignIn: undefined;
  BackupRegister: undefined;
  ForgotPassword: undefined;
};

export type DataConflictChoice = 'local' | 'cloud';

export type MainTabParamList = {
  Home: undefined;
  Settings: undefined;
};
