import React from 'react';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { Pressable } from '@/src/components/ui/pressable';
import { Calendar } from 'lucide-react-native';

interface EventCardProps {
    title: string;
    dateTime: string;
    attending: number;
    price: string;
    onPress?: () => void;
}

export const EventCard = ({ title, dateTime, attending, price, onPress }: EventCardProps) => {
    return (
        <Pressable
            onPress={onPress}
            className="w-64 bg-white border border-gray-200 rounded-2xl p-4"
        >
            <Box className="flex-row items-start justify-between mb-2">
                <Box className="flex-1">
                    <Text className="text-sm font-medium text-neutral-900 mb-1">{title}</Text>
                    <Box className="flex-row items-center">
                        <Calendar size={16} color="#4a5565" />
                        <Text className="text-sm text-[#4a5565] ml-2">{dateTime}</Text>
                    </Box>
                </Box>
                <Box className="bg-[#cbfbf1] rounded-lg px-2 py-1">
                    <Text className="text-xs text-[#00786f]">{price}</Text>
                </Box>
            </Box>
            <Text className="text-sm text-[#6a7282]">{attending} attending</Text>
        </Pressable>
    );
};
