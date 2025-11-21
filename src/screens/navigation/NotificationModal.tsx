// src/screens/navigation/NotificationModal.tsx
import React from 'react';
import {
  Modal,
  ScrollView,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { Pressable } from '@/src/components/ui/pressable';
import { Swipeable } from 'react-native-gesture-handler';
import { X, Trash2 } from 'lucide-react-native';

export interface Notification {
  id: string;
  message: string;
  timeAgo: string;
  isRead: boolean;
  type: string;
  drinkLogId?: string | null;
}

interface NotificationModalProps {
  visible: boolean;
  notifications: Notification[];
  onClose: () => void;
  onNotificationPress: (notification: Notification) => void;
  onDeleteNotification: (id: string) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  notifications,
  onClose,
  onNotificationPress,
  onDeleteNotification,
}) => {
  const isWeb = Platform.OS === 'web';

  const renderRowContent = (notification: Notification) => (
    <Box
      className={`border-b border-gray-100 ${
        !notification.isRead ? 'bg-[rgba(240,253,250,0.3)]' : ''
      }`}
    >
      <Box className="px-4 py-4">
        <Box className="flex-row items-start">
          {/* Unread dot */}
          {!notification.isRead && (
            <Box className="w-2 h-2 rounded-full bg-[#00BBA7] mt-1.5 mr-3" />
          )}

          <Box className={`flex-1 ${notification.isRead ? 'ml-5' : ''}`}>
            <Text className="text-sm text-neutral-950 mb-1">
              {notification.message}
            </Text>
            <Text className="text-xs text-[#6a7282]">
              {notification.timeAgo}
            </Text>
          </Box>

          {/* On web, show an explicit trash button instead of swipe */}
          {isWeb && (
            <Pressable
              className="ml-3 justify-center items-center"
              onPress={() => onDeleteNotification(notification.id)}
            >
              <Trash2 size={18} color="#ef4444" />
            </Pressable>
          )}
        </Box>
      </Box>
    </Box>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Pressable className="flex-1 bg-black/20" onPress={onClose}>
        {/* Modal Content */}
        <View className="flex-1 items-end pt-20 pr-4">
          {/* Stop backdrop press from closing when tapping inside */}
          <Pressable onPress={(e) => e.stopPropagation()}>
            <Box className="bg-white rounded-2xl shadow-lg w-80 max-h-[450px] overflow-hidden border border-gray-200">
              {/* Header */}
              <Box className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
                <Text className="text-base font-medium text-neutral-950">
                  Notifications
                </Text>
                <TouchableOpacity
                  onPress={onClose}
                  className="p-1 rounded-full"
                >
                  <X size={20} color="#6b7280" />
                </TouchableOpacity>
              </Box>

              {/* Notification List */}
              <ScrollView className="max-h-96">
                {notifications.map((notification) => {
                  // On web: no Swipeable, just normal row + trash icon
                  if (isWeb) {
                    return (
                      <TouchableOpacity
                        key={notification.id}
                        onPress={() => onNotificationPress(notification)}
                      >
                        {renderRowContent(notification)}
                      </TouchableOpacity>
                    );
                  }

                  // Native (iOS/Android): keep swipe-to-delete
                  return (
                    <Swipeable
                      key={notification.id}
                      renderRightActions={() => (
                        <Pressable
                          className="bg-red-500 justify-center items-center w-16"
                          onPress={() => onDeleteNotification(notification.id)}
                        >
                          <Trash2 size={20} color="#fff" />
                        </Pressable>
                      )}
                      onSwipeableOpen={() =>
                        onDeleteNotification(notification.id)
                      }
                    >
                      <TouchableOpacity
                        onPress={() => onNotificationPress(notification)}
                      >
                        {renderRowContent(notification)}
                      </TouchableOpacity>
                    </Swipeable>
                  );
                })}
              </ScrollView>
            </Box>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};
