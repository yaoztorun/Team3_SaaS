import React, { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { Pressable } from '@/src/components/ui/pressable';
import { X, Check } from 'lucide-react-native';
import { getFriends } from '@/src/api/friendship';
import { Friend } from '@/src/types/friendship';
import { useAuth } from '@/src/hooks/useAuth';

interface FriendSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  selectedFriendIds: string[];
  onConfirm: (friendIds: string[]) => void;
}

export const FriendSelectorModal: React.FC<FriendSelectorModalProps> = ({
  visible,
  onClose,
  selectedFriendIds,
  onConfirm,
}) => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);
  const [tempSelected, setTempSelected] = useState<string[]>(selectedFriendIds);

  useEffect(() => {
    if (visible) {
      setTempSelected(selectedFriendIds);
      loadFriends();
    }
  }, [visible, selectedFriendIds]);

  const loadFriends = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const friendsList = await getFriends(user.id);
      setFriends(friendsList);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFriend = (friendId: string) => {
    setTempSelected((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleConfirm = () => {
    onConfirm(tempSelected);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Box className="flex-1 bg-black/50 justify-end" style={{ alignItems: 'center' }}>
        <Box className="bg-white rounded-t-3xl max-h-[80%]" style={{ width: '100%', maxWidth: 480 }}>
          {/* Header */}
          <Box className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200">
            <Text className="text-lg font-semibold text-neutral-900">
              Tag Friends
            </Text>
            <Pressable onPress={onClose}>
              <X size={24} color="#000" />
            </Pressable>
          </Box>

          {/* Friends List */}
          <ScrollView className="flex-1 px-4 py-2">
            {loading ? (
              <Box className="items-center justify-center py-8">
                <ActivityIndicator color="#14b8a6" />
              </Box>
            ) : friends.length === 0 ? (
              <Box className="items-center justify-center py-8">
                <Text className="text-gray-500 text-center">
                  No friends found. Add friends to tag them!
                </Text>
              </Box>
            ) : (
              friends.map((friend) => {
                const isSelected = tempSelected.includes(friend.id);
                return (
                  <TouchableOpacity
                    key={friend.id}
                    onPress={() => toggleFriend(friend.id)}
                    className="flex-row items-center py-3 border-b border-gray-100"
                  >
                    {/* Avatar */}
                    {friend.profile.avatar_url ? (
                      <Image
                        source={{ uri: friend.profile.avatar_url }}
                        style={{ width: 48, height: 48, borderRadius: 24 }}
                      />
                    ) : (
                      <Box className="w-12 h-12 rounded-full bg-teal-500 items-center justify-center">
                        <Text className="text-white text-lg font-medium">
                          {friend.profile.full_name?.charAt(0)?.toUpperCase() || '?'}
                        </Text>
                      </Box>
                    )}

                    {/* Name */}
                    <Text className="flex-1 ml-3 text-base text-neutral-900">
                      {friend.profile.full_name || 'Unknown'}
                    </Text>

                    {/* Checkbox */}
                    <Box
                      className={`w-6 h-6 rounded border-2 items-center justify-center ${
                        isSelected
                          ? 'bg-teal-500 border-teal-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <Check size={16} color="#fff" />}
                    </Box>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>

          {/* Footer */}
          <Box className="px-4 py-4 border-t border-gray-200">
            <Pressable
              onPress={handleConfirm}
              className="bg-[#00a294] py-3 rounded-xl"
            >
              <Text className="text-white text-center font-medium">
                Confirm ({tempSelected.length} selected)
              </Text>
            </Pressable>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};
