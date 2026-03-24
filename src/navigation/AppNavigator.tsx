import React from 'react';
import { Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Pill, Settings } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { MainTabParamList, RootStackParamList } from '../types';
import { CompletionScreen } from '../screens/CompletionScreen';
import { CreateMedicineScreen } from '../screens/CreateMedicineScreen';
import { EditMedicineScreen } from '../screens/EditMedicineScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { BackupSyncScreen } from '../screens/BackupSyncScreen';
import { BackupSignInScreen } from '../screens/BackupSignInScreen';
import { BackupRegisterScreen } from '../screens/BackupRegisterScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        position: 'absolute',
        left: 20,
        right: 20,
        bottom: 24,
        height: 72,
        paddingTop: 10,
        paddingBottom: 10,
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.95)',
      },
      tabBarActiveTintColor: '#024039',
      tabBarInactiveTintColor: '#6B6B6B',
      tabBarLabelStyle: { fontSize: 14, fontWeight: '600' },
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarLabel: 'Medicines',
        tabBarIcon: ({ color, size }) => <Pill color={color} size={size} />,
      }}
    />
    <Tab.Screen
      name="Settings"
      component={SettingsScreen}
      options={{
        tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
      }}
    />
  </Tab.Navigator>
);

const LoadingScreen = () => (
  <View style={{ flex: 1, backgroundColor: '#F1EEE7', alignItems: 'center', justifyContent: 'center' }}>
    <Text style={{ color: '#024039', fontSize: 20, fontWeight: '700' }}>Dotra is waking up…</Text>
  </View>
);

export const AppNavigator: React.FC = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="CreateMedicine" component={CreateMedicineScreen} />
      <Stack.Screen name="EditMedicine" component={EditMedicineScreen} />
      <Stack.Screen name="Completion" component={CompletionScreen} />
      <Stack.Screen name="BackupSync" component={BackupSyncScreen} />
      <Stack.Screen name="BackupSignIn" component={BackupSignInScreen} />
      <Stack.Screen name="BackupRegister" component={BackupRegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};
