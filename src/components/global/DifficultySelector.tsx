import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { HStack } from '@/src/components/ui/hstack';

type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

interface DifficultySelectorProps {
    selected: DifficultyLevel;
    onChange: (level: DifficultyLevel) => void;
}

const difficultyConfig: Record<DifficultyLevel, { icon: string; emoji: string }> = {
    Easy: { icon: '🥂', emoji: '🥂' },
    Medium: { icon: '🍸', emoji: '🍸' },
    Hard: { icon: '🍹', emoji: '🍹' },
};

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({ 
    selected, 
    onChange 
}) => {
    return (
        <HStack space="md" className="justify-center">
            {(Object.keys(difficultyConfig) as DifficultyLevel[]).map((level) => (
                <TouchableOpacity 
                    key={level}
                    onPress={() => onChange(level)}
                    className="items-center px-4"
                >
                    <Box 
                        className={`w-12 h-12 rounded-full items-center justify-center mb-2 ${
                            selected === level 
                                ? 'bg-[#cbfbf1] border-2 border-[#00786f]' 
                                : 'bg-primary-50'
                        }`}
                    >
                        <Text className="text-xl">
                            {difficultyConfig[level].emoji}
                        </Text>
                    </Box>
                    <Text 
                        className={`text-sm ${
                            selected === level 
                                ? 'text-[#00786f] font-bold' 
                                : 'text-neutral-600'
                        }`}
                    >
                        {level}
                    </Text>
                </TouchableOpacity>
            ))}
        </HStack>
    );
};
