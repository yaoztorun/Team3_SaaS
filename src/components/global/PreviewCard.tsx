import React from 'react';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { Pressable } from '@/src/components/ui/pressable';
import { Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface PreviewCardProps {
    emoji?: string;
    imageUrl?: string;
    title: string;
    subtitle?: string;
    rating?: number;
    price?: string;
    onPress?: () => void;
    variant?: 'cocktail' | 'bar' | 'event' | 'shop';
}

export const PreviewCard = ({
    emoji,
    imageUrl,
    title,
    subtitle,
    rating,
    price,
    onPress,
    variant = 'cocktail',
}: PreviewCardProps) => {
    if (variant === 'cocktail') {
        return (
            <Pressable onPress={onPress} className="w-32 h-32 rounded-2xl overflow-hidden shadow-md relative bg-gray-800 border-2 border-[#00BBA7]">
                {imageUrl ? (
                    <Image
                        source={{ uri: imageUrl }}
                        style={{ width: '100%', height: '100%', position: 'absolute' }}
                        resizeMode="cover"
                    />
                ) : (
                    <Box className="absolute inset-0 items-center justify-center opacity-30">
                        <Text className="text-6xl">{emoji || '🍸'}</Text>
                    </Box>
                )}
                {/* Stronger gradient overlay for better text visibility */}
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
                    locations={[0, 0.5, 1]}
                    style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
                />
                <Box className="absolute bottom-3 left-3 right-3">
                    <Text className="text-sm text-white font-semibold mb-1" numberOfLines={1}>{title}</Text>
                    {rating && (
                        <Box className="flex-row items-center">
                            <Text className="text-xs text-white mr-1">⭐</Text>
                            <Text className="text-xs text-white">{rating.toFixed(1)}</Text>
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
                className="w-32 h-32 rounded-2xl overflow-hidden shadow-md relative border-2 border-[#00BBA7]"
            >
                {imageUrl ? (
                    <Image
                        source={{ uri: imageUrl }}
                        style={{ width: '100%', height: '100%', position: 'absolute' }}
                        resizeMode="cover"
                    />
                ) : (
                    <Box className="absolute inset-0 items-center justify-center bg-gray-800 opacity-30">
                        <Text className="text-6xl">{emoji || '🍸'}</Text>
                    </Box>
                )}
                {/* Stronger gradient overlay for better text visibility */}
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
                    locations={[0, 0.5, 1]}
                    style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
                />
                <Box className="absolute bottom-3 left-3 right-3">
                    <Text className="text-sm text-white font-semibold mb-1" numberOfLines={1}>{title}</Text>
                    {rating && (
                        <Box className="flex-row items-center">
                            <Text className="text-xs text-white mr-1">⭐</Text>
                            <Text className="text-xs text-white">{typeof rating === 'number' ? rating.toFixed(1) : rating}</Text>
                        </Box>
                    )}
                </Box>
            </Pressable>
        );
    }

    if (variant === 'shop') {
        return (
            <Pressable
                onPress={onPress}
                className="w-32 h-32 rounded-2xl overflow-hidden shadow-md relative border-2 border-[#00BBA7]"
            >
                {imageUrl ? (
                    <Image
                        source={{ uri: imageUrl }}
                        style={{ width: '100%', height: '100%', position: 'absolute' }}
                        resizeMode="cover"
                    />
                ) : (
                    <Box className="absolute inset-0 items-center justify-center bg-gray-800 opacity-30">
                        <Text className="text-3xl">{emoji || '🛍️'}</Text>
                    </Box>
                )}
                {/* Stronger gradient overlay for better text visibility */}
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
                    locations={[0, 0.5, 1]}
                    style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
                />
                <Box className="absolute bottom-3 left-3 right-3">
                    <Text className="text-xs text-white font-semibold mb-1" numberOfLines={2}>
                        {title}
                    </Text>
                    {price && <Text className="text-xs text-white font-semibold">{price}</Text>}
                </Box>
            </Pressable>
        );
    }

    return null;
};
