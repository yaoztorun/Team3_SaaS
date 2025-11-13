import React from 'react';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';

interface CocktailCarouselCardProps {
    emoji: string;
    name: string;
    isCenter?: boolean;
}

export const CocktailCarouselCard = ({
    emoji,
    name,
    isCenter = false,
}: CocktailCarouselCardProps) => {
    return (
        <Box
            className={`${
                isCenter ? 'w-40 h-40' : 'w-[136px] h-[136px]'
            } rounded-2xl items-center justify-center shadow-md ${
                !isCenter ? 'opacity-40' : ''
            }`}
            style={{
                backgroundColor: isCenter ? 'white' : 'white',
            }}
        >
            <Text className={isCenter ? 'text-6xl mb-2' : 'text-5xl mb-2'}>{emoji}</Text>
            <Text className={`text-white ${isCenter ? 'text-base' : 'text-base'}`}>
                {name}
            </Text>
        </Box>
    );
};
