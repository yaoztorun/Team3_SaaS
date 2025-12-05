import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { TopBar } from '@/src/screens/navigation/TopBar';
import { FlatList, TextInput, TouchableOpacity, Image, View, Platform, ScrollView, Animated } from 'react-native';
import { HStack } from '@/src/components/ui/hstack';
import { fetchAllCocktails, fetchCocktailTypes, DBCocktail } from '@/src/api/cocktail';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FilterChip, SearchBar } from '@/src/components/global';
import { useAuth } from '@/src/hooks/useAuth';
import { ANALYTICS_EVENTS, posthogCapture } from '@/src/analytics';

type RootStackParamList = {
    CocktailDetail: { cocktail: DBCocktail };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Fallback placeholder image (could be replaced with a local asset)
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/300x300.png?text=Cocktail';
// Layout constants to keep grid stable and prevent vertical jumping while filtering
const CARD_HEIGHT = 220; // total card height (image + text area)
const CARD_VERTICAL_MARGIN = 16; // space below each card
const LIST_TOP_SPACER = 24;

export const AllCocktails = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<any>();
    const { user } = useAuth();
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [activeType, setActiveType] = useState('All');
    const [activeDifficulty, setActiveDifficulty] = useState('All');
    const [cocktails, setCocktails] = useState<DBCocktail[]>([]);
    const [cocktailTypes, setCocktailTypes] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [searchBarHeight, setSearchBarHeight] = useState(0);
    const [filtersHeight, setFiltersHeight] = useState(0);

    const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

    // Scroll-aware filter animation (not search bar)
    const scrollY = useRef(new Animated.Value(0)).current;
    const lastScrollY = useRef(0);
    const filtersTranslateY = useRef(new Animated.Value(0)).current;
    const isAnimating = useRef(false);

    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        {
            useNativeDriver: true,
            listener: (event: any) => {
                const currentScrollY = event.nativeEvent.contentOffset.y;
                const diff = currentScrollY - lastScrollY.current;

                // Only hide/show filters after scrolling past the initial padding
                if (currentScrollY > 50 && Math.abs(diff) > 2 && !isAnimating.current) {
                    if (diff > 0) {
                        // Scrolling down - hide filters immediately
                        isAnimating.current = true;
                        Animated.timing(filtersTranslateY, {
                            toValue: -(filtersHeight || 0),
                            duration: 150,
                            useNativeDriver: true,
                        }).start(() => {
                            isAnimating.current = false;
                        });
                    } else if (diff < 0) {
                        // Scrolling up - show filters immediately
                        isAnimating.current = true;
                        Animated.timing(filtersTranslateY, {
                            toValue: 0,
                            duration: 150,
                            useNativeDriver: true,
                        }).start(() => {
                            isAnimating.current = false;
                        });
                    }
                }

                lastScrollY.current = currentScrollY;
            },
        }
    );

    // Debounce the search input to reduce rapid re-renders that can cause perceived layout shifts
    useEffect(() => {
        const handle = setTimeout(() => {
            setDebouncedQuery(query);
            // Track search if query is not empty
            if (query.trim()) {
                posthogCapture(ANALYTICS_EVENTS.FEATURE_USED, {
                    feature: 'cocktail_search',
                    query_length: query.trim().length,
                });
            }
        }, 200);
        return () => clearTimeout(handle);
    }, [query]);

    // If navigated with an initialQuery param, set it into the search bar
    useEffect(() => {
        const initialQuery: string | undefined = route?.params?.initialQuery;
        if (initialQuery) {
            setQuery(initialQuery);
        }
    }, [route?.params?.initialQuery]);

    useEffect(() => {
        let isMounted = true;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const [cocktailsData, typesData] = await Promise.all([
                    fetchAllCocktails(),
                    fetchCocktailTypes()
                ]);
                if (isMounted) {
                    setCocktails(cocktailsData);
                    setCocktailTypes(typesData);
                }
            } catch (e: any) {
                if (isMounted) setError(e.message || 'Failed to load cocktails');
            } finally {
                if (isMounted) setLoading(false);
            }
        })();
        return () => {
            isMounted = false;
        };
    }, []);

    const filtered = useMemo(() => {
        const q = debouncedQuery.trim().toLowerCase();
        const results = cocktails.filter(c => {
            const name = (c.name ?? '')?.toString().toLowerCase();
            const matchesQuery = !q || name.includes(q);
            
            // Type filtering
            let matchesType = true;
            if (activeType === 'Own Recipes') {
                // Show only user's own recipes
                matchesType = user ? c.creator_id === user.id : false;
            } else if (activeType !== 'All') {
                // Convert display name back to database value (lowercase with underscores)
                const dbTypeValue = activeType.toLowerCase().replace(/ /g, '_'); // Convert "Mixed Drinks" back to "mixed_drinks"
                matchesType = c.cocktail_type === dbTypeValue;
            }
            
            // Difficulty filtering
            const matchesDifficulty = activeDifficulty === 'All' || 
                c.difficulty?.toLowerCase() === activeDifficulty.toLowerCase();
            
            return matchesQuery && matchesType && matchesDifficulty;
        });
        
        // Track filter usage when filters are applied
        if (activeType !== 'All' || activeDifficulty !== 'All') {
            posthogCapture(ANALYTICS_EVENTS.FEATURE_USED, {
                feature: 'cocktail_filter',
                type_filter: activeType,
                difficulty_filter: activeDifficulty,
                results_count: results.length,
            });
        }
        
        return results;
    }, [debouncedQuery, activeType, activeDifficulty, cocktails, user]);

    const renderCard = ({ item }: { item: DBCocktail }) => {
        const parseJsonArray = (v: any) => {
            if (!v) return [] as any[];
            if (Array.isArray(v)) return v;
            try {
                return typeof v === 'string' ? JSON.parse(v) : v;
            } catch (e) {
                return [];
            }
        };

        const ingredientCount = parseJsonArray(item.ingredients).length ?? 0;
        const imageUri = item.image_url ?? PLACEHOLDER_IMAGE;
        return (
            <TouchableOpacity
                className="bg-white rounded-xl overflow-hidden shadow"
                style={{ width: '47%', marginBottom: CARD_VERTICAL_MARGIN, height: CARD_HEIGHT }}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('CocktailDetail', { cocktail: item })}
            >
                <View
                    className="bg-neutral-200 items-center justify-center"
                    style={{ height: 140 }}
                >
                    <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                </View>
                <Box className="p-3">
                    <Text className="text-sm font-medium text-neutral-900" numberOfLines={1} ellipsizeMode="tail">{item.name ?? 'Unnamed Cocktail'}</Text>
                    <HStack className="justify-between items-center mt-2">
                        {/* Public / Private pill */}
                        {/* <Text className="text-xs bg-[#F3F3F5] px-2 py-1 rounded-full text-neutral-600">
                            {item.is_public ? 'Public' : 'Private'}
                        </Text> */}
                        <Text className="text-xs text-neutral-600">{ingredientCount} ingredients</Text>
                    </HStack>
                    <Text className="text-[10px] text-neutral-400 mt-2">{item.created_at ? `Created ${new Date(item.created_at).toLocaleDateString()}` : 'Created date unknown'}</Text>
                </Box>
            </TouchableOpacity>
        );
    };

    return (
        <Box className="flex-1 bg-neutral-50">
            <TopBar title="All Cocktails" showBack onBackPress={() => navigation.goBack()} />
            {/* Content area with overlay header above the list */}
            <View style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                {/* Fixed Search Bar - always visible */}
                <View
                    onLayout={e => setSearchBarHeight(e.nativeEvent.layout.height)}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        zIndex: 2,
                        elevation: 2,
                        paddingHorizontal: 16,
                        paddingTop: 20,
                        paddingBottom: 12,
                        backgroundColor: 'rgba(255,255,255, 1)',
                        borderBottomWidth: 1,
                        borderBottomColor: 'rgba(0,0,0,0.06)',
                        shadowColor: '#000',
                        shadowOpacity: 0.08,
                        shadowRadius: 8,
                        shadowOffset: { width: 0, height: 4 },
                    }}
                >
                    <SearchBar
                        value={query}
                        onChangeText={setQuery}
                        placeholder="Search cocktails..."
                    />
                </View>

                {/* Animated Filters - hide on scroll down */}
                <Animated.View
                    onLayout={e => setFiltersHeight(e.nativeEvent.layout.height)}
                    style={{
                        position: 'absolute',
                        top: searchBarHeight,
                        left: 0,
                        right: 0,
                        zIndex: 1,
                        elevation: 1,
                        paddingHorizontal: 16,
                        paddingTop: 12,
                        paddingBottom: 12,
                        backgroundColor: 'rgba(255,255,255, 1)',
                        borderBottomWidth: 1,
                        borderBottomColor: 'rgba(0,0,0,0.06)',
                        transform: [{ translateY: filtersTranslateY }],
                    }}
                >
                    {/* Cocktail Type Filter */}
                    <Box className="mb-3">
                        <Text className="text-xs font-medium text-neutral-600 mb-2">Type</Text>
                        <ScrollViewHorizontal 
                            categories={['All', ...(user ? ['Own Recipes'] : []), ...cocktailTypes]} 
                            active={activeType} 
                            onChange={setActiveType} 
                        />
                    </Box>
                    {/* Difficulty Filter */}
                    <Box>
                        <Text className="text-xs font-medium text-neutral-600 mb-2">Difficulty</Text>
                        <ScrollViewHorizontal 
                            categories={difficulties} 
                            active={activeDifficulty} 
                            onChange={setActiveDifficulty} 
                        />
                    </Box>
                </Animated.View>

                <FlatList
                    data={filtered}
                    keyExtractor={(i, idx) => i.id ?? String(idx)}
                    renderItem={renderCard}
                    numColumns={2}
                    keyboardShouldPersistTaps="handled"
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    contentContainerStyle={{
                        paddingBottom: 56,
                        paddingHorizontal: 12,
                        paddingTop: (searchBarHeight + filtersHeight || 4) + LIST_TOP_SPACER,
                    }}
                    columnWrapperStyle={{ justifyContent: 'space-between' }}
                    ListHeaderComponent={(
                        <>
                            {loading && (
                                <Box className="px-1 py-2"><Text className="text-neutral-600">Loading cocktails...</Text></Box>
                            )}
                            {error && (
                                <Box className="px-1 py-2"><Text className="text-red-600">{error}</Text></Box>
                            )}
                        </>
                    )}
                />
            </View>
        </Box>
    );
};

// small horizontal scroll component implemented inline to reuse styling
const ScrollViewHorizontal = ({ categories, active, onChange }: { categories: string[]; active: string; onChange: (v: string) => void }) => {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 0 }}
        >
            <View style={{ flexDirection: 'row' }}>
                {categories.map(cat => (
                    <View key={cat} className="mr-2">
                        <FilterChip
                            label={cat}
                            selected={active === cat}
                            onPress={() => onChange(cat)}
                        />
                    </View>
                ))}
            </View>
        </ScrollView>
    );
};
