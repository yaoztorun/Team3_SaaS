import React from 'react';
import {
  Modal,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { Pressable } from '@/src/components/ui/pressable';
import { X, Trash } from 'lucide-react-native';
import { Swipeable } from 'react-native-gesture-handler';

export interface Notification {
  id: string;
  message: string;
  timeAgo: string;
  isRead: boolean;
}

interface NotificationModalProps {
  visible: boolean;
  notifications: Notification[];
  onClose: () => void;
  onNotificationPress: (id: string) => void;
  onDeleteNotification: (id: string) => void; // 🔹 new
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  notifications,
  onClose,
  onNotificationPress,
  onDeleteNotification,
}) => {
  // right-side red bin for swipe action
  const renderRightActions = (id: string) => (
    <Box className="flex-row items-stretch">
      <Pressable
        className="bg-red-500 justify-center px-4"
        onPress={() => onDeleteNotification(id)}
      >
        <Trash size={20} color="#ffffff" />
      </Pressable>
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
                {notifications.map((notification) => (
                  <Swipeable
                    key={notification.id}
                    renderRightActions={() =>
                      renderRightActions(notification.id)
                    }
                  >
                    <TouchableOpacity
                      onPress={() => onNotificationPress(notification.id)}
                      className={`border-b border-gray-100 ${
                        !notification.isRead
                          ? 'bg-[rgba(240,253,250,0.3)]'
                          : ''
                      }`}
                    >
                      <Box className="px-4 py-4">
                        <Box className="flex-row items-start">
                          {/* Unread indicator dot */}
                          {!notification.isRead && (
                            <Box className="w-2 h-2 rounded-full bg-[#00BBA7] mt-1.5 mr-3" />
                          )}

                          <Box
                            className={`flex-1 ${
                              notification.isRead ? 'ml-5' : ''
                            }`}
                          >
                            <Text className="text-sm text-neutral-950 mb-1">
                              {notification.message}
                            </Text>
                            <Text className="text-xs text-[#6a7282]">
                              {notification.timeAgo}
                            </Text>
                          </Box>
                        </Box>
                      </Box>
                    </TouchableOpacity>
                  </Swipeable>
                ))}

                {notifications.length === 0 && (
                  <Box className="px-4 py-4">
                    <Text className="text-sm text-neutral-500">
                      No notifications yet.
                    </Text>
                  </Box>
                )}
              </ScrollView>
            </Box>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};
