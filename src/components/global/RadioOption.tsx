import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';

interface RadioOptionProps {
    selected: boolean;
    onPress: () => void;
    icon: string;
    title: string;
    description: string;
}

export const RadioOption: React.FC<RadioOptionProps> = ({ 
    selected, 
    onPress, 
    icon, 
    title, 
    description 
}) => {
    return (
        <TouchableOpacity 
            className="flex-row items-center min-h-[68px] p-3 rounded-lg"
            onPress={onPress}
        >
            <Box className="w-10 h-10 rounded-full bg-[#cbfbf1] items-center justify-center">
                <Text className="text-base text-[#00786f]">{icon}</Text>
            </Box>
            <Box className="ml-6 flex-1">
                <Text className="text-base text-neutral-900">{title}</Text>
                <Text className="text-sm text-[#6a7282]">{description}</Text>
            </Box>
            <Box className="mr-2">
                <Box 
                    className={`w-4 h-4 rounded-full border ${
                        selected 
                            ? 'bg-[#030213] border-[#030213]' 
                            : 'bg-[#f3f3f5] border-[rgba(0,0,0,0.1)]'
                    }`} 
                />
            </Box>
        </TouchableOpacity>
    );
};
