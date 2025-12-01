import React, { useState } from 'react';
import { Image, Modal, View } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { Pressable } from '@/src/components/ui/pressable';
import { Heart, MessageCircle, Share2 } from 'lucide-react-native';
import { shareSystemSheet, shareToWhatsApp, copyLinkForLog } from '@/src/utils/share';
import { posthogCapture, trackFirstTime, ANALYTICS_EVENTS } from '@/src/analytics';
import { useAuth } from '@/src/hooks/useAuth';
import { TaggedUser } from '@/src/api/tags';

interface FeedPostCardProps {
  id: string;
  cocktailId: string;
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
  taggedFriends?: TaggedUser[];

  // highlight glow
  isHighlighted?: boolean;

  // callbacks
  onToggleLike?: () => void;
  onPressComments?: () => void;
  onPressUser?: () => void;
  onPressTags?: () => void;
  onPressCocktail?: (cocktailId: string) => void;
}

export const FeedPostCard: React.FC<FeedPostCardProps> = ({
  id,
  cocktailId,
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
  taggedFriends = [],
  isHighlighted = false,
  onToggleLike,
  onPressComments,
  onPressUser,
  onPressTags,
  onPressCocktail,
}) => {
  const [shareOpen, setShareOpen] = useState(false);
  const { user } = useAuth();
  const userId = user?.id;

  const handleWhatsApp = async () => {
    // Track first share with TTFA if it's user's first time
    const isFirstShare = trackFirstTime(ANALYTICS_EVENTS.SHARE_CLICKED, {
      post_id: id,
      cocktail_name: cocktailName,
      share_method: 'whatsapp',
    });
    
    // Also track regular share event (for all shares)
    if (!isFirstShare) {
      posthogCapture(ANALYTICS_EVENTS.SHARE_CLICKED, {
        post_id: id,
        cocktail_name: cocktailName,
        share_method: 'whatsapp',
      });
    }
    
    await shareToWhatsApp(id, cocktailName, userId);
    setShareOpen(false);
  };
  
  const handleCopyLink = async () => {
    const isFirstShare = trackFirstTime(ANALYTICS_EVENTS.SHARE_CLICKED, {
      post_id: id,
      cocktail_name: cocktailName,
      share_method: 'copy_link',
    });
    
    if (!isFirstShare) {
      posthogCapture(ANALYTICS_EVENTS.SHARE_CLICKED, {
        post_id: id,
        cocktail_name: cocktailName,
        share_method: 'copy_link',
      });
    }
    
    await copyLinkForLog(id, userId);
    setShareOpen(false);
  };
  
  const handleSystemShare = async () => {
    const isFirstShare = trackFirstTime(ANALYTICS_EVENTS.SHARE_CLICKED, {
      post_id: id,
      cocktail_name: cocktailName,
      share_method: 'system',
    });
    
    if (!isFirstShare) {
      posthogCapture(ANALYTICS_EVENTS.SHARE_CLICKED, {
        post_id: id,
        cocktail_name: cocktailName,
        share_method: 'system',
      });
    }
    
    await shareSystemSheet(id, cocktailName, userId, 'system');
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
          <Pressable 
            className="rounded-xl px-3 py-2 flex-row items-center"
            style={{
              borderWidth: 2,
              borderColor: '#14b8a6',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
            }}
            onPress={() => onPressCocktail?.(cocktailId)}
          >
            <Text className="text-base mr-1">🍸</Text>
            <Text className="text-sm text-neutral-900">{cocktailName}</Text>
          </Pressable>
          <Box 
            className="rounded-xl px-3 py-2 flex-row items-center"
            style={{
              borderWidth: 2,
              borderColor: '#14b8a6',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
            }}
          >
            <Text className="text-yellow-500 mr-1">⭐</Text>
            <Text className="text-sm text-neutral-900">{Math.round(rating / 2)}</Text>
          </Box>
        </Box>
      </Box>

      {/* Caption and actions */}
      <Box className="px-4 py-4">
        {/* Caption */}
        {caption ? (
          <Text className="text-sm text-neutral-900 mb-3">{caption}</Text>
        ) : null}

        {/* Tagged Friends */}
        {taggedFriends.length > 0 && (
          <Pressable
            className="flex-row items-center mb-3"
            onPress={onPressTags}
          >
            <Text className="text-sm text-neutral-600 mr-2">with</Text>
            <Box className="flex-row items-center">
              {taggedFriends.slice(0, 3).map((friend, index) => (
                <Box
                  key={friend.id}
                  style={{
                    marginLeft: index > 0 ? -8 : 0,
                    zIndex: 3 - index,
                  }}
                >
                  {friend.avatar_url ? (
                    <Image
                      source={{ uri: friend.avatar_url }}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        borderWidth: 2,
                        borderColor: '#fff',
                      }}
                    />
                  ) : (
                    <Box
                      className="items-center justify-center"
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: '#14b8a6',
                        borderWidth: 2,
                        borderColor: '#fff',
                      }}
                    >
                      <Text className="text-white text-xs font-medium">
                        {friend.full_name?.charAt(0)?.toUpperCase() || '?'}
                      </Text>
                    </Box>
                  )}
                </Box>
              ))}
              {taggedFriends.length > 3 && (
                <Box
                  className="items-center justify-center bg-gray-300"
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    marginLeft: -8,
                    borderWidth: 2,
                    borderColor: '#fff',
                  }}
                >
                  <Text className="text-xs font-medium text-gray-700">
                    +{taggedFriends.length - 3}
                  </Text>
                </Box>
              )}
            </Box>
            <Text className="text-sm text-neutral-600 ml-2">
              {taggedFriends.length === 1
                ? taggedFriends[0].full_name
                : taggedFriends.length === 2
                ? `${taggedFriends[0].full_name} and ${taggedFriends[1].full_name}`
                : `${taggedFriends[0].full_name} and ${taggedFriends.length - 1} others`}
            </Text>
          </Pressable>
        )}

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
          <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
            <Pressable onPress={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 480 }}>
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
