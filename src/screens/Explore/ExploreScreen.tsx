import React from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { TopBar } from '@/src/screens/navigation/TopBar';
import { spacing } from '@/src/theme/spacing';
import { Text } from '@/src/components/ui/text';
import { Pressable } from '@/src/components/ui/pressable';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
    AllCocktails: undefined;
    AIAssistant: undefined;
    WhatCanIMake: undefined;
    BestRated: undefined;
    UpcomingEvents: undefined;
    Shop: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ExploreScreen = () => {
    const navigation = useNavigation<NavigationProp>();

    const navigateToSection = (section: string) => {
        const routes: { [key: string]: keyof RootStackParamList } = {
            'All Cocktails': 'AllCocktails',
            'AI Assistant': 'AIAssistant',
            'What Can I Make?': 'WhatCanIMake',
            'Best Rated': 'BestRated',
            'Upcoming Events': 'UpcomingEvents',
            'Shop': 'Shop'
        };
        
        const route = routes[section];
        if (route) {
            navigation.navigate(route);
        }
    };

    const ExploreBox = ({ title, description }: { title: string; description: string }) => (
        <Pressable 
            onPress={() => navigateToSection(title)}
            className="w-full bg-white rounded-xl p-4 mb-4 shadow-sm"
        >
            <Text className="text-xl font-semibold mb-2">{title}</Text>
            <Text className="text-gray-600">{description}</Text>
        </Pressable>
    );

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
                

                {/* Content Boxes */}
                <ExploreBox 
                    title="All Cocktails" 
                    description="Discover our complete collection of cocktail recipes"
                />

                <ExploreBox 
                    title="AI Assistant" 
                    description="Get personalized cocktail recommendations"
                />

                <ExploreBox 
                    title="What Can I Make?" 
                    description="Find recipes based on your ingredients"
                />

                <ExploreBox 
                    title="Best Rated" 
                    description="Explore our highest rated cocktails"
                />

                <ExploreBox 
                    title="Upcoming Events" 
                    description="Check out cocktail events near you"
                />

                <ExploreBox 
                    title="Shop" 
                    description="Browse cocktail making equipment and ingredients"
                />
            </ScrollView>
        </Box>
    );
};