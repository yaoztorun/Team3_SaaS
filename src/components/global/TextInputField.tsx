import React, { useState } from 'react';
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
    const [isFocused, setIsFocused] = useState(false);

    return (
        <Box className="space-y-2">
            {label && (
                <Text className="text-sm text-neutral-950">
                    {label} {required && '*'}
                </Text>
            )}
            <View 
                className="bg-white rounded-lg border flex-row items-center" 
                style={{
                    shadowColor: '#000', 
                    shadowOffset: { width: 0, height: 1 }, 
                    shadowOpacity: 0.05, 
                    shadowRadius: 2, 
                    elevation: 1,
                    borderColor: error ? '#EF4444' : (isFocused ? '#9CA3AF' : '#E5E7EB'),
                }}
            >
                {icon && (
                    <Box className="pl-3">
                        {icon}
                    </Box>
                )}
                <RNTextInput 
                    className={`flex-1 p-3 ${icon ? 'pl-2' : ''}`}
                    placeholderTextColor="#717182"
                    style={{ outlineStyle: 'none' } as any}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                />
            </View>
            {error && (
                <Text className="text-sm text-red-500">{error}</Text>
            )}
        </Box>
    );
};
