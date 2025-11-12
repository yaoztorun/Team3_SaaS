import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { HStack } from '@/src/components/ui/hstack';
import { Camera, Image } from 'lucide-react-native';

interface ImageUploadBoxProps {
    onCameraPress: () => void;
    onGalleryPress: () => void;
}

export const ImageUploadBox: React.FC<ImageUploadBoxProps> = ({ 
    onCameraPress, 
    onGalleryPress 
}) => {
    return (
        <HStack space="md" className="w-full">
            <TouchableOpacity 
                className="flex-1 h-48 rounded-xl border-2 border-[#00a294] items-center justify-center bg-[#e6faf7]"
                onPress={onCameraPress}
                activeOpacity={0.7}
            >
                <Box className="items-center space-y-2">
                    <Camera size={32} color="#00786f" />
                    <Text className="text-[#00786f] font-medium">Camera</Text>
                </Box>
            </TouchableOpacity>
            <TouchableOpacity 
                className="flex-1 h-48 rounded-xl border-2 border-[#00a294] items-center justify-center bg-[#e6faf7]"
                onPress={onGalleryPress}
                activeOpacity={0.7}
            >
                <Box className="items-center space-y-2">
                    <Image size={32} color="#00786f" />
                    <Text className="text-[#00786f] font-medium">Upload Photo</Text>
                </Box>
            </TouchableOpacity>
        </HStack>
    );
};
