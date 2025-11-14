import React, { useState, useEffect } from 'react';
import { ScrollView, ActivityIndicator } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { TopBar } from '@/src/screens/navigation/TopBar';
import { spacing } from '@/src/theme/spacing';
import { Text } from '@/src/components/ui/text';
import { Pressable } from '@/src/components/ui/pressable';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Search, ChevronRight, Bot, MessageCircle } from 'lucide-react-native';
import { PreviewCard, EventCard } from '@/src/components/global';
import { fetchLocations } from '@/src/api/location';
import type { DBLocation } from '@/src/api/location';

type RootStackParamList = {
    AllCocktails: undefined;
    AIAssistant: undefined;
    WhatCanIMake: undefined;
    BestBars: undefined;
    UpcomingEvents: undefined;
    Shop: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ExploreScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const [bars, setBars] = useState<DBLocation[]>([]);
    const [loadingBars, setLoadingBars] = useState(true);

    useEffect(() => {
        const loadBars = async () => {
            setLoadingBars(true);
            const data = await fetchLocations();
            if (data && data.length > 0) {
                // Show top 3 rated bars (where rating is a number), or fill with unrated ones
                const ratedBars = data.filter((bar: DBLocation) => {
                    const r = (bar as any).rating;
                    return typeof r === 'number';
                });
                const sortedBars = ratedBars
                    .sort((a: DBLocation, b: DBLocation) => (((b as any).rating ?? 0) - ((a as any).rating ?? 0)))
                    .slice(0, 3);

                if (sortedBars.length < 3) {
                    const unratedBars = data.filter((bar: DBLocation) => {
                        const r = (bar as any).rating;
                        return typeof r !== 'number';
                    }).slice(0, 3 - sortedBars.length);
                    setBars([...sortedBars, ...unratedBars]);
                } else {
                    setBars(sortedBars);
                }
            }
            setLoadingBars(false);
        };
        loadBars();
    }, []);

    const navigateToSection = (route: keyof RootStackParamList) => {
        navigation.navigate(route);
    };

    return (
        <Box className="flex-1 bg-gray-50">
            <TopBar title="Explore" streakCount={12} cocktailCount={47} />
            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingTop: spacing.screenVertical,
                    paddingBottom: spacing.screenBottom,
                }}
            >
                {/* Search Bar */}
                <Box className="px-4 mb-4">
                    <Box className="bg-gray-100 rounded-lg px-4 py-3 flex-row items-center">
                        <Search size={20} color="#717182" />
                        <Text className="ml-3 text-sm text-[#717182]">
                            Search cocktails, bars, events...
                        </Text>
                    </Box>
                </Box>

                {/* All Cocktails Section */}
                <Box className="mb-6">
                    <Pressable
                        onPress={() => navigateToSection('AllCocktails')}
                        className="px-4 mb-3 flex-row items-center justify-between"
                    >
                        <Box className="flex-row items-center">
                            <Text className="text-2xl mr-2">🍸</Text>
                            <Text className="text-xl font-medium text-neutral-900">All Cocktails</Text>
                        </Box>
                        <ChevronRight size={20} color="#000" />
                    </Pressable>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: spacing.screenHorizontal }}
                    >
                        <Box className="mr-3">
                            <PreviewCard
                                emoji="🥃"
                                title="Whiskey Sour"
                                rating={4.8}
                                variant="cocktail"
                                onPress={() => navigateToSection('AllCocktails')}
                            />
                        </Box>
                        <Box className="mr-3">
                            <PreviewCard
                                emoji="🍃"
                                title="Mojito"
                                rating={4.7}
                                variant="cocktail"
                                onPress={() => navigateToSection('AllCocktails')}
                            />
                        </Box>
                        <PreviewCard
                            emoji="🍋"
                            title="Margarita"
                            rating={4.9}
                            variant="cocktail"
                            onPress={() => navigateToSection('AllCocktails')}
                        />
                    </ScrollView>
                </Box>

                {/* Divider */}
                <Box className="h-px bg-gray-200 mx-4 mb-6" />

                {/* AI Assistant Section */}
                <Box className="px-4 mb-6">
                    <Box className="flex-row items-center justify-between mb-3">
                        <Box className="flex-row items-center">
                            <Text className="text-2xl mr-2">🤖</Text>
                            <Text className="text-xl font-medium text-neutral-900">AI Assistant</Text>
                        </Box>
                        <ChevronRight size={20} color="#000" />
                    </Box>
                    <Pressable
                        onPress={() => navigateToSection('AIAssistant')}
                        className="bg-white border-2 border-[#00bba7] rounded-2xl p-6"
                    >
                        <Box className="flex-row items-center mb-2">
                            <MessageCircle size={24} color="#000" />
                            <Text className="ml-3 text-base font-medium text-neutral-900">
                                Chat with AI
                            </Text>
                        </Box>
                        <Text className="text-sm text-[#4a5565]">
                            Ask questions about cocktails, recipes, or party planning
                        </Text>
                    </Pressable>
                </Box>

                {/* Divider */}
                <Box className="h-px bg-gray-200 mx-4 mb-6" />

                {/* What Can I Make Section */}
                <Box className="px-4 mb-6">
                    <Box className="flex-row items-center mb-3">
                        <Text className="text-2xl mr-2">🔮</Text>
                        <Text className="text-xl font-medium text-neutral-900">What Can I Make?</Text>
                    </Box>
                    <Pressable
                        onPress={() => navigateToSection('WhatCanIMake')}
                        className="border-2 border-[#00d5be] rounded-2xl p-8 items-center justify-center"
                    >
                        <Text className="text-3xl mb-1">+</Text>
                        <Text className="text-sm text-[#4a5565]">Add Ingredients</Text>
                    </Pressable>
                </Box>

                {/* Divider */}
                <Box className="h-px bg-gray-200 mx-4 mb-6" />

                {/* Best Rated Bars Section */}
                <Box className="mb-6">
                    <Pressable
                        onPress={() => navigateToSection('BestBars')}
                        className="px-4 mb-3 flex-row items-center justify-between"
                    >
                        <Box className="flex-row items-center">
                            <Text className="text-2xl mr-2">⭐</Text>
                            <Text className="text-xl font-medium text-neutral-900">Best Bars</Text>
                        </Box>
                        <ChevronRight size={20} color="#000" />
                    </Pressable>
                    {loadingBars ? (
                        <Box className="px-4 py-8 items-center">
                            <ActivityIndicator size="large" color="#14b8a6" />
                        </Box>
                    ) : bars.length > 0 ? (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: spacing.screenHorizontal }}
                        >
                            {bars.map((bar, index) => (
                                <Box key={bar.id} className={index < bars.length - 1 ? "mr-3" : ""}>
                                    <PreviewCard
                                        emoji="🍸"
                                        title={bar.name ?? 'Unknown'}
                                        rating={(bar as any).rating ?? undefined}
                                        variant="bar"
                                        onPress={() => navigateToSection('BestBars')}
                                    />
                                </Box>
                            ))}
                        </ScrollView>
                    ) : (
                        <Box className="px-4">
                            <Text className="text-gray-500 text-center">No bars available</Text>
                        </Box>
                    )}
                </Box>

                {/* Divider */}
                <Box className="h-px bg-gray-200 mx-4 mb-6" />

                {/* Upcoming Events Section */}
                <Box className="mb-6">
                    <Pressable
                        onPress={() => navigateToSection('UpcomingEvents')}
                        className="px-4 mb-3 flex-row items-center justify-between"
                    >
                        <Box className="flex-row items-center">
                            <Text className="text-2xl mr-2">📍</Text>
                            <Text className="text-xl font-medium text-neutral-900">
                                Upcoming Events Nearby
                            </Text>
                        </Box>
                        <ChevronRight size={20} color="#000" />
                    </Pressable>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: spacing.screenHorizontal }}
                    >
                        <Box className="mr-3">
                            <EventCard
                                title="Craft Cocktail Night"
                                dateTime="Tomorrow 8pm"
                                attending={23}
                                price="$15"
                                onPress={() => navigateToSection('UpcomingEvents')}
                            />
                        </Box>
                        <EventCard
                            title="Mojito Happy Hour"
                            dateTime="Saturday 7pm"
                            attending={45}
                            price="Free"
                            onPress={() => navigateToSection('UpcomingEvents')}
                        />
                    </ScrollView>
                </Box>

                {/* Divider */}
                <Box className="h-px bg-gray-200 mx-4 mb-6" />

                {/* Our Shop Section */}
                <Box className="mb-6">
                    <Pressable
                        onPress={() => navigateToSection('Shop')}
                        className="px-4 mb-3 flex-row items-center justify-between"
                    >
                        <Box className="flex-row items-center">
                            <Text className="text-2xl mr-2">🛍️</Text>
                            <Text className="text-xl font-medium text-neutral-900">Our Shop</Text>
                        </Box>
                        <ChevronRight size={20} color="#000" />
                    </Pressable>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: spacing.screenHorizontal }}
                    >
                        <Box className="mr-3">
                            <PreviewCard
                                emoji="🍹"
                                title="Bartender Starter Kit"
                                price="$45.99"
                                variant="shop"
                                onPress={() => navigateToSection('Shop')}
                            />
                        </Box>
                        <Box className="mr-3">
                            <PreviewCard
                                emoji="📚"
                                title="Classic Cocktails Book"
                                price="$24.99"
                                variant="shop"
                                onPress={() => navigateToSection('Shop')}
                            />
                        </Box>
                        <PreviewCard
                            emoji="🥃"
                            title="Premium Tequila Bundle"
                            price="$89.99"
                            variant="shop"
                            onPress={() => navigateToSection('Shop')}
                        />
                    </ScrollView>
                </Box>
            </ScrollView>
        </Box>
    );
};