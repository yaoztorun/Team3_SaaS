import React from 'react';
import { ScrollView } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { TopBar } from '@/src/screens/navigation/TopBar';
import { spacing } from '@/src/theme/spacing';

export const HomeScreen = () => {
    return (
        <Box className="flex-1 bg-neutral-50">
            <TopBar title="Home" streakCount={7} cocktailCount={42} />

            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingHorizontal: 28,
                    paddingTop: 24,
                    paddingBottom: 100, // Space for bottom tab bar
                }}
            >
                <Text className="text-2xl font-bold text-neutral-900 mb-4">
                    Welcome Home
                </Text>
                <Text className="text-neutral-600 mb-6">
                    Scroll down to test if content goes under the tab bar...
                </Text>

                {/* Test Content - Repeated Boxes */}
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
                    <Box
                        key={item}
                        className="bg-white rounded-xl p-6 mb-4"
                        style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.08,
                            shadowRadius: 4,
                            elevation: 3,
                        }}
                    >
                        <Text className="text-xl font-bold text-neutral-900 mb-2">
                            Item {item}
                        </Text>
                        <Text className="text-neutral-600 mb-2">
                            This is test content item number {item}.
                        </Text>
                        <Text className="text-neutral-500 text-sm">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                        </Text>
                    </Box>
                ))}

                <Box
                    className="bg-primary-500 rounded-xl p-6 mb-4"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 3,
                    }}
                >
                    <Text className="text-xl font-bold text-white mb-2">
                        bottom
                    </Text>
                    <Text className="text-white">
                        This cant be hidden by the tab bar, when scrolling down!
                    </Text>
                </Box>
            </ScrollView>
        </Box>
    );
};