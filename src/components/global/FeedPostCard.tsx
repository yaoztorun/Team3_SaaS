import React from 'react';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { Pressable } from '@/src/components/ui/pressable';
import { Image, View } from 'react-native';
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
}

export const FeedPostCard = ({
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
}: FeedPostCardProps) => {
    return (
        <Box className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            {/* Header with user info */}
            <Box className="flex-row items-center px-4 pt-4 pb-3">
                <Box className="w-10 h-10 rounded-full bg-[#009689] items-center justify-center mr-3">
                    <Text className="text-white font-medium">{userInitials}</Text>
                </Box>
                <Box className="flex-1">
                    <Text className="text-base font-medium text-neutral-900">{userName}</Text>
                    <Text className="text-sm text-[#6a7282]">{timeAgo}</Text>
                </Box>
            </Box>

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

            {/* Actions and caption */}
            <Box className="px-4 py-4">
                {/* Action buttons */}
                <Box className="flex-row items-center mb-2">
                    <Pressable className="flex-row items-center mr-4">
                        <Heart
                            size={20}
                            color={isLiked ? '#ff0000' : '#4a5565'}
                            fill={isLiked ? '#ff0000' : 'none'}
                        />
                        <Text className="text-sm text-[#4a5565] ml-2">{likes}</Text>
                    </Pressable>
                    <Pressable className="flex-row items-center mr-4">
                        <MessageCircle size={20} color="#4a5565" />
                        <Text className="text-sm text-[#4a5565] ml-2">{comments}</Text>
                    </Pressable>
                    <Pressable>
                        <Share2 size={20} color="#4a5565" />
                    </Pressable>
                </Box>
                {/* Caption */}
                <Text className="text-sm text-neutral-900">{caption}</Text>
            </Box>
        </Box>
    );
};
