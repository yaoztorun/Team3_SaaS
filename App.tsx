import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GluestackUIProvider } from '@/src/components/ui/gluestack-ui-provider';
import { RootStack } from './src/screens/navigation/RootStack';
import { AuthStack } from './src/screens/navigation/AuthStack';
import ResetPasswordScreen from './src/screens/Auth/ResetPasswordScreen';
import { useAuth } from './src/hooks/useAuth';
import { View, ActivityIndicator, useWindowDimensions, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '@/global.css';
import {colors} from '@/src/theme/colors';
import { initAnalytics } from './src/analytics';
import { trackShareLinkOpen } from './src/utils/referral';
import { PWAInstallPrompt } from './src/components/global/PWAInstallPrompt';
import { PushNotificationPrompt } from './src/components/global/PushNotificationPrompt';
import {
  shouldShowInstallPrompt,
  markInstallPromptShown,
  markInstallPromptSkipped,
  setupInstallPrompt,
  triggerInstallPrompt,
  isIOSDevice,
  isPWAInstalled,
} from './src/utils/pwa';
import { isPushNotificationSupported, getNotificationPermission, wasPermissionRequested } from './src/utils/pushNotifications';

// Maximum width for the app content (similar to mobile screen width)
const MAX_CONTENT_WIDTH = 480; // ~iPhone 14 Pro Max width

export default function App() {
  const { user, loading, isPasswordRecovery } = useAuth();
  const { width } = useWindowDimensions();
  
  // Onboarding state
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showPushPrompt, setShowPushPrompt] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  // Initialize analytics once on mount
  useEffect(() => {
    initAnalytics();
  }, []);
  
  // Track if user arrived via shared link (UTM parameters)
  useEffect(() => {
    if (Platform.OS === 'web') {
      trackShareLinkOpen();
    }
  }, []);

  // Setup PWA install prompt listeners
  useEffect(() => {
    if (Platform.OS === 'web') {
      setupInstallPrompt();
    }
  }, []);

  // Show onboarding prompts when user is authenticated
  useEffect(() => {
    if (user && Platform.OS === 'web' && !loading) {
      // Small delay to ensure smooth transition after login
      setTimeout(() => {
        if (shouldShowInstallPrompt()) {
          setShowInstallPrompt(true);
        } else {
          // If install prompt not needed, show push prompt if user hasn't been asked yet
          const currentPermission = getNotificationPermission();
          const wasAsked = wasPermissionRequested();
          
          // Show push prompt ONLY if: supported AND not asked yet AND permission is still default
          if (isPushNotificationSupported() && !wasAsked && currentPermission === 'default') {
            setShowPushPrompt(true);
          } else {
            setOnboardingComplete(true);
          }
        }
      }, 500);
    } else if (!user) {
      // Reset onboarding when user logs out
      setOnboardingComplete(false);
      setShowInstallPrompt(false);
      setShowPushPrompt(false);
    }
  }, [user, loading]);

  // Handle install prompt actions
  const handleInstall = async () => {
    markInstallPromptShown();
    
    // Try to trigger native install prompt (Android Chrome/Edge)
    const installed = await triggerInstallPrompt();
    
    setShowInstallPrompt(false);
    
    if (installed || isIOSDevice()) {
      // Show push notification prompt after install or on iOS
      setTimeout(() => {
        if (isPushNotificationSupported()) {
          setShowPushPrompt(true);
        } else {
          setOnboardingComplete(true);
        }
      }, 500);
    } else {
      setOnboardingComplete(true);
    }
  };

  const handleSkipInstall = () => {
    markInstallPromptShown();
    markInstallPromptSkipped();
    setShowInstallPrompt(false);
    setOnboardingComplete(true);
  };

  // Handle push notification prompt actions
  const handlePushComplete = (granted: boolean) => {
    console.log('Push notifications', granted ? 'granted' : 'not granted');
    setShowPushPrompt(false);
    setOnboardingComplete(true);
  };

  const handleSkipPush = () => {
    setShowPushPrompt(false);
    setOnboardingComplete(true);
  };

  // Calculate if we should center content (on web/larger screens)
  const shouldCenterContent = Platform.OS === 'web' && width > MAX_CONTENT_WIDTH;

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  // Determine what content to show
  let content;
  if (isPasswordRecovery) {
    content = (
      <GluestackUIProvider mode="light">
        <ResetPasswordScreen />
      </GluestackUIProvider>
    );
  } else {
    content = (
      <GluestackUIProvider mode="light">
        <NavigationContainer key={user ? 'root' : 'auth'}>
          {user ? <RootStack /> : <AuthStack />}
        </NavigationContainer>
      </GluestackUIProvider>
    );
  }

  // Render onboarding prompts
  const renderOnboardingPrompts = () => {
    if (!user || Platform.OS !== 'web') return null;

    return (
      <>
        <PWAInstallPrompt
          visible={showInstallPrompt}
          onInstall={handleInstall}
          onSkip={handleSkipInstall}
        />
        <PushNotificationPrompt
          visible={showPushPrompt}
          userId={user.id}
          onComplete={handlePushComplete}
          onSkip={handleSkipPush}
        />
      </>
    );
  };

  // Wrap content in centered container for web
  if (shouldCenterContent) {
    return (
      <>
        <View style={{ 
          flex: 1, 
          backgroundColor: '#f5f5f5',
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
        {renderOnboardingPrompts()}
      </>
    );
  }

  return (
    <>
      {content}
      {renderOnboardingPrompts()}
    </>
  );
}
