import React from 'react';
import { Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pill, Settings } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { MainTabParamList, RootStackParamList } from '../types';
import { CompletionScreen } from '../screens/CompletionScreen';
import { CreateMedicineScreen } from '../screens/CreateMedicineScreen';
import { EditMedicineScreen } from '../screens/EditMedicineScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { BackupSyncScreen } from '../screens/BackupSyncScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => {
  const insets = useSafeAreaInsets();
  return (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        height: 62 + insets.bottom,
        paddingTop: 10,
        paddingBottom: insets.bottom,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.06)',
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
};

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
    </Stack.Navigator>
  );
};
