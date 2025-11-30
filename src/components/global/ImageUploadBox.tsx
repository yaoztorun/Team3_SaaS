import React, { useState } from 'react';
import { TouchableOpacity, Image as RNImage } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { ImagePlus, RefreshCw } from 'lucide-react-native';
import { ImagePickerModal } from './ImagePickerModal';

interface ImageUploadBoxProps {
    onCameraPress: () => void;
    onGalleryPress: () => void;
    title?: string;
    imageUri?: string | null;
}

export const ImageUploadBox: React.FC<ImageUploadBoxProps> = ({
    onCameraPress,
    onGalleryPress,
    title = "Add Photo",
    imageUri
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
            {!imageUri ? (
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
            ) : (
                <Box className="space-y-3">
                    <Box className="rounded-xl overflow-hidden">
                        <RNImage
                            source={{ uri: imageUri }}
                            style={{ width: '100%', height: 200 }}
                            resizeMode="cover"
                        />
                    </Box>
                    <TouchableOpacity
                        className="flex-row items-center justify-center space-x-2 py-2 px-4 rounded-lg border-2 border-[#00a294] bg-[#e6faf7]"
                        onPress={() => setShowModal(true)}
                        activeOpacity={0.7}
                    >
                        <RefreshCw size={18} color="#00786f" />
                        <Text className="text-[#00786f] font-medium">Choose Different Picture</Text>
                    </TouchableOpacity>
                </Box>
            )}

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
