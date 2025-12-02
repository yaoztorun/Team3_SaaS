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
        <Box className="rounded-lg">
            <HStack>
                <Pressable 
                    className={`flex-1 py-2 px-4 rounded-xl justify-center ${value === 'left' ? 'bg-teal-500' : 'border border-gray-300'}`}
                    onPress={() => onChange('left')}
                >
                    <Text className={`text-center text-sm font-medium ${value === 'left' ? 'text-white' : 'text-neutral-900'}`}>
                        {leftLabel}
                    </Text>
                </Pressable>
                <Pressable 
                    className={`flex-1 py-2 px-4 rounded-xl justify-center ${value === 'right' ? 'bg-teal-500' : 'border border-gray-300'}`}
                    onPress={() => onChange('right')}
                >
                    <Text className={`text-center text-sm font-medium ${value === 'right' ? 'text-white' : 'text-neutral-900'}`}>
                        {rightLabel}
                    </Text>
                </Pressable>
            </HStack>
        </Box>
    );
};
