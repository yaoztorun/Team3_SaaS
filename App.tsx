import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GluestackUIProvider } from '@/src/components/ui/gluestack-ui-provider';
import { RootStack } from './src/screens/navigation/RootStack';
import { AuthStack } from './src/screens/navigation/AuthStack';
import { useAuth } from './src/hooks/useAuth';
import { View, ActivityIndicator } from 'react-native';
import '@/global.css';
import {colors} from '@/src/theme/colors';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  return (
    <GluestackUIProvider mode="light">
      <NavigationContainer key={user ? 'root' : 'auth'}>
        {user ? <RootStack /> : <AuthStack />}
      </NavigationContainer>
    </GluestackUIProvider>
  );
}
