import React from 'react';
import { Image, StyleSheet, Pressable } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Heading } from '@/src/components/global';
import type { ImageSourcePropType } from 'react-native';

type Props = {
  name: string;
  image: ImageSourcePropType;
  isCenter: boolean;
  onPress?: () => void;
};

export const CocktailCarouselCard: React.FC<Props> = ({
  name,
  image,
  isCenter,
  onPress,
}) => {
  return (
    <Pressable onPress={onPress}>
      <Box
        className="items-center bg-white rounded-3xl overflow-hidden"
        style={[
          styles.card,
          !isCenter && styles.cardSide,
          isCenter && styles.cardCenter,
        ]}
      >
        {/* Image Container with fixed aspect ratio */}
        <Box style={styles.imageContainer}>
          <Image 
            source={image} 
            style={styles.image} 
            resizeMode="contain"
          />
          {/* Gradient overlay */}
          <Box style={styles.gradientOverlay} />
        </Box>
        
        {/* Title */}
        <Box style={styles.titleContainer}>
          <Heading
            level="h5"
            className="text-lg"
            numberOfLines={1}
          >
            {name}
          </Heading>
        </Box>
      </Box>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  cardCenter: {
    borderWidth: 2,
    borderColor: '#14b8a6', // primary-500
    transform: [{ scale: 1 }],
    opacity: 1,
    shadowOpacity: 0.2,
  },
  cardSide: {
    opacity: 0.6,
    transform: [{ scale: 0.92 }],
  },
  imageContainer: {
    width: '100%',
    height: 280,
    backgroundColor: '#f3f4f6',
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    padding: 16,
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  titleContainer: {
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
});