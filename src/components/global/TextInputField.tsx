import React from 'react';
import { TextInput as RNTextInput, TextInputProps, View } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';

interface TextInputFieldProps extends TextInputProps {
    label?: string;
    required?: boolean;
    icon?: React.ReactNode;
    error?: string;
}

export const TextInputField: React.FC<TextInputFieldProps> = ({ 
    label, 
    required = false,
    icon,
    error,
    ...props 
}) => {
    return (
        <Box className="space-y-2">
            {label && (
                <Text className="text-sm text-neutral-950">
                    {label} {required && '*'}
                </Text>
            )}
            <View className={`bg-white rounded-lg border ${error ? 'border-red-500' : 'border-gray-200'} flex-row items-center`}>
                {icon && (
                    <Box className="pl-3">
                        {icon}
                    </Box>
                )}
                <RNTextInput 
                    className={`flex-1 p-3 ${icon ? 'pl-2' : ''}`}
                    placeholderTextColor="#717182"
                    {...props}
                />
            </View>
            {error && (
                <Text className="text-sm text-red-500">{error}</Text>
            )}
        </Box>
    );
};
