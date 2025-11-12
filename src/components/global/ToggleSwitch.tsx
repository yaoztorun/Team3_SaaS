import React from 'react';
import { Pressable } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { HStack } from '@/src/components/ui/hstack';

type ToggleValue = 'left' | 'right';

interface ToggleSwitchProps {
    value: ToggleValue;
    onChange: (value: ToggleValue) => void;
    leftLabel: string;
    rightLabel: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ 
    value, 
    onChange, 
    leftLabel, 
    rightLabel 
}) => {
    return (
        <Box className="bg-gray-200 rounded-[14px] p-1">
            <HStack className="h-[29px]">
                <Pressable 
                    className={`flex-1 rounded-[14px] justify-center ${value === 'left' ? 'bg-[#00bba7]' : ''}`}
                    onPress={() => onChange('left')}
                >
                    <Text className={`text-center text-sm ${value === 'left' ? 'text-white' : 'text-neutral-950'}`}>
                        {leftLabel}
                    </Text>
                </Pressable>
                <Pressable 
                    className={`flex-1 rounded-[14px] justify-center ${value === 'right' ? 'bg-[#00bba7]' : ''}`}
                    onPress={() => onChange('right')}
                >
                    <Text className={`text-center text-sm ${value === 'right' ? 'text-white' : 'text-neutral-950'}`}>
                        {rightLabel}
                    </Text>
                </Pressable>
            </HStack>
        </Box>
    );
};
