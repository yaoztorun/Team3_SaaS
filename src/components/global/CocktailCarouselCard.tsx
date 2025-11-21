import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import type { ImageSourcePropType } from 'react-native';

type Props = {
  name: string;
  image: ImageSourcePropType;
  isCenter: boolean;
};

export const CocktailCarouselCard: React.FC<Props> = ({
  name,
  image,
  isCenter,
}) => {
  return (
    <Box
      style={[
        styles.card,
        !isCenter && styles.cardSide,
      ]}
      className="items-center justify-center bg-white rounded-3xl"
    >
      <Image source={image} style={styles.image} resizeMode="contain" />
      <Text
        className="mt-3 text-base font-semibold text-neutral-900"
        numberOfLines={1}
      >
        {name}
      </Text>
    </Box>
  );
};

const styles = StyleSheet.create({
  card: {
    paddingVertical: 32,
    paddingHorizontal: 12,
    opacity: 1,
    // Figma look: subtle shadow & bigger scale for center card
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 4,
  },
  cardSide: {
    opacity: 0.25, // this matches the side cards in Figma frames
  },
  image: {
    width: 140, // tune with Figma values if you want
    height: 220,
  },
});
