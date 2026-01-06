import React, { useState, useEffect } from 'react';
import { Modal, Platform, View } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { HStack } from '@/src/components/ui/hstack';
import { Center } from '@/src/components/ui/center';
import { PrimaryButton } from '@/src/components/global/PrimaryButton';
import { Pressable } from '@/src/components/ui/pressable';
import { colors } from '@/src/theme/colors';

interface PWAInstallPromptProps {
  visible: boolean;
  onInstall: () => void;
  onSkip: () => void;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({
  visible,
  onInstall,
  onSkip,
}) => {
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const userAgent = window.navigator.userAgent.toLowerCase();
      setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    }
  }, []);

  const instructionLineHeight = 2;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onSkip}
    >
      <Box className="flex-1 bg-black/50 justify-center items-center p-4">
        <Box 
          className="bg-white rounded-2xl p-5 w-full" 
          style={{ maxWidth: 380, maxHeight: '90%' }}
        >
          <View style={{ gap: 12 }}>
            {/* Icon */}
            <Center>
              <Box 
                className="w-16 h-16 rounded-3xl items-center justify-center"
                style={{ backgroundColor: colors.primary[500] }}
              >
                <Text className="text-3xl">🍹</Text>
              </Box>
            </Center>

            {/* Title */}
            <View style={{ gap: 6 }}>
              <Text className="text-xl font-bold text-center text-gray-900">
                Install Sippin
              </Text>
              <Text className="text-sm text-center text-gray-600">
                Get the best experience on your home screen
              </Text>
            </View>

            {/* Benefits - only show if NOT iOS to save space */}
            {!isIOS && (
              <View style={{ gap: 10 }}>
                <HStack space="sm" className="items-start">
                  <Text className="text-lg">📱</Text>
                  <View style={{ flex: 1 }}>
                    <Text className="text-sm font-semibold text-gray-900">Quick Access</Text>
                    <Text className="text-xs text-gray-600">Launch instantly</Text>
                  </View>
                </HStack>

                <HStack space="sm" className="items-start">
                  <Text className="text-lg">🔔</Text>
                  <View style={{ flex: 1 }}>
                    <Text className="text-sm font-semibold text-gray-900">Notifications</Text>
                    <Text className="text-xs text-gray-600">Stay updated</Text>
                  </View>
                </HStack>

                <HStack space="sm" className="items-start">
                  <Text className="text-lg">⚡</Text>
                  <View style={{ flex: 1 }}>
                    <Text className="text-sm font-semibold text-gray-900">Fast Performance</Text>
                    <Text className="text-xs text-gray-600">App-like experience</Text>
                  </View>
                </HStack>
              </View>
            )}

            {/* iOS-specific instructions */}
            {isIOS && (
              <Box className="bg-blue-50 rounded-xl p-3">
                <View style={{ gap: 4 }}>
                  <Text className="text-sm font-semibold text-gray-900 text-center">
                    How to install:
                  </Text>
                  <View style={{ gap: 2 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                      <Text className="text-teal-600 font-bold text-sm" style={{ width: 18, lineHeight: instructionLineHeight }}>1.</Text>
                      <Text className="text-sm text-gray-700" style={{ flex: 1, lineHeight: instructionLineHeight }}>
                        Tap the three dots (•••) at the bottom
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                      <Text className="text-teal-600 font-bold text-sm" style={{ width: 18, lineHeight: instructionLineHeight }}>2.</Text>
                      <Text className="text-sm text-gray-700" style={{ flex: 1, lineHeight: instructionLineHeight }}>
                        Tap the Share icon
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                      <Text className="text-teal-600 font-bold text-sm" style={{ width: 18, lineHeight: instructionLineHeight }}>3.</Text>
                      <Text className="text-sm text-gray-700" style={{ flex: 1, lineHeight: instructionLineHeight }}>
                        Select "Add to Home Screen"
                      </Text>
                    </View>
                  </View>
                </View>
              </Box>
            )}

            {/* Action Buttons */}
            <View style={{ gap: 6, paddingTop: 4 }}>
              <PrimaryButton
                title={isIOS ? "Got it!" : "Install Now"}
                onPress={onInstall}
              />
              <Pressable onPress={onSkip} style={{ outline: 'none' } as any}>
                <Center className="py-2">
                  <Text className="text-gray-600 text-sm font-medium">
                    Maybe later
                  </Text>
                </Center>
              </Pressable>
            </View>
          </View>
        </Box>
      </Box>
    </Modal>
  );
};
