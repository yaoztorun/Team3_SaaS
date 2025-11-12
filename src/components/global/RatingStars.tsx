import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { HStack } from '@/src/components/ui/hstack';

interface RatingStarsProps {
    value: number;
    onChange: (rating: number) => void;
    size?: 'sm' | 'md' | 'lg';
}

export const RatingStars: React.FC<RatingStarsProps> = ({ 
    value, 
    onChange, 
    size = 'md' 
}) => {
    const [hoverRating, setHoverRating] = useState(0);
    const [isHovering, setIsHovering] = useState(false);

    const sizeClasses = {
        sm: 'text-xl',
        md: 'text-2xl',
        lg: 'text-3xl',
    };

    const handleStarInteraction = (starValue: number, isHover: boolean = false) => {
        if (isHover) {
            setHoverRating(starValue);
        } else {
            onChange(starValue);
            setHoverRating(0);
        }
    };

    const displayRating = isHovering ? hoverRating : value;

    return (
        <HStack space="sm">
            {[1, 2, 3, 4, 5].map((star) => (
                <Box key={star} className="relative">
                    {/* Full star background */}
                    <Text className={`${sizeClasses[size]} text-gray-200`}>★</Text>
                    {/* Left half of star */}
                    <Pressable
                        className="absolute top-0 left-0 w-1/2 h-full overflow-hidden"
                        onPress={() => handleStarInteraction(star - 0.5)}
                        onHoverIn={() => {
                            setIsHovering(true);
                            handleStarInteraction(star - 0.5, true);
                        }}
                        onHoverOut={() => setIsHovering(false)}
                    >
                        <Text className={`${sizeClasses[size]} ${displayRating >= star - 0.5 ? 'text-yellow-400' : 'text-gray-200'}`}>
                            ★
                        </Text>
                    </Pressable>
                    {/* Right half of star */}
                    <Pressable
                        className="absolute top-0 right-0 w-1/2 h-full overflow-hidden"
                        onPress={() => handleStarInteraction(star)}
                        onHoverIn={() => {
                            setIsHovering(true);
                            handleStarInteraction(star, true);
                        }}
                        onHoverOut={() => setIsHovering(false)}
                    >
                        <Text 
                            className={`${sizeClasses[size]} ${displayRating >= star ? 'text-yellow-400' : 'text-gray-200'}`}
                            style={{ marginLeft: -10 }}
                        >
                            ★
                        </Text>
                    </Pressable>
                </Box>
            ))}
        </HStack>
    );
};
