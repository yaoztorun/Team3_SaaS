import React, { memo } from 'react';
import { Image, ImageProps } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { Center } from '@/src/components/ui/center';

interface AvatarProps {
    avatarUrl?: string | null;
    fallbackText?: string;
    size?: number;
    className?: string;
}

/**
 * Avatar component with built-in caching to prevent excessive image requests.
 * Use this instead of rendering Image directly for user profile pictures.
 */
export const Avatar = memo(({ avatarUrl, fallbackText = '?', size = 48, className = '' }: AvatarProps) => {
    const sizeClass = `w-[${size}px] h-[${size}px]`;
    
    if (avatarUrl) {
        return (
            <Box className={`rounded-full overflow-hidden bg-gray-200 ${className}`} style={{ width: size, height: size }}>
                <Image 
                    source={{ 
                        uri: avatarUrl,
                        // Add cache headers to reduce requests
                        headers: {
                            'Cache-Control': 'max-age=3600',
                        }
                    }}
                    style={{ width: size, height: size }}
                    resizeMode="cover"
                />
            </Box>
        );
    }
    
    return (
        <Center className={`rounded-full bg-teal-500 ${className}`} style={{ width: size, height: size }}>
            <Text className="text-white" style={{ fontSize: size / 3 }}>
                {fallbackText.charAt(0)?.toUpperCase() || '?'}
            </Text>
        </Center>
    );
}, (prevProps, nextProps) => {
    // Custom comparison to prevent re-renders if props haven't actually changed
    return prevProps.avatarUrl === nextProps.avatarUrl &&
           prevProps.fallbackText === nextProps.fallbackText &&
           prevProps.size === nextProps.size &&
           prevProps.className === nextProps.className;
});

Avatar.displayName = 'Avatar';
