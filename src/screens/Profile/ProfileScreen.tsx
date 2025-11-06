import React, { useState } from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { Center } from '@/src/components/ui/center';
import { HStack } from '@/src/components/ui/hstack';
import { Pressable } from '@/src/components/ui/pressable';
import { TopBar } from '@/src/screens/navigation/TopBar';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from './ProfileStack';
import { spacing } from '@/src/theme/spacing';

type View = 'logged-drinks' | 'stats';

export const ProfileScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
    const [currentView, setCurrentView] = useState<View>('logged-drinks');
    const [isOwnRecipes, setIsOwnRecipes] = useState(false);

    // Dummy data
    const userStats = {
        drinksLogged: 47,
        avgRating: 4.1,
        barsVisited: 12,
        popularCocktail: {
            name: 'Mai Tai',
            count: 15
        },
        cocktailBreakdown: [
            { name: 'Mai Tai', count: 12, color: '#F6339A' },
            { name: 'Mojito', count: 10, color: '#AD46FF' },
            { name: 'Margarita', count: 8, color: '#FF6900' },
            { name: 'Others', count: 17, color: '#F0B100' }
        ],
        recentDrinks: [
            { name: 'Mai Tai', location: 'Tiki Room', rating: 4.5, time: '1 week ago' },
            { name: 'My Special Mojito', location: 'Home', rating: 5, time: '1 week ago' },
            { name: 'Mojito', location: 'Beach Bar', rating: 4.2, time: '2 weeks ago' },
            { name: 'Whiskey Sour', location: 'The Lounge', rating: 4.8, time: '2 weeks ago' },
            { name: 'Sunset Dream', location: 'Home', rating: 4.7, time: '2 weeks ago' },
            { name: 'Daiquiri', location: 'Sunset Club', rating: 4, time: '3 weeks ago' }
        ]
    };

    return (
        <Box className="flex-1 bg-neutral-50">
            <TopBar title="Profile" showSettingsIcon onSettingsPress={() => navigation.navigate('Settings')} />
            
            {/* User Profile Card */}
            <Box className="mx-4 mt-4 p-6 bg-white rounded-2xl">
                <HStack className="mb-4">
                    <Center className="h-20 w-20 rounded-full bg-teal-500">
                        <Text className="text-2xl text-white">JD</Text>
                    </Center>
                    <Box className="ml-4 flex-1">
                        <Text className="text-xl font-semibold text-neutral-900">John Doe</Text>
                        <Text className="text-base text-neutral-600">Cocktail Enthusiast</Text>
                    </Box>
                </HStack>
                <Pressable 
                    onPress={() => navigation.navigate('EditProfile')}
                    className="flex-row justify-center items-center py-2 rounded-lg bg-neutral-100"
                >
                    <Text className="text-sm text-teal-500">Edit Profile</Text>
                </Pressable>
            </Box>

            {/* View Toggle */}
            <Box className="mx-4 mt-6 bg-white rounded-2xl p-1 flex-row">
                <Pressable 
                    onPress={() => setCurrentView('logged-drinks')}
                    className={currentView === 'logged-drinks' 
                        ? "flex-1 py-2 px-4 rounded-xl bg-teal-500"
                        : "flex-1 py-2 px-4 rounded-xl bg-transparent"}
                >
                    <Text
                        className={currentView === 'logged-drinks'
                            ? "text-sm text-center text-white"
                            : "text-sm text-center text-neutral-900"}
                    >
                        Logged Drinks
                    </Text>
                </Pressable>
                <Pressable 
                    onPress={() => setCurrentView('stats')}
                    className={currentView === 'stats'
                        ? "flex-1 py-2 px-4 rounded-xl bg-teal-500"
                        : "flex-1 py-2 px-4 rounded-xl bg-transparent"}
                >
                    <Text
                        className={currentView === 'stats'
                            ? "text-sm text-center text-white"
                            : "text-sm text-center text-neutral-900"}
                    >
                        Stats
                    </Text>
                </Pressable>
            </Box>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingHorizontal: spacing.screenHorizontal,
                    paddingTop: spacing.screenVertical,
                    paddingBottom: spacing.screenBottom,
                }}
            >
                {currentView === 'logged-drinks' ? (
                    <>
                        {/* Logged Drinks Header */}
                        <HStack className="justify-between items-center mb-3">
                            <Text className="text-base text-neutral-900">Recent Logged Drinks</Text>
                            <TouchableOpacity 
                                onPress={() => setIsOwnRecipes(!isOwnRecipes)}
                                className="flex-row items-center"
                            >
                                <Box 
                                    className={isOwnRecipes 
                                        ? "h-4 w-4 rounded border mr-2 justify-center items-center bg-teal-500 border-teal-500" 
                                        : "h-4 w-4 rounded border mr-2 justify-center items-center bg-neutral-100 border-neutral-300"}
                                >
                                    {isOwnRecipes && (
                                        <Text className="text-white text-xs">✓</Text>
                                    )}
                                </Box>
                                <Text className="text-sm text-neutral-600">Own recipes</Text>
                            </TouchableOpacity>
                        </HStack>

                        {/* Recent Drinks List */}
                        {userStats.recentDrinks.map((drink, index) => (
                            <Box
                                key={index}
                                className="bg-white rounded-2xl p-4 mb-3"
                            >
                                <HStack className="justify-between items-center mb-2">
                                    <Box>
                                        <Text className="text-base text-neutral-900 mb-1">{drink.name}</Text>
                                        <Text className="text-sm text-neutral-600">{drink.location}</Text>
                                    </Box>
                                    <Box className="bg-yellow-100 px-2 py-1 rounded-full flex-row items-center">
                                        <Text className="text-sm text-neutral-900">⭐ {drink.rating}</Text>
                                    </Box>
                                </HStack>
                                <Text className="text-xs text-neutral-500">{drink.time}</Text>
                            </Box>
                        ))}
                    </>
                ) : (
                    <>
                        {/* Stats View */}
                        <Box className="bg-white rounded-2xl p-4 mb-4">
                            <Text className="text-base text-neutral-900 mb-4">Your Stats</Text>
                            <HStack className="justify-between">
                                <Box className="items-center">
                                    <Text className="text-3xl text-teal-500 font-semibold">
                                        {userStats.drinksLogged}
                                    </Text>
                                    <Text className="text-xs text-neutral-500">
                                        Drinks Logged
                                    </Text>
                                </Box>
                                <Box className="items-center">
                                    <Text className="text-3xl text-red-500 font-semibold">
                                        {userStats.avgRating}
                                    </Text>
                                    <Text className="text-xs text-neutral-500">
                                        Avg Rating
                                    </Text>
                                </Box>
                                <Box className="items-center">
                                    <Text className="text-3xl text-blue-500 font-semibold">
                                        {userStats.barsVisited}
                                    </Text>
                                    <Text className="text-xs text-neutral-500">
                                        Bars Visited
                                    </Text>
                                </Box>
                            </HStack>
                        </Box>

                        {/* Most Popular Cocktail */}
                        <Box className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-6 mb-4">
                            <Text className="text-base text-white mb-2">Most Popular Cocktail</Text>
                            <HStack className="items-center">
                                <Text className="text-4xl mr-3">🍹</Text>
                                <Box>
                                    <Text className="text-xl text-white">{userStats.popularCocktail.name}</Text>
                                    <Text className="text-sm text-white opacity-90">
                                        Logged {userStats.popularCocktail.count} times
                                    </Text>
                                </Box>
                            </HStack>
                        </Box>

                        {/* Rating Trend */}
                        <Box className="bg-white rounded-2xl p-4 mb-4">
                            <HStack className="justify-between items-center mb-4">
                                <Text className="text-base text-neutral-900">Rating Trend</Text>
                                <Box className="h-5 w-5 bg-neutral-100 rounded-full" />
                            </HStack>
                            <Box className="h-48 bg-neutral-50 rounded-lg mb-2" />
                        </Box>

                        {/* Cocktail Breakdown */}
                        <Box className="bg-white rounded-2xl p-4">
                            <Text className="text-lg text-neutral-900 mb-4">
                                Cocktail Breakdown
                            </Text>
                            <Box className="items-center justify-center mb-4">
                                <Box className="h-48 w-48 bg-neutral-50 rounded-full" />
                            </Box>
                            <Box className="flex-row flex-wrap">
                                {userStats.cocktailBreakdown.map((item, index) => (
                                    <Box 
                                        key={index}
                                        className="w-1/2 flex-row items-center mb-2 pr-2"
                                    >
                                        <Box 
                                            style={{ backgroundColor: item.color }}
                                            className="h-4 w-4 rounded-full mr-2"
                                        />
                                        <Text className="text-sm text-neutral-900">
                                            {item.name} - {item.count}
                                        </Text>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    </>
                )}
            </ScrollView>
        </Box>
    );
};