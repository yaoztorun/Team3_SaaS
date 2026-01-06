import React, { useState } from 'react';
import { Modal, Platform, View } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { HStack } from '@/src/components/ui/hstack';
import { Center } from '@/src/components/ui/center';
import { PrimaryButton } from '@/src/components/global/PrimaryButton';
import { Pressable } from '@/src/components/ui/pressable';
import { colors } from '@/src/theme/colors';
import {
  requestNotificationPermission,
  subscribeToPushNotifications,
  subscriptionToJSON,
  isPushNotificationSupported,
  getNotificationPermission,
} from '@/src/utils/pushNotifications';
import { savePushSubscription } from '@/src/api/pushSubscription';

interface PushNotificationPromptProps {
  visible: boolean;
  userId: string;
  onComplete: (granted: boolean) => void;
  onSkip: () => void;
}

// You need to generate VAPID keys for production
// Use: npx web-push generate-vapid-keys
// For now, using a placeholder - REPLACE THIS IN PRODUCTION
const VAPID_PUBLIC_KEY = process.env.EXPO_PUBLIC_VAPID_PUBLIC_KEY || 
  'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

export const PushNotificationPrompt: React.FC<PushNotificationPromptProps> = ({
  visible,
  userId,
  onComplete,
  onSkip,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if push notifications are supported
      if (!isPushNotificationSupported()) {
        setError('Push notifications are not supported on this device');
        setIsLoading(false);
        return;
      }

      // Request permission
      const permission = await requestNotificationPermission();

      if (permission === 'granted') {
        // Subscribe to push notifications
        const subscription = await subscribeToPushNotifications(VAPID_PUBLIC_KEY);

        if (subscription) {
          // Save subscription to database
          const result = await savePushSubscription(userId, subscriptionToJSON(subscription));

          if (result.success) {
            console.log('Push notifications enabled successfully');
            onComplete(true);
          } else {
            setError('Failed to save notification settings');
          }
        } else {
          setError('Failed to subscribe to notifications');
        }
      } else if (permission === 'denied') {
        setError('Notification permission denied. Please enable in browser settings.');
        setTimeout(() => onComplete(false), 2000);
      } else {
        // Permission dismissed
        onComplete(false);
      }
    } catch (err) {
      console.error('Error enabling notifications:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentPermission = Platform.OS === 'web' ? getNotificationPermission() : null;
  const isAlreadyGranted = currentPermission === 'granted';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onSkip}
    >
      <Box className="flex-1 bg-black/50 justify-center items-center p-6">
        <Box className="bg-white rounded-2xl p-6 max-w-md w-full" style={{ maxWidth: 400 }}>
          <View style={{ gap: 16 }}>
            {/* Icon */}
            <Center>
              <Box 
                className="w-20 h-20 rounded-full items-center justify-center"
                style={{ backgroundColor: colors.primary[100] }}
              >
                <Text className="text-4xl">🔔</Text>
              </Box>
            </Center>

            {/* Title */}
            <View style={{ gap: 8 }}>
              <Text className="text-2xl font-bold text-center text-gray-900">
                Stay Updated
              </Text>
              <Text className="text-base text-center text-gray-600">
                Get notified when friends like your cocktails, comment on your posts, or invite you to events
              </Text>
            </View>

            {/* Benefits */}
            <View style={{ gap: 12, paddingVertical: 8 }}>
              <HStack space="md" className="items-start">
                <Text className="text-xl">💬</Text>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text className="font-semibold text-gray-900">New Comments</Text>
                  <Text className="text-sm text-gray-600">
                    When someone comments on your cocktails
                  </Text>
                </View>
              </HStack>

              <HStack space="md" className="items-start">
                <Text className="text-xl">❤️</Text>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text className="font-semibold text-gray-900">Likes & Reactions</Text>
                  <Text className="text-sm text-gray-600">
                    When friends appreciate your creations
                  </Text>
                </View>
              </HStack>

              <HStack space="md" className="items-start">
                <Text className="text-xl">🎉</Text>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text className="font-semibold text-gray-900">Event Invites</Text>
                  <Text className="text-sm text-gray-600">
                    When you're invited to cocktail events
                  </Text>
                </View>
              </HStack>

              <HStack space="md" className="items-start">
                <Text className="text-xl">👥</Text>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text className="font-semibold text-gray-900">Friend Activity</Text>
                  <Text className="text-sm text-gray-600">
                    When friends accept your requests or follow you
                  </Text>
                </View>
              </HStack>
            </View>

            {/* Error message */}
            {error && (
              <Box className="bg-red-50 rounded-lg p-3">
                <Text className="text-red-700 text-sm text-center">{error}</Text>
              </Box>
            )}

            {/* Already granted message */}
            {isAlreadyGranted && !error && (
              <Box className="bg-green-50 rounded-lg p-3">
                <Text className="text-green-700 text-sm text-center">
                  ✓ Notifications are already enabled
                </Text>
              </Box>
            )}

            {/* Action Buttons */}
            <View style={{ gap: 8, paddingTop: 8 }}>
              <PrimaryButton
                title={isAlreadyGranted ? "Continue" : "Enable Notifications"}
                onPress={isAlreadyGranted ? () => onComplete(true) : handleEnableNotifications}
                loading={isLoading}
                disabled={isLoading}
              />
              <Pressable onPress={onSkip} disabled={isLoading} style={{ outline: 'none' } as any}>
                <Center className="py-3">
                  <Text className="text-gray-600 font-medium">
                    Not now
                  </Text>
                </Center>
              </Pressable>
            </View>

            {/* Privacy note */}
            <Text className="text-xs text-gray-500 text-center">
              You can change notification preferences anytime in your profile settings
            </Text>
          </View>
        </Box>
      </Box>
    </Modal>
  );
};
