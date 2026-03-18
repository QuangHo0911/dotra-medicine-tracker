import './global.css';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import { MedicineProvider } from './src/context/MedicineContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useNotifications } from './src/hooks/useNotifications';

const NotificationsSetup: React.FC = () => {
  useNotifications();
  return null;
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AuthProvider>
          <MedicineProvider>
            <NotificationsSetup />
            <AppNavigator />
            <StatusBar style="light" />
          </MedicineProvider>
        </AuthProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
