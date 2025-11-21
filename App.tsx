import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GluestackUIProvider } from '@/src/components/ui/gluestack-ui-provider';
import { RootStack } from './src/screens/navigation/RootStack';
import { AuthStack } from './src/screens/navigation/AuthStack';
import { useAuth } from './src/hooks/useAuth';
import { View, ActivityIndicator, useWindowDimensions, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '@/global.css';
import {colors} from '@/src/theme/colors';
import { initAnalytics } from './src/analytics';

// Maximum width for the app content (similar to mobile screen width)
const MAX_CONTENT_WIDTH = 480; // ~iPhone 14 Pro Max width

export default function App() {
  initAnalytics();
  const { user, loading } = useAuth();
  const { width } = useWindowDimensions();

  // Calculate if we should center content (on web/larger screens)
  const shouldCenterContent = Platform.OS === 'web' && width > MAX_CONTENT_WIDTH;

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  const content = (
    <SafeAreaProvider>
      <GluestackUIProvider mode="light">
        <NavigationContainer key={user ? 'root' : 'auth'}>
          {user ? <RootStack /> : <AuthStack />}
        </NavigationContainer>
      </GluestackUIProvider>
    </SafeAreaProvider>
  );

  // Wrap content in centered container for web
  if (shouldCenterContent) {
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: '#f5f5f5', // Light gray background for sides
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <View style={{ 
          width: MAX_CONTENT_WIDTH, 
          height: '100%',
          backgroundColor: 'white',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
          elevation: 5,
        }}>
          {content}
        </View>
      </View>
    );
  }

  return content;
}
