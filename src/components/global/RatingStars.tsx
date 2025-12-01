import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { HStack } from '@/src/components/ui/hstack';
import { Star } from 'lucide-react-native';

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

    const sizeMap = {
        sm: 28,
        md: 36,
        lg: 44,
    };

    const starSize = sizeMap[size];

    const handleStarPress = (starValue: number) => {
        // Emit a 0–10 value to keep Supabase scale unchanged
        onChange(starValue * 2);
    };

    // Show stars on a 0–5 basis for UI
    const displayRating = (isHovering ? hoverRating : value / 2);

    return (
        <HStack space="sm">
            {[1, 2, 3, 4, 5].map((star) => (
                <Pressable
                    key={star}
                    onPress={() => handleStarPress(star)}
                    onHoverIn={() => {
                        setIsHovering(true);
                        setHoverRating(star);
                    }}
                    onHoverOut={() => setIsHovering(false)}
                >
                    <Star
                        size={starSize}
                        color="#00a294"
                        fill={displayRating >= star ? '#00a294' : 'transparent'}
                        strokeWidth={2}
                    />
                </Pressable>
            ))}
        </HStack>
    );
};
