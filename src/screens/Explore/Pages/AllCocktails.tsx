import React, { useEffect, useMemo, useState } from 'react';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { PageHeader } from '../components/PageHeader';
import { FlatList, TextInput, TouchableOpacity, Image, View } from 'react-native';
import { HStack } from '@/src/components/ui/hstack';
import { fetchCocktails } from '@/src/api/cocktail';
import { Cocktail } from '@/src/types/cocktail';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
    CocktailDetail: { cocktail: Cocktail };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Fallback placeholder image (could be replaced with a local asset)
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/300x300.png?text=Cocktail';
// Layout constants to keep grid stable and prevent vertical jumping while filtering
const CARD_HEIGHT = 220; // total card height (image + text area)
const CARD_VERTICAL_MARGIN = 16; // space below each card

export const AllCocktails = () => {
    const navigation = useNavigation<NavigationProp>();
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [cocktails, setCocktails] = useState<Cocktail[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

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
            const name = c.name?.toLowerCase() || '';
            const matchesQuery = !q || name.includes(q);
            // Category filtering placeholder (no origin_type semantics yet)
            const matchesCategory = activeCategory === 'All' || (activeCategory === 'Whiskey' ? name.includes('whiskey') : true);
            return matchesQuery && matchesCategory;
        });
    }, [debouncedQuery, activeCategory, cocktails]);

    const renderCard = ({ item }: { item: Cocktail }) => {
        const ingredientCount = item.ingredients?.length || 0;
        const imageUri = item.image_url || PLACEHOLDER_IMAGE;
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
                    <Text className="text-[10px] text-neutral-400 mt-2">Created {new Date(item.created_at).toLocaleDateString()}</Text>
                </Box>
            </TouchableOpacity>
        );
    };

    return (
        <Box className="flex-1 bg-neutral-50">
            <PageHeader title="All Cocktails" />
            {/* Search and categories header (outside FlatList to prevent input blur issues) */}
            {/* Header spacing normalized: removed large bottom margin (was mb-20) to keep header height perception stable */}
            <Box className="px-4 pt-5 pb-4 mb-10">
                <Box
                    className="flex-row items-center bg-[#F3F3F5] rounded-lg px-4 py-3"
                    style={{
                        shadowColor: '#000',
                        shadowOpacity: 0.08,
                        shadowRadius: 8,
                        shadowOffset: { width: 0, height: 4 },
                        elevation: 5,
                    }}
                >
                    <TextInput
                        className="flex-1 text-sm text-neutral-900"
                        placeholder="Search cocktails..."
                        placeholderTextColor="#6A7282"
                        value={query}
                        onChangeText={setQuery}
                    />
                </Box>
                <Box className="mt-2">
                    <ScrollViewHorizontal categories={categories} active={activeCategory} onChange={setActiveCategory} />
                </Box>
            </Box>
            {loading && (
                <Box className="px-4 py-3"><Text className="text-neutral-600">Loading cocktails...</Text></Box>
            )}
            {error && (
                <Box className="px-4 py-3"><Text className="text-red-600">{error}</Text></Box>
            )}
            <FlatList
                data={filtered}
                keyExtractor={i => i.id}
                renderItem={renderCard}
                numColumns={2}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 56, paddingHorizontal: 12, paddingTop: 4 }}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
            />
        </Box>
    );
};

// small horizontal scroll component implemented inline to reuse styling
const ScrollViewHorizontal = ({ categories, active, onChange }: { categories: string[]; active: string; onChange: (v: string) => void }) => {
    return (
        <View className="mt-3">
            <View style={{ flexDirection: 'row' }}>
                {categories.map(cat => (
                    <TouchableOpacity
                        key={cat}
                        onPress={() => onChange(cat)}
                        className={`h-7 min-w-[60px] items-center justify-center px-3 rounded-full mr-2 ${active === cat ? 'bg-[#00BBA7]' : 'bg-[#F3F3F5]'}`}
                        style={{
                            shadowColor: '#000',
                            shadowOpacity: active === cat ? 0.2 : 0.05,
                            shadowRadius: active === cat ? 4 : 2,
                            shadowOffset: { width: 0, height: 2 },
                            elevation: active === cat ? 3 : 1,
                        }}
                    >
                        <Text className={`text-sm ${active === cat ? 'text-white' : 'text-neutral-600'}`}>{cat}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};
