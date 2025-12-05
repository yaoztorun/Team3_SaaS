import React, { useState } from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { Center } from '@/src/components/ui/center';

interface AvatarProps {
  /** Avatar URL (can be from Google, Supabase, etc.) */
  avatarUrl?: string | null;
  /** Fallback initials to display if no avatar or on error */
  initials?: string;
  /** Size in pixels (width and height) */
  size?: number;
  /** Background color for the fallback circle */
  fallbackColor?: string;
  /** Additional styles for the container */
  containerClassName?: string;
  /** Custom image style */
  imageStyle?: StyleProp<ImageStyle>;
}

/**
 * Centralized Avatar component that handles:
 * - Display of user avatars from various sources (Google, Supabase, etc.)
 * - Graceful fallback to initials when image fails to load (e.g., 429 rate limit)
 * - Consistent styling across the app
 */
export const Avatar: React.FC<AvatarProps> = ({
  avatarUrl,
  initials = '?',
  size = 40,
  fallbackColor = '#009689',
  containerClassName = '',
  imageStyle,
}) => {
  const [imageError, setImageError] = useState(false);

  // Show fallback if no URL, error occurred, or URL is invalid
  const showFallback = !avatarUrl || imageError;

  // Calculate font size based on avatar size
  // Following industry standard: ~40-45% of avatar size for optimal readability
  const getFontSize = () => {
    // Use 45% ratio as baseline for good visibility
    const calculatedSize = Math.round(size * 0.45);
    
    // Ensure minimum font size of 10px for very small avatars
    return Math.max(10, calculatedSize);
  };

  if (showFallback) {
    return (
      <Center
        className={containerClassName}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: fallbackColor,
        }}
      >
        <Text
          className="text-white font-medium"
          style={{
            fontSize: getFontSize(),
          }}
        >
          {initials}
        </Text>
      </Center>
    );
  }

  return (
    <Box
      className={`overflow-hidden bg-gray-200 ${containerClassName}`}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
      }}
    >
      <Image
        source={{ uri: avatarUrl }}
        style={[
          {
            width: size,
            height: size,
          },
          imageStyle,
        ]}
        resizeMode="cover"
        onError={() => {
          // Handle any image loading errors (including 429 rate limits from Google)
          console.log(`Avatar image failed to load: ${avatarUrl}`);
          setImageError(true);
        }}
      />
    </Box>
  );
};
