import React, { useEffect, useMemo, useState } from 'react';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { TopBar } from '@/src/screens/navigation/TopBar';
import { FlatList, TextInput, TouchableOpacity, Image, View, Platform, ScrollView } from 'react-native';
import { HStack } from '@/src/components/ui/hstack';
import { fetchCocktails, DBCocktail } from '@/src/api/cocktail';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FilterChip } from '@/src/components/global';

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
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [cocktails, setCocktails] = useState<DBCocktail[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [overlayHeight, setOverlayHeight] = useState(0);

    const categories = ['All', 'Tropical', 'Classic', 'Modern', 'Whiskey'];

    // Debounce the search input to reduce rapid re-renders that can cause perceived layout shifts
    useEffect(() => {
        const handle = setTimeout(() => setDebouncedQuery(query), 200);
        return () => clearTimeout(handle);
    }, [query]);

    useEffect(() => {
        let isMounted = true;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await fetchCocktails();
                if (isMounted) {
                    setCocktails(data);
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
        return cocktails.filter(c => {
            const name = (c.name ?? '')?.toString().toLowerCase();
            const matchesQuery = !q || name.includes(q);
            // Category filtering placeholder (no origin_type semantics yet)
            const matchesCategory = activeCategory === 'All' || (activeCategory === 'Whiskey' ? name.includes('whiskey') : true);
            return matchesQuery && matchesCategory;
        });
    }, [debouncedQuery, activeCategory, cocktails]);

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
            <View style={{ flex: 1, position: 'relative' }}>
                {/* Overlay Header: semi-transparent, on top of list */}
                <View
                    onLayout={e => setOverlayHeight(e.nativeEvent.layout.height)}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        zIndex: 10,
                        elevation: 6,
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
                    <Box
                        className="flex-row items-center rounded-lg px-4 py-3"
                        style={{
                            backgroundColor: '#F3F3F5',
                        }}
                    >
                        <TextInput
                            className="flex-1 text-sm text-neutral-900"
                            placeholder="Search cocktails..."
                            placeholderTextColor="#6A7282"
                            value={query}
                            onChangeText={setQuery}
                            underlineColorAndroid="transparent"
                            selectionColor="#00BBA7"
                            // Remove default blue/brown outline on web when selecting the input
                            style={
                                Platform.OS === 'web'
                                    ? ({
                                        outlineStyle: 'none',
                                        outlineWidth: 0,
                                        outlineColor: 'transparent',
                                        WebkitTapHighlightColor: 'transparent',
                                    } as any)
                                    : undefined
                            }
                        />
                    </Box>
                    <Box className="mt-2">
                        <ScrollViewHorizontal categories={categories} active={activeCategory} onChange={setActiveCategory} />
                    </Box>
                </View>

                <FlatList
                    data={filtered}
                    keyExtractor={(i, idx) => i.id ?? String(idx)}
                    renderItem={renderCard}
                    numColumns={2}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{
                        paddingBottom: 56,
                        paddingHorizontal: 12,
                        paddingTop: (overlayHeight || 4) + LIST_TOP_SPACER,
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
        <View className="mt-3">
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
        </View>
    );
};
