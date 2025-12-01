import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '@/src/components/ui/text';
import { colors } from '@/src/theme/colors';

interface PrimaryButtonProps extends TouchableOpacityProps {
    title: string;
    onPress: () => void;
    fullWidth?: boolean;
    loading?: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({ 
    title, 
    onPress, 
    fullWidth = true,
    loading = false,
    disabled,
    ...props 
}) => {
    const isDisabled = disabled || loading;
    
    return (
        <TouchableOpacity 
            onPress={onPress}
            activeOpacity={0.8}
            disabled={isDisabled}
            {...props}
        >
            <LinearGradient
                colors={[colors.primary[500], colors.primary[600]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                    paddingVertical: 12,
                    paddingHorizontal: fullWidth ? 0 : 24,
                    borderRadius: 8,
                    opacity: isDisabled ? 0.6 : 1,
                }}
            >
                {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <Text className="text-white text-center font-medium">
                        {title}
                    </Text>
                )}
            </LinearGradient>
        </TouchableOpacity>
    );
};
