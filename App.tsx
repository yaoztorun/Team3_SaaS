import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GluestackUIProvider } from '@/src/components/ui/gluestack-ui-provider';
import { RootStack } from './src/screens/navigation/RootStack';
import { AuthStack } from './src/screens/navigation/AuthStack';
import { useAuth } from './src/hooks/useAuth';
import '@/global.css';

export default function App() {
  const { user, loading } = useAuth();

  if(loading) {
    return <></>; // or a loading spinner
  }

  return (
    <GluestackUIProvider mode="light">
      <NavigationContainer>
        {user ? <RootStack /> : <AuthStack />}
      </NavigationContainer>
    </GluestackUIProvider>
  );
}
