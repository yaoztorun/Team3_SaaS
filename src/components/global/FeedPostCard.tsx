// src/components/global/FeedPostCard.tsx
import React from 'react';
import { Image } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { Pressable } from '@/src/components/ui/pressable';
import { Heart, MessageCircle, Share2 } from 'lucide-react-native';

interface FeedPostCardProps {
  userName: string;
  userInitials: string;
  timeAgo: string;
  cocktailName: string;
  rating: number;
  imageUrl: string;
  likes: number;
  comments: number;
  caption: string;
  isLiked?: boolean;

  // highlight glow
  isHighlighted?: boolean;

  // callbacks
  onToggleLike?: () => void;
  onPressComments?: () => void;
  onPressUser?: () => void;   // 👈 NEW
}

export const FeedPostCard: React.FC<FeedPostCardProps> = ({
  userName,
  userInitials,
  timeAgo,
  cocktailName,
  rating,
  imageUrl,
  likes,
  comments,
  caption,
  isLiked = false,
  isHighlighted = false,
  onToggleLike,
  onPressComments,
  onPressUser,
}) => {
  return (
    <Box
      className="rounded-2xl bg-white overflow-hidden"
      style={{
        borderWidth: isHighlighted ? 3 : 1,
        borderColor: isHighlighted ? '#00BBA7' : '#e5e7eb',
        shadowColor: isHighlighted ? '#00BBA7' : '#000',
        shadowOpacity: isHighlighted ? 0.35 : 0.1,
        shadowRadius: isHighlighted ? 12 : 4,
        shadowOffset: { width: 0, height: 2 },
        transform: isHighlighted ? [{ scale: 1.02 }] : [{ scale: 1 }],
      }}
    >
      {/* Header with user info */}
      <Pressable
        className="flex-row items-center px-4 pt-4 pb-3"
        onPress={onPressUser}
      >
        <Box className="w-10 h-10 rounded-full bg-[#009689] items-center justify-center mr-3">
          <Text className="text-white font-medium">{userInitials}</Text>
        </Box>
        <Box className="flex-1">
          <Text className="text-base font-medium text-neutral-900">
            {userName}
          </Text>
          <Text className="text-sm text-[#6a7282]">{timeAgo}</Text>
        </Box>
      </Pressable>

      {/* Cocktail Image */}
      <Box className="w-full h-[414px] relative">
        <Image
          source={{ uri: imageUrl }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
        {/* Cocktail name and rating badge */}
        <Box className="absolute bottom-4 left-4 right-4 flex-row items-center justify-between">
          <Box className="bg-white/90 rounded-xl px-3 py-2">
            <Text className="text-sm text-neutral-900">{cocktailName}</Text>
          </Box>
          <Box className="bg-white/90 rounded-xl px-3 py-2 flex-row items-center">
            <Text className="text-yellow-500 mr-1">⭐</Text>
            <Text className="text-sm text-neutral-900">{rating}</Text>
          </Box>
        </Box>
      </Box>

      {/* Caption and actions */}
      <Box className="px-4 py-4">
        {/* Caption */}
        {caption ? (
          <Text className="text-sm text-neutral-900 mb-3">{caption}</Text>
        ) : null}

        {/* Action buttons */}
        <Box className="flex-row items-center">
          {/* Like */}
          <Pressable
            className="flex-row items-center mr-4"
            onPress={onToggleLike}
          >
            <Heart
              size={20}
              color={isLiked ? '#ff0000' : '#4a5565'}
              fill={isLiked ? '#ff0000' : 'none'}
            />
            <Text className="text-sm text-[#4a5565] ml-2">{likes}</Text>
          </Pressable>

          {/* Comments */}
          <Pressable
            className="flex-row items-center mr-4"
            onPress={onPressComments}
          >
            <MessageCircle size={20} color="#4a5565" />
            <Text className="text-sm text-[#4a5565] ml-2">{comments}</Text>
          </Pressable>

          {/* Share (no handler yet) */}
          <Pressable>
            <Share2 size={20} color="#4a5565" />
          </Pressable>
        </Box>
      </Box>
    </Box>
  );
};
