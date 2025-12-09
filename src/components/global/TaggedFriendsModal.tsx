import React from 'react';
import {
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { Pressable } from '@/src/components/ui/pressable';
import { X } from 'lucide-react-native';
import { TaggedUser } from '@/src/api/tags';
import { Avatar } from './Avatar';

interface TaggedFriendsModalProps {
  visible: boolean;
  onClose: () => void;
  taggedFriends: TaggedUser[];
  onPressFriend: (friendId: string) => void;
}

export const TaggedFriendsModal: React.FC<TaggedFriendsModalProps> = ({
  visible,
  onClose,
  taggedFriends,
  onPressFriend,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Box className="flex-1 bg-black/50 justify-center items-center p-4">
        <Box className="bg-white rounded-3xl max-h-[70%] w-full max-w-sm">
          {/* Header */}
          <Box className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200">
            <Text className="text-lg font-semibold text-neutral-900">
              Tagged Friends
            </Text>
            <Pressable onPress={onClose}>
              <X size={24} color="#000" />
            </Pressable>
          </Box>

          {/* Friends List */}
          <ScrollView className="flex-1 px-4 py-2">
            {taggedFriends.map((friend) => (
              <TouchableOpacity
                key={friend.id}
                onPress={() => {
                  onPressFriend(friend.id);
                  onClose();
                }}
                className="flex-row items-center py-3 border-b border-gray-100"
              >
                {/* Avatar */}
                <Avatar
                  avatarUrl={friend.avatar_url}
                  initials={friend.full_name?.charAt(0)?.toUpperCase() || '?'}
                  size={48}
                  fallbackColor="#14b8a6"
                />

                {/* Name */}
                <Text className="flex-1 ml-3 text-base text-neutral-900">
                  {friend.full_name || 'Unknown'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Box>
      </Box>
    </Modal>
  );
};
