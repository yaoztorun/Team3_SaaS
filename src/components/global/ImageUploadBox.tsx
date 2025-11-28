import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { ImagePlus } from 'lucide-react-native';
import { ImagePickerModal } from './ImagePickerModal';

interface ImageUploadBoxProps {
    onCameraPress: () => void;
    onGalleryPress: () => void;
    title?: string;
}

export const ImageUploadBox: React.FC<ImageUploadBoxProps> = ({ 
    onCameraPress, 
    onGalleryPress,
    title = "Add Photo"
}) => {
    const [showModal, setShowModal] = useState(false);

    const handleCameraPress = () => {
        setShowModal(false);
        onCameraPress();
    };

    const handleGalleryPress = () => {
        setShowModal(false);
        onGalleryPress();
    };

    return (
        <>
            <TouchableOpacity 
                className="h-48 rounded-xl border-2 border-[#00a294] items-center justify-center bg-[#e6faf7]"
                onPress={() => setShowModal(true)}
                activeOpacity={0.7}
            >
                <Box className="items-center space-y-2">
                    <ImagePlus size={48} color="#00786f" />
                    <Text className="text-[#00786f] font-medium">{title}</Text>
                </Box>
            </TouchableOpacity>

            <ImagePickerModal
                visible={showModal}
                onClose={() => setShowModal(false)}
                onCameraPress={handleCameraPress}
                onGalleryPress={handleGalleryPress}
                title={title}
            />
        </>
    );
};
