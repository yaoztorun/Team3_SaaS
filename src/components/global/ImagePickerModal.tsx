import React from 'react';
import { Modal, TouchableOpacity } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { Pressable } from '@/src/components/ui/pressable';
import { Camera, Image as ImageIcon, X } from 'lucide-react-native';
import { Heading } from './Heading';

interface ImagePickerModalProps {
    visible: boolean;
    onClose: () => void;
    onCameraPress: () => void;
    onGalleryPress: () => void;
    title?: string;
}

export const ImagePickerModal: React.FC<ImagePickerModalProps> = ({
    visible,
    onClose,
    onCameraPress,
    onGalleryPress,
    title = "Add Photo"
}) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity 
                className="flex-1 bg-black/50 justify-end"
                activeOpacity={1}
                onPress={onClose}
                style={{ alignItems: 'center' }}
            >
                <TouchableOpacity 
                    activeOpacity={1} 
                    onPress={(e) => e.stopPropagation()}
                    style={{ width: '100%', maxWidth: 480 }}
                >
                    <Box className="bg-white rounded-t-3xl p-6">
                        <Box className="flex-row justify-between items-center mb-4">
                            <Heading level="h3">{title}</Heading>
                            <Pressable onPress={onClose}>
                                <X size={24} color="#666" />
                            </Pressable>
                        </Box>

                        <TouchableOpacity
                            className="bg-gray-50 rounded-xl p-4 mb-3 flex-row items-center"
                            onPress={onCameraPress}
                        >
                            <Box className="bg-teal-500 rounded-full p-3 mr-4">
                                <Camera size={24} color="white" />
                            </Box>
                            <Box>
                                <Text className="text-base font-medium text-neutral-900">Take Photo</Text>
                                <Text className="text-sm text-gray-600">Use your camera</Text>
                            </Box>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="bg-gray-50 rounded-xl p-4 flex-row items-center"
                            onPress={onGalleryPress}
                        >
                            <Box className="bg-teal-500 rounded-full p-3 mr-4">
                                <ImageIcon size={24} color="white" />
                            </Box>
                            <Box>
                                <Text className="text-base font-medium text-neutral-900">Choose from Library</Text>
                                <Text className="text-sm text-gray-600">Select an existing photo</Text>
                            </Box>
                        </TouchableOpacity>
                    </Box>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};
