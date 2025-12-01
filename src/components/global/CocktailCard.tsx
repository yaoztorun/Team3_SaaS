import React from 'react';
import { TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { Heading } from '@/src/components/global';
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
  onPress,
}) => {
  return (
    <TouchableOpacity
      className="bg-white rounded-2xl overflow-hidden mb-4"
      onPress={onPress}
      style={styles.container}
    >
      {/* Image */}
      <Box className="relative h-48 bg-gray-100">
        <Image
          source={{ uri: image }}
          className="w-full h-full"
          resizeMode="cover"
        />

        {/* Name and Rating Overlay */}
        <Box className="absolute bottom-3 left-3 right-3 flex-row justify-between">
          <Box 
            className="px-4 py-2 rounded-xl"
            style={styles.nameTag}
          >
            <Heading level="h6" className="text-sm">
              {name}
            </Heading>
          </Box>

          <Box 
            className="px-3 py-2 rounded-xl flex-row items-center"
            style={styles.ratingTag}
          >
            <Star size={14} fill="#14b8a6" color="#14b8a6" />
            <Text className="text-sm font-semibold text-neutral-900 ml-1">
              {Math.round(rating / 2)}
            </Text>
          </Box>
        </Box>
      </Box>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  nameTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  ratingTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
});