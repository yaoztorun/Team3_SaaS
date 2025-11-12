import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, Dimensions, FlatList, View, ViewToken } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { TopBar } from '@/src/screens/navigation/TopBar';
import { spacing } from '@/src/theme/spacing';
import { FeedPostCard, CocktailCarouselCard } from '@/src/components/global';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAROUSEL_ITEM_WIDTH = 160;
const CAROUSEL_SPACING = 16;
const SIDE_CARD_OFFSET = 12; // Vertical offset for side cards

// Placeholder cocktails for carousel
const COCKTAILS = [
    { emoji: '🍃', name: 'Mojito' },
    { emoji: '🍋', name: 'Margarita' },
    { emoji: '🍹', name: 'Mai Tai' },
];

// Create a large virtual array for infinite scrolling
const VIRTUAL_CYCLES = 1000;
const DATA_LEN = VIRTUAL_CYCLES * COCKTAILS.length;
const START_INDEX = Math.floor(DATA_LEN / 2);

// Placeholder feed posts
const FEED_POSTS = [
    {
        id: '1',
        userName: 'Sarah Chen',
        userInitials: 'SC',
        timeAgo: '2 hours ago',
        cocktailName: 'Mai Tai',
        rating: 4.5,
        imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80',
        likes: 42,
        comments: 8,
        caption: 'Check out this sunset cocktail I made! 🍹',
        isLiked: false,
    },
    {
        id: '2',
        userName: 'Mike Rodriguez',
        userInitials: 'MR',
        timeAgo: '5 hours ago',
        cocktailName: 'Old Fashioned',
        rating: 5,
        imageUrl: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800&q=80',
        likes: 67,
        comments: 12,
        caption: 'Finally nailed the perfect Old Fashioned! 🥃',
        isLiked: true,
    },
    {
        id: '3',
        userName: 'Emma Wilson',
        userInitials: 'EW',
        timeAgo: '1 day ago',
        cocktailName: 'Espresso Martini',
        rating: 4.8,
        imageUrl: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&q=80',
        likes: 89,
        comments: 15,
        caption: 'Perfect pick-me-up for the afternoon ☕✨',
        isLiked: false,
    },
    {
        id: '4',
        userName: 'David Park',
        userInitials: 'DP',
        timeAgo: '2 days ago',
        cocktailName: 'Negroni',
        rating: 4.7,
        imageUrl: 'https://images.unsplash.com/photo-1560508801-e1d2c82f5e1a?w=800&q=80',
        likes: 54,
        comments: 9,
        caption: 'Classic Italian cocktail never disappoints 🇮🇹',
        isLiked: false,
    },
    {
        id: '5',
        userName: 'Lisa Anderson',
        userInitials: 'LA',
        timeAgo: '3 days ago',
        cocktailName: 'Piña Colada',
        rating: 4.9,
        imageUrl: 'https://images.unsplash.com/photo-1568643243859-c3aafff3d909?w=800&q=80',
        likes: 103,
        comments: 21,
        caption: 'Tropical vibes all the way! 🏝️🥥',
        isLiked: true,
    },
];

export const HomeScreen = () => {
    const [virtualIndex, setVirtualIndex] = useState(START_INDEX);
    const flatListRef = useRef<FlatList>(null);
    const autoScrollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

    // Calculate current cocktail index using modulo
    const currentCocktailIndex = virtualIndex % COCKTAILS.length;

    // Calculate dynamic padding to center the carousel
    const leftPad = (SCREEN_WIDTH - CAROUSEL_ITEM_WIDTH) / 2 - spacing.screenHorizontal;

    // Auto-scroll every 5 seconds
    useEffect(() => {
        autoScrollTimer.current = setInterval(() => {
            setVirtualIndex((prev) => {
                const next = prev + 1;
                flatListRef.current?.scrollToIndex({
                    index: next,
                    animated: true,
                });
                return next;
            });
        }, 5000);

        return () => {
            if (autoScrollTimer.current) {
                clearInterval(autoScrollTimer.current);
            }
        };
    }, []);

    const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0 && viewableItems[0].index !== null) {
            setVirtualIndex(viewableItems[0].index);
        }
    }).current;

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
    }).current;

    return (
        <Box className="flex-1 bg-neutral-50">
            <TopBar title="Feed" streakCount={12} cocktailCount={47} />
            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingHorizontal: spacing.screenHorizontal,
                    paddingTop: spacing.screenVertical,
                    paddingBottom: spacing.screenBottom,
                }}
            >
                {/* Popular Right Now Section */}
                <Box className="mb-6">
                    <Text className="text-lg font-medium text-neutral-900 mb-3">
                        Popular Right Now
                    </Text>
                    <Box className="h-48">
                        <FlatList
                            ref={flatListRef}
                            data={Array.from({ length: DATA_LEN })}
                            horizontal
                            pagingEnabled={false}
                            snapToInterval={CAROUSEL_ITEM_WIDTH + CAROUSEL_SPACING}
                            decelerationRate="fast"
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{
                                paddingLeft: leftPad,
                                paddingRight: leftPad,
                            }}
                            initialScrollIndex={START_INDEX}
                            getItemLayout={(_, index) => ({
                                length: CAROUSEL_ITEM_WIDTH + CAROUSEL_SPACING,
                                offset: (CAROUSEL_ITEM_WIDTH + CAROUSEL_SPACING) * index,
                                index,
                            })}
                            onViewableItemsChanged={onViewableItemsChanged}
                            viewabilityConfig={viewabilityConfig}
                            keyExtractor={(_, index) => `carousel-${index}`}
                            renderItem={({ index: virtualIdx }) => {
                                const cocktailIdx = virtualIdx % COCKTAILS.length;
                                const isCenter = virtualIdx === virtualIndex;
                                const cocktail = COCKTAILS[cocktailIdx];

                                return (
                                    <Box
                                        style={{
                                            width: CAROUSEL_ITEM_WIDTH,
                                            marginRight: CAROUSEL_SPACING,
                                            marginTop: isCenter ? 0 : SIDE_CARD_OFFSET,
                                        }}
                                    >
                                        <CocktailCarouselCard
                                            emoji={cocktail.emoji}
                                            name={cocktail.name}
                                            isCenter={isCenter}
                                        />
                                    </Box>
                                );
                            }}
                        />
                        {/* Pagination dots */}
                        <Box className="flex-row justify-center mt-4">
                            {COCKTAILS.map((_, index) => (
                                <Box
                                    key={index}
                                    className={`h-2 rounded-full mx-1 ${
                                        currentCocktailIndex === index
                                            ? 'w-6 bg-[#9810fa]'
                                            : 'w-2 bg-[#d1d5dc]'
                                    }`}
                                />
                            ))}
                        </Box>
                    </Box>
                </Box>

                {/* Feed Section */}
                <Text className="text-base font-medium text-neutral-900 mb-4">Feed</Text>
                {FEED_POSTS.map((post) => (
                    <Box key={post.id} className="mb-4">
                        <FeedPostCard {...post} />
                    </Box>
                ))}
            </ScrollView>
        </Box>
    );
};