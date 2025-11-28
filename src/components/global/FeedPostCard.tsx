// src/components/global/FeedPostCard.tsx
import React, { useState } from 'react';
import { Image, Modal, View } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { Pressable } from '@/src/components/ui/pressable';
import { Heart, MessageCircle, Share2 } from 'lucide-react-native';
import { shareSystemSheet, shareToWhatsApp, copyLinkForLog } from '@/src/utils/share';
import { posthogCapture, ANALYTICS_EVENTS } from '@/src/analytics';

interface FeedPostCardProps {
  id: string;
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
  onPressUser?: () => void;
}

export const FeedPostCard: React.FC<FeedPostCardProps> = ({
  id,
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
  const [shareOpen, setShareOpen] = useState(false);

  const handleWhatsApp = async () => {
    posthogCapture(ANALYTICS_EVENTS.SHARE_CLICKED, {
      post_id: id,
      cocktail_name: cocktailName,
      share_method: 'whatsapp',
    });
    await shareToWhatsApp(id, cocktailName);
    setShareOpen(false);
  };
  const handleCopyLink = async () => {
    posthogCapture(ANALYTICS_EVENTS.SHARE_CLICKED, {
      post_id: id,
      cocktail_name: cocktailName,
      share_method: 'copy_link',
    });
    await copyLinkForLog(id);
    setShareOpen(false);
  };
  const handleSystemShare = async () => {
    posthogCapture(ANALYTICS_EVENTS.SHARE_CLICKED, {
      post_id: id,
      cocktail_name: cocktailName,
      share_method: 'system',
    });
    await shareSystemSheet(id, cocktailName);
    setShareOpen(false);
  };
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
      <Box 
        className="w-full h-[414px] relative"
        style={{
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: '#e5e7eb',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <Image
          source={{ uri: imageUrl }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
        {/* Cocktail name and rating badge */}
        <Box className="absolute bottom-4 left-4 right-4 flex-row items-center justify-between">
          <Box 
            className="rounded-xl px-3 py-2 flex-row items-center"
            style={{
              borderWidth: 2,
              borderColor: '#14b8a6',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
            }}
          >
            <Text className="text-base mr-1">🍸</Text>
            <Text className="text-sm text-neutral-900">{cocktailName}</Text>
          </Box>
          <Box 
            className="rounded-xl px-3 py-2 flex-row items-center"
            style={{
              borderWidth: 2,
              borderColor: '#14b8a6',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
            }}
          >
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
          <Pressable onPress={() => setShareOpen(true)}>
            <Share2 size={20} color="#4a5565" />
          </Pressable>
        </Box>
      </Box>

      {/* Share Bottom Modal */}
      <Modal
        visible={shareOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setShareOpen(false)}
      >
        <Pressable className="flex-1 bg-black/40" onPress={() => setShareOpen(false)}>
          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
            <Pressable onPress={(e) => e.stopPropagation()}>
              <Box
                className="bg-white rounded-t-3xl border-t border-neutral-200"
                style={{
                  paddingHorizontal: 16,
                  paddingTop: 12,
                  paddingBottom: 24,
                  maxHeight: 260,
                }}
              >
                <Text className="text-center text-base font-semibold mb-3">Share</Text>
                <Box className="flex-row items-center justify-around py-2">
                  <Pressable onPress={handleWhatsApp} className="items-center">
                    <Box className="w-12 h-12 rounded-full bg-[#25D366] items-center justify-center">
                      <Text className="text-white font-bold">WA</Text>
                    </Box>
                    <Text className="mt-2 text-xs text-neutral-900">WhatsApp</Text>
                  </Pressable>

                  <Pressable onPress={handleCopyLink} className="items-center">
                    <Box className="w-12 h-12 rounded-full bg-neutral-900 items-center justify-center">
                      <Text className="text-white font-bold">⎘</Text>
                    </Box>
                    <Text className="mt-2 text-xs text-neutral-900">Copy link</Text>
                  </Pressable>

                  <Pressable onPress={handleSystemShare} className="items-center">
                    <Box className="w-12 h-12 rounded-full bg-neutral-200 items-center justify-center">
                      <Text className="text-neutral-900 font-bold">…</Text>
                    </Box>
                    <Text className="mt-2 text-xs text-neutral-900">More…</Text>
                  </Pressable>
                </Box>
              </Box>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </Box>
  );
};
