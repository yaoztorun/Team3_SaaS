import React from 'react';
import { TouchableOpacity, Image } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { Star } from 'lucide-react-native';

interface CocktailCardProps {
    name: string;
    image: string;
    rating: number;
    onPress: () => void;
}

export const CocktailCard: React.FC<CocktailCardProps> = ({ 
    name, 
    image, 
    rating, 
    onPress 
}) => {
    return (
        <TouchableOpacity 
            className="bg-white rounded-2xl overflow-hidden mb-4"
            onPress={onPress}
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
            }}
        >
            {/* Image */}
            <Box className="relative h-48 bg-gray-200">
                <Image 
                    source={{ uri: image }} 
                    className="w-full h-full"
                    resizeMode="cover"
                />
                
                {/* Name and Rating Overlay */}
                <Box className="absolute bottom-3 left-3 right-3 flex-row justify-between">
                    <Box className="bg-white/90 px-3 py-2 rounded-lg">
                        <Text className="text-sm font-medium text-neutral-950">
                            {name}
                        </Text>
                    </Box>
                    
                    <Box className="bg-white/90 px-3 py-2 rounded-lg flex-row items-center">
                        <Star size={14} fill="#FFD700" color="#FFD700" />
                        <Text className="text-sm text-neutral-950 ml-1">
                            {rating.toFixed(1)}
                        </Text>
                    </Box>
                </Box>
            </Box>
        </TouchableOpacity>
    );
};
