import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { Text } from '@/src/components/ui/text';

interface PrimaryButtonProps extends TouchableOpacityProps {
    title: string;
    onPress: () => void;
    fullWidth?: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({ 
    title, 
    onPress, 
    fullWidth = true,
    ...props 
}) => {
    return (
        <TouchableOpacity 
            className={`bg-gradient-to-r from-[#009689] to-[#00786f] py-3 rounded-lg ${fullWidth ? '' : 'px-6'}`}
            onPress={onPress}
            activeOpacity={0.8}
            {...props}
        >
            <Text className="text-white text-center font-medium">
                {title}
            </Text>
        </TouchableOpacity>
    );
};
