import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ScrollView, Image, TouchableOpacity, View, Animated, TextInput, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Box } from '@/src/components/ui/box';
import { TopBar } from '@/src/screens/navigation/TopBar';
import { HStack } from '@/src/components/ui/hstack';
import { Text } from '@/src/components/ui/text';
import { Pressable } from '@/src/components/ui/pressable';
import { ChevronDown } from 'lucide-react-native';
import { PrimaryButton, SearchBar, FilterChip } from '@/src/components/global';
import { fetchShopItems, DBShopItem } from '@/src/api/shop';
import { Star } from 'lucide-react-native';
import { ANALYTICS_EVENTS, posthogCapture } from '@/src/analytics';

type RootStackParamList = {
    ItemDetail: { itemId: string };
}


type Product = {
    id: string;
    name: string;
    price: string;
    rating: number;
    vendor: string;
    image?: any;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type ProductCardProps = {
    item: DBShopItem;
    onPress: () => void;
};

const ProductCard = ({ item, onPress }: ProductCardProps) => (
    <TouchableOpacity onPress={onPress} className="bg-white rounded-xl p-3 mb-4 shadow-sm w-[48%]" style={{ height: 300 }}>
        <Box className="h-36 bg-neutral-100 rounded-lg mb-3 items-center justify-center overflow-hidden">
            {item.image ? (
                <Image source={{ uri: item.image }} className="w-full h-full" resizeMode="contain" />
            ) : (
                <Text className="text-gray-400">No Image</Text>
            )}
        </Box>
        <Text className="font-semibold" numberOfLines={2} style={{ minHeight: 40 }}>{item.name || 'Unnamed Item'}</Text>
        {item.category && (
            <Text className="text-xs text-gray-500 mt-1" numberOfLines={1}>{item.category}</Text>
        )}
        <Box className="mt-2">
            <Text className="font-bold text-lg">€{item.price?.toFixed(2) || '0.00'}</Text>
        </Box>
        <Box className="mt-2">
            <PrimaryButton
                title="View"
                onPress={onPress}
            />
        </Box>
    </TouchableOpacity>
);

export const Shop = () => {
    const navigation = useNavigation<NavigationProp>();
    const [items, setItems] = useState<DBShopItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState<'all' | 'under20' | '20to50' | 'over50'>('all');
    const [showPriceFilter, setShowPriceFilter] = useState(false);
    const [searchBarHeight, setSearchBarHeight] = useState(0);
    const [filtersHeight, setFiltersHeight] = useState(0);

    // Scroll-aware filter animation
    const scrollY = useRef(new Animated.Value(0)).current;
    const lastScrollY = useRef(0);
    const filtersTranslateY = useRef(new Animated.Value(0)).current;

    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        {
            useNativeDriver: true,
            listener: (event: any) => {
                const currentScrollY = event.nativeEvent.contentOffset.y;
                const diff = currentScrollY - lastScrollY.current;

                // Only hide/show filters after scrolling past initial padding
                if (currentScrollY > 50) {
                    if (diff > 0) {
                        // Scrolling down - hide filters
                        Animated.timing(filtersTranslateY, {
                            toValue: -(filtersHeight || 0),
                            duration: 200,
                            useNativeDriver: true,
                        }).start();
                    } else if (diff < 0) {
                        // Scrolling up - show filters
                        Animated.timing(filtersTranslateY, {
                            toValue: 0,
                            duration: 200,
                            useNativeDriver: true,
                        }).start();
                    }
                }

                lastScrollY.current = currentScrollY;
            },
        }
    );

    useEffect(() => {
        let mounted = true;
        (async () => {
            setLoading(true);
            try {
                const data = await fetchShopItems();
                if (mounted) setItems(data);
            } catch (e) {
                console.warn('Failed to load shop items', e);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    const categories = useMemo(() => {
        const cats = new Set<string>();
        items.forEach(item => {
            if (item.category) cats.add(item.category);
        });
        return Array.from(cats).sort();
    }, [items]);

    const filteredItems = useMemo(() => {
        const results = items.filter(item => {
            // Search filter
            if (searchQuery && !item.name?.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }

            // Category filter - if categories are selected, item must match one of them
            if (selectedCategories.length > 0 && !selectedCategories.includes(item.category || '')) {
                return false;
            }

            // Price filter
            if (item.price === null) return priceRange === 'all';
            if (priceRange === 'under20' && item.price >= 20) return false;
            if (priceRange === '20to50' && (item.price < 20 || item.price > 50)) return false;
            if (priceRange === 'over50' && item.price <= 50) return false;

            return true;
        });
        
        // Track shop search and filter usage
        if (searchQuery || selectedCategories.length > 0 || priceRange !== 'all') {
            posthogCapture(ANALYTICS_EVENTS.FEATURE_USED, {
                feature: 'shop_search_filter',
                has_search: !!searchQuery,
                search_length: searchQuery?.length || 0,
                category_count: selectedCategories.length,
                price_filter: priceRange,
                results_count: results.length,
            });
        }
        
        return results;
    }, [items, searchQuery, selectedCategories, priceRange]);

    return (
        <Box className="flex-1 bg-neutral-50">
            <TopBar title="Shop" showBack onBackPress={() => navigation.goBack()} />
            
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
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search products..."
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
                        backgroundColor: 'rgba(255,255,255, 1)',
                        paddingHorizontal: 16,
                        paddingTop: 12,
                        paddingBottom: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: 'rgba(0,0,0,0.06)',
                        transform: [{ translateY: filtersTranslateY }],
                    }}
                >
                    {/* Category Filter */}
                    <Box className="mb-3">
                        <Text className="text-xs font-medium text-neutral-600 mb-2">Category</Text>
                        <ScrollView 
                            horizontal 
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 0, gap: 8 }}
                        >
                            {categories.map((cat) => (
                                <FilterChip
                                    key={cat}
                                    label={cat}
                                    selected={selectedCategories.includes(cat)}
                                    onPress={() => {
                                        setSelectedCategories(prev => 
                                            prev.includes(cat) 
                                                ? prev.filter(c => c !== cat)
                                                : [...prev, cat]
                                        );
                                    }}
                                />
                            ))}
                        </ScrollView>
                    </Box>

                    {/* Price Filter */}
                    <Box>
                        <Text className="text-xs font-medium text-neutral-600 mb-2">Price Range</Text>
                        <ScrollView 
                            horizontal 
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 0, gap: 8 }}
                        >
                            {[
                                { value: 'all', label: 'All Prices' },
                                { value: 'under20', label: 'Under €20' },
                                { value: '20to50', label: '€20 - €50' },
                                { value: 'over50', label: 'Over €50' },
                            ].map(option => (
                                <FilterChip
                                    key={option.value}
                                    label={option.label}
                                    selected={priceRange === option.value}
                                    onPress={() => setPriceRange(option.value as any)}
                                />
                            ))}
                        </ScrollView>
                    </Box>
            </Animated.View>

                {/* Scrollable product content - starts below filters */}
                <ScrollView
                    className="flex-1"
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    contentContainerStyle={{ 
                        padding: 16,
                        paddingTop: (searchBarHeight + filtersHeight || 0) + 16,
                    }}
                >

                {/* Results count */}
                <Text className="text-sm text-gray-600 mb-3">
                    {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
                </Text>

                {/* Product grid */}
                {loading ? (
                    <Text className="text-center mt-10">Loading...</Text>
                ) : filteredItems.length === 0 ? (
                    <Text className="text-center mt-10 text-gray-500">No items found</Text>
                ) : (
                    <Box className="flex-row flex-wrap justify-between">
                        {filteredItems.map((item) => (
                            <ProductCard
                                key={item.id}
                                item={item}
                                onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
                            />
                        ))}
                    </Box>
                )}
            </ScrollView>
            </View>
        </Box>
    );
};
