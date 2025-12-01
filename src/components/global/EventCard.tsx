import React from 'react';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { Pressable } from '@/src/components/ui/pressable';
import { Calendar } from 'lucide-react-native';
import { Image } from 'react-native';

interface EventCardProps {
    title: string;
    dateTime: string;
    attending: number;
    price: string;
    imageUrl?: string;
    onPress?: () => void;
}

export const EventCard = ({ title, dateTime, attending, price, imageUrl, onPress }: EventCardProps) => {
    return (
        <Pressable
            onPress={onPress}
            className="w-64 bg-white border-2 border-[#00bba7] rounded-2xl overflow-hidden shadow-md"
        >
            {/* Cover Image */}
            {imageUrl ? (
                <Box>
                    <Image
                        source={{ uri: imageUrl }}
                        style={{ width: '100%', height: 120 }}
                        resizeMode="cover"
                    />
                    <Box className="h-px bg-gray-300" />
                </Box>
            ) : (
                <Box>
                    <Box className="bg-gray-200 items-center justify-center" style={{ height: 120 }}>
                        <Text className="text-5xl">🎉</Text>
                    </Box>
                    <Box className="h-px bg-gray-300" />
                </Box>
            )}
            
            {/* Event Info */}
            <Box className="p-4">
                {/* Title and Price on same line */}
                <Box className="flex-row items-center justify-between mb-2">
                    <Text className="text-sm font-medium text-neutral-900 flex-1 mr-2" numberOfLines={1}>{title}</Text>
                    <Text className="text-sm font-semibold text-neutral-900">{price}</Text>
                </Box>
                <Box className="flex-row items-center mb-2">
                    <Calendar size={14} color="#4a5565" />
                    <Text className="text-xs text-[#4a5565] ml-2" numberOfLines={1}>{dateTime}</Text>
                </Box>
                <Text className="text-xs text-[#6a7282]">{attending} attending</Text>
            </Box>
        </Pressable>
    );
};
