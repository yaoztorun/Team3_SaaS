import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Text } from '@/src/components/ui/text';

interface FilterChipProps {
    label: string;
    selected: boolean;
    onPress: () => void;
}

export const FilterChip: React.FC<FilterChipProps> = ({ 
    label, 
    selected, 
    onPress 
}) => {
    return (
        <TouchableOpacity 
            className={`px-4 py-2 rounded-full border ${
                selected 
                    ? 'bg-primary-500 border-primary-500' 
                    : 'bg-white border-gray-300'
            }`}
            onPress={onPress}
        >
            <Text 
                className={`text-sm ${
                    selected ? 'text-white' : 'text-gray-600'
                }`}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
};
