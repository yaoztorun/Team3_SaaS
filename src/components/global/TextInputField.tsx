import React, { useState } from 'react';
import { TextInput as RNTextInput, TextInputProps, View } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';

interface TextInputFieldProps extends TextInputProps {
    label?: string;
    required?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    error?: string;
}

export const TextInputField: React.FC<TextInputFieldProps> = ({
    label,
    required = false,
    icon,
    iconPosition = 'right',
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
                    borderColor: error ? '#EF4444' : (isFocused ? '#9CA3AF' : '#D1D5DB'),
                }}
            >
                {icon && iconPosition === 'left' && (
                    <Box className="pl-3">
                        {icon}
                    </Box>
                )}
                <RNTextInput
                    className={`flex-1 p-3 ${icon && iconPosition === 'left' ? 'pl-2' : ''} ${icon && iconPosition === 'right' ? 'pr-2' : ''}`}
                    placeholderTextColor="#717182"
                    style={{ fontSize: 16, outlineStyle: 'none' } as any}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                />
                {icon && iconPosition === 'right' && (
                    <Box className="pr-3">
                        {icon}
                    </Box>
                )}
            </View>
            {error && (
                <Text className="text-sm text-red-500">{error}</Text>
            )}
        </Box>
    );
};
