import React from 'react';
import { Image } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { Center } from '@/src/components/ui/center';
import { HStack } from '@/src/components/ui/hstack';
import { Pressable } from '@/src/components/ui/pressable';
import { Heading } from '@/src/components/global';
import type { Profile } from '@/src/types/profile';
import { Badge } from '@/src/api/badges';

interface ProfileHeaderProps {
  profile: Profile | null;
  loadingProfile: boolean;
  userEmail?: string;
  badges: Badge[];
  loadingBadges: boolean;
  onBadgePress: (badge: Badge) => void;
  onEditProfile: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  loadingProfile,
  userEmail,
  badges,
  loadingBadges,
  onBadgePress,
  onEditProfile,
}) => {
  return (
    <Box className="mb-4 p-6 bg-white rounded-2xl">
      <HStack className="mb-4">
        {profile?.avatar_url ? (
          <Box className="w-20 h-20 rounded-full overflow-hidden bg-gray-200">
            <Image
              source={{ uri: profile.avatar_url }}
              style={{ width: 80, height: 80 }}
              resizeMode="cover"
            />
          </Box>
        ) : (
          <Center className="h-20 w-20 rounded-full bg-teal-500">
            <Text className="text-2xl text-white">
              {profile?.full_name?.charAt(0)?.toUpperCase() ||
                userEmail?.charAt(0)?.toUpperCase() ||
                '?'}
            </Text>
          </Center>
        )}
        <Box className="ml-4 flex-1">
          <Heading level="h4">
            {loadingProfile
              ? 'Loading...'
              : profile?.full_name ||
              userEmail?.split('@')[0] ||
              'User'}
          </Heading>
          {/* Badges */}
          <Box className="mt-2">
            {loadingBadges ? (
              <Text className="text-xs text-neutral-500">Loading badges...</Text>
            ) : badges.length > 0 ? (
              <HStack className="flex-wrap gap-2">
                {badges.slice(0, 6).map((badge) => (
                  <Pressable
                    key={badge.type}
                    onPress={() => onBadgePress(badge)}
                    className="items-center"
                    style={{ width: 42 }}
                  >
                    <Image
                      source={{ uri: badge.imageUrl }}
                      style={{ width: 40, height: 40 }}
                      resizeMode="contain"
                    />
                  </Pressable>
                ))}
              </HStack>
            ) : (
              <Text className="text-xs text-neutral-500">No badges earned yet</Text>
            )}
          </Box>
        </Box>
      </HStack>
      <Pressable
        onPress={onEditProfile}
        className="flex-row justify-center items-center py-2 rounded-lg bg-teal-500"
      >
        <Text className="text-sm text-white font-medium">Edit Profile</Text>
      </Pressable>
    </Box>
  );
};
