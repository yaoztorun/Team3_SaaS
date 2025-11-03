// src/screens/_MinimalTemplate.tsx
import React from 'react';
import { ScrollView } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { TopBar } from '@/src/screens/navigation/TopBar';
import { spacing } from '@/src/theme/spacing';

export const ExploreScreen = () => {
    return (
        <Box className="flex-1 bg-neutral-50">
            <TopBar title="Explore" streakCount={7} cocktailCount={42} />
            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingHorizontal: spacing.screenHorizontal,
                    paddingTop: spacing.screenVertical,
                    paddingBottom: spacing.screenBottom,
                }}
            >
                {/* SPECIFIC CONTENT HERE */}
            </ScrollView>
        </Box>
    );
};