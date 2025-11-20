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

const difficultyConfig: Record<DifficultyLevel, { icon: string; emoji: string; bgColor: string; borderColor: string; textColor: string }> = {
    Easy: {
        icon: '🥂',
        emoji: '🥂',
        bgColor: '#d1fae5',
        borderColor: '#10b981',
        textColor: '#065f46'
    },
    Medium: {
        icon: '🍸',
        emoji: '🍸',
        bgColor: '#dbeafe',
        borderColor: '#3b82f6',
        textColor: '#1e40af'
    },
    Hard: {
        icon: '🍹',
        emoji: '🍹',
        bgColor: '#fee2e2',
        borderColor: '#ef4444',
        textColor: '#991b1b'
    },
};

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({
    selected,
    onChange
}) => {
    return (
        <HStack space="md" className="justify-center">
            {(Object.keys(difficultyConfig) as DifficultyLevel[]).map((level) => {
                const config = difficultyConfig[level];
                return (
                    <TouchableOpacity
                        key={level}
                        onPress={() => onChange(level)}
                        className="items-center px-4"
                    >
                        <Box
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: 24,
                                backgroundColor: selected === level ? config.bgColor : '#f9fafb',
                                borderWidth: 2,
                                borderColor: selected === level ? config.borderColor : '#e5e7eb',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 8,
                            }}
                        >
                            <Text className="text-xl">
                                {config.emoji}
                            </Text>
                        </Box>
                        <Text
                            style={{
                                fontSize: 14,
                                color: selected === level ? config.textColor : '#6b7280',
                                fontWeight: selected === level ? '700' : '400',
                            }}
                        >
                            {level}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </HStack>
    );
};
