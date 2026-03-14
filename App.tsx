import './global.css';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { MedicineProvider } from './src/context/MedicineContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useNotifications } from './src/hooks/useNotifications';

// Notifications setup component
const NotificationsSetup: React.FC = () => {
  useNotifications();
  return null;
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <NavigationContainer>
          <MedicineProvider>
            <NotificationsSetup />
            <AppNavigator />
            <StatusBar style="light" />
          </MedicineProvider>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
