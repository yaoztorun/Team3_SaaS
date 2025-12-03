import React, { useState, useEffect } from 'react';
import { ScrollView, ActivityIndicator } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { TopBar } from '@/src/screens/navigation/TopBar';
import { spacing } from '@/src/theme/spacing';
import { Heading } from '@/src/components/global';
import { Text } from '@/src/components/ui/text';
import { Pressable } from '@/src/components/ui/pressable';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronRight, Bot, MessageCircle } from 'lucide-react-native';
import { PreviewCard, EventCard } from '@/src/components/global';
import { fetchLocations } from '@/src/api/location';
import type { DBLocation } from '@/src/api/location';
import { fetchShopItems } from '@/src/api/shop';
import type { DBShopItem } from '@/src/api/shop';
import { fetchPublicEventsWithDetails } from '@/src/api/event';
import type { EventWithDetails } from '@/src/api/event';

type RootStackParamList = {
    AllCocktails: undefined;
    AIAssistant: undefined;
    WhatCanIMake: undefined;
    BestBars: undefined;
    UpcomingEvents: undefined;
    Shop: undefined;
    ItemDetail: { itemId: string };
    BarDetail: { bar: DBLocation };
    CocktailDetail: { cocktail: any };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ExploreScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const [bars, setBars] = useState<DBLocation[]>([]);
    const [loadingBars, setLoadingBars] = useState(true);
    const [shopItems, setShopItems] = useState<DBShopItem[]>([]);
    const [loadingShop, setLoadingShop] = useState(true);
    const [publicEvents, setPublicEvents] = useState<EventWithDetails[]>([]);
    const [loadingEvents, setLoadingEvents] = useState(true);
    const [topCocktails, setTopCocktails] = useState<any[]>([]);
    const [loadingCocktails, setLoadingCocktails] = useState(true);

    useEffect(() => {
        const loadTopCocktails = async () => {
            setLoadingCocktails(true);
            try {
                // Use the existing cocktail API
                const { fetchAllCocktails } = await import('@/src/api/cocktail');
                const cocktails = await fetchAllCocktails();
                
                // Get first 5 cocktails that have images
                const cocktailsWithImages = cocktails
                    .filter(c => c.image_url)
                    .slice(0, 5);
                
                if (cocktailsWithImages.length > 0) {
                    setTopCocktails(cocktailsWithImages);
                } else {
                    // If no cocktails with images, just get first 5
                    setTopCocktails(cocktails.slice(0, 5));
                }
            } catch (err) {
                console.error('Error loading cocktails:', err);
            }
            setLoadingCocktails(false);
        };
        loadTopCocktails();
    }, []);

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
                    .slice(0, 5);

                if (sortedBars.length < 5) {
                    const unratedBars = data.filter((bar: DBLocation) => {
                        const r = (bar as any).rating;
                        return typeof r !== 'number';
                    }).slice(0, 5 - sortedBars.length);
                    setBars([...sortedBars, ...unratedBars]);
                } else {
                    setBars(sortedBars);
                }
            }
            setLoadingBars(false);
        };
        loadBars();
    }, []);

    useEffect(() => {
        const loadShopItems = async () => {
            setLoadingShop(true);
            const data = await fetchShopItems();
            // Show first 5 shop items
            setShopItems(data.slice(0, 5));
            setLoadingShop(false);
        };
        loadShopItems();
    }, []);

    useEffect(() => {
        const loadPublicEvents = async () => {
            setLoadingEvents(true);
            const events = await fetchPublicEventsWithDetails();
            
            // Filter out past events
            const now = new Date();
            const upcomingEvents = events.filter(event => {
                const eventDate = event.start_time ? new Date(event.start_time) : null;
                return !eventDate || eventDate >= now;
            });
            
            // Show first 5 for preview
            setPublicEvents(upcomingEvents.slice(0, 5));
            setLoadingEvents(false);
        };
        loadPublicEvents();
    }, []);

    const navigateToSection = (route: keyof RootStackParamList) => {
        navigation.navigate(route as any);
    };

    return (
        <Box className="flex-1 bg-gray-50">
            <TopBar title="Explore" showLogo />
            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingTop: spacing.screenVertical,
                    paddingBottom: spacing.screenBottom,
                }}
            >
                {/* All Cocktails Section */}
                <Box className="mb-6">
                    <Pressable
                        onPress={() => navigateToSection('AllCocktails')}
                        className="px-4 mb-3 flex-row items-center justify-between"
                    >
                        <Heading level="h4">All Cocktails</Heading>
                        <ChevronRight size={20} color="#000" />
                    </Pressable>
                    {loadingCocktails ? (
                        <Box className="px-4 py-8 items-center">
                            <ActivityIndicator size="large" color="#00BBA7" />
                        </Box>
                    ) : topCocktails.length > 0 ? (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: spacing.screenHorizontal }}
                        >
                            {topCocktails.map((cocktail, index) => (
                                <Box key={cocktail.id} className={index < topCocktails.length - 1 ? "mr-3" : ""}>
                                    <PreviewCard
                                        imageUrl={cocktail.image_url}
                                        title={cocktail.name}
                                        variant="cocktail"
                                        onPress={() => navigation.navigate('CocktailDetail' as any, { cocktail })}
                                    />
                                </Box>
                            ))}
                        </ScrollView>
                    ) : (
                        <Box className="px-4">
                            <Text className="text-gray-500 text-center">No cocktails available</Text>
                        </Box>
                    )}
                </Box>

                {/* Divider */}
                <Box className="h-px bg-gray-200 mx-4 mb-6" />

                {/* AI Assistant Section */}
                <Box className="px-4 mb-6">
                    <Box className="flex-row items-center justify-between mb-3">
                        <Heading level="h4">AI Assistant</Heading>
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
                    <Heading level="h4" className="mb-3">What Can I Make?</Heading>
                    <Pressable
                        onPress={() => navigateToSection('WhatCanIMake')}
                        className="border-2 border-[#00bba7] rounded-2xl p-8 items-center justify-center"
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
                        <Heading level="h4">Best Bars</Heading>
                        <ChevronRight size={20} color="#000" />
                    </Pressable>
                    {loadingBars ? (
                        <Box className="px-4 py-8 items-center">
                            <ActivityIndicator size="large" color="#00BBA7" />
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
                                        imageUrl={bar.image_url ?? undefined}
                                        title={bar.name ?? 'Unknown'}
                                        rating={(bar as any).rating ?? undefined}
                                        variant="bar"
                                        onPress={() => navigation.navigate('BarDetail', { bar })}
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
                        <Heading level="h4">Upcoming Events Nearby</Heading>
                        <ChevronRight size={20} color="#000" />
                    </Pressable>
                    {loadingEvents ? (
                        <Box className="px-4 py-8 items-center">
                            <ActivityIndicator size="large" color="#00BBA7" />
                        </Box>
                    ) : publicEvents.length > 0 ? (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: spacing.screenHorizontal }}
                        >
                            {publicEvents.map((event, index) => {
                                const startDate = event.start_time ? new Date(event.start_time) : null;
                                const dateTimeStr = startDate
                                    ? `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${startDate.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })}`
                                    : 'TBA';
                                const priceStr = event.price === null || event.price === 0 ? 'Free' : `€${event.price}`;

                                return (
                                    <Box key={event.id} className={index < publicEvents.length - 1 ? "mr-3" : ""}>
                                        <EventCard
                                            title={event.name || 'Event'}
                                            dateTime={dateTimeStr}
                                            attending={event.attendee_count || 0}
                                            price={priceStr}
                                            imageUrl={event.cover_image ?? undefined}
                                            onPress={() => navigation.navigate('PartyDetails' as any, { party: event })}
                                        />
                                    </Box>
                                );
                            })}
                        </ScrollView>
                    ) : (
                        <Box className="px-4">
                            <Text className="text-gray-500 text-center">No upcoming events</Text>
                        </Box>
                    )}
                </Box>

                {/* Divider */}
                <Box className="h-px bg-gray-200 mx-4 mb-6" />

                {/* Our Shop Section */}
                <Box className="mb-6">
                    <Pressable
                        onPress={() => navigateToSection('Shop')}
                        className="px-4 mb-3 flex-row items-center justify-between"
                    >
                        <Heading level="h4">Our Shop</Heading>
                        <ChevronRight size={20} color="#000" />
                    </Pressable>
                    {loadingShop ? (
                        <Box className="px-4">
                            <ActivityIndicator size="small" color="#00BBA7" />
                        </Box>
                    ) : shopItems.length === 0 ? (
                        <Box className="px-4">
                            <Text className="text-gray-500 text-sm">No shop items available</Text>
                        </Box>
                    ) : (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: spacing.screenHorizontal }}
                        >
                            {shopItems.map((item, index) => (
                                <Box key={item.id} className={index < shopItems.length - 1 ? 'mr-3' : ''}>
                                    <PreviewCard
                                        imageUrl={item.image ?? undefined}
                                        title={item.name || 'Shop Item'}
                                        price={`€${item.price?.toFixed(2) || '0.00'}`}
                                        variant="shop"
                                        onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
                                    />
                                </Box>
                            ))}
                        </ScrollView>
                    )}
                </Box>
            </ScrollView>
        </Box>
    );
};