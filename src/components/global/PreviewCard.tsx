import React from 'react';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { Pressable } from '@/src/components/ui/pressable';

interface PreviewCardProps {
    emoji: string;
    title: string;
    subtitle?: string;
    rating?: number;
    price?: string;
    onPress?: () => void;
    variant?: 'cocktail' | 'bar' | 'event' | 'shop';
}

export const PreviewCard = ({
    emoji,
    title,
    subtitle,
    rating,
    price,
    onPress,
    variant = 'cocktail',
}: PreviewCardProps) => {
    if (variant === 'cocktail') {
        return (
            <Pressable onPress={onPress} className="w-32 h-32 rounded-2xl overflow-hidden shadow-md relative bg-gray-800">
                <Box className="absolute inset-0 items-center justify-center opacity-30">
                    <Text className="text-6xl">{emoji}</Text>
                </Box>
                {/* Gradient overlay for better text readability */}
                <Box className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
                <Box className="absolute bottom-3 left-3 right-3">
                    <Text className="text-sm text-white mb-1">{title}</Text>
                    {rating && (
                        <Box className="flex-row items-center">
                            <Text className="text-xs text-white mr-1">⭐</Text>
                            <Text className="text-xs text-white">{rating}</Text>
                        </Box>
                    )}
                </Box>
            </Pressable>
        );
    }

    if (variant === 'bar') {
        return (
            <Pressable
                onPress={onPress}
                className="w-32 bg-white border-2 border-[#00bba7] rounded-2xl p-4"
            >
                <Text className="text-4xl mb-2">{emoji}</Text>
                <Text className="text-sm text-neutral-900 mb-2">{title}</Text>
                {rating && (
                    <Box className="flex-row items-center">
                        <Text className="text-xs text-[#009689] mr-1">⭐</Text>
                        <Text className="text-xs text-[#009689]">{rating}</Text>
                    </Box>
                )}
            </Pressable>
        );
    }

    if (variant === 'shop') {
        return (
            <Pressable
                onPress={onPress}
                className="w-32 bg-white border-2 border-[#00bba7] rounded-2xl p-3"
            >
                <Text className="text-3xl mb-2">{emoji}</Text>
                <Text className="text-xs text-neutral-900 mb-2" numberOfLines={2}>
                    {title}
                </Text>
                {price && <Text className="text-xs text-[#009689]">{price}</Text>}
            </Pressable>
        );
    }

    return null;
};
